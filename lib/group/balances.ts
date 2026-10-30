import { ExpenseModel, SettlementModel, SuggestedSettlement } from "./types";

/**
 * Deterministically splits an amount equally across members with leftover remainder
 * allocated to the first members in stable order so sum(shares) === totalAmount exactly.
 */
export function calculateEqualSplits(
  totalAmount: number,
  memberIds: string[]
): Record<string, number> {
  if (memberIds.length === 0) return {};
  
  const baseShare = Math.floor(totalAmount / memberIds.length);
  const remainder = totalAmount - baseShare * memberIds.length;
  
  const shares: Record<string, number> = {};
  memberIds.forEach((id, index) => {
    shares[id] = baseShare + (index < remainder ? 1 : 0);
  });
  
  return shares;
}

/**
 * Calculates net balance for every group member:
 * net = (total expenses paid by member) - (total shares allocated to member)
 *       + (confirmed settlements sent by member) - (confirmed settlements received by member)
 * 
 * Note: Settlements with status 'marked_paid' do NOT adjust balances until receiver confirms.
 */
export function computeMemberBalances(
  memberIds: string[],
  expenses: ExpenseModel[],
  settlements: SettlementModel[] = []
): Record<string, number> {
  const balances: Record<string, number> = {};
  for (const id of memberIds) {
    balances[id] = 0;
  }

  // 1. Credit payer for expense amount
  for (const exp of expenses) {
    const amt = Number(exp.amount) || 0;
    if (balances[exp.paid_by] !== undefined) {
      balances[exp.paid_by] += amt;
    } else {
      balances[exp.paid_by] = amt;
    }

    // 2. Debit each member for their share
    for (const split of exp.splits || []) {
      const share = Number(split.share_amount) || 0;
      if (balances[split.user_id] !== undefined) {
        balances[split.user_id] -= share;
      } else {
        balances[split.user_id] = -share;
      }
    }
  }

  // 3. Adjust for CONFIRMED settlements only
  for (const s of settlements) {
    if (s.status === "confirmed") {
      const amt = Number(s.amount) || 0;
      // Sender paid money, so their debt decreases (balance becomes more positive)
      if (balances[s.from_user] !== undefined) {
        balances[s.from_user] += amt;
      }
      // Receiver collected money, so their credit decreases (balance becomes less positive)
      if (balances[s.to_user] !== undefined) {
        balances[s.to_user] -= amt;
      }
    }
  }

  // Round balances to avoid floating point imprecision
  for (const id of Object.keys(balances)) {
    balances[id] = Math.round(balances[id] * 100) / 100;
  }

  // Verify zero-sum invariant
  assertZeroSum(balances);

  return balances;
}

/**
 * Asserts that balances sum to zero.
 */
export function assertZeroSum(balances: Record<string, number>): boolean {
  const sum = Object.values(balances).reduce((acc, val) => acc + val, 0);
  if (Math.abs(sum) > 0.05) {
    console.warn(`Zero-sum assertion warning: net balances sum to ${sum}, not 0`, balances);
    return false;
  }
  return true;
}

/**
 * Computes minimum cash flow settlements using greedy creditor/debtor matching.
 */
export function simplifyDebts(
  balances: Record<string, number>,
  memberNames: Record<string, string> = {}
): SuggestedSettlement[] {
  // Separate into debtors (negative balance) and creditors (positive balance)
  const debtors: Array<{ id: string; amount: number }> = [];
  const creditors: Array<{ id: string; amount: number }> = [];

  for (const [id, balance] of Object.entries(balances)) {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded < -0.01) {
      debtors.push({ id, amount: Math.abs(rounded) });
    } else if (rounded > 0.01) {
      creditors.push({ id, amount: rounded });
    }
  }

  // Sort descending by amount for greedy matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const suggestions: SuggestedSettlement[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.round(Math.min(debtor.amount, creditor.amount) * 100) / 100;

    if (settleAmount > 0.01) {
      suggestions.push({
        fromUserId: debtor.id,
        fromName: memberNames[debtor.id] || "Member",
        toUserId: creditor.id,
        toName: memberNames[creditor.id] || "Member",
        amount: settleAmount,
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) {
      dIdx++;
    }
    if (creditor.amount < 0.01) {
      cIdx++;
    }
  }

  return suggestions;
}

