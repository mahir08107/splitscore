"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { DEMO_GROUP_ID, DEMO_MEMBERS_USERS } from "@/lib/group/demo-data";
import { roundToTwo } from "@/lib/utils";

export interface SuggestedPayment {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

export interface SettlementRecord {
  id: string;
  group_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  status: "pending" | "marked_paid" | "confirmed" | "disputed";
  due_date?: string | null;
  marked_paid_at?: string | null;
  confirmed_at?: string | null;
  fromName?: string;
  toName?: string;
}

export interface SettleUpData {
  groupId: string;
  groupName: string;
  currentUserId: string;
  suggestedPayments: SuggestedPayment[];
  activeSettlements: SettlementRecord[];
  isDemo: boolean;
}

/**
 * Simplifies debts for any list of expenses and splits.
 * Eliminates middlemen using Minimum Cash Flow greedy matching.
 */
export async function simplifyGroupDebts(
  memberIds: string[],
  memberNames: Record<string, string>,
  expenses: Array<{ id: string; amount: number; paid_by: string }>,
  splits: Array<{ expense_id: string; user_id: string; share_amount: number }>,
  settlements: Array<{ from_user: string; to_user: string; amount: number; status: string }> = []
): Promise<SuggestedPayment[]> {
  // 1. Calculate net balance for each member
  const balances: Record<string, number> = {};
  for (const id of memberIds) {
    balances[id] = 0;
  }

  // Credit payers
  for (const exp of expenses) {
    const amt = Number(exp.amount) || 0;
    balances[exp.paid_by] = (balances[exp.paid_by] || 0) + amt;
  }

  // Debit split shares
  for (const split of splits) {
    const share = Number(split.share_amount) || 0;
    balances[split.user_id] = (balances[split.user_id] || 0) - share;
  }

  // Adjust for confirmed settlements only (settled payments decrease debt)
  for (const s of settlements) {
    if (s.status === "confirmed") {
      const amt = Number(s.amount) || 0;
      balances[s.from_user] = (balances[s.from_user] || 0) + amt;
      balances[s.to_user] = (balances[s.to_user] || 0) - amt;
    }
  }

  // Round balances to 2 decimal places
  for (const id of Object.keys(balances)) {
    balances[id] = roundToTwo(balances[id]);
  }

  // 2. Separate into debtors and creditors
  const debtors: Array<{ id: string; amount: number }> = [];
  const creditors: Array<{ id: string; amount: number }> = [];

  for (const [id, balance] of Object.entries(balances)) {
    if (balance < -0.01) {
      debtors.push({ id, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ id, amount: balance });
    }
  }

  // 3. Sort descending for greedy matching (eliminates middlemen)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const suggested: SuggestedPayment[] = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];

    const settleAmount = roundToTwo(Math.min(debtor.amount, creditor.amount));

    if (settleAmount > 0.01) {
      suggested.push({
        fromUserId: debtor.id,
        fromName: memberNames[debtor.id] || "Member",
        toUserId: creditor.id,
        toName: memberNames[creditor.id] || "Member",
        amount: settleAmount,
      });
    }

    debtor.amount = roundToTwo(debtor.amount - settleAmount);
    creditor.amount = roundToTwo(creditor.amount - settleAmount);

    if (debtor.amount < 0.01) d++;
    if (creditor.amount < 0.01) c++;
  }

  return suggested;
}

/**
 * Fetch all data required for the /group/[id]/settle page.
 */
export async function getSettleUpData(
  groupId: string,
  userIdOverride?: string
): Promise<SettleUpData | null> {
  const isDemoGroup = groupId === DEMO_GROUP_ID;
  let currentUserId = userIdOverride || "";

  if (!currentUserId) {
    try {
      const serverClient = await createServerSupabase();
      const { data } = await serverClient.auth.getUser();
      if (data?.user) {
        currentUserId = data.user.id;
      }
    } catch {
      // Supabase auth optional in dev
    }
  }

  // Fallback demo state if Supabase unconfigured or demo group
  if (isDemoGroup || !supabase) {
    const memberNames: Record<string, string> = {};
    DEMO_MEMBERS_USERS.forEach((m) => {
      memberNames[m.id] = m.name;
    });

    return {
      groupId,
      groupName: "Goa Trip (Demo)",
      currentUserId,
      suggestedPayments: [
        {
          fromUserId: "demo-user-rahul",
          fromName: "Rahul Verma",
          toUserId: currentUserId,
          toName: "Student User",
          amount: 2500,
        },
      ],
      activeSettlements: [
        {
          id: "demo-settle-1",
          group_id: groupId,
          from_user: "demo-user-arjun",
          to_user: currentUserId,
          amount: 1200,
          status: "marked_paid",
          marked_paid_at: new Date().toISOString(),
          fromName: "Arjun Nair",
          toName: "Student User",
        },
      ],
      isDemo: true,
    };
  }

  try {
    let client = supabase;
    try {
      const serverClient = await createServerSupabase();
      if (serverClient) client = serverClient;
    } catch {
      // client remains singleton supabase
    }

    // 1. Fetch group
    const { data: group, error: groupErr } = await client
      .from("groups")
      .select("id, name")
      .eq("id", groupId)
      .maybeSingle();

    if (groupErr || !group) {
      console.warn("Group not found in Supabase:", groupErr?.message);
      return null;
    }

    // 2. Fetch members
    const { data: memberRows } = await client
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    const memberIds = (memberRows || []).map((m: { user_id: string }) => m.user_id);

    // 3. Fetch member user profiles
    const memberNames: Record<string, string> = {};
    if (memberIds.length > 0) {
      const { data: usersData } = await client
        .from("users")
        .select("id, name")
        .in("id", memberIds);

      for (const u of usersData || []) {
        memberNames[u.id] = u.name || "Member";
      }
    }

    // 4. Fetch expenses
    const { data: expensesData } = await client
      .from("expenses")
      .select("id, amount, paid_by")
      .eq("group_id", groupId);

    const expenseList = (expensesData || []).map((e: any) => ({
      id: e.id,
      amount: Number(e.amount) || 0,
      paid_by: e.paid_by,
    }));
    const expenseIds = expenseList.map((e) => e.id);

    // 5. Fetch splits
    let splitsList: Array<{ expense_id: string; user_id: string; share_amount: number }> = [];
    if (expenseIds.length > 0) {
      const { data: splitsData } = await client
        .from("expense_splits")
        .select("expense_id, user_id, share_amount")
        .in("expense_id", expenseIds);

      splitsList = (splitsData || []).map((s: any) => ({
        expense_id: s.expense_id,
        user_id: s.user_id,
        share_amount: Number(s.share_amount) || 0,
      }));
    }

    // 6. Fetch settlements for this group
    const { data: settlementsData } = await client
      .from("settlements")
      .select("id, group_id, from_user, to_user, amount, status, due_date, marked_paid_at, confirmed_at")
      .eq("group_id", groupId);

    const activeSettlements: SettlementRecord[] = (settlementsData || []).map((s: any) => ({
      id: s.id,
      group_id: s.group_id,
      from_user: s.from_user,
      to_user: s.to_user,
      amount: Number(s.amount) || 0,
      status: s.status,
      due_date: s.due_date,
      marked_paid_at: s.marked_paid_at,
      confirmed_at: s.confirmed_at,
      fromName: memberNames[s.from_user] || "Member",
      toName: memberNames[s.to_user] || "Member",
    }));

    // 7. Simplify debts
    const suggestedPayments = await simplifyGroupDebts(
      memberIds,
      memberNames,
      expenseList,
      splitsList,
      activeSettlements
    );

    return {
      groupId,
      groupName: group.name,
      currentUserId,
      suggestedPayments,
      activeSettlements,
      isDemo: false,
    };
  } catch (err) {
    console.error("Failed to load settle up data:", err);
    return null;
  }
}

/**
 * Server action: Payer marks a debt as paid.
 * Creates or updates a settlement with status 'marked_paid' and marked_paid_at = NOW()
 */
export async function markAsPaidAction(payload: {
  groupId: string;
  fromUser: string;
  toUser: string;
  amount: number;
  settlementId?: string;
}): Promise<{ success: boolean; settlementId?: string; error?: string }> {
  const { groupId, fromUser, toUser, amount, settlementId } = payload;

  if (groupId === DEMO_GROUP_ID || !supabase) {
    return { success: true, settlementId: settlementId || "demo-paid-123" };
  }

  try {
    let client = supabase;
    try {
      const serverClient = await createServerSupabase();
      if (serverClient) client = serverClient;
    } catch {
      // client remains singleton supabase
    }

    const now = new Date().toISOString();

    if (settlementId) {
      // Update existing settlement
      const { data, error } = await client
        .from("settlements")
        .update({
          status: "marked_paid",
          marked_paid_at: now,
        })
        .eq("id", settlementId)
        .select("id")
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      revalidatePath(`/group/${groupId}`);
      revalidatePath(`/group/${groupId}/settle`);
      revalidatePath("/dashboard");
      return { success: true, settlementId: data.id };
    } else {
      // Insert new settlement record with status marked_paid
      const { data, error } = await client
        .from("settlements")
        .insert({
          group_id: groupId,
          from_user: fromUser,
          to_user: toUser,
          amount: roundToTwo(amount),
          status: "marked_paid",
          marked_paid_at: now,
        })
        .select("id")
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      revalidatePath(`/group/${groupId}`);
      revalidatePath(`/group/${groupId}/settle`);
      revalidatePath("/dashboard");
      return { success: true, settlementId: data.id };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to mark payment as paid." };
  }
}

/**
 * Server action: Receiver confirms received or disputes a payment.
 * When status is confirmed:
 * 1. Sets status = 'confirmed', confirmed_at = NOW()
 * 2. Triggers score_events insertion for the payer
 */
export async function updateSettlementStatusAction(payload: {
  settlementId: string;
  groupId: string;
  status: "confirmed" | "disputed";
  payerId: string;
  amount: number;
}): Promise<{ success: boolean; error?: string }> {
  const { settlementId, groupId, status, payerId, amount } = payload;

  if (groupId === DEMO_GROUP_ID || !supabase) {
    return { success: true };
  }

  try {
    let client = supabase;
    try {
      const serverClient = await createServerSupabase();
      if (serverClient) client = serverClient;
    } catch {
      // client remains singleton supabase
    }

    const now = new Date().toISOString();

    // 1. Update settlement row
    const updateData: Record<string, any> = { status };
    if (status === "confirmed") {
      updateData.confirmed_at = now;
    }

    const { error: updateError } = await client
      .from("settlements")
      .update(updateData)
      .eq("id", settlementId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 2. Score Event Hook: If confirmed, create a score_events record for the payer
    if (status === "confirmed") {
      console.log(`[updateSettlementStatusAction] Triggering score event for payer ${payerId}`);

      const points = amount >= 1000 ? 15 : 10;
      const reason = `Confirmed repayment of ₹${amount.toLocaleString("en-IN")}`;

      const { error: scoreError } = await client
        .from("score_events")
        .insert({
          user_id: payerId,
          settlement_id: settlementId,
          points_change: points,
          reason,
        });

      if (scoreError) {
        console.warn("[updateSettlementStatusAction] Warning: Failed to insert score event:", scoreError.message);
        // Do not fail the settlement confirmation if score logging has an issue
      }
    }

    revalidatePath(`/group/${groupId}`);
    revalidatePath(`/group/${groupId}/settle`);
    revalidatePath("/dashboard");
    revalidatePath("/trust-score");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update settlement status." };
  }
}
