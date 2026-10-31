-- ======================================================================
-- Migration: Group Ownership, Member Status, Atomic Receipts & Invariants
-- File: supabase/migrations/20261031_ownership_and_atomic_receipts.sql
-- Safe to run multiple times (idempotent with IF NOT EXISTS and backfills)
-- ======================================================================

-- ----------------------------------------------------------------------
-- 1. EXTENSIONS & PREREQUISITES
-- ----------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------
-- 2. SCHEMA EVOLUTION
-- ----------------------------------------------------------------------

-- groups: owner_id, deleted_at, deleted_by, description
ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS description text;

-- Backfill owner_id from created_by for any existing rows
UPDATE public.groups
SET owner_id = created_by
WHERE owner_id IS NULL AND created_by IS NOT NULL;

-- group_members: status, left_at, removed_by, role
ALTER TABLE public.group_members
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'left', 'removed')),
  ADD COLUMN IF NOT EXISTS left_at timestamptz,
  ADD COLUMN IF NOT EXISTS removed_by uuid REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member';

-- Ensure unique constraint on (group_id, user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'group_members_group_id_user_id_key'
  ) THEN
    ALTER TABLE public.group_members
      ADD CONSTRAINT group_members_group_id_user_id_key UNIQUE (group_id, user_id);
  END IF;
END $$;

-- Backfill existing group_members status as 'active'
UPDATE public.group_members
SET status = 'active'
WHERE status IS NULL;

-- expenses: source, receipt_batch_id, receipt_hash, idempotency_key
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'receipt')),
  ADD COLUMN IF NOT EXISTS receipt_batch_id uuid,
  ADD COLUMN IF NOT EXISTS receipt_hash text,
  ADD COLUMN IF NOT EXISTS idempotency_key text;

-- Unique constraint on (group_id, idempotency_key) to prevent double-click duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_expenses_group_idempotency
  ON public.expenses (group_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_receipt_hash
  ON public.expenses (group_id, receipt_hash)
  WHERE receipt_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_group_members_active
  ON public.group_members (group_id, user_id, status);

-- ----------------------------------------------------------------------
-- 3. DEMO USER AARAV SETUP IN AUTH (auth.users)
-- ----------------------------------------------------------------------
-- Enables real signInWithPassword for Try Demo so auth.uid() works
DO $$
DECLARE
  v_user_id uuid := '00000000-0000-0000-0000-000000000000'::uuid;
  v_email text := 'aarav@demo.splitscore.app';
  v_password text := 'Demo@123456';
  has_provider_id boolean;
BEGIN
  DELETE FROM auth.users 
  WHERE email = v_email 
    AND id <> v_user_id;

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    v_user_id,
    v_user_id,
    'authenticated',
    'authenticated',
    v_email,
    crypt(v_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Aarav Sharma","name":"Aarav Sharma"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE
  SET
    encrypted_password = crypt(v_password, gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
    raw_user_meta_data = '{"full_name":"Aarav Sharma","name":"Aarav Sharma"}'::jsonb,
    updated_at = now();

  DELETE FROM auth.identities 
  WHERE user_id = v_user_id 
     OR id::text = v_user_id::text;

  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'auth' 
      AND table_name = 'identities' 
      AND column_name = 'provider_id'
  ) INTO has_provider_id;

  IF has_provider_id THEN
    EXECUTE '
      INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        $1,
        $1,
        $1::text,
        jsonb_build_object(''sub'', $1::text, ''email'', $2, ''email_verified'', true),
        ''email'',
        now(),
        now(),
        now()
      )'
    USING v_user_id, v_email;
  ELSE
    EXECUTE '
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        $1,
        $1,
        jsonb_build_object(''sub'', $1::text, ''email'', $2, ''email_verified'', true),
        ''email'',
        now(),
        now(),
        now()
      )'
    USING v_user_id, v_email;
  END IF;

  INSERT INTO public.users (id, name, email)
  VALUES (v_user_id, 'Aarav Sharma', v_email)
  ON CONFLICT (id) DO UPDATE
  SET name = 'Aarav Sharma', email = v_email;
END $$;

-- ----------------------------------------------------------------------
-- 4. BUSINESS LOGIC & ENFORCEMENT FUNCTIONS (SECURITY DEFINER)
-- ----------------------------------------------------------------------

-- A. Helper: check open balance, unconfirmed settlements, or open payment plans
CREATE OR REPLACE FUNCTION public.check_member_open_status(
  p_group_id uuid,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_paid numeric := 0;
  v_share numeric := 0;
  v_settled_sent numeric := 0;
  v_settled_recv numeric := 0;
  v_net numeric := 0;
  v_open_settlements int := 0;
  v_open_plans int := 0;
  v_has_open boolean := false;
  v_reasons text[] := ARRAY[]::text[];
BEGIN
  -- Net expense balance
  SELECT COALESCE(SUM(amount), 0) INTO v_paid
  FROM public.expenses
  WHERE group_id = p_group_id AND paid_by = p_user_id;

  SELECT COALESCE(SUM(es.share_amount), 0) INTO v_share
  FROM public.expense_splits es
  JOIN public.expenses e ON e.id = es.expense_id
  WHERE e.group_id = p_group_id AND es.user_id = p_user_id;

  SELECT COALESCE(SUM(amount), 0) INTO v_settled_sent
  FROM public.settlements
  WHERE group_id = p_group_id AND from_user = p_user_id AND status = 'confirmed';

  SELECT COALESCE(SUM(amount), 0) INTO v_settled_recv
  FROM public.settlements
  WHERE group_id = p_group_id AND to_user = p_user_id AND status = 'confirmed';

  v_net := round((v_paid - v_share + v_settled_sent - v_settled_recv)::numeric, 2);

  IF abs(v_net) > 0.01 THEN
    v_has_open := true;
    IF v_net > 0 THEN
      v_reasons := array_append(v_reasons, 'Member is owed ₹' || v_net::text);
    ELSE
      v_reasons := array_append(v_reasons, 'Member owes ₹' || abs(v_net)::text);
    END IF;
  END IF;

  -- Pending, marked_paid, or disputed settlements
  SELECT COUNT(*) INTO v_open_settlements
  FROM public.settlements
  WHERE group_id = p_group_id
    AND (from_user = p_user_id OR to_user = p_user_id)
    AND status IN ('pending', 'marked_paid', 'disputed');

  IF v_open_settlements > 0 THEN
    v_has_open := true;
    v_reasons := array_append(v_reasons, v_open_settlements || ' open settlement(s)');
  END IF;

  -- Check pay in parts plans if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settlement_plans') THEN
    EXECUTE 'SELECT COUNT(*) FROM settlement_plans sp ' ||
            'JOIN settlements s ON s.id = sp.settlement_id ' ||
            'WHERE s.group_id = $1 AND (s.from_user = $2 OR s.to_user = $2) ' ||
            'AND sp.status IN (''pending'', ''active'', ''disputed'', ''overdue'')'
    INTO v_open_plans
    USING p_group_id, p_user_id;

    IF v_open_plans > 0 THEN
      v_has_open := true;
      v_reasons := array_append(v_reasons, v_open_plans || ' active pay-in-parts plan(s)');
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'has_open', v_has_open,
    'net_balance', v_net,
    'reasons', v_reasons
  );
END;
$$;

-- B. Remove Member: Owner only, target not self, net balance 0, no open settlements
CREATE OR REPLACE FUNCTION public.remove_group_member(
  p_group_id uuid,
  p_target_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_owner uuid;
  v_group_name text;
  v_status jsonb;
  v_new_invite_code text;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Concurrency lock on group
  SELECT owner_id, name INTO v_owner, v_group_name
  FROM public.groups
  WHERE id = p_group_id AND deleted_at IS NULL
  FOR UPDATE;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Group not found or deleted';
  END IF;

  IF v_caller != v_owner THEN
    RAISE EXCEPTION 'Only the group owner can remove members';
  END IF;

  IF p_target_user_id = v_owner THEN
    RAISE EXCEPTION 'The owner cannot be removed. Transfer ownership first.';
  END IF;

  -- Check member exists and lock
  PERFORM 1 FROM public.group_members
  WHERE group_id = p_group_id AND user_id = p_target_user_id AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member is not an active member of this group';
  END IF;

  -- Verify open balance and settlements
  v_status := public.check_member_open_status(p_group_id, p_target_user_id);
  IF (v_status->>'has_open')::boolean THEN
    RAISE EXCEPTION 'Cannot remove member with open obligations: %',
      array_to_string(ARRAY(SELECT jsonb_array_elements_text(v_status->'reasons')), ', ');
  END IF;

  -- Mark as removed
  UPDATE public.group_members
  SET status = 'removed',
      left_at = now(),
      removed_by = v_caller
  WHERE group_id = p_group_id AND user_id = p_target_user_id;

  -- Rotate invite code so removed member cannot reuse it
  v_new_invite_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
  UPDATE public.groups
  SET invite_code = v_new_invite_code
  WHERE id = p_group_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_invite_code', v_new_invite_code
  );
END;
$$;

-- C. Leave Group: Non-owner active member only, net balance 0
CREATE OR REPLACE FUNCTION public.leave_group(
  p_group_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_owner uuid;
  v_status jsonb;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT owner_id INTO v_owner
  FROM public.groups
  WHERE id = p_group_id AND deleted_at IS NULL
  FOR UPDATE;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Group not found or deleted';
  END IF;

  IF v_caller = v_owner THEN
    RAISE EXCEPTION 'The owner cannot leave the group. Transfer ownership to another active member first, or delete the group.';
  END IF;

  -- Check member active and lock
  PERFORM 1 FROM public.group_members
  WHERE group_id = p_group_id AND user_id = v_caller AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not an active member of this group';
  END IF;

  v_status := public.check_member_open_status(p_group_id, v_caller);
  IF (v_status->>'has_open')::boolean THEN
    RAISE EXCEPTION 'Cannot leave group with open obligations: %',
      array_to_string(ARRAY(SELECT jsonb_array_elements_text(v_status->'reasons')), ', ');
  END IF;

  UPDATE public.group_members
  SET status = 'left',
      left_at = now()
  WHERE group_id = p_group_id AND user_id = v_caller;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- D. Transfer Ownership: Owner only, target must be active member
CREATE OR REPLACE FUNCTION public.transfer_group_ownership(
  p_group_id uuid,
  p_new_owner_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_owner uuid;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT owner_id INTO v_owner
  FROM public.groups
  WHERE id = p_group_id AND deleted_at IS NULL
  FOR UPDATE;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Group not found or deleted';
  END IF;

  IF v_caller != v_owner THEN
    RAISE EXCEPTION 'Only the current owner can transfer ownership';
  END IF;

  -- Ensure target is an active member
  PERFORM 1 FROM public.group_members
  WHERE group_id = p_group_id AND user_id = p_new_owner_id AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The new owner must be an active member of the group';
  END IF;

  UPDATE public.groups
  SET owner_id = p_new_owner_id
  WHERE id = p_group_id;

  RETURN jsonb_build_object('success', true, 'owner_id', p_new_owner_id);
END;
$$;

-- E. Re-Add Member: Owner only, resets status to active
CREATE OR REPLACE FUNCTION public.readd_group_member(
  p_group_id uuid,
  p_target_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_owner uuid;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT owner_id INTO v_owner
  FROM public.groups
  WHERE id = p_group_id AND deleted_at IS NULL
  FOR UPDATE;

  IF v_caller != v_owner THEN
    RAISE EXCEPTION 'Only the owner can re-add removed members';
  END IF;

  UPDATE public.group_members
  SET status = 'active',
      left_at = NULL,
      removed_by = NULL
  WHERE group_id = p_group_id AND user_id = p_target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member record not found';
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- F. Delete Group: Owner only, typed name check, no open balances in group
CREATE OR REPLACE FUNCTION public.delete_group(
  p_group_id uuid,
  p_confirm_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_owner uuid;
  v_real_name text;
  v_member record;
  v_status jsonb;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT owner_id, name INTO v_owner, v_real_name
  FROM public.groups
  WHERE id = p_group_id AND deleted_at IS NULL
  FOR UPDATE;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Group not found or already deleted';
  END IF;

  IF v_caller != v_owner THEN
    RAISE EXCEPTION 'Only the group owner can delete the group';
  END IF;

  IF trim(p_confirm_name) != trim(v_real_name) THEN
    RAISE EXCEPTION 'Confirmation name does not match the group name';
  END IF;

  -- Check every member for open balance
  FOR v_member IN
    SELECT user_id FROM public.group_members WHERE group_id = p_group_id
  LOOP
    v_status := public.check_member_open_status(p_group_id, v_member.user_id);
    IF (v_status->>'has_open')::boolean THEN
      RAISE EXCEPTION 'Cannot delete group with open balances or unconfirmed settlements: %',
        array_to_string(ARRAY(SELECT jsonb_array_elements_text(v_status->'reasons')), ', ');
    END IF;
  END LOOP;

  -- Soft delete group: score_events, settlements, and history stay untouched
  UPDATE public.groups
  SET deleted_at = now(),
      deleted_by = v_caller
  WHERE id = p_group_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- G. Join Group by Invite Link: Rejects deleted, rejects removed, idempotent
CREATE OR REPLACE FUNCTION public.join_group_by_invite_code(
  p_invite_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_group_id uuid;
  v_group_name text;
  v_existing_status text;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Please sign in to join this group';
  END IF;

  SELECT id, name INTO v_group_id, v_group_name
  FROM public.groups
  WHERE invite_code = trim(p_invite_code) AND deleted_at IS NULL;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite link. The group may have been deleted.';
  END IF;

  SELECT status INTO v_existing_status
  FROM public.group_members
  WHERE group_id = v_group_id AND user_id = v_caller;

  IF v_existing_status = 'removed' THEN
    RAISE EXCEPTION 'You have been removed from this group by the owner and cannot rejoin by invite link.';
  END IF;

  IF v_existing_status = 'active' THEN
    RETURN jsonb_build_object('success', true, 'group_id', v_group_id, 'already_member', true);
  END IF;

  IF v_existing_status = 'left' THEN
    UPDATE public.group_members
    SET status = 'active', left_at = NULL
    WHERE group_id = v_group_id AND user_id = v_caller;
  ELSE
    INSERT INTO public.group_members (group_id, user_id, status, role)
    VALUES (v_group_id, v_caller, 'active', 'member');
  END IF;

  RETURN jsonb_build_object('success', true, 'group_id', v_group_id, 'already_member', false);
END;
$$;

-- H. Rotate Invite Code: Owner only
CREATE OR REPLACE FUNCTION public.rotate_group_invite_code(
  p_group_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_owner uuid;
  v_new_code text;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT owner_id INTO v_owner
  FROM public.groups
  WHERE id = p_group_id AND deleted_at IS NULL
  FOR UPDATE;

  IF v_caller != v_owner THEN
    RAISE EXCEPTION 'Only the owner can rotate the invite code';
  END IF;

  v_new_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
  UPDATE public.groups
  SET invite_code = v_new_code
  WHERE id = p_group_id;

  RETURN jsonb_build_object('success', true, 'invite_code', v_new_code);
END;
$$;

-- I. Check if Receipt Hash Already Added in Group
CREATE OR REPLACE FUNCTION public.check_receipt_hash_exists(
  p_group_id uuid,
  p_receipt_hash text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_receipt_hash IS NULL OR trim(p_receipt_hash) = '' THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.expenses
    WHERE group_id = p_group_id AND receipt_hash = p_receipt_hash
  );
END;
$$;

-- J. Atomic Multi-Step Receipt Save for EXISTING Group
CREATE OR REPLACE FUNCTION public.save_receipt_expenses_atomic(
  p_group_id uuid,
  p_paid_by uuid,
  p_date text,
  p_idempotency_key text,
  p_receipt_hash text,
  p_expenses jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_group_exists boolean;
  v_batch_id uuid := gen_random_uuid();
  v_exp_elem jsonb;
  v_split_elem jsonb;
  v_exp_id uuid;
  v_amount numeric;
  v_title text;
  v_category text;
  v_split_sum numeric;
  v_count int := 0;
  v_user_active boolean;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock group row & ensure not deleted
  SELECT true INTO v_group_exists
  FROM public.groups
  WHERE id = p_group_id AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT v_group_exists THEN
    RAISE EXCEPTION 'Group not found or has been deleted';
  END IF;

  -- Verify caller is an ACTIVE member
  SELECT (status = 'active') INTO v_user_active
  FROM public.group_members
  WHERE group_id = p_group_id AND user_id = v_caller;

  IF NOT COALESCE(v_user_active, false) THEN
    RAISE EXCEPTION 'Only active group members can add expenses';
  END IF;

  -- Verify payer is an ACTIVE member
  SELECT (status = 'active') INTO v_user_active
  FROM public.group_members
  WHERE group_id = p_group_id AND user_id = p_paid_by;

  IF NOT COALESCE(v_user_active, false) THEN
    RAISE EXCEPTION 'Payer must be an active member of the group';
  END IF;

  -- Idempotency check: if key already exists, return existing batch
  IF p_idempotency_key IS NOT NULL AND p_idempotency_key != '' THEN
    SELECT receipt_batch_id INTO v_batch_id
    FROM public.expenses
    WHERE group_id = p_group_id AND idempotency_key = p_idempotency_key
    LIMIT 1;

    IF v_batch_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success', true,
        'group_id', p_group_id,
        'batch_id', v_batch_id,
        'idempotent_replay', true
      );
    END IF;

    v_batch_id := gen_random_uuid();
  END IF;

  -- Iterate over expenses array and insert atomically
  FOR v_exp_elem IN SELECT * FROM jsonb_array_elements(p_expenses)
  LOOP
    v_title := coalesce(v_exp_elem->>'title', 'Receipt Item');
    v_amount := (v_exp_elem->>'amount')::numeric;
    v_category := coalesce(v_exp_elem->>'category', 'Food');

    IF v_amount IS NULL OR v_amount <= 0 THEN
      CONTINUE;
    END IF;

    -- Validate that sum of splits equals expense amount
    SELECT coalesce(SUM((s->>'share_amount')::numeric), 0)
    INTO v_split_sum
    FROM jsonb_array_elements(v_exp_elem->'splits') s;

    IF abs(v_split_sum - v_amount) > 0.02 THEN
      RAISE EXCEPTION 'Splits total (₹%) does not equal expense amount (₹%) for item "%"',
        v_split_sum, v_amount, v_title;
    END IF;

    -- Verify all split users are active members
    FOR v_split_elem IN SELECT * FROM jsonb_array_elements(v_exp_elem->'splits')
    LOOP
      SELECT (status = 'active') INTO v_user_active
      FROM public.group_members
      WHERE group_id = p_group_id AND user_id = (v_split_elem->>'user_id')::uuid;

      IF NOT COALESCE(v_user_active, false) THEN
        RAISE EXCEPTION 'Split participant % is not an active member of this group',
          v_split_elem->>'user_id';
      END IF;
    END LOOP;

    -- Insert expense
    INSERT INTO public.expenses (
      group_id,
      title,
      amount,
      paid_by,
      category,
      date,
      split_type,
      source,
      receipt_batch_id,
      receipt_hash,
      idempotency_key
    ) VALUES (
      p_group_id,
      v_title,
      v_amount,
      p_paid_by,
      v_category,
      coalesce(p_date, CURRENT_DATE::text),
      'exact',
      'receipt',
      v_batch_id,
      p_receipt_hash,
      p_idempotency_key
    )
    RETURNING id INTO v_exp_id;

    -- Insert splits
    FOR v_split_elem IN SELECT * FROM jsonb_array_elements(v_exp_elem->'splits')
    LOOP
      INSERT INTO public.expense_splits (
        expense_id,
        user_id,
        share_amount
      ) VALUES (
        v_exp_id,
        (v_split_elem->>'user_id')::uuid,
        (v_split_elem->>'share_amount')::numeric
      );
    END LOOP;

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'group_id', p_group_id,
    'batch_id', v_batch_id,
    'expenses_created', v_count
  );
END;
$$;

-- K. Atomic Multi-Step Create Group + Members + Receipt
CREATE OR REPLACE FUNCTION public.create_group_with_receipt_atomic(
  p_name text,
  p_type text,
  p_member_emails text[],
  p_date text,
  p_idempotency_key text,
  p_receipt_hash text,
  p_expenses jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_group_id uuid;
  v_invite_code text;
  v_email text;
  v_found_user_id uuid;
  v_res jsonb;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_invite_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));

  -- 1. Create Group
  INSERT INTO public.groups (
    name,
    type,
    invite_code,
    created_by,
    owner_id
  ) VALUES (
    trim(p_name),
    coalesce(p_type, 'event'),
    v_invite_code,
    v_caller,
    v_caller
  )
  RETURNING id INTO v_group_id;

  -- 2. Add Creator as active admin member
  INSERT INTO public.group_members (
    group_id,
    user_id,
    status,
    role
  ) VALUES (
    v_group_id,
    v_caller,
    'active',
    'admin'
  );

  -- 3. Add other members by email if they exist in public.users
  IF p_member_emails IS NOT NULL THEN
    FOREACH v_email IN ARRAY p_member_emails
    LOOP
      SELECT id INTO v_found_user_id
      FROM public.users
      WHERE lower(email) = lower(trim(v_email));

      IF v_found_user_id IS NOT NULL AND v_found_user_id != v_caller THEN
        INSERT INTO public.group_members (group_id, user_id, status, role)
        VALUES (v_group_id, v_found_user_id, 'active', 'member')
        ON CONFLICT (group_id, user_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  -- 4. Atomically insert all receipt items as expenses using the atomic function
  v_res := public.save_receipt_expenses_atomic(
    v_group_id,
    v_caller,
    p_date,
    p_idempotency_key,
    p_receipt_hash,
    p_expenses
  );

  RETURN jsonb_build_object(
    'success', true,
    'group_id', v_group_id,
    'invite_code', v_invite_code,
    'batch_id', v_res->>'batch_id'
  );
END;
$$;
