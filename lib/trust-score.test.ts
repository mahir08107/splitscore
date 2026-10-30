import { describe, it, expect } from "vitest";
import {
  calculateTrustScore,
  detectCircularLoops,
  BASE_SCORE,
  WEEKLY_GROWTH_CAP,
  SimulatedPayment,
} from "./trust-score";

describe("SplitScore Standalone Trust Scoring Engine", () => {
  it("Cold start baseline starts at 500", () => {
    const result = calculateTrustScore([]);
    expect(result.baseScore).toBe(500);
    expect(result.finalScore).toBe(500);
    expect(result.band).toBe("Building");
  });

  it("Rule 3: Mutual Confirmation - ignores unconfirmed payments", () => {
    const payments: SimulatedPayment[] = [
      {
        id: "unconfirmed-1",
        fromUser: "User A",
        toUser: "User B",
        amount: 500,
        dueDate: "2026-03-01T00:00:00Z",
        paidDate: "2026-03-01T00:00:00Z",
        isConfirmed: false,
      },
    ];

    const result = calculateTrustScore(payments);
    expect(result.finalScore).toBe(500);
    expect(result.metrics.attacksBlocked).toBe(1);
    expect(result.logs[0].type).toBe("BLOCKED");
  });

  it("Rule 5: Minimum Amount - ignores payments below threshold (< ₹50)", () => {
    const payments: SimulatedPayment[] = [
      {
        id: "micro-1",
        fromUser: "User A",
        toUser: "User B",
        amount: 10,
        dueDate: "2026-03-01T00:00:00Z",
        paidDate: "2026-03-01T00:00:00Z",
        isConfirmed: true,
      },
    ];

    const result = calculateTrustScore(payments);
    expect(result.finalScore).toBe(500);
    expect(result.metrics.attacksBlocked).toBe(1);
    expect(result.logs[0].rule).toBe("Minimum Amount");
  });

  it("Rule 9: Loop Detection - detects circular wash settlements (A->B->C->A)", () => {
    const payments: SimulatedPayment[] = [
      {
        id: "p1",
        fromUser: "Alice",
        toUser: "Bob",
        amount: 1000,
        dueDate: "2026-03-01T00:00:00Z",
        paidDate: "2026-03-01T00:00:00Z",
        isConfirmed: true,
      },
      {
        id: "p2",
        fromUser: "Bob",
        toUser: "Charlie",
        amount: 1000,
        dueDate: "2026-03-01T00:00:00Z",
        paidDate: "2026-03-01T00:00:00Z",
        isConfirmed: true,
      },
      {
        id: "p3",
        fromUser: "Charlie",
        toUser: "Alice",
        amount: 1000,
        dueDate: "2026-03-01T00:00:00Z",
        paidDate: "2026-03-01T00:00:00Z",
        isConfirmed: true,
      },
    ];

    const loops = detectCircularLoops(payments);
    expect(loops.size).toBe(3);
    expect(loops.has("p1")).toBe(true);
    expect(loops.has("p2")).toBe(true);
    expect(loops.has("p3")).toBe(true);

    const result = calculateTrustScore(payments);
    expect(result.metrics.loopsDetected).toBe(1);
    expect(result.finalScore).toBe(500); // Neutralized!
  });

  it("Rule 7 & 2: Asymmetric Penalty and Amount Weighting for late big payments", () => {
    const payments: SimulatedPayment[] = [
      {
        id: "small-early",
        fromUser: "User A",
        toUser: "Friend 1",
        amount: 50,
        dueDate: "2026-03-10T00:00:00Z",
        paidDate: "2026-03-08T00:00:00Z", // early
        isConfirmed: true,
      },
      {
        id: "big-late",
        fromUser: "User A",
        toUser: "Friend 2",
        amount: 5000,
        dueDate: "2026-03-01T00:00:00Z",
        paidDate: "2026-03-10T00:00:00Z", // 9 days late!
        isConfirmed: true,
      },
    ];

    const result = calculateTrustScore(payments);
    expect(result.finalScore).toBeLessThan(500);
    expect(result.band).toBe("Risky");
  });

  it("Rule 6: Weekly Growth Cap limits rapid spam gains to +30", () => {
    const payments: SimulatedPayment[] = Array.from({ length: 20 }, (_, i) => ({
      id: `pay-${i}`,
      fromUser: "User A",
      toUser: `Friend-${i}`, // distinct friends
      amount: 500,
      dueDate: "2026-03-01T00:00:00Z",
      paidDate: "2026-03-01T00:00:00Z",
      isConfirmed: true,
    }));

    const result = calculateTrustScore(payments);
    expect(result.pointsDelta).toBe(WEEKLY_GROWTH_CAP);
    expect(result.finalScore).toBe(530);
  });
});
