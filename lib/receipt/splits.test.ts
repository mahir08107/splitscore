import { describe, it, expect } from "vitest";
import {
  distributePaiseLargestRemainder,
  calculateReceiptSplits,
} from "./splits";

describe("Receipt splitting in paise with largest-remainder", () => {
  it("divides an odd amount equally and allocates exact remainder", () => {
    // 1000 paise (10.00 rupees) among 3 people
    // 1000 / 3 = 333.333... -> 334, 333, 333
    const recipients = [
      { id: "u1", weight: 1 },
      { id: "u2", weight: 1 },
      { id: "u3", weight: 1 },
    ];
    const splits = distributePaiseLargestRemainder(1000, recipients, "u1");
    const sum = Object.values(splits).reduce((a, b) => a + b, 0);

    expect(sum).toBe(1000);
    expect(splits["u1"]).toBe(334); // payer gets remainder
    expect(splits["u2"]).toBe(333);
    expect(splits["u3"]).toBe(333);
  });

  it("distributes tax proportionally to item spend", () => {
    // u1 spent 100 Rs (10000 paise), u2 spent 200 Rs (20000 paise)
    // tax = 30 Rs (3000 paise)
    // u1 proportion = 1/3 -> 1000 paise (10.00 Rs)
    // u2 proportion = 2/3 -> 2000 paise (20.00 Rs)
    const recipients = [
      { id: "u1", weight: 10000 },
      { id: "u2", weight: 20000 },
    ];
    const splits = distributePaiseLargestRemainder(3000, recipients, "u1");
    expect(splits["u1"]).toBe(1000);
    expect(splits["u2"]).toBe(2000);
    expect(splits["u1"] + splits["u2"]).toBe(3000);
  });

  it("handles complex receipt with per-item members, tax, service charge and zero float discrepancies", () => {
    const items = [
      { name: "Burger", price: 155.5, sharedByMemberIds: ["u1", "u2"] },
      { name: "Pizza", price: 349.0, sharedByMemberIds: ["u2", "u3"] },
      { name: "Coke", price: 60.0, sharedByMemberIds: ["u1"] },
    ];

    const result = calculateReceiptSplits({
      items,
      tax: 28.23,
      serviceCharge: 15.0,
      discount: 0,
      payerId: "u1",
      allMemberIds: ["u1", "u2", "u3"],
    });

    // Verify every single expense has sum(splits) === expense.amount
    for (const exp of result.expenses) {
      const splitSum = exp.splits.reduce((acc, s) => acc + s.shareAmount, 0);
      expect(Math.round(splitSum * 100)).toBe(Math.round(exp.amount * 100));
    }

    // Verify sum of member totals === bill total down to the exact cent
    const totalMemberSum = Object.values(result.memberTotals).reduce(
      (a, b) => a + b,
      0
    );
    expect(Math.round(totalMemberSum * 100)).toBe(
      Math.round(result.totalBill * 100)
    );
  });
});
