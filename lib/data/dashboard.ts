import { supabase } from "@/lib/supabase";

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

export type GroupType = "trip" | "mess" | "event";

export type TrustBand = "Excellent" | "Good" | "Building" | "Risky";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface TrustScoreInfo {
  score: number;
  band: TrustBand;
  confidenceNote: string;
  verifiedCount?: number;
}

export interface PendingAction {
  id: string;
  type: "confirm_payment" | "pay_someone";
  counterpartyName: string;
  amount: number;
  groupId: string;
  settlementId: string;
  description: string;
}

export interface DashboardGroup {
  id: string;
  name: string;
  type: GroupType;
  memberCount: number;
  userBalance: number; // positive = owed to user (green), negative = user owes (red), 0 = settled (grey)
}

export interface DashboardData {
  user: UserProfile;
  totalOwe: number;
  totalOwed: number;
  trustScore: TrustScoreInfo;
  pendingActions: PendingAction[];
  groups: DashboardGroup[];
}


export function getTrustBand(score: number): TrustBand {
  if (score >= 800) return "Excellent";
  if (score >= 650) return "Good";
  if (score >= 500) return "Building";
  return "Risky";
}

export function formatRupees(amount: number): string {
  const rounded = Math.round(Math.abs(amount));
  return `₹${rounded.toLocaleString("en-IN")}`;
}

/**
 * Computes dashboard balance from expenses and expense splits.
 * netBalance = (Amount paid by user for expenses in the group) - (User's share in expenses of the group)
 */
export function computeGroupBalances(
  userId: string,
  groupIds: string[],
  expenses: Array<{ id: string; group_id: string; paid_by: string; amount: number }>,
  splits: Array<{ expense_id: string; user_id: string; share_amount: number }>
): Record<string, number> {
  const balances: Record<string, number> = {};
  for (const gid of groupIds) {
    balances[gid] = 0;
  }

  // Map each expense to its group and payer
  const expenseMap = new Map<
    string,
    { group_id: string; paid_by: string; amount: number }
  >();
  for (const exp of expenses) {
    expenseMap.set(exp.id, exp);
  }

  // Credit: When user paid an expense, they are owed back what other members share
  for (const exp of expenses) {
    if (exp.paid_by === userId && balances[exp.group_id] !== undefined) {
      balances[exp.group_id] += Number(exp.amount) || 0;
    }
  }

  // Debit: For every split assigned to user, user owes their share
  for (const split of splits) {
    if (split.user_id === userId) {
      const exp = expenseMap.get(split.expense_id);
      if (exp && balances[exp.group_id] !== undefined) {
        balances[exp.group_id] -= Number(split.share_amount) || 0;
      }
    }
  }

  return balances;
}

/**
 * Fetch all dashboard data for a given user from Supabase.
 * Returns clean empty states if tables have no data or Supabase is not configured yet.
 */
export async function getDashboardData(
  userId: string = DEMO_USER_ID
): Promise<DashboardData> {
  const activeUserId = userId || DEMO_USER_ID;

  // If Supabase credentials are missing, provide clean graceful mock/empty state
  if (!supabase) {
    return getFallbackEmptyData(activeUserId);
  }

  try {
    // 1. Fetch User details
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, name, email, avatar")
      .eq("id", activeUserId)
      .maybeSingle();

    if (userError) {
      console.warn("Error fetching user profile:", userError.message);
    }

    const user: UserProfile = {
      id: activeUserId,
      name: userData?.name || (activeUserId === DEMO_USER_ID ? "Student User" : "User"),
      email: userData?.email || (activeUserId === DEMO_USER_ID ? "student@college.edu" : "user@splitscore.in"),
      avatar: userData?.avatar || null,
    };

    // 2. Fetch User's groups via group_members
    const { data: memberRows, error: memberError } = await supabase
      .from("group_members")
      .select("group_id, joined_at")
      .eq("user_id", activeUserId);

    if (memberError) {
      console.warn("Error fetching group members:", memberError.message);
    }

    const groupIds = (memberRows || []).map((m: { group_id: string }) => m.group_id);

    let groups: DashboardGroup[] = [];
    let totalOwe = 0;
    let totalOwed = 0;

    if (groupIds.length > 0) {
      // Fetch group details
      const { data: groupDetails, error: groupError } = await supabase
        .from("groups")
        .select("id, name, type")
        .in("id", groupIds);

      if (groupError) {
        console.warn("Error fetching groups:", groupError.message);
      }

      // Fetch member counts for these groups
      const { data: allMembers, error: allMembersError } = await supabase
        .from("group_members")
        .select("group_id")
        .in("group_id", groupIds);

      const memberCountMap: Record<string, number> = {};
      for (const m of allMembers || []) {
        memberCountMap[m.group_id] = (memberCountMap[m.group_id] || 0) + 1;
      }

      // Fetch expenses for per-group balance display
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("id, group_id, paid_by, amount")
        .in("group_id", groupIds);

      if (expensesError) {
        console.warn("Error fetching expenses:", expensesError.message);
      }

      const expenseList = expenses || [];
      const expenseIds = expenseList.map((e: { id: string }) => e.id);

      let splitsList: Array<{ expense_id: string; user_id: string; share_amount: number }> = [];
      if (expenseIds.length > 0) {
        const { data: splits, error: splitsError } = await supabase
          .from("expense_splits")
          .select("expense_id, user_id, share_amount")
          .in("expense_id", expenseIds);

        if (splitsError) {
          console.warn("Error fetching expense splits:", splitsError.message);
        }
        splitsList = splits || [];
      }

      const balancesByGroup = computeGroupBalances(
        activeUserId,
        groupIds,
        expenseList,
        splitsList
      );

      groups = (groupDetails || []).map((g: { id: string; name: string; type: GroupType }) => {
        const net = balancesByGroup[g.id] || 0;
        return {
          id: g.id,
          name: g.name,
          type: (g.type as GroupType) || "trip",
          memberCount: memberCountMap[g.id] || 1,
          userBalance: net,
        };
      });
    }

    // 3. Fetch all pending/marked_paid settlements for this user in one query
    // Then derive BOTH the summary card totals AND the pending actions from the same data
    const { data: settlements, error: settlementError } = await supabase
      .from("settlements")
      .select("id, group_id, from_user, to_user, amount, status")
      .in("status", ["pending", "marked_paid"])
      .or(`from_user.eq.${activeUserId},to_user.eq.${activeUserId}`);

    if (settlementError) {
      console.warn("Error fetching settlements:", settlementError.message);
    }

    const settlementList = settlements || [];

    // "You owe" = sum of amount where from_user = activeUserId AND status = 'pending'
    // "You are owed" = sum of amount where to_user = activeUserId AND status = 'pending'
    // This strictly matches the pending actions so the cards and the list always agree
    for (const s of settlementList) {
      const amt = Number(s.amount) || 0;
      if (s.from_user === activeUserId && s.status === "pending") {
        totalOwe += amt;
      }
      if (s.to_user === activeUserId && s.status === "pending") {
        totalOwed += amt;
      }
    }

    // Build pending actions list from the same settlement data
    const pendingActions: PendingAction[] = [];

    if (settlementList.length > 0) {
      // Collect counterparty user IDs
      const counterpartyIds = Array.from(
        new Set(
          settlementList.map((s: any) =>
            s.from_user === activeUserId ? s.to_user : s.from_user
          ).filter(Boolean)
        )
      );

      let nameMap: Record<string, string> = {};
      if (counterpartyIds.length > 0) {
        const { data: counterpartyUsers } = await supabase
          .from("users")
          .select("id, name")
          .in("id", counterpartyIds);

        for (const u of counterpartyUsers || []) {
          nameMap[u.id] = u.name;
        }
      }

      for (const item of settlementList) {
        const isPayer = item.from_user === activeUserId;
        const isReceiver = item.to_user === activeUserId;
        const amt = Number(item.amount) || 0;

        if (isReceiver && item.status === "marked_paid") {
          const counterparty = nameMap[item.from_user] || "Member";
          pendingActions.push({
            id: item.id,
            type: "confirm_payment",
            counterpartyName: counterparty,
            amount: amt,
            groupId: item.group_id,
            settlementId: item.id,
            description: `Confirm payment from ${counterparty}`,
          });
        } else if (isPayer && item.status === "pending") {
          const counterparty = nameMap[item.to_user] || "Member";
          pendingActions.push({
            id: item.id,
            type: "pay_someone",
            counterpartyName: counterparty,
            amount: amt,
            groupId: item.group_id,
            settlementId: item.id,
            description: `You owe ${counterparty} ${amt} rupees`,
          });
        }
      }
    }

    // 4. Fetch user's latest trust score from score_events or user score
    const { data: scoreEvents, error: scoreError } = await supabase
      .from("score_events")
      .select("id, points_change, reason, created_at")
      .eq("user_id", activeUserId)
      .order("created_at", { ascending: false });

    if (scoreError) {
      console.warn("Error fetching score events:", scoreError.message);
    }

    const settlementCount = scoreEvents?.length || 0;
    // Base score starts at 650 (mid) + sum of points changes
    const totalPointsChange = (scoreEvents || []).reduce(
      (acc: number, curr: { points_change: number }) => acc + (Number(curr.points_change) || 0),
      0
    );

    const isDemoUser = activeUserId === DEMO_USER_ID;
    const scoreVal =
      isDemoUser && settlementCount === 0
        ? 760
        : Math.min(900, Math.max(300, 650 + totalPointsChange));
    const band = getTrustBand(scoreVal);
    const confidenceNote =
      isDemoUser && settlementCount === 0
        ? "Based on 8 settlements across 4 peers"
        : settlementCount > 0
          ? `Based on ${settlementCount} settlement${settlementCount > 1 ? "s" : ""}`
          : "Cold start (neutral)";
    const verifiedCount =
      isDemoUser && settlementCount === 0 ? 8 : settlementCount;

    return {
      user,
      totalOwe,
      totalOwed,
      trustScore: {
        score: scoreVal,
        band,
        confidenceNote,
        verifiedCount,
      },
      pendingActions,
      groups,
    };
  } catch (err) {
    console.error("Dashboard data fetching failed, returning fallback:", err);
    return getFallbackEmptyData(activeUserId);
  }
}

/**
 * Returns empty/starter state when database tables are empty or Supabase isn't reachable yet
 */
function getFallbackEmptyData(userId: string): DashboardData {
  return {
    user: {
      id: userId,
      name: "Student",
      email: "demo@splitscore.in",
      avatar: null,
    },
    totalOwe: 0,
    totalOwed: 0,
    trustScore: {
      score: 650,
      band: "Good",
      confidenceNote: "Cold start (neutral)",
      verifiedCount: 0,
    },
    pendingActions: [],
    groups: [],
  };
}
