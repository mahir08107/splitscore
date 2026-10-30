import { GroupType } from "@/lib/data/dashboard";

export type MemberRole = "admin" | "member";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface GroupModel {
  id: string;
  name: string;
  type: GroupType;
  description?: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface GroupMemberModel {
  group_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  user: UserSummary;
  totalContributed: number; // total amount paid in expenses
  netBalance: number; // positive = gets back, negative = owes, 0 = settled
  trustScore?: number;
  trustBand?: string;
}

export interface ExpenseSplitModel {
  expense_id: string;
  user_id: string;
  share_amount: number; // in integer paise or rupees
  userName?: string;
}

export interface ExpenseModel {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  paid_by: string;
  category: string;
  date: string;
  split_type: string;
  splits: ExpenseSplitModel[];
  payerName?: string;
}

export type SettlementStatus = "pending" | "marked_paid" | "confirmed" | "disputed";

export interface SettlementModel {
  id: string;
  group_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  due_date?: string | null;
  status: SettlementStatus;
  marked_paid_at?: string | null;
  confirmed_at?: string | null;
  fromName?: string;
  toName?: string;
}

export interface SuggestedSettlement {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

export interface GroupSummaryMetrics {
  totalExpenses: number;
  youOwe: number;
  youAreOwed: number;
  memberCount: number;
}

export interface GroupDetailData {
  group: GroupModel;
  members: GroupMemberModel[];
  expenses: ExpenseModel[];
  awaitingSettlements: SettlementModel[];
  suggestedSettlements: SuggestedSettlement[];
  summary: GroupSummaryMetrics;
  currentUser: UserSummary;
  currentUserRole: MemberRole;
}

