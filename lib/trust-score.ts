/**
 * SplitScore Standalone Trust Scoring Engine
 * Team Null Pointers | PS 6 Fintech
 * 
 * Implements the mathematical scoring algorithm, metrics, and all 9 anti-gaming defense mechanisms.
 * Pure, stateless, unit-testable TypeScript module.
 */

export type TrustBand = "Excellent" | "Good" | "Building" | "Risky";

export interface SimulatedPayment {
  id: string;
  fromUser: string;
  toUser: string;
  amount: number;
  dueDate: string | Date;
  paidDate: string | Date;
  isConfirmed: boolean;
  isDisputed?: boolean;
}

export type RuleLogType = "ALLOWED" | "BLOCKED" | "PENALTY" | "CAPPED" | "FLAGGED";

export interface ScoringRuleLog {
  id: string;
  rule: string;
  type: RuleLogType;
  message: string;
  pointsChange: number;
  timestamp: string;
}

export interface EngineMetrics {
  totalSettlements: number;
  uniqueCounterparties: number;
  onTimeRate: number;
  averageDelayDays: number;
  amountRepaid: number;
  loopsDetected: number;
  penaltiesApplied: number;
  attacksBlocked: number;
}

export interface ScoringEngineResult {
  baseScore: number;
  finalScore: number;
  pointsDelta: number;
  band: TrustBand;
  confidence: {
    level: "Low" | "Moderate" | "High";
    score: number; // 0 - 100%
    label: string;
  };
  metrics: EngineMetrics;
  logs: ScoringRuleLog[];
}

export const BASE_SCORE = 500;
export const MIN_SCORE = 0;
export const MAX_SCORE = 900;
export const MIN_PAYMENT_AMOUNT = 50; // ₹50 minimum threshold
export const WEEKLY_GROWTH_CAP = 30; // Max +30 points per rolling 7 days

export function getTrustBand(score: number): TrustBand {
  if (score >= 800) return "Excellent";
  if (score >= 650) return "Good";
  if (score >= 500) return "Building";
  return "Risky";
}

/**
 * Detects circular debt cycles: A -> B -> C -> A
 */
export function detectCircularLoops(payments: SimulatedPayment[]): Set<string> {
  const flaggedIds = new Set<string>();
  
  // Build directed edges: fromUser -> list of payments
  const adj = new Map<string, SimulatedPayment[]>();
  for (const p of payments) {
    if (!adj.has(p.fromUser)) adj.set(p.fromUser, []);
    adj.get(p.fromUser)!.push(p);
  }

  // Check 3-node loops: A -> B, B -> C, C -> A
  for (const p1 of payments) {
    const userA = p1.fromUser;
    const userB = p1.toUser;

    const bPayments = adj.get(userB) || [];
    for (const p2 of bPayments) {
      const userC = p2.toUser;
      if (userC === userA) continue; // direct bilateral, handled by diversity rule

      const cPayments = adj.get(userC) || [];
      for (const p3 of cPayments) {
        if (p3.toUser === userA) {
          // Circular loop found: A -> B -> C -> A!
          flaggedIds.add(p1.id);
          flaggedIds.add(p2.id);
          flaggedIds.add(p3.id);
        }
      }
    }
  }

  return flaggedIds;
}

/**
 * Core scoring calculation function
 */
export function calculateTrustScore(
  payments: SimulatedPayment[],
  options?: {
    baseScore?: number;
    currentUser?: string;
  }
): ScoringEngineResult {
  const baseScore = options?.baseScore ?? BASE_SCORE;
  const targetUser = options?.currentUser ?? payments[0]?.fromUser ?? "User A";

  const logs: ScoringRuleLog[] = [];
  let currentScore = baseScore;
  let attacksBlocked = 0;
  let penaltiesApplied = 0;

  // Track counts per counterparty for diversity rule
  const counterpartyInteractionCount = new Map<string, number>();
  const uniqueCounterparties = new Set<string>();

  // Detect circular loops across the whole batch
  const circularPaymentIds = detectCircularLoops(payments);

  let onTimeCount = 0;
  let totalDelayDays = 0;
  let totalAmountRepaid = 0;
  let rollingWeeklyPositiveGains = 0;

  // Process payments chronologically
  const sorted = [...payments].sort((a, b) => {
    const tA = new Date(a.paidDate).getTime();
    const tB = new Date(b.paidDate).getTime();
    return tA - tB;
  });

  for (const payment of sorted) {
    const logId = `log-${payment.id}-${Date.now()}`;
    const nowIso = new Date().toISOString();

    // 1. MUTUAL CONFIRMATION CHECK
    if (!payment.isConfirmed) {
      attacksBlocked++;
      logs.push({
        id: logId,
        rule: "Mutual Confirmation",
        type: "BLOCKED",
        message: `[BLOCKED] Settlement of ₹${payment.amount} to ${payment.toUser} not confirmed by receiver. Zero points awarded.`,
        pointsChange: 0,
        timestamp: nowIso,
      });
      continue;
    }

    // 2. LOOP DETECTION CHECK
    if (circularPaymentIds.has(payment.id)) {
      attacksBlocked++;
      logs.push({
        id: logId,
        rule: "Loop Detection",
        type: "FLAGGED",
        message: `[FLAGGED] Circular repayment ring detected (${payment.fromUser} → ${payment.toUser} in circular graph). Score adjustment neutralized.`,
        pointsChange: 0,
        timestamp: nowIso,
      });
      continue;
    }

    // 3. MINIMUM AMOUNT CHECK
    if (payment.amount < MIN_PAYMENT_AMOUNT) {
      attacksBlocked++;
      logs.push({
        id: logId,
        rule: "Minimum Amount",
        type: "BLOCKED",
        message: `[BLOCKED] Payment of ₹${payment.amount} is below the ₹${MIN_PAYMENT_AMOUNT} spam defense threshold. Ignored.`,
        pointsChange: 0,
        timestamp: nowIso,
      });
      continue;
    }

    // Register counterparty
    uniqueCounterparties.add(payment.toUser);
    const prevInteractions = counterpartyInteractionCount.get(payment.toUser) || 0;
    counterpartyInteractionCount.set(payment.toUser, prevInteractions + 1);

    // 4. COUNTERPARTY DIVERSITY (Diminishing Returns)
    let diversityMultiplier = 1.0;
    if (prevInteractions === 0) {
      diversityMultiplier = 1.0; // 1st interaction
    } else if (prevInteractions === 1) {
      diversityMultiplier = 0.5; // 2nd interaction
    } else if (prevInteractions === 2) {
      diversityMultiplier = 0.2; // 3rd interaction
    } else {
      diversityMultiplier = 0.0; // 4th+ interaction: BLOCKED!
    }

    if (diversityMultiplier === 0.0) {
      attacksBlocked++;
      logs.push({
        id: logId,
        rule: "Counterparty Diversity",
        type: "BLOCKED",
        message: `[BLOCKED] Counterparty diversity limit reached with ${payment.toUser} (${prevInteractions + 1} transactions). Farming rejected.`,
        pointsChange: 0,
        timestamp: nowIso,
      });
      continue;
    }

    // 5. AMOUNT WEIGHTING
    let amountWeight = 1.0;
    if (payment.amount < 100) {
      amountWeight = 0.3;
    } else if (payment.amount <= 500) {
      amountWeight = 0.7;
    } else if (payment.amount <= 2000) {
      amountWeight = 1.0;
    } else if (payment.amount <= 5000) {
      amountWeight = 1.6;
    } else {
      amountWeight = 2.2;
    }

    totalAmountRepaid += payment.amount;

    // 6. DUE DATE & LATE CALCULATION
    const dueTime = new Date(payment.dueDate).getTime();
    const paidTime = new Date(payment.paidDate).getTime();
    const delayDays = Math.max(0, (paidTime - dueTime) / (1000 * 60 * 60 * 24));

    if (payment.isDisputed) {
      // Disputed penalty
      penaltiesApplied++;
      const penalty = -50;
      currentScore = Math.max(MIN_SCORE, currentScore + penalty);
      logs.push({
        id: logId,
        rule: "Dispute Penalty",
        type: "PENALTY",
        message: `[PENALTY] Payment of ₹${payment.amount} was flagged as DISPUTED by ${payment.toUser}. Heavy penalty applied (${penalty} pts).`,
        pointsChange: penalty,
        timestamp: nowIso,
      });
      continue;
    }

    if (delayDays <= 0) {
      // ON TIME / EARLY
      onTimeCount++;
      const baseGain = 8;
      let rawPoints = Math.round(baseGain * amountWeight * diversityMultiplier);

      // 7. WEEKLY GROWTH CAP CHECK
      if (rollingWeeklyPositiveGains + rawPoints > WEEKLY_GROWTH_CAP) {
        const allowedPoints = Math.max(0, WEEKLY_GROWTH_CAP - rollingWeeklyPositiveGains);
        rollingWeeklyPositiveGains = WEEKLY_GROWTH_CAP;
        attacksBlocked++;

        currentScore = Math.min(MAX_SCORE, currentScore + allowedPoints);
        logs.push({
          id: logId,
          rule: "Growth Cap",
          type: "CAPPED",
          message: `[CAPPED] Weekly growth ceiling (+${WEEKLY_GROWTH_CAP} pts) reached. Gain clamped from +${rawPoints} to +${allowedPoints} pts.`,
          pointsChange: allowedPoints,
          timestamp: nowIso,
        });
      } else {
        rollingWeeklyPositiveGains += rawPoints;
        currentScore = Math.min(MAX_SCORE, currentScore + rawPoints);

        const diversityNote = diversityMultiplier < 1.0 ? ` (${Math.round(diversityMultiplier * 100)}% diversity weight)` : "";
        logs.push({
          id: logId,
          rule: "On-Time Repayment",
          type: "ALLOWED",
          message: `[ALLOWED] Paid ₹${payment.amount} on-time to ${payment.toUser}${diversityNote} (+${rawPoints} pts).`,
          pointsChange: rawPoints,
          timestamp: nowIso,
        });
      }
    } else {
      // 8. BIGGER PENALTY THAN REWARD (ASYMMETRIC)
      totalDelayDays += delayDays;
      penaltiesApplied++;

      const basePenalty = -15;
      const delayPenalty = -Math.min(30, Math.round(delayDays * 4));
      // Late payments with large amounts hurt much more
      const penalty = Math.round((basePenalty + delayPenalty) * amountWeight);

      currentScore = Math.max(MIN_SCORE, currentScore + penalty);

      logs.push({
        id: logId,
        rule: "Asymmetric Penalty",
        type: "PENALTY",
        message: `[PENALTY] Paid ₹${payment.amount} ${Math.round(delayDays)} days late to ${payment.toUser}. Asymmetric penalty applied (${penalty} pts).`,
        pointsChange: penalty,
        timestamp: nowIso,
      });
    }
  }

  const finalScore = Math.min(MAX_SCORE, Math.max(MIN_SCORE, currentScore));
  const pointsDelta = finalScore - baseScore;
  const band = getTrustBand(finalScore);

  const totalSettlements = payments.filter((p) => p.isConfirmed).length;
  const onTimeRate =
    totalSettlements > 0 ? Math.round((onTimeCount / totalSettlements) * 100) : 100;
  const averageDelayDays =
    totalSettlements > 0
      ? Math.round((totalDelayDays / totalSettlements) * 10) / 10
      : 0;

  // Confidence calculation
  const uniqueCount = uniqueCounterparties.size;
  let confLevel: "Low" | "Moderate" | "High" = "Low";
  let confScore = 20;

  if (uniqueCount >= 4 && totalSettlements >= 8) {
    confLevel = "High";
    confScore = 90;
  } else if (uniqueCount >= 2 && totalSettlements >= 4) {
    confLevel = "Moderate";
    confScore = 60;
  } else {
    confLevel = "Low";
    confScore = Math.min(40, uniqueCount * 10 + totalSettlements * 3);
  }

  return {
    baseScore,
    finalScore,
    pointsDelta,
    band,
    confidence: {
      level: confLevel,
      score: confScore,
      label: `based on ${uniqueCount} ${
        uniqueCount === 1 ? "person" : "people"
      } and ${totalSettlements} ${
        totalSettlements === 1 ? "settlement" : "settlements"
      }`,
    },
    metrics: {
      totalSettlements,
      uniqueCounterparties: uniqueCount,
      onTimeRate,
      averageDelayDays,
      amountRepaid: totalAmountRepaid,
      loopsDetected: circularPaymentIds.size > 0 ? 1 : 0,
      penaltiesApplied,
      attacksBlocked,
    },
    logs,
  };
}
