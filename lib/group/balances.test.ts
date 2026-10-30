import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateEqualSplits,
  computeMemberBalances,
  assertZeroSum,
  simplifyDebts,
} from "./balances";
import { ExpenseModel, SettlementModel } from "./types";

test("calculateEqualSplits: divides evenly when no remainder", () => {
  const splits = calculateEqualSplits(1200, ["u1", "u2", "u3"]);
  assert.deepEqual(splits, {
    u1: 400,
    u2: 400,
    u3: 400,
  });
  const sum = Object.values(splits).reduce((a, b) => a + b, 0);
  assert.equal(sum, 1200);
});

test("calculateEqualSplits: uneven split distributes remainder deterministically to first members", () => {
  // 1000 split among 3 members: 334, 333, 333
  const splits = calculateEqualSplits(1000, ["u1", "u2", "u3"]);
  assert.deepEqual(splits, {
    u1: 334,
    u2: 333,
    u3: 333,
  });
  const sum = Object.values(splits).reduce((a, b) => a + b, 0);
  assert.equal(sum, 1000);
});

test("computeMemberBalances: single payer who is also a participant", () => {
  // u1 pays 3000 split equally among u1, u2, u3 (1000 each)
  // u1 paid 3000, owes 1000 -> net +2000
  // u2 paid 0, owes 1000 -> net -1000
  // u3 paid 0, owes 1000 -> net -1000
  const expenses: ExpenseModel[] = [
    {
      id: "e1",
      group_id: "g1",
      title: "Fuel",
      amount: 3000,
      paid_by: "u1",
      category: "Transport",
      date: "2026-10-20",
      split_type: "equal",
      splits: [
        { expense_id: "e1", user_id: "u1", share_amount: 1000 },
        { expense_id: "e1", user_id: "u2", share_amount: 1000 },
        { expense_id: "e1", user_id: "u3", share_amount: 1000 },
      ],
    },
  ];

  const balances = computeMemberBalances(["u1", "u2", "u3"], expenses);
  assert.equal(balances["u1"], 2000);
  assert.equal(balances["u2"], -1000);
  assert.equal(balances["u3"], -1000);
  assert.equal(assertZeroSum(balances), true);
});

test("computeMemberBalances: multiple payers across multiple expenses", () => {
  // e1: u1 pays 600 for u1, u2 (300 each) -> u1:+300, u2:-300
  // e2: u2 pays 1000 for u1, u2 (500 each) -> u1:-500, u2:+500
  // Net: u1 = +300 - 500 = -200; u2 = -300 + 500 = +200
  const expenses: ExpenseModel[] = [
    {
      id: "e1",
      group_id: "g1",
      title: "Lunch",
      amount: 600,
      paid_by: "u1",
      category: "Food",
      date: "2026-10-21",
      split_type: "equal",
      splits: [
        { expense_id: "e1", user_id: "u1", share_amount: 300 },
        { expense_id: "e1", user_id: "u2", share_amount: 300 },
      ],
    },
    {
      id: "e2",
      group_id: "g1",
      title: "Dinner",
      amount: 1000,
      paid_by: "u2",
      category: "Food",
      date: "2026-10-21",
      split_type: "equal",
      splits: [
        { expense_id: "e2", user_id: "u1", share_amount: 500 },
        { expense_id: "e2", user_id: "u2", share_amount: 500 },
      ],
    },
  ];

  const balances = computeMemberBalances(["u1", "u2"], expenses);
  assert.equal(balances["u1"], -200);
  assert.equal(balances["u2"], 200);
  assert.equal(assertZeroSum(balances), true);
});

test("computeMemberBalances: marked_paid vs confirmed settlements", () => {
  // u1 paid 2000 for u1 and u2 (1000 each) -> u1: +1000, u2: -1000
  const expenses: ExpenseModel[] = [
    {
      id: "e1",
      group_id: "g1",
      title: "Stay",
      amount: 2000,
      paid_by: "u1",
      category: "Stay",
      date: "2026-10-22",
      split_type: "equal",
      splits: [
        { expense_id: "e1", user_id: "u1", share_amount: 1000 },
        { expense_id: "e1", user_id: "u2", share_amount: 1000 },
      ],
    },
  ];

  // Settlement 1: status is 'marked_paid' (NOT confirmed yet)
  // Must NOT adjust balance!
  const unconfirmedSettlements: SettlementModel[] = [
    {
      id: "s1",
      group_id: "g1",
      from_user: "u2",
      to_user: "u1",
      amount: 500,
      status: "marked_paid",
    },
  ];

  const balancesUnconfirmed = computeMemberBalances(
    ["u1", "u2"],
    expenses,
    unconfirmedSettlements
  );
  assert.equal(balancesUnconfirmed["u1"], 1000, "marked_paid must not affect creditor balance");
  assert.equal(balancesUnconfirmed["u2"], -1000, "marked_paid must not affect debtor balance");

  // Settlement 2: status is 'confirmed'
  // Must adjust balance: u2 paid 500, so owes 500 less (-500), u1 gets back 500 less (+500)
  const confirmedSettlements: SettlementModel[] = [
    {
      id: "s2",
      group_id: "g1",
      from_user: "u2",
      to_user: "u1",
      amount: 500,
      status: "confirmed",
    },
  ];

  const balancesConfirmed = computeMemberBalances(
    ["u1", "u2"],
    expenses,
    confirmedSettlements
  );
  assert.equal(balancesConfirmed["u1"], 500);
  assert.equal(balancesConfirmed["u2"], -500);
  assert.equal(assertZeroSum(balancesConfirmed), true);
});

test("simplifyDebts: minimum cash flow matches largest creditor with largest debtor", () => {
  // u1: +2000, u2: -1500, u3: -500
  const balances = {
    u1: 2000,
    u2: -1500,
    u3: -500,
  };
  const names = { u1: "Alice", u2: "Bob", u3: "Charlie" };

  const settlements = simplifyDebts(balances, names);
  // Should result in 2 payments:
  // Bob pays Alice 1500
  // Charlie pays Alice 500
  assert.equal(settlements.length, 2);
  assert.equal(settlements[0].fromUserId, "u2");
  assert.equal(settlements[0].toUserId, "u1");
  assert.equal(settlements[0].amount, 1500);

  assert.equal(settlements[1].fromUserId, "u3");
  assert.equal(settlements[1].toUserId, "u1");
  assert.equal(settlements[1].amount, 500);
});

test("simplifyDebts: 4-person cycle resolves to minimum transactions", () => {
  // u1: +1000, u2: +1000, u3: -1200, u4: -800
  const balances = {
    u1: 1000,
    u2: 1000,
    u3: -1200,
    u4: -800,
  };
  const names = { u1: "A", u2: "B", u3: "C", u4: "D" };

  const settlements = simplifyDebts(balances, names);
  const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0);
  assert.equal(totalSettled, 2000);
  // Debtor sum (2000) === Creditor sum (2000)
  assert.ok(settlements.length <= 3, "Simplification should require at most N-1 transactions");
});

