import { supabase } from "@/lib/supabase";

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

export const DEMO_USER_ID =
  process.env.NEXT_PUBLIC_DEMO_USER_ID || "demo-user-123";

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
  // If Supabase credentials are missing, provide clean graceful mock/empty state
  if (!supabase) {
    return getFallbackEmptyData(userId);
  }

  try {
    // 1. Fetch User details
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, name, email, avatar")
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      console.warn("Error fetching user profile:", userError.message);
    }

    const user: UserProfile = {
      id: userId,
      name: userData?.name || "Student User",
      email: userData?.email || "student@college.edu",
      avatar: userData?.avatar || null,
    };

    // 2. Fetch User's groups via group_members
    const { data: memberRows, error: memberError } = await supabase
      .from("group_members")
      .select("group_id, joined_at")
      .eq("user_id", userId);

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

      // Fetch expenses for balance calculation
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
        userId,
        groupIds,
        expenseList,
        splitsList
      );

      groups = (groupDetails || []).map((g: { id: string; name: string; type: GroupType }) => {
        const net = balancesByGroup[g.id] || 0;
        if (net > 0) {
          totalOwed += net;
        } else if (net < 0) {
          totalOwe += Math.abs(net);
        }

        return {
          id: g.id,
          name: g.name,
          type: (g.type as GroupType) || "trip",
          memberCount: memberCountMap[g.id] || 1,
          userBalance: net,
        };
      });
    }

    // 3. Fetch pending actions from settlements (pending or marked_paid)
    // where user is either payer (needs to pay) or receiver (needs to confirm)
    const { data: settlements, error: settlementError } = await supabase
      .from("settlements")
      .select("id, group_id, from_user, to_user, amount, status")
      .in("status", ["pending", "marked_paid"])
      .or(`from_user.eq.${userId},to_user.eq.${userId}`);

    if (settlementError) {
      console.warn("Error fetching settlements:", settlementError.message);
    }

    const pendingActions: PendingAction[] = [];
    const settlementList = settlements || [];

    if (settlementList.length > 0) {
      // Collect counterparty user IDs
      const counterpartyIds = Array.from(
        new Set(
          settlementList.map((s: any) =>
            s.from_user === userId ? s.to_user : s.from_user
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
        const isPayer = item.from_user === userId;
        const isReceiver = item.to_user === userId;
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
      .eq("user_id", userId)
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
    const scoreVal = Math.min(900, Math.max(300, 650 + totalPointsChange));
    const band = getTrustBand(scoreVal);
    const confidenceNote =
      settlementCount > 0
        ? `Based on ${settlementCount} settlement${settlementCount > 1 ? "s" : ""}`
        : "Cold start (neutral)";

    return {
      user,
      totalOwe,
      totalOwed,
      trustScore: {
        score: scoreVal,
        band,
        confidenceNote,
        verifiedCount: settlementCount,
      },
      pendingActions,
      groups,
    };
  } catch (err) {
    console.error("Dashboard data fetching failed, returning fallback:", err);
    return getFallbackEmptyData(userId);
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
