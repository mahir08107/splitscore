import {
  GroupModel,
  GroupMemberModel,
  ExpenseModel,
  SettlementModel,
  GroupDetailData,
  UserSummary,
} from "./types";
import {
  calculateEqualSplits,
  computeMemberBalances,
  simplifyDebts,
} from "./balances";

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

export const DEMO_STUDENT_USER: UserSummary = {
  id: DEMO_USER_ID,
  name: "Aarav Sharma",
  email: "aarav@demo.splitscore.app",
  avatar: null,
};

export const DEMO_MEMBERS_USERS: UserSummary[] = [
  DEMO_STUDENT_USER,
  {
    id: "demo-user-rahul",
    name: "Rahul Verma",
    email: "rahul@college.edu",
    avatar: null,
  },
  {
    id: "demo-user-arjun",
    name: "Arjun Nair",
    email: "arjun@college.edu",
    avatar: null,
  },
  {
    id: "demo-user-karan",
    name: "Karan Mehta",
    email: "karan@college.edu",
    avatar: null,
  },
];

export const DEMO_GROUP_ID = "goa-trip-demo";

export const DEMO_GROUP: GroupModel = {
  id: DEMO_GROUP_ID,
  name: "Goa Trip",
  type: "trip",
  description: "Annual graduation trip to North & South Goa with the squad.",
  invite_code: "GOA2026",
  created_by: DEMO_USER_ID,
  created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
};

// 4 seed expenses equal split among all four
const allMemberIds = DEMO_MEMBERS_USERS.map((m) => m.id);

function createEqualSplitsList(expenseId: string, amount: number) {
  const shares = calculateEqualSplits(amount, allMemberIds);
  return Object.entries(shares).map(([userId, shareAmount]) => ({
    expense_id: expenseId,
    user_id: userId,
    share_amount: shareAmount,
  }));
}

export const INITIAL_DEMO_EXPENSES: ExpenseModel[] = [
  {
    id: "demo-exp-1",
    group_id: DEMO_GROUP_ID,
    title: "Hotel Booking",
    amount: 8000,
    paid_by: "demo-user-rahul",
    category: "Stay",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    split_type: "equal",
    splits: createEqualSplitsList("demo-exp-1", 8000),
    payerName: "Rahul Verma",
  },
  {
    id: "demo-exp-2",
    group_id: DEMO_GROUP_ID,
    title: "Dinner",
    amount: 2400,
    paid_by: "demo-user-arjun",
    category: "Food",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    split_type: "equal",
    splits: createEqualSplitsList("demo-exp-2", 2400),
    payerName: "Arjun Nair",
  },
  {
    id: "demo-exp-3",
    group_id: DEMO_GROUP_ID,
    title: "Fuel",
    amount: 3000,
    paid_by: DEMO_USER_ID,
    category: "Transport",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    split_type: "equal",
    splits: createEqualSplitsList("demo-exp-3", 3000),
    payerName: "Aarav Sharma",
  },
  {
    id: "demo-exp-4",
    group_id: DEMO_GROUP_ID,
    title: "Beach Activities",
    amount: 2600,
    paid_by: "demo-user-karan",
    category: "Activities",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    split_type: "equal",
    splits: createEqualSplitsList("demo-exp-4", 2600),
    payerName: "Karan Mehta",
  },
];

export const INITIAL_DEMO_AWAITING_SETTLEMENTS: SettlementModel[] = [];

/**
 * Builds dynamic GroupDetailData strictly calculated from current expenses and settlements.
 */
export function buildDemoGroupData(
  customExpenses?: ExpenseModel[],
  customSettlements?: SettlementModel[]
): GroupDetailData {
  const expenses = customExpenses || INITIAL_DEMO_EXPENSES;
  const awaitingSettlements = customSettlements || INITIAL_DEMO_AWAITING_SETTLEMENTS;

  const memberIds = DEMO_MEMBERS_USERS.map((m) => m.id);
  const memberNames: Record<string, string> = {};
  DEMO_MEMBERS_USERS.forEach((u) => {
    memberNames[u.id] = u.name;
  });

  // Dynamic balances calculation
  const netBalances = computeMemberBalances(memberIds, expenses, awaitingSettlements);

  // Contributions per member
  const totalContributedMap: Record<string, number> = {};
  memberIds.forEach((id) => {
    totalContributedMap[id] = 0;
  });
  expenses.forEach((e) => {
    if (totalContributedMap[e.paid_by] !== undefined) {
      totalContributedMap[e.paid_by] += Number(e.amount) || 0;
    }
  });

  const members: GroupMemberModel[] = DEMO_MEMBERS_USERS.map((u, idx) => ({
    group_id: DEMO_GROUP_ID,
    user_id: u.id,
    role: idx === 0 ? "admin" : "member",
    joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    user: u,
    totalContributed: totalContributedMap[u.id] || 0,
    netBalance: netBalances[u.id] || 0,
    trustScore: idx === 0 ? 760 : idx === 1 ? 810 : idx === 2 ? 690 : 640,
    trustBand: idx === 0 ? "Good" : idx === 1 ? "Excellent" : idx === 2 ? "Good" : "Building",
  }));

  // Debt simplification
  const suggestedSettlements = simplifyDebts(netBalances, memberNames);

  // Summary Metrics
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const myNet = netBalances[DEMO_USER_ID] || 0;
  const youOwe = myNet < 0 ? Math.abs(myNet) : 0;
  const youAreOwed = myNet > 0 ? myNet : 0;

  return {
    group: DEMO_GROUP,
    members,
    expenses,
    awaitingSettlements,
    suggestedSettlements,
    summary: {
      totalExpenses,
      youOwe,
      youAreOwed,
      memberCount: members.length,
    },
    currentUser: DEMO_STUDENT_USER,
    currentUserRole: "admin",
  };
}

