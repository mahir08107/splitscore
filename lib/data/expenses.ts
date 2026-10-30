"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { DEMO_GROUP_ID, DEMO_MEMBERS_USERS } from "@/lib/group/demo-data";
import { UserSummary } from "@/lib/group/types";
import { roundToTwo } from "@/lib/utils";

export type SplitMode = "equal" | "exact" | "percentage" | "shares";

export interface ExpenseShareInput {
  userId: string;
  shareAmount: number;
}

export interface CreateExpensePayload {
  groupId: string;
  title: string;
  amount: number;
  paidBy: string;
  date: string;
  category: string;
  splitType: SplitMode;
  splits: ExpenseShareInput[];
}

export interface GroupMembersResult {
  groupName: string;
  members: UserSummary[];
  currentUserId: string;
  isDemo: boolean;
}

/**
 * Fetch group info and members for the Add Expense page
 */
export async function getGroupForExpense(
  groupId: string,
  userIdOverride?: string
): Promise<GroupMembersResult | null> {
  // Determine current user from real auth
  let currentUserId = userIdOverride || "";

  if (!currentUserId) {
    try {
      const serverClient = await createServerSupabase();
      const { data } = await serverClient.auth.getUser();
      if (data?.user) {
        currentUserId = data.user.id;
      }
    } catch {
      // Supabase auth might be unavailable
    }
  }

  // If demo group or no supabase instance, return mock members
  if (groupId === DEMO_GROUP_ID || !supabase) {
    return {
      groupName: groupId === DEMO_GROUP_ID ? "Goa Trip (Demo)" : "Group",
      members: DEMO_MEMBERS_USERS,
      currentUserId: currentUserId || DEMO_MEMBERS_USERS[0].id,
      isDemo: true,
    };
  }

  try {
    // 1. Fetch group
    const { data: group, error: groupErr } = await supabase
      .from("groups")
      .select("id, name")
      .eq("id", groupId)
      .maybeSingle();

    if (groupErr || !group) {
      console.warn("Group not found in Supabase:", groupErr?.message);
      return null;
    }

    // 2. Fetch group members
    const { data: memberRows, error: memberErr } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    if (memberErr) {
      console.warn("Error fetching members:", memberErr.message);
      return null;
    }

    const memberUserIds = (memberRows || []).map((m: { user_id: string }) => m.user_id);

    if (memberUserIds.length === 0) {
      return {
        groupName: group.name,
        members: [],
        currentUserId,
        isDemo: false,
      };
    }

    // 3. Fetch user profiles
    const { data: usersData, error: userErr } = await supabase
      .from("users")
      .select("id, name, email, avatar")
      .in("id", memberUserIds);

    if (userErr) {
      console.warn("Error fetching users:", userErr.message);
    }

    const members: UserSummary[] = (usersData || []).map((u: any) => ({
      id: u.id,
      name: u.name || "Member",
      email: u.email || "",
      avatar: u.avatar || null,
    }));

    return {
      groupName: group.name,
      members,
      currentUserId,
      isDemo: false,
    };
  } catch (err) {
    console.error("Failed to load group members for expense:", err);
    return null;
  }
}

/**
 * Server action to atomically insert an expense and its individual shares.
 */
export async function createExpenseAction(payload: CreateExpensePayload): Promise<{
  success: boolean;
  error?: string;
  expenseId?: string;
}> {
  const {
    groupId,
    title,
    amount,
    paidBy,
    date,
    category,
    splitType,
    splits,
  } = payload;

  // Basic validation
  if (!title || title.trim().length === 0) {
    return { success: false, error: "Please enter an expense title." };
  }

  const numericAmount = roundToTwo(Number(amount));
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return { success: false, error: "Total amount must be greater than zero." };
  }

  if (!paidBy) {
    return { success: false, error: "Please specify who paid for this expense." };
  }

  if (!splits || splits.length === 0) {
    return { success: false, error: "At least one member must be included in the split." };
  }

  // Validate math equality: sum of individual shares must match total amount
  const totalSplits = roundToTwo(
    splits.reduce((acc, curr) => acc + Number(curr.shareAmount), 0)
  );

  // Allow tiny float epsilon of 0.05 for rounding distribution
  if (Math.abs(totalSplits - numericAmount) > 0.05) {
    return {
      success: false,
      error: `Sum of member shares (₹${totalSplits.toFixed(2)}) does not equal total amount (₹${numericAmount.toFixed(2)}).`,
    };
  }
  // Handle demo group — never hit the real database with a non-UUID id
  if (groupId === DEMO_GROUP_ID) {
    return {
      success: true,
      expenseId: "demo-exp-" + Date.now(),
    };
  }

  // Handle Offline / Unconfigured
  if (!supabase) {
    return {
      success: false,
      error: "Database connection is not configured.",
    };
  }

  try {
    // Prefer server Supabase client for authenticated context, fallback to client
    let client = supabase;
    try {
      const serverClient = await createServerSupabase();
      if (serverClient) client = serverClient;
    } catch {
      // Use fallback singleton client
    }

    // 1. Insert into expenses table
    console.log("[createExpenseAction] Inserting expense:", {
      group_id: groupId,
      title: title.trim(),
      amount: numericAmount,
      paid_by: paidBy,
      category,
      date,
      split_type: splitType,
    });

    const { data: expenseRecord, error: expenseError } = await client
      .from("expenses")
      .insert({
        group_id: groupId,
        title: title.trim(),
        amount: numericAmount,
        paid_by: paidBy,
        category: category || "Other",
        date: date || new Date().toISOString().split("T")[0],
        split_type: splitType,
      })
      .select("id")
      .single();

    if (expenseError || !expenseRecord) {
      console.error("[createExpenseAction] Error creating expense:", expenseError);
      return {
        success: false,
        error: expenseError?.message || "Failed to create expense in database.",
      };
    }

    const newExpenseId = expenseRecord.id;
    console.log("[createExpenseAction] Expense inserted with ID:", newExpenseId);

    // 2. Prepare individual splits rows
    const splitRows = splits.map((s) => ({
      expense_id: newExpenseId,
      user_id: s.userId,
      share_amount: roundToTwo(Number(s.shareAmount)),
    }));

    console.log("[createExpenseAction] Inserting splits:", splitRows);

    // 3. Insert splits
    const { error: splitsError } = await client
      .from("expense_splits")
      .insert(splitRows);

    if (splitsError) {
      console.error("[createExpenseAction] Error creating splits:", splitsError);
      // Attempt cleanup of parent expense to prevent orphaned records
      await client.from("expenses").delete().eq("id", newExpenseId);
      return {
        success: false,
        error: splitsError.message || "Failed to save individual splits.",
      };
    }

    console.log("[createExpenseAction] Expense and splits inserted successfully!");

    // 4. Revalidate cache so dashboard and group pages reflect the new expense immediately
    try {
      revalidatePath(`/group/${groupId}`);
      revalidatePath("/dashboard");
    } catch {
      // Revalidation errors can be ignored in dev
    }

    return {
      success: true,
      expenseId: newExpenseId,
    };
  } catch (err: any) {
    console.error("[createExpenseAction] Unexpected failure:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while saving the expense.",
    };
  }
}
