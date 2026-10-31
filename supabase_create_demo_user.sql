-- ============================================================
-- SplitScore: Create Demo User (Aarav) in Supabase Auth
-- ============================================================
-- INSTRUCTIONS:
--   1. Go to your Supabase Dashboard → SQL Editor
--   2. Click "New Query" (clear anything in the editor)
--   3. Paste this entire file and click "Run"
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id uuid := '00000000-0000-0000-0000-000000000000'::uuid;
  v_email text := 'aarav@demo.splitscore.app';
  v_password text := 'Demo@123456';
  has_provider_id boolean;
BEGIN
  -- 1. Remove conflicting user if someone signed up with this email under a different UUID
  DELETE FROM auth.users 
  WHERE email = v_email 
    AND id <> v_user_id;

  -- 2. Insert or update the user in auth.users
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

  -- 3. Clean up any existing identity records for Aarav to prevent constraint errors
  DELETE FROM auth.identities 
  WHERE user_id = v_user_id 
     OR id::text = v_user_id::text;

  -- 4. Check if the modern provider_id column exists
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

  -- 5. Ensure row exists in public.users
  INSERT INTO public.users (id, name, email)
  VALUES (v_user_id, 'Aarav Sharma', v_email)
  ON CONFLICT (id) DO UPDATE
  SET name = 'Aarav Sharma', email = v_email;

END $$;

-- Done!
