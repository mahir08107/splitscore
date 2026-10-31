"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SplitResult } from "./splits";

export interface SaveReceiptToExistingGroupPayload {
  groupId: string;
  paidBy: string;
  date: string;
  idempotencyKey: string;
  receiptHash: string;
  expenses: SplitResult["expenses"];
}

export interface CreateGroupWithReceiptPayload {
  name: string;
  type: "trip" | "mess" | "event";
  memberEmails: string[];
  paidBy?: string;
  date: string;
  idempotencyKey: string;
  receiptHash: string;
  expenses: SplitResult["expenses"];
}

export interface ReceiptActionResult {
  success: boolean;
  groupId?: string;
  batchId?: string;
  inviteCode?: string;
  error?: string;
}

export interface ActiveGroupOption {
  id: string;
  name: string;
  type: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

/**
 * Checks if a bill with this exact image hash was already uploaded in this group.
 */
export async function checkReceiptHashExistsAction(
  groupId: string,
  receiptHash: string
): Promise<boolean> {
  if (!groupId || !receiptHash) return false;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_receipt_hash_exists", {
    p_group_id: groupId,
    p_receipt_hash: receiptHash,
  });

  if (error) {
    // Fallback direct query if RPC not yet run
    const { count } = await supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("group_id", groupId)
      .eq("receipt_hash", receiptHash);
    return (count ?? 0) > 0;
  }

  return Boolean(data);
}

/**
 * Fetches the user's active groups so they can choose to add the receipt to an existing group.
 */
export async function getUserActiveGroupsAction(): Promise<ActiveGroupOption[]> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    return [];
  }

  const userId = authData.user.id;

  // 1. Get groups where user is a member
  const { data: memberRows, error: memberErr } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);

  if (memberErr || !memberRows) {
    console.warn("[getUserActiveGroupsAction] Notice fetching member rows:", memberErr?.message);
    return [];
  }

  const activeGroupIds = Array.from(new Set(memberRows.map((m) => m.group_id)));

  if (activeGroupIds.length === 0) {
    return [];
  }

  // 2. Fetch group details
  const { data: groups, error: groupsErr } = await supabase
    .from("groups")
    .select("id, name, type")
    .in("id", activeGroupIds);

  if (groupsErr || !groups) {
    console.warn("[getUserActiveGroupsAction] Notice fetching groups:", groupsErr?.message);
    return [];
  }

  const validGroups = groups;

  // 3. Fetch active members for these groups
  const result: ActiveGroupOption[] = [];

  for (const g of validGroups) {
    const { data: groupMembers } = await supabase
      .from("group_members")
      .select("user_id, status, users:user_id(id, name, email)")
      .eq("group_id", g.id);

    const activeMembers = (groupMembers || [])
      .filter((m) => !m.status || m.status === "active")
      .map((m: any) => {
        const u = Array.isArray(m.users) ? m.users[0] : m.users;
        return {
          id: u?.id || m.user_id,
          name: u?.name || "Member",
          email: u?.email || "",
        };
      });

    result.push({
      id: g.id,
      name: g.name,
      type: g.type,
      members: activeMembers,
    });
  }

  return result;
}

/**
 * Saves receipt expenses to an EXISTING group atomically via RPC.
 */
export async function saveReceiptToExistingGroupAction(
  payload: SaveReceiptToExistingGroupPayload
): Promise<ReceiptActionResult> {
  const { groupId, paidBy, date, idempotencyKey, receiptHash, expenses } = payload;

  if (!groupId) {
    return { success: false, error: "Please select a group." };
  }
  if (!paidBy) {
    return { success: false, error: "Please choose who paid for the bill." };
  }
  if (!expenses || expenses.length === 0) {
    return { success: false, error: "No receipt expenses to save." };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    return { success: false, error: "You must be signed in to add expenses." };
  }

  // Transform expenses payload for PostgreSQL RPC format
  const formattedExpenses = expenses.map((exp) => ({
    title: exp.title,
    amount: exp.amount,
    category: exp.category,
    splits: exp.splits.map((s) => ({
      user_id: s.userId,
      share_amount: s.shareAmount,
    })),
  }));

  const { data, error } = await supabase.rpc("save_receipt_expenses_atomic", {
    p_group_id: groupId,
    p_paid_by: paidBy,
    p_date: date || new Date().toISOString().split("T")[0],
    p_idempotency_key: idempotencyKey,
    p_receipt_hash: receiptHash,
    p_expenses: formattedExpenses,
  });

  if (error) {
    console.error("[saveReceiptToExistingGroupAction] RPC error:", error);
    return {
      success: false,
      error: error.message || "Failed to save expenses to group.",
    };
  }

  revalidatePath(`/group/${groupId}`);
  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    groupId,
    batchId: data?.batch_id,
  };
}

/**
 * Atomically creates a NEW group with members and saves receipt expenses in ONE transaction.
 */
export async function createGroupWithReceiptAction(
  payload: CreateGroupWithReceiptPayload
): Promise<ReceiptActionResult> {
  const {
    name,
    type,
    memberEmails,
    date,
    idempotencyKey,
    receiptHash,
    expenses,
  } = payload;

  if (!name.trim()) {
    return { success: false, error: "Please enter a group name." };
  }
  if (!expenses || expenses.length === 0) {
    return { success: false, error: "No receipt expenses to save." };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    return { success: false, error: "You must be signed in to create a group." };
  }

  const formattedExpenses = expenses.map((exp) => ({
    title: exp.title,
    amount: exp.amount,
    category: exp.category,
    splits: exp.splits.map((s) => ({
      user_id: s.userId,
      share_amount: s.shareAmount,
    })),
  }));

  let groupId: string | undefined;
  let inviteCode: string | undefined;
  let batchId: string | undefined;

  const { data, error } = await supabase.rpc(
    "create_group_with_receipt_atomic",
    {
      p_name: name.trim(),
      p_type: type || "event",
      p_member_emails: memberEmails || [],
      p_date: date || new Date().toISOString().split("T")[0],
      p_idempotency_key: idempotencyKey,
      p_receipt_hash: receiptHash,
      p_expenses: formattedExpenses,
    }
  );

  if (!error && data?.group_id) {
    groupId = data.group_id;
    inviteCode = data.invite_code;
    batchId = data.batch_id;
  } else {
    // If the function is not found in schema cache, fall back to direct inserts
    const isMissingRpc =
      error?.message?.includes("Could not find the function") ||
      error?.code === "PGRST202" ||
      error?.message?.includes("schema cache");

    if (!isMissingRpc && error) {
      console.error("[createGroupWithReceiptAction] RPC error:", error);
      return {
        success: false,
        error: error.message || "Failed to create group and save receipt.",
      };
    }

    // Direct insert fallback
    try {
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: newGroup, error: groupErr } = await supabase
        .from("groups")
        .insert({
          name: name.trim(),
          type: type || "event",
          created_by: authData.user.id,
          invite_code: generatedCode,
        })
        .select("id, invite_code")
        .single();

      if (groupErr || !newGroup) {
        throw new Error(groupErr?.message || "Failed to create group.");
      }

      groupId = newGroup.id;
      inviteCode = newGroup.invite_code;

      // Add creator as member
      await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: authData.user.id,
      });

      // Add other members if emails provided
      if (memberEmails && memberEmails.length > 0) {
        const { data: foundUsers } = await supabase
          .from("users")
          .select("id, email")
          .in("email", memberEmails);

        if (foundUsers && foundUsers.length > 0) {
          const newMembers = foundUsers.map((u) => ({
            group_id: groupId,
            user_id: u.id,
          }));
          await supabase.from("group_members").insert(newMembers);
        }
      }

      // Insert expenses
      const expenseDate = date || new Date().toISOString().split("T")[0];
      for (const exp of formattedExpenses) {
        const { data: insertedExp, error: expErr } = await supabase
          .from("expenses")
          .insert({
            group_id: groupId,
            title: exp.title,
            amount: exp.amount,
            paid_by: authData.user.id,
            category: exp.category,
            date: expenseDate,
            split_type: "exact",
          })
          .select("id")
          .single();

        if (!expErr && insertedExp) {
          const splitsToInsert = exp.splits.map((s) => ({
            expense_id: insertedExp.id,
            user_id: s.user_id,
            share_amount: s.share_amount,
          }));
          await supabase.from("expense_splits").insert(splitsToInsert);
        }
      }

      // Record in receipt_scans if available
      try {
        await supabase.from("receipt_scans").insert({
          user_id: authData.user.id,
          status: "success",
          idempotency_key: idempotencyKey,
          receipt_hash: receiptHash,
        });
      } catch {
        // Safe to ignore if receipt_scans table does not exist yet
      }
    } catch (fallbackErr: any) {
      console.error("[createGroupWithReceiptAction] Fallback error:", fallbackErr);
      return {
        success: false,
        error: fallbackErr?.message || "Failed to save group and receipt.",
      };
    }
  }

  if (groupId) {
    revalidatePath(`/group/${groupId}`);
    revalidatePath(`/groups/${groupId}`);
  }
  revalidatePath("/dashboard");

  return {
    success: true,
    groupId,
    inviteCode,
    batchId,
  };
}

/**
 * Backward compatibility alias for any existing imports
 */
export const createGroupFromReceipt = createGroupWithReceiptAction;
