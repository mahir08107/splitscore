import { supabase } from "@/lib/supabase";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { DEMO_USER_ID, DEMO_MEMBERS_USERS } from "@/lib/group/demo-data";

import {
  signTrustCardToken,
  verifyTrustCardToken,
  VerificationProof,
} from "@/lib/crypto/jwt";

// ─── Types ───────────────────────────────────────────────────────────

export type TrustBand = "Excellent" | "Good" | "Building" | "Risky";
export type ContextType = "overall" | "trip" | "mess" | "event";

export interface PublicTrustCardData {
  userId: string;
  userName: string;
  avatar?: string | null;
  score: number;
  band: TrustBand;
  confidence: ConfidenceInfo;
  verifiedByCount: number;
  signedToken: string;
  verificationProof: VerificationProof | null;
  memberSince?: string;
}

export interface ScoreEvent {
  id: string;
  user_id: string;
  settlement_id: string | null;
  points_change: number;
  reason: string;
  created_at: string;
  /** Running total at this point in time */
  running_total: number;
  /** Name of the counterparty if applicable */
  counterparty_name?: string;
}

export interface ScoreMetrics {
  onTimeRate: number;        // 0–100%
  averageDelay: number;      // days (lower is better)
  amountReliability: number; // 0–100%
  consistency: number;       // 0–100%
  diversityOfPeople: number; // unique counterparties count
}

export interface ConfidenceInfo {
  uniquePeople: number;
  totalSettlements: number;
  label: string; // e.g. "based on 4 people and 9 settlements"
}

export interface TrustScoreData {
  userId: string;
  userName: string;
  currentScore: number;
  band: TrustBand;
  confidence: ConfidenceInfo;
  metrics: ScoreMetrics;
  events: ScoreEvent[];
  /** Per-context scores if available */
  contextScores: Record<ContextType, number | null>;
  isDemo: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────

export function getTrustBand(score: number): TrustBand {
  if (score >= 800) return "Excellent";
  if (score >= 650) return "Good";
  if (score >= 500) return "Building";
  return "Risky";
}

const BASE_SCORE = 500;

// ─── Demo Data ───────────────────────────────────────────────────────

function buildDemoScoreData(): TrustScoreData {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const demoEvents: ScoreEvent[] = [
    {
      id: "se-1",
      user_id: DEMO_USER_ID,
      settlement_id: "stl-1",
      points_change: 0,
      reason: "Account created, starting at base score of 500",
      created_at: new Date(now - 30 * day).toISOString(),
      running_total: 500,
      counterparty_name: undefined,
    },
    {
      id: "se-2",
      user_id: DEMO_USER_ID,
      settlement_id: "stl-2",
      points_change: 12,
      reason: "Paid 2000 rupees to Rahul Verma on time for Hotel Booking",
      created_at: new Date(now - 25 * day).toISOString(),
      running_total: 512,
      counterparty_name: "Rahul Verma",
    },
    {
      id: "se-3",
      user_id: DEMO_USER_ID,
      settlement_id: "stl-3",
      points_change: 8,
      reason: "Paid 600 rupees to Arjun Nair on time for Dinner",
      created_at: new Date(now - 20 * day).toISOString(),
      running_total: 520,
      counterparty_name: "Arjun Nair",
    },
    {
      id: "se-4",
      user_id: DEMO_USER_ID,
      settlement_id: "stl-4",
      points_change: -15,
      reason: "Payment of 1500 rupees to Karan Mehta was 3 days late",
      created_at: new Date(now - 14 * day).toISOString(),
      running_total: 505,
      counterparty_name: "Karan Mehta",
    },
    {
      id: "se-5",
      user_id: DEMO_USER_ID,
      settlement_id: "stl-5",
      points_change: 6,
      reason: "Paid 1200 rupees to Rahul Verma 1 day early",
      created_at: new Date(now - 10 * day).toISOString(),
      running_total: 511,
      counterparty_name: "Rahul Verma",
    },
    {
      id: "se-6",
      user_id: DEMO_USER_ID,
      settlement_id: "stl-6",
      points_change: 10,
      reason: "Paid 800 rupees to Arjun Nair on time for Fuel share",
      created_at: new Date(now - 7 * day).toISOString(),
      running_total: 521,
      counterparty_name: "Arjun Nair",
    },
    {
      id: "se-7",
      user_id: DEMO_USER_ID,
      settlement_id: "stl-7",
      points_change: 14,
      reason: "Paid 2500 rupees to Karan Mehta 2 days early for Beach Activities",
      created_at: new Date(now - 3 * day).toISOString(),
      running_total: 535,
      counterparty_name: "Karan Mehta",
    },
    {
      id: "se-8",
      user_id: DEMO_USER_ID,
      settlement_id: "stl-8",
      points_change: 5,
      reason: "Consistency bonus for 3 on-time payments in a row",
      created_at: new Date(now - 1 * day).toISOString(),
      running_total: 540,
      counterparty_name: undefined,
    },
  ];

  return {
    userId: DEMO_USER_ID,
    userName: "Student User",
    currentScore: 540,
    band: getTrustBand(540),
    confidence: {
      uniquePeople: 3,
      totalSettlements: 7,
      label: "based on 3 people and 7 settlements",
    },
    metrics: {
      onTimeRate: 86,
      averageDelay: 0.4,
      amountReliability: 92,
      consistency: 78,
      diversityOfPeople: 3,
    },
    events: demoEvents,
    contextScores: {
      overall: 540,
      trip: 560,
      mess: null,
      event: null,
    },
    isDemo: true,
  };
}

export function isDemoUser(id: string): boolean {
  return (
    !id ||
    id === DEMO_USER_ID ||
    id === "demo123" ||
    id === "demo-user-123" ||
    id === process.env.NEXT_PUBLIC_DEMO_USER_ID ||
    id === "00000000-0000-0000-0000-000000000000"
  );
}

// ─── Main Fetcher ────────────────────────────────────────────────────

export async function getTrustScoreData(
  userIdOverride?: string
): Promise<TrustScoreData> {
  // Determine current user
  let currentUserId = userIdOverride || DEMO_USER_ID;
  let isDemo = true;
  let serverClient = null;

  if (!userIdOverride) {
    try {
      serverClient = await createServerSupabase();
      const { data } = await serverClient.auth.getUser();
      if (data?.user) {
        currentUserId = data.user.id;
        isDemo = false;
      }
    } catch {
      // auth not configured
    }
  }

  // Check for demo mode
  if (isDemo || isDemoUser(currentUserId) || !supabase) {
    return buildDemoScoreData();
  }

  const client = serverClient || supabase;

  try {
    // 1. Fetch user profile
    const { data: userData } = await client
      .from("users")
      .select("id, name, email")
      .eq("id", currentUserId)
      .maybeSingle();

    const userName = userData?.name || "User";

    // 2. Fetch score_events ordered chronologically
    const { data: eventsRaw, error: eventsErr } = await client
      .from("score_events")
      .select("id, user_id, settlement_id, points_change, reason, created_at")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: true });

    if (eventsErr) {
      console.warn("Error fetching score_events:", eventsErr.message);
    }

    const rawEvents = eventsRaw || [];

    // 3. Compute running totals
    let runningTotal = BASE_SCORE;
    const events: ScoreEvent[] = rawEvents.map((e: any) => {
      runningTotal += Number(e.points_change) || 0;
      return {
        id: e.id,
        user_id: e.user_id,
        settlement_id: e.settlement_id,
        points_change: Number(e.points_change) || 0,
        reason: e.reason || "Score adjustment",
        created_at: e.created_at,
        running_total: runningTotal,
      };
    });

    const currentScore = runningTotal;

    // 4. Fetch settlements for confidence + metrics
    const { data: settlementsAsFrom } = await client
      .from("settlements")
      .select("id, from_user, to_user, amount, status, due_date, confirmed_at, marked_paid_at")
      .eq("from_user", currentUserId)
      .eq("status", "confirmed");

    const { data: settlementsAsTo } = await client
      .from("settlements")
      .select("id, from_user, to_user, amount, status, due_date, confirmed_at, marked_paid_at")
      .eq("to_user", currentUserId)
      .eq("status", "confirmed");

    const allConfirmedSettlements = [
      ...(settlementsAsFrom || []),
      ...(settlementsAsTo || []),
    ];

    // Unique counterparties
    const counterpartySet = new Set<string>();
    for (const s of allConfirmedSettlements) {
      if (s.from_user === currentUserId) counterpartySet.add(s.to_user);
      if (s.to_user === currentUserId) counterpartySet.add(s.from_user);
    }

    const uniquePeople = counterpartySet.size;
    const totalSettlements = allConfirmedSettlements.length;

    // 5. Compute metrics from settlements where user is payer
    const paidSettlements = allConfirmedSettlements.filter(
      (s) => s.from_user === currentUserId
    );

    let onTimeCount = 0;
    let totalDelayDays = 0;
    for (const s of paidSettlements) {
      if (s.due_date && s.marked_paid_at) {
        const due = new Date(s.due_date).getTime();
        const paid = new Date(s.marked_paid_at).getTime();
        const delayMs = paid - due;
        const delayDays = Math.max(0, delayMs / (24 * 60 * 60 * 1000));
        if (delayDays <= 0) onTimeCount++;
        totalDelayDays += delayDays;
      } else {
        // No due date = on time by default
        onTimeCount++;
      }
    }

    const onTimeRate =
      paidSettlements.length > 0
        ? Math.round((onTimeCount / paidSettlements.length) * 100)
        : 100;
    const averageDelay =
      paidSettlements.length > 0
        ? Math.round((totalDelayDays / paidSettlements.length) * 10) / 10
        : 0;

    // Amount reliability: percentage of total split amount actually settled
    const amountReliability = totalSettlements > 0 ? 95 : 100; // placeholder approximation
    const consistency = onTimeRate >= 80 ? Math.min(onTimeRate - 5, 95) : Math.max(onTimeRate - 15, 20);

    const metrics: ScoreMetrics = {
      onTimeRate,
      averageDelay,
      amountReliability,
      consistency,
      diversityOfPeople: uniquePeople,
    };

    // 6. Try to resolve counterparty names from events
    const settlementIds = events
      .filter((e) => e.settlement_id)
      .map((e) => e.settlement_id as string);

    if (settlementIds.length > 0 && supabase) {
      const { data: stlData } = await supabase
        .from("settlements")
        .select("id, from_user, to_user")
        .in("id", settlementIds);

      const stlMap = new Map<string, { from_user: string; to_user: string }>();
      for (const s of stlData || []) {
        stlMap.set(s.id, s);
      }

      // Get user names for counterparties
      const counterpartyIds = new Set<string>();
      for (const s of stlData || []) {
        if (s.from_user !== currentUserId) counterpartyIds.add(s.from_user);
        if (s.to_user !== currentUserId) counterpartyIds.add(s.to_user);
      }

      let nameMap: Record<string, string> = {};
      if (counterpartyIds.size > 0) {
        const { data: names } = await supabase
          .from("users")
          .select("id, name")
          .in("id", Array.from(counterpartyIds));
        for (const n of names || []) {
          nameMap[n.id] = n.name || "Member";
        }
      }

      for (const event of events) {
        if (event.settlement_id && stlMap.has(event.settlement_id)) {
          const stl = stlMap.get(event.settlement_id)!;
          const counterId =
            stl.from_user === currentUserId ? stl.to_user : stl.from_user;
          event.counterparty_name = nameMap[counterId] || "Member";
        }
      }
    }

    return {
      userId: currentUserId,
      userName,
      currentScore,
      band: getTrustBand(currentScore),
      confidence: {
        uniquePeople,
        totalSettlements,
        label: `based on ${uniquePeople} ${uniquePeople === 1 ? "person" : "people"} and ${totalSettlements} ${totalSettlements === 1 ? "settlement" : "settlements"}`,
      },
      metrics,
      events: events.reverse(), // newest first for timeline
      contextScores: {
        overall: currentScore,
        trip: null,
        mess: null,
        event: null,
      },
      isDemo: false,
    };
  } catch (err) {
    console.error("Error fetching trust score data:", err);
    return buildDemoScoreData();
  }
}

// ─── Public Trust Card Data Fetcher ───────────────────────────────────

export async function getPublicTrustCardData(
  userId: string
): Promise<PublicTrustCardData> {
  // Check if it's one of the demo users
  const isDemo = isDemoUser(userId) || DEMO_MEMBERS_USERS.some((m) => m.id === userId);
  const demoMatch = DEMO_MEMBERS_USERS.find(
    (m) => m.id === userId || (isDemo && m.id === DEMO_USER_ID)
  );

  if (demoMatch || isDemo) {
    const isRahul = userId === "demo-user-rahul";
    const isArjun = userId === "demo-user-arjun";
    const isKaran = userId === "demo-user-karan";

    const name = demoMatch?.name || "Student User";
    const score = isRahul ? 710 : isArjun ? 620 : isKaran ? 480 : 540;
    const band = getTrustBand(score);
    const verifiedByCount = isRahul ? 6 : isArjun ? 4 : isKaran ? 2 : 3;
    const totalSettlements = isRahul ? 14 : isArjun ? 8 : isKaran ? 4 : 7;

    const token = signTrustCardToken({
      sub: userId,
      name,
      score,
      band,
      verified_by_count: verifiedByCount,
      settlements_count: totalSettlements,
    });

    const proof = verifyTrustCardToken(token);

    return {
      userId,
      userName: name,
      score,
      band,
      confidence: {
        uniquePeople: verifiedByCount,
        totalSettlements,
        label: `based on ${verifiedByCount} people and ${totalSettlements} settlements`,
      },
      verifiedByCount,
      signedToken: token,
      verificationProof: proof,
      memberSince: "January 2026",
    };
  }

  // Live Supabase lookup
  try {
    if (!supabase) throw new Error("Supabase client unavailable");

    // 1. Fetch user profile (only basic identity, NO private info)
    const { data: userProfile } = await supabase
      .from("users")
      .select("id, name, created_at, avatar")
      .eq("id", userId)
      .maybeSingle();

    const userName = userProfile?.name || "SplitScore Member";
    const memberSince = userProfile?.created_at
      ? new Date(userProfile.created_at).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        })
      : "Active Member";

    // 2. Fetch score events (only points_change for sum, NO reasons/amounts)
    const { data: scoreEvents } = await supabase
      .from("score_events")
      .select("points_change")
      .eq("user_id", userId);

    let score = BASE_SCORE;
    if (scoreEvents && scoreEvents.length > 0) {
      for (const ev of scoreEvents) {
        score += Number(ev.points_change) || 0;
      }
    }

    // 3. Fetch confirmed settlements (only IDs & users, NO amounts/groups)
    const { data: confirmedFrom } = await supabase
      .from("settlements")
      .select("id, from_user, to_user")
      .eq("from_user", userId)
      .eq("status", "confirmed");

    const { data: confirmedTo } = await supabase
      .from("settlements")
      .select("id, from_user, to_user")
      .eq("to_user", userId)
      .eq("status", "confirmed");

    const allConfirmed = [...(confirmedFrom || []), ...(confirmedTo || [])];
    const counterparties = new Set<string>();

    for (const stl of allConfirmed) {
      if (stl.from_user !== userId) counterparties.add(stl.from_user);
      if (stl.to_user !== userId) counterparties.add(stl.to_user);
    }

    const uniquePeople = counterparties.size;
    const totalSettlements = allConfirmed.length;
    const band = getTrustBand(score);

    // Cryptographic signature
    const token = signTrustCardToken({
      sub: userId,
      name: userName,
      score,
      band,
      verified_by_count: uniquePeople,
      settlements_count: totalSettlements,
    });

    const proof = verifyTrustCardToken(token);

    return {
      userId,
      userName,
      avatar: userProfile?.avatar || null,
      score,
      band,
      confidence: {
        uniquePeople,
        totalSettlements,
        label: `based on ${uniquePeople} ${
          uniquePeople === 1 ? "person" : "people"
        } and ${totalSettlements} ${
          totalSettlements === 1 ? "settlement" : "settlements"
        }`,
      },
      verifiedByCount: uniquePeople,
      signedToken: token,
      verificationProof: proof,
      memberSince,
    };
  } catch (err) {
    console.error("Error in getPublicTrustCardData:", err);
    // Fallback card
    const score = 500;
    const band = getTrustBand(score);
    const token = signTrustCardToken({
      sub: userId,
      name: "SplitScore Member",
      score,
      band,
      verified_by_count: 0,
      settlements_count: 0,
    });
    return {
      userId,
      userName: "SplitScore Member",
      score,
      band,
      confidence: {
        uniquePeople: 0,
        totalSettlements: 0,
        label: "New member building reputation",
      },
      verifiedByCount: 0,
      signedToken: token,
      verificationProof: verifyTrustCardToken(token),
      memberSince: "Recent",
    };
  }
}
