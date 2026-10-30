/**
 * SplitScore Anti-Gaming Simulator Math Engine
 * Team Null Pointers | PS 6 Fintech
 * 
 * Pure client-side mathematical scoring engine.
 * Computes exact mathematical decisions step-by-step for hackathon live judging.
 */

export type TrustBand = "Excellent" | "Good" | "Building" | "Risky";

export function getTrustBand(score: number): TrustBand {
  if (score >= 800) return "Excellent";
  if (score >= 650) return "Good";
  if (score >= 500) return "Building";
  return "Risky";
}

export interface SimulatedEvent {
  id: string;
  fromUser: string;
  toUser: string;
  amount: number;
  daysLate: number; // <= 0: on-time/early, > 0: late
  isConfirmed: boolean;
  isOld?: boolean; // Older positive events weighted at 0.5x
  isRecentNegative?: boolean; // Recent negative events weighted at 1.5x
  description?: string;
}

export type TerminalLogLevel =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "CRITICAL"
  | "PENALTY"
  | "SYSTEM";

export interface TerminalLogEntry {
  id: string;
  level: TerminalLogLevel;
  message: string;
  pointsDelta: number;
  scoreAfter: number;
}

export interface SimulationResult {
  scenarioName: string;
  initialScore: number;
  finalScore: number;
  totalDelta: number;
  band: TrustBand;
  logs: TerminalLogEntry[];
}

export const BASE_SCORE = 500;
export const MIN_SCORE = 0;
export const MAX_SCORE = 900;
export const MIN_AMOUNT_THRESHOLD = 50; // ₹50
export const VELOCITY_CAP = 30; // Max +30 points in a session
export const RING_FRAUD_PENALTY = -50; // -50 penalty for closed cycle loop

/**
 * Detects closed cycle debt loops (e.g., A -> B -> C -> A)
 */
export function detectClosedLoop(events: SimulatedEvent[]): boolean {
  if (events.length < 3) return false;

  const adj = new Map<string, string[]>();
  for (const e of events) {
    if (!adj.has(e.fromUser)) adj.set(e.fromUser, []);
    adj.get(e.fromUser)!.push(e.toUser);
  }

  for (const [userA, neighborsB] of adj.entries()) {
    for (const userB of neighborsB) {
      if (userB === userA) continue;
      const neighborsC = adj.get(userB) || [];
      for (const userC of neighborsC) {
        if (userC === userA || userC === userB) continue;
        const neighborsBack = adj.get(userC) || [];
        if (neighborsBack.includes(userA)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Runs the simulation and returns full sequence of terminal logs & scores
 */
export function runSimulation(
  scenarioName: string,
  events: SimulatedEvent[],
  initialScore: number = BASE_SCORE
): SimulationResult {
  const logs: TerminalLogEntry[] = [];
  let currentScore = Math.max(MIN_SCORE, Math.min(MAX_SCORE, initialScore));
  let logCounter = 1;

  const pushLog = (
    level: TerminalLogLevel,
    message: string,
    pointsDelta: number = 0
  ) => {
    currentScore = Math.max(
      MIN_SCORE,
      Math.min(MAX_SCORE, currentScore + pointsDelta)
    );
    logs.push({
      id: `log-${logCounter++}`,
      level,
      message,
      pointsDelta,
      scoreAfter: currentScore,
    });
  };

  // 1. Initial test announcement
  pushLog("INFO", `Initializing test: ${scenarioName}... Starting Score: ${currentScore}`);

  // 2. Ring Fraud Detection (Closed loop cycle check)
  const isRingFraud = detectClosedLoop(events);
  if (isRingFraud) {
    pushLog(
      "CRITICAL",
      "Malicious collective detected! Closed circular debt loop identified (A → B → C → A)."
    );
    pushLog(
      "PENALTY",
      `Score adjusted: ${RING_FRAUD_PENALTY} points (Ring Fraud collusion penalty).`,
      RING_FRAUD_PENALTY
    );
  }

  // 3. Process events
  const counterpartyCounts = new Map<string, number>();
  let sessionPositivePoints = 0;

  for (const event of events) {
    // A. Minimum Amount Filter (< ₹50)
    if (event.amount < MIN_AMOUNT_THRESHOLD) {
      pushLog(
        "WARNING",
        `₹${event.amount.toLocaleString("en-IN")} paid to ${event.toUser}. Points added: +0 (Ignored: Amount too small to impact trust).`,
        0
      );
      continue;
    }

    // B. Asymmetric Penalty (Late payment: -(days_late * (amount / 100)))
    if (event.daysLate > 0) {
      let rawPenalty = -Math.round(event.daysLate * (event.amount / 100));

      // Time Decay for recent negative events: 1.5x multiplier
      if (event.isRecentNegative) {
        rawPenalty = Math.round(rawPenalty * 1.5);
      }

      pushLog(
        "CRITICAL",
        `₹${event.amount.toLocaleString("en-IN")} paid ${event.daysLate} days late to ${event.toUser}! Asymmetric multiplier applied${event.isRecentNegative ? " (1.5x Recent Negative Time Decay)" : ""}.`
      );
      pushLog(
        "PENALTY",
        `Score adjusted: ${rawPenalty} points.`,
        rawPenalty
      );
      continue;
    }

    // C. On-Time Payment
    // Counterparty Diversity: Reward = Base Reward / (1 + previous_transactions_with_user)
    const prevInteractions = counterpartyCounts.get(event.toUser) || 0;
    counterpartyCounts.set(event.toUser, prevInteractions + 1);

    const baseReward = 5;
    let reward = Math.floor(baseReward / (1 + prevInteractions));

    // Time Decay: Older positive events weighted at 0.5x
    if (event.isOld) {
      reward = Math.max(1, Math.floor(reward * 0.5));
    }

    // If counterparty interactions exceed 3, points effectively drop to 0
    if (prevInteractions >= 3 || reward <= 0) {
      pushLog(
        "WARNING",
        `₹${event.amount.toLocaleString("en-IN")} paid to ${event.toUser}. Points added: +0 (Counterparty diversity limit reached for ${event.toUser}).`,
        0
      );
      continue;
    }

    // Velocity / Growth Cap: session_positive_points > 30
    if (sessionPositivePoints >= VELOCITY_CAP) {
      pushLog(
        "WARNING",
        `₹${event.amount.toLocaleString("en-IN")} paid on time. Points added: +0 (Blocked: Weekly growth cap reached).`,
        0
      );
      continue;
    }

    if (sessionPositivePoints + reward > VELOCITY_CAP) {
      const clampedReward = Math.max(0, VELOCITY_CAP - sessionPositivePoints);
      sessionPositivePoints = VELOCITY_CAP;
      pushLog(
        "SUCCESS",
        `₹${event.amount.toLocaleString("en-IN")} paid on time. Points added: +${clampedReward} (Growth cap clamped from +${reward}).`,
        clampedReward
      );
    } else {
      sessionPositivePoints += reward;
      pushLog(
        "SUCCESS",
        `₹${event.amount.toLocaleString("en-IN")} paid on time. Points added: +${reward}${event.isOld ? " (0.5x Time Decay for older event)" : ""}.`,
        reward
      );
    }
  }

  const band = getTrustBand(currentScore);
  pushLog(
    "SYSTEM",
    `Test Complete. Final Trust Score: ${currentScore} (${band.toUpperCase()})`,
    0
  );

  return {
    scenarioName,
    initialScore,
    finalScore: currentScore,
    totalDelta: currentScore - initialScore,
    band,
    logs,
  };
}
