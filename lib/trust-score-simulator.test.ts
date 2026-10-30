import { describe, it, expect } from "vitest";
import {
  runSimulation,
  detectClosedLoop,
  BASE_SCORE,
  MIN_AMOUNT_THRESHOLD,
  VELOCITY_CAP,
  RING_FRAUD_PENALTY,
  SimulatedEvent,
} from "./trust-score-simulator";

describe("SplitScore Anti-Gaming Simulator Math Engine", () => {
  it("Rule 1: Minimum Amount Filter (< ₹50) gives 0 points", () => {
    const events: SimulatedEvent[] = [
      {
        id: "micro-1",
        fromUser: "User A",
        toUser: "Friend B",
        amount: 10,
        daysLate: 0,
        isConfirmed: true,
      },
    ];

    const result = runSimulation("Micro-Transactions Farming", events, BASE_SCORE);
    expect(result.finalScore).toBe(500);
    expect(result.totalDelta).toBe(0);
    const log = result.logs.find((l) =>
      l.message.includes("Ignored: Amount too small to impact trust")
    );
    expect(log).toBeDefined();
    expect(log?.level).toBe("WARNING");
  });

  it("Rule 2: Asymmetric Penalty - late payment docks -(days_late * (amount / 100))", () => {
    const events: SimulatedEvent[] = [
      {
        id: "bust-out-default",
        fromUser: "User A",
        toUser: "Resort Lead",
        amount: 10000,
        daysLate: 15, // 15 * (10000 / 100) = 1500 points
        isConfirmed: true,
      },
    ];

    const result = runSimulation("The Bust-Out Strategy", events, BASE_SCORE);
    expect(result.finalScore).toBe(0); // 500 - 1500 = clamped to 0
    expect(result.band).toBe("Risky");
    const penaltyLog = result.logs.find((l) =>
      l.message.includes("-1500 points")
    );
    expect(penaltyLog).toBeDefined();
    expect(penaltyLog?.level).toBe("PENALTY");
  });

  it("Rule 3: Counterparty Diversity diminishes repeated rewards with same person", () => {
    const events: SimulatedEvent[] = Array.from({ length: 4 }, (_, i) => ({
      id: `rep-${i}`,
      fromUser: "User A",
      toUser: "Same Friend",
      amount: 100,
      daysLate: 0,
      isConfirmed: true,
    }));

    const result = runSimulation("Diversity Test", events, BASE_SCORE);
    // 1st: floor(5 / 1) = 5
    // 2nd: floor(5 / 2) = 2
    // 3rd: floor(5 / 3) = 1
    // 4th: blocked (0 pts)
    expect(result.finalScore).toBe(508);
    const limitLog = result.logs.find((l) =>
      l.message.includes("Counterparty diversity limit reached")
    );
    expect(limitLog).toBeDefined();
  });

  it("Rule 4: Velocity Cap limits session positive gains to 30 points", () => {
    const events: SimulatedEvent[] = Array.from({ length: 20 }, (_, i) => ({
      id: `vel-${i}`,
      fromUser: "User A",
      toUser: `Peer ${i}`,
      amount: 500,
      daysLate: 0,
      isConfirmed: true,
    }));

    const result = runSimulation("Velocity Spamming", events, BASE_SCORE);
    expect(result.finalScore).toBe(530);
    expect(result.totalDelta).toBe(VELOCITY_CAP);
    const capLog = result.logs.find((l) =>
      l.message.includes("Blocked: Weekly growth cap reached")
    );
    expect(capLog).toBeDefined();
  });

  it("Rule 5: Ring Fraud Detection penalizes circular debt rings with -50 points", () => {
    const events: SimulatedEvent[] = [
      {
        id: "r-1",
        fromUser: "User A",
        toUser: "User B",
        amount: 1000,
        daysLate: 0,
        isConfirmed: true,
      },
      {
        id: "r-2",
        fromUser: "User B",
        toUser: "User C",
        amount: 1000,
        daysLate: 0,
        isConfirmed: true,
      },
      {
        id: "r-3",
        fromUser: "User C",
        toUser: "User A",
        amount: 1000,
        daysLate: 0,
        isConfirmed: true,
      },
    ];

    expect(detectClosedLoop(events)).toBe(true);
    const result = runSimulation("Malicious Collective (Ring Fraud)", events, BASE_SCORE);
    const ringLog = result.logs.find((l) =>
      l.message.includes("-50 points")
    );
    expect(ringLog).toBeDefined();
    expect(ringLog?.level).toBe("PENALTY");
  });

  it("Rule 6: Time Decay weights older positives at 0.5x and recent negatives at 1.5x", () => {
    const events: SimulatedEvent[] = [
      {
        id: "old-1",
        fromUser: "User A",
        toUser: "Friend 1",
        amount: 500,
        daysLate: 0,
        isConfirmed: true,
        isOld: true, // 5 * 0.5 = 2.5 -> floor(2.5) = 2
      },
      {
        id: "recent-late-1",
        fromUser: "User A",
        toUser: "Friend 2",
        amount: 1000,
        daysLate: 4, // 4 * 10 = 40 * 1.5 = 60 penalty
        isConfirmed: true,
        isRecentNegative: true,
      },
    ];

    const result = runSimulation("Reputation Milking (Oscillation)", events, BASE_SCORE);
    const oldLog = result.logs.find((l) =>
      l.message.includes("0.5x Time Decay for older event")
    );
    expect(oldLog).toBeDefined();
    const recentNegativeLog = result.logs.find((l) =>
      l.message.includes("1.5x Recent Negative Time Decay")
    );
    expect(recentNegativeLog).toBeDefined();
    expect(result.finalScore).toBe(500 + 2 - 60);
  });
});
