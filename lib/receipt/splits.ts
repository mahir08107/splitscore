/**
 * Receipt expense splitting logic using paise (integer arithmetic)
 * and the largest-remainder method (Hamilton-Webster).
 * 
 * Guarantees that:
 * 1. For every expense, sum(splits) === expense.amount down to the exact paise.
 * 2. Across all items + tax + service charge - discount, sum of member totals === bill total.
 * 3. Rounding remainders are prioritized to the payer.
 */

export interface SplitItem {
  id?: string;
  name: string;
  price: number; // in rupees
  sharedByMemberIds: string[]; // members sharing this item
}

export interface SplitResult {
  expenses: Array<{
    title: string;
    amount: number; // in rupees
    category: string;
    splits: Array<{
      userId: string;
      shareAmount: number; // in rupees
    }>;
  }>;
  memberTotals: Record<string, number>; // in rupees
  totalBill: number; // in rupees
}

/**
 * Distributes an integer amount in paise among N weights using the largest-remainder method.
 * Any remainder is distributed to the shares with the largest fractional part,
 * with ties broken in favor of payerId.
 */
export function distributePaiseLargestRemainder(
  totalPaise: number,
  recipients: Array<{ id: string; weight: number }>,
  payerId?: string
): Record<string, number> {
  if (totalPaise === 0 || recipients.length === 0) {
    const res: Record<string, number> = {};
    for (const r of recipients) res[r.id] = 0;
    return res;
  }

  const totalWeight = recipients.reduce((sum, r) => sum + r.weight, 0);

  // If totalWeight is 0, give equal weights
  const effectiveRecipients = recipients.map((r) => ({
    id: r.id,
    weight: totalWeight > 0 ? r.weight : 1,
  }));
  const effTotalWeight = totalWeight > 0 ? totalWeight : recipients.length;

  const parts = effectiveRecipients.map((r) => {
    const exact = (totalPaise * r.weight) / effTotalWeight;
    const floor = Math.floor(exact);
    const rem = exact - floor;
    return {
      id: r.id,
      floor,
      rem,
      isPayer: r.id === payerId,
    };
  });

  const sumFloors = parts.reduce((acc, p) => acc + p.floor, 0);
  let deficit = totalPaise - sumFloors;

  // Sort descending by remainder; if tied, favor payer
  parts.sort((a, b) => {
    if (Math.abs(b.rem - a.rem) > 1e-9) {
      return b.rem - a.rem;
    }
    if (a.isPayer !== b.isPayer) {
      return a.isPayer ? -1 : 1;
    }
    return a.id.localeCompare(b.id);
  });

  for (let i = 0; i < parts.length && deficit > 0; i++) {
    parts[i].floor += 1;
    deficit--;
  }

  const result: Record<string, number> = {};
  for (const p of parts) {
    result[p.id] = p.floor;
  }

  return result;
}

/**
 * Calculates complete proportional splits for receipt items, tax, service charge, and discount.
 */
export function calculateReceiptSplits(params: {
  items: SplitItem[];
  tax: number; // in rupees
  serviceCharge: number; // in rupees
  discount: number; // in rupees
  payerId: string;
  allMemberIds: string[];
}): SplitResult {
  const { items, tax, serviceCharge, discount, payerId, allMemberIds } = params;

  // 1. Calculate each item's split in paise
  const itemExpenses: SplitResult["expenses"] = [];
  const memberItemPaise: Record<string, number> = {};
  for (const m of allMemberIds) memberItemPaise[m] = 0;

  for (const item of items) {
    const itemPaise = Math.round((Number(item.price) || 0) * 100);
    if (itemPaise <= 0) continue;

    const sharingIds =
      item.sharedByMemberIds.length > 0
        ? item.sharedByMemberIds
        : allMemberIds;

    const sharingRecipients = sharingIds.map((id) => ({ id, weight: 1 }));
    const paiseSplits = distributePaiseLargestRemainder(
      itemPaise,
      sharingRecipients,
      payerId
    );

    // Record per-member item spend
    for (const [uid, p] of Object.entries(paiseSplits)) {
      memberItemPaise[uid] = (memberItemPaise[uid] || 0) + p;
    }

    itemExpenses.push({
      title: item.name.trim() || "Item",
      amount: itemPaise / 100,
      category: "Food",
      splits: Object.entries(paiseSplits).map(([uid, p]) => ({
        userId: uid,
        shareAmount: p / 100,
      })),
    });
  }

  // 2. Proportional distribution weights based on each person's item spend
  const activeMembersWithSpend = allMemberIds.map((id) => ({
    id,
    weight: memberItemPaise[id] || 0,
  }));

  // 3. Proportional Tax
  const taxPaise = Math.round((Number(tax) || 0) * 100);
  if (taxPaise > 0) {
    const taxSplits = distributePaiseLargestRemainder(
      taxPaise,
      activeMembersWithSpend,
      payerId
    );
    itemExpenses.push({
      title: "Tax",
      amount: taxPaise / 100,
      category: "Tax",
      splits: Object.entries(taxSplits).map(([uid, p]) => ({
        userId: uid,
        shareAmount: p / 100,
      })),
    });
  }

  // 4. Proportional Service Charge
  const servicePaise = Math.round((Number(serviceCharge) || 0) * 100);
  if (servicePaise > 0) {
    const serviceSplits = distributePaiseLargestRemainder(
      servicePaise,
      activeMembersWithSpend,
      payerId
    );
    itemExpenses.push({
      title: "Service Charge",
      amount: servicePaise / 100,
      category: "Fees",
      splits: Object.entries(serviceSplits).map(([uid, p]) => ({
        userId: uid,
        shareAmount: p / 100,
      })),
    });
  }

  // 5. Discount (if any)
  const discountPaise = Math.round((Number(discount) || 0) * 100);
  if (discountPaise > 0) {
    // Discount reduces total. If treated as a negative adjustment:
    const discountSplits = distributePaiseLargestRemainder(
      discountPaise,
      activeMembersWithSpend,
      payerId
    );
    itemExpenses.push({
      title: "Discount",
      amount: -(discountPaise / 100),
      category: "Discount",
      splits: Object.entries(discountSplits).map(([uid, p]) => ({
        userId: uid,
        shareAmount: -(p / 100),
      })),
    });
  }

  // 6. Aggregate member totals
  const memberTotals: Record<string, number> = {};
  for (const m of allMemberIds) memberTotals[m] = 0;

  let totalBill = 0;
  for (const exp of itemExpenses) {
    totalBill = Math.round((totalBill + exp.amount) * 100) / 100;
    for (const s of exp.splits) {
      memberTotals[s.userId] =
        Math.round(((memberTotals[s.userId] || 0) + s.shareAmount) * 100) / 100;
    }
  }

  return {
    expenses: itemExpenses,
    memberTotals,
    totalBill,
  };
}
