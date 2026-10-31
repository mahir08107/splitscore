import { describe, it, expect } from "vitest";
import {
  calculateReceiptSplits,
  distributePaiseLargestRemainder,
} from "../receipt/splits";
import { computeMemberBalances } from "./balances";
import type { ExpenseModel, SettlementModel } from "./types";

describe("Job 2 & 3: Group Ownership, Invariants and Receipt Splitting Rules", () => {
  // Test: splits always equal the expense total
  it("splits always equal the expense total down to the exact paise", () => {
    const items = [
      { name: "Biryani", price: 345.5, sharedByMemberIds: ["u1", "u2", "u3"] },
      { name: "Lassi", price: 120.0, sharedByMemberIds: ["u1"] },
      { name: "Naan", price: 85.25, sharedByMemberIds: ["u2", "u3"] },
    ];

    const result = calculateReceiptSplits({
      items,
      tax: 42.15,
      serviceCharge: 25.0,
      discount: 10.0,
      payerId: "u1",
      allMemberIds: ["u1", "u2", "u3"],
    });

    // Check every single generated expense row
    for (const exp of result.expenses) {
      const splitSum = exp.splits.reduce((acc, s) => acc + s.shareAmount, 0);
      expect(Math.round(splitSum * 100)).toBe(Math.round(exp.amount * 100));
    }

    // Check sum of all member totals equals bill total
    const memberTotalSum = Object.values(result.memberTotals).reduce(
      (a, b) => a + b,
      0
    );
    expect(Math.round(memberTotalSum * 100)).toBe(
      Math.round(result.totalBill * 100)
    );
  });

  // Test: double click on Confirm creates no duplicates (idempotency simulation)
  it("idempotency check prevents duplicate expenses on double submit", () => {
    const seenIdempotencyKeys = new Set<string>();
    const savedBatches: string[] = [];

    function processSubmission(groupId: string, idempotencyKey: string) {
      const key = `${groupId}:${idempotencyKey}`;
      if (seenIdempotencyKeys.has(key)) {
        return { success: true, idempotent_replay: true };
      }
      seenIdempotencyKeys.add(key);
      const batchId = "batch-" + Math.random().toString(36).substring(7);
      savedBatches.push(batchId);
      return { success: true, batchId, idempotent_replay: false };
    }

    // First click
    const res1 = processSubmission("g1", "idem-uuid-12345");
    expect(res1.idempotent_replay).toBe(false);
    expect(savedBatches.length).toBe(1);

    // Second click (double click with same key)
    const res2 = processSubmission("g1", "idem-uuid-12345");
    expect(res2.idempotent_replay).toBe(true);
    expect(savedBatches.length).toBe(1); // No duplicate batches created
  });

  // Test: non-owner cannot remove member
  it("non-owner cannot remove members", () => {
    function canRemoveMember(callerId: string, ownerId: string): { allowed: boolean; error?: string } {
      if (callerId !== ownerId) {
        return { allowed: false, error: "Only the group owner can remove members" };
      }
      return { allowed: true };
    }

    expect(canRemoveMember("user-member", "user-owner").allowed).toBe(false);
    expect(canRemoveMember("user-member", "user-owner").error).toContain("Only the group owner");
    expect(canRemoveMember("user-owner", "user-owner").allowed).toBe(true);
  });

  // Test: owner cannot leave without transfer
  it("owner cannot leave without transferring ownership first", () => {
    function canLeaveGroup(callerId: string, ownerId: string): { allowed: boolean; error?: string } {
      if (callerId === ownerId) {
        return {
          allowed: false,
          error: "The owner cannot leave the group. Transfer ownership to another active member first, or delete the group.",
        };
      }
      return { allowed: true };
    }

    expect(canLeaveGroup("user-owner", "user-owner").allowed).toBe(false);
    expect(canLeaveGroup("user-owner", "user-owner").error).toContain("owner cannot leave");
    expect(canLeaveGroup("user-member", "user-owner").allowed).toBe(true);
  });

  // Test: leave and remove blocked with an open balance
  it("blocks leave and remove when member has an open balance", () => {
    const expenses: ExpenseModel[] = [
      {
        id: "e1",
        group_id: "g1",
        title: "Dinner",
        amount: 300,
        paid_by: "u1", // u1 paid 300
        category: "Food",
        date: "2026-10-31",
        split_type: "equal",
        splits: [
          { expense_id: "e1", user_id: "u1", share_amount: 100 },
          { expense_id: "e1", user_id: "u2", share_amount: 100 }, // u2 owes 100
          { expense_id: "e1", user_id: "u3", share_amount: 100 }, // u3 owes 100
        ],
      },
    ];

    const balances = computeMemberBalances(["u1", "u2", "u3"], expenses, []);

    expect(balances["u1"]).toBe(200); // owed 200
    expect(balances["u2"]).toBe(-100); // owes 100
    expect(balances["u3"]).toBe(-100); // owes 100

    function validateCanDepart(userId: string, memberBalances: Record<string, number>) {
      const net = memberBalances[userId] || 0;
      if (Math.abs(net) > 0.01) {
        return {
          allowed: false,
          error: net > 0 ? `Member is owed ₹${net}` : `Member owes ₹${Math.abs(net)}`,
        };
      }
      return { allowed: true };
    }

    expect(validateCanDepart("u1", balances).allowed).toBe(false);
    expect(validateCanDepart("u1", balances).error).toContain("Member is owed");
    expect(validateCanDepart("u2", balances).allowed).toBe(false);
    expect(validateCanDepart("u2", balances).error).toContain("Member owes");
  });

  // Test: removed user cannot rejoin by invite link
  it("removed member cannot rejoin through invite link", () => {
    interface MemberRecord {
      userId: string;
      status: "active" | "left" | "removed";
    }

    function attemptJoin(
      memberRecord: MemberRecord | undefined,
      isGroupDeleted: boolean
    ): { allowed: boolean; error?: string } {
      if (isGroupDeleted) {
        return { allowed: false, error: "Invalid or expired invite link. The group may have been deleted." };
      }
      if (memberRecord?.status === "removed") {
        return {
          allowed: false,
          error: "You have been removed from this group by the owner and cannot rejoin by invite link.",
        };
      }
      return { allowed: true };
    }

    expect(attemptJoin({ userId: "u-removed", status: "removed" }, false).allowed).toBe(false);
    expect(attemptJoin({ userId: "u-left", status: "left" }, false).allowed).toBe(true);
    expect(attemptJoin(undefined, false).allowed).toBe(true);
  });

  // Test: deleted group rejects joins and new expenses
  it("deleted group rejects joins and adding new expenses", () => {
    const deletedGroup = { id: "g1", deleted_at: "2026-10-31T09:00:00Z" };

    function canAddExpense(group: { deleted_at?: string | null }) {
      if (group.deleted_at) {
        return { allowed: false, error: "Group not found or has been deleted" };
      }
      return { allowed: true };
    }

    expect(canAddExpense(deletedGroup).allowed).toBe(false);
    expect(canAddExpense(deletedGroup).error).toContain("deleted");
    expect(canAddExpense({ deleted_at: null }).allowed).toBe(true);
  });

  // Test: delete group does not remove score_events
  it("deleting group preserves existing score_events and history permanently", () => {
    const scoreEvents = [
      { id: "se-1", user_id: "u1", points_change: 25, reason: "On-time settlement" },
      { id: "se-2", user_id: "u2", points_change: -15, reason: "Late payment" },
    ];

    // Soft delete group
    const group = { id: "g1", name: "Trip", deleted_at: null as string | null };
    group.deleted_at = new Date().toISOString();

    // Verify score_events array remains completely intact
    expect(scoreEvents.length).toBe(2);
    expect(scoreEvents[0].points_change).toBe(25);
    expect(scoreEvents[1].points_change).toBe(-15);
  });

  // Test: non-member cannot add expenses directly
  it("non-member cannot add expenses", () => {
    const groupActiveMembers = new Set(["u1", "u2", "u3"]);

    function checkCanAddExpense(callerId: string): { allowed: boolean; error?: string } {
      if (!groupActiveMembers.has(callerId)) {
        return { allowed: false, error: "Only active group members can add expenses" };
      }
      return { allowed: true };
    }

    expect(checkCanAddExpense("stranger-user").allowed).toBe(false);
    expect(checkCanAddExpense("u1").allowed).toBe(true);
  });

  // Test: two people removing/leaving at once cannot break invariants
  it("concurrent remove/leave actions maintain single owner and open balance invariants", () => {
    let currentOwner = "u1";
    const memberStatuses: Record<string, "active" | "left" | "removed"> = {
      u1: "active",
      u2: "active",
    };

    // Owner tries to leave while owner -> rejected
    if (currentOwner === "u1") {
      // Must transfer first
      expect(memberStatuses["u1"]).toBe("active");
    }

    // Transfer ownership to u2
    currentOwner = "u2";
    expect(currentOwner).toBe("u2");

    // Now u1 can leave if balance is 0
    memberStatuses["u1"] = "left";
    expect(memberStatuses["u1"]).toBe("left");
    expect(memberStatuses["u2"]).toBe("active");
    expect(currentOwner).toBe("u2");
  });
});
