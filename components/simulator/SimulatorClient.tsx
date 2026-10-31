"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  runSimulation,
  SimulatedEvent,
  TerminalLogEntry,
  TerminalLogLevel,
  getTrustBand,
  BASE_SCORE,
  TrustBand,
} from "@/lib/trust-score-simulator";
import {
  Zap,
  RotateCcw,
  Play,
  Terminal,
  ShieldCheck,
  FastForward,
  Copy,
  Check,
} from "lucide-react";

type ScenarioKey =
  | "micro_transactions"
  | "ring_fraud"
  | "bust_out"
  | "velocity_spam"
  | "reputation_milking"
  | "legitimate_baseline";

interface ScenarioConfig {
  key: ScenarioKey;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  title: string;
  description: string;
  eventCountText: string;
  rulesTested: string;
  events: SimulatedEvent[];
}

const SCENARIOS: ScenarioConfig[] = [
  {
    key: "micro_transactions",
    badge: "MINIMUM AMOUNT & DIVERSITY",
    badgeBg: "#FEE2E2",
    badgeColor: "#B91C1C",
    title: "Micro-Transactions Farming",
    description:
      "User sends ₹10 to the same friend 50 times to farm points artificially.",
    eventCountText: "50 simulated events",
    rulesTested: "Minimum Amount (< ₹50) & Counterparty Diversity",
    events: Array.from({ length: 50 }, (_, i) => ({
      id: `micro-${i + 1}`,
      fromUser: "User A",
      toUser: "Friend B", // same friend!
      amount: 10,
      daysLate: 0,
      isConfirmed: true,
      description: "Chai split",
    })),
  },
  {
    key: "ring_fraud",
    badge: "RING FRAUD DETECTION",
    badgeBg: "#FEF3C7",
    badgeColor: "#B45309",
    title: "Malicious Collective (Ring Fraud)",
    description:
      "Three users orchestrate a circular ₹1,000 debt (A → B, B → C, C → A) to inflate scores.",
    eventCountText: "3 simulated events",
    rulesTested: "Graph Loop Detection (-50 Penalty)",
    events: [
      {
        id: "ring-1",
        fromUser: "User A",
        toUser: "User B",
        amount: 1000,
        daysLate: 0,
        isConfirmed: true,
        description: "Room advance",
      },
      {
        id: "ring-2",
        fromUser: "User B",
        toUser: "User C",
        amount: 1000,
        daysLate: 0,
        isConfirmed: true,
        description: "Equipment share",
      },
      {
        id: "ring-3",
        fromUser: "User C",
        toUser: "User A",
        amount: 1000,
        daysLate: 0,
        isConfirmed: true,
        description: "Trip reimbursement",
      },
    ],
  },
  {
    key: "bust_out",
    badge: "ASYMMETRIC MULTIPLIER",
    badgeBg: "#FFEDD5",
    badgeColor: "#C2410C",
    title: "The Bust-Out Strategy",
    description:
      "User grooms the system with ten ₹100 on-time payments, then defaults 15 days late on a ₹10,000 Goa trip bill.",
    eventCountText: "11 simulated events",
    rulesTested: "Asymmetric Penalty: -(days_late × amount / 100)",
    events: [
      // 10 grooming payments across 5 friends
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `groom-${i + 1}`,
        fromUser: "User A",
        toUser: `Peer ${String.fromCharCode(66 + (i % 5))}`,
        amount: 100,
        daysLate: 0,
        isConfirmed: true,
        description: `Coffee payback ${i + 1}`,
      })),
      // 1 catastrophic late default: ₹10,000 15 days late -> -1,500 pts!
      {
        id: "bust-out-default",
        fromUser: "User A",
        toUser: "Resort Lead",
        amount: 10000,
        daysLate: 15,
        isConfirmed: true,
        description: "Goa resort villa share",
      },
    ],
  },
  {
    key: "velocity_spam",
    badge: "WEEKLY GROWTH CAP",
    badgeBg: "#FFF1F2",
    badgeColor: "#E11D48",
    title: "Velocity Spamming",
    description:
      "User triggers 20 legitimate ₹500 payments to 20 different people in a single afternoon.",
    eventCountText: "20 simulated events",
    rulesTested: "Velocity Cap (Session Max +30 pts)",
    events: Array.from({ length: 20 }, (_, i) => ({
      id: `vel-${i + 1}`,
      fromUser: "User A",
      toUser: `User ${String.fromCharCode(66 + i)}`,
      amount: 500,
      daysLate: 0,
      isConfirmed: true,
      description: `Mess share #${i + 1}`,
    })),
  },
  {
    key: "reputation_milking",
    badge: "TIME DECAY ENGINE",
    badgeBg: "#F3E8FF",
    badgeColor: "#7E22CE",
    title: "Reputation Milking (Oscillation)",
    description:
      "User has 5 old on-time payments, but their 3 most recent payments are increasingly late.",
    eventCountText: "8 simulated events",
    rulesTested: "Time Decay (0.5x Old Positives, 1.5x Recent Negatives)",
    events: [
      // 5 old on-time payments (weighted 0.5x)
      {
        id: "old-1",
        fromUser: "User A",
        toUser: "Rohan",
        amount: 500,
        daysLate: 0,
        isConfirmed: true,
        isOld: true,
        description: "Old trip expense (3 months ago)",
      },
      {
        id: "old-2",
        fromUser: "User A",
        toUser: "Pooja",
        amount: 600,
        daysLate: 0,
        isConfirmed: true,
        isOld: true,
        description: "Old textbook bill (2 months ago)",
      },
      {
        id: "old-3",
        fromUser: "User A",
        toUser: "Vikram",
        amount: 700,
        daysLate: 0,
        isConfirmed: true,
        isOld: true,
        description: "Old groceries share (2 months ago)",
      },
      {
        id: "old-4",
        fromUser: "User A",
        toUser: "Sneha",
        amount: 800,
        daysLate: 0,
        isConfirmed: true,
        isOld: true,
        description: "Old birthday dinner (6 weeks ago)",
      },
      {
        id: "old-5",
        fromUser: "User A",
        toUser: "Ananya",
        amount: 900,
        daysLate: 0,
        isConfirmed: true,
        isOld: true,
        description: "Old concert ticket (5 weeks ago)",
      },
      // 3 recent late payments with 1.5x recent negative multiplier
      {
        id: "recent-late-1",
        fromUser: "User A",
        toUser: "Karan",
        amount: 1500,
        daysLate: 3, // -(3 * 15) * 1.5 = -68
        isConfirmed: true,
        isRecentNegative: true,
        description: "Recent rent split (3 days late)",
      },
      {
        id: "recent-late-2",
        fromUser: "User A",
        toUser: "Arjun",
        amount: 2500,
        daysLate: 6, // -(6 * 25) * 1.5 = -225
        isConfirmed: true,
        isRecentNegative: true,
        description: "Recent electricity bill (6 days late)",
      },
      {
        id: "recent-late-3",
        fromUser: "User A",
        toUser: "Rahul",
        amount: 3500,
        daysLate: 10, // -(10 * 35) * 1.5 = -525
        isConfirmed: true,
        isRecentNegative: true,
        description: "Recent caterer deposit (10 days late)",
      },
    ],
  },
  {
    key: "legitimate_baseline",
    badge: "HONEST BASELINE",
    badgeBg: "#DCFCE7",
    badgeColor: "#15803D",
    title: "Legitimate Baseline",
    description:
      "3 clean, spaced-out payments of standard amounts (₹800, ₹1,200) paid on time.",
    eventCountText: "3 simulated events",
    rulesTested: "Clean Trust Accrual Across Diverse Peers",
    events: [
      {
        id: "legit-1",
        fromUser: "User A",
        toUser: "Rahul Verma",
        amount: 800,
        daysLate: 0,
        isConfirmed: true,
        description: "Dinner share",
      },
      {
        id: "legit-2",
        fromUser: "User A",
        toUser: "Arjun Nair",
        amount: 1200,
        daysLate: 0,
        isConfirmed: true,
        description: "Train ticket share",
      },
      {
        id: "legit-3",
        fromUser: "User A",
        toUser: "Karan Mehta",
        amount: 1200,
        daysLate: 0,
        isConfirmed: true,
        description: "Hostel mess deposit",
      },
    ],
  },
];

const bandColorConfig: Record<
  TrustBand,
  { text: string; bg: string; border: string }
> = {
  Excellent: { text: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
  Good: { text: "#0F766E", bg: "#F0FDFA", border: "#99F6E4" },
  Building: { text: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  Risky: { text: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" },
};

export function SimulatorClient() {
  const [activeKey, setActiveKey] = useState<ScenarioKey>("bust_out");
  const [displayedLogs, setDisplayedLogs] = useState<TerminalLogEntry[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(BASE_SCORE);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeScenario = SCENARIOS.find((s) => s.key === activeKey)!;

  // Stream events into the terminal line-by-line with 300ms delay
  const startSimulation = (scenario: ScenarioConfig) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const simResult = runSimulation(scenario.title, scenario.events, BASE_SCORE);
    const allLogs = simResult.logs;

    setDisplayedLogs([]);
    setCurrentScore(BASE_SCORE);
    setIsStreaming(true);

    let index = 0;
    timerRef.current = setInterval(() => {
      if (index < allLogs.length) {
        const nextLog = allLogs[index];
        setDisplayedLogs((prev) => [...prev, nextLog]);
        setCurrentScore(nextLog.scoreAfter);
        index++;
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsStreaming(false);
      }
    }, 300);
  };

  useEffect(() => {
    const kickoff = window.setTimeout(() => startSimulation(activeScenario), 0);
    return () => {
      window.clearTimeout(kickoff);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeScenario]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedLogs]);

  const handleSelectScenario = (key: ScenarioKey) => {
    if (key === activeKey && !isStreaming) {
      startSimulation(activeScenario);
    } else {
      setActiveKey(key);
    }
  };

  const handleFastForward = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const simResult = runSimulation(activeScenario.title, activeScenario.events, BASE_SCORE);
    setDisplayedLogs(simResult.logs);
    setCurrentScore(simResult.finalScore);
    setIsStreaming(false);
  };

  const handleCopyLogs = () => {
    const text = displayedLogs
      .map((l) => `[${l.level}] ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const band = getTrustBand(currentScore);
  const bandStyle = bandColorConfig[band];
  const delta = currentScore - BASE_SCORE;

  return (
    <div className="space-y-6">
      {/* ─── SECTION TITLE ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#E11D48] fill-[#E11D48]" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1C1917] font-display">
            CHOOSE ANTI-GAMING SCENARIO TO TEST
          </h2>
        </div>
        <span className="text-xs text-[#57534E] hidden sm:inline">
          Interactive scoring engine sandbox
        </span>
      </div>

      {/* ─── 6 SHADCN-STYLE SCENARIO CARDS GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCENARIOS.map((scenario) => {
          const isActive = scenario.key === activeKey;

          return (
            <div
              key={scenario.key}
              onClick={() => handleSelectScenario(scenario.key)}
              className={`
                cursor-pointer rounded-xl p-5 border transition-all duration-200 flex flex-col justify-between text-left
                ${
                  isActive
                    ? "border-[#5BC5A7] bg-[#5BC5A7] text-black shadow-[0_0_20px_rgba(91,197,167,0.18)]"
                    : "border-slate-700/70 bg-[#10151C] text-white hover:border-[#5BC5A7]/50 hover:shadow-sm"
                }
              `}
            >
              <div>
                {/* Badge Row + Active indicator */}
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: scenario.badgeBg,
                      color: scenario.badgeColor,
                    }}
                  >
                    {scenario.badge}
                  </span>

                  {isActive && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-black">
                      <Play className="w-3 h-3 fill-current" />
                      Active
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className={`text-base font-bold leading-snug mb-1 font-display ${isActive ? "text-black" : "text-white"}`}>
                  {scenario.title}
                </h3>

                {/* Description */}
                <p className={`text-xs leading-relaxed line-clamp-3 ${isActive ? "text-slate-900" : "text-gray-400"}`}>
                  {scenario.description}
                </p>
              </div>

              {/* Card Footer: Event count + Run Test link */}
              <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${isActive ? "border-black/20" : "border-slate-700/70"}`}>
                <span className={`${isActive ? "text-slate-800" : "text-gray-500"} font-medium`}>
                  {scenario.eventCountText}
                </span>
                <span className={`font-semibold flex items-center gap-0.5 hover:underline ${isActive ? "text-black" : "text-[#5BC5A7]"}`}>
                  Run Test <span className="text-sm">→</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── SCENARIO RUNNING STATUS BANNER ─── */}
      <div className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-4 sm:p-5 soft-card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isStreaming ? "bg-[#22C55E] animate-ping" : "bg-[#22C55E]"
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-[#BE123C]">
              SCENARIO RUNNING: {activeScenario.title.toUpperCase()}
            </span>
            {isStreaming && (
              <span className="text-[10px] bg-rose-50 text-[#E11D48] px-2 py-0.5 rounded-full font-bold animate-pulse border border-[#FECDD3]">
                STREAMING LINE-BY-LINE (300ms)...
              </span>
            )}
          </div>
          <p className="text-xs text-[#57534E] mt-1">
            {activeScenario.description} •{" "}
            <span className="font-medium text-[#1C1917]">
              Tests: {activeScenario.rulesTested}
            </span>
          </p>
        </div>

        <button
          onClick={() => handleSelectScenario("legitimate_baseline")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-[rgba(225,29,72,0.09)] bg-white hover:bg-[#FCFBF7] text-[#57534E] hover:text-[#1C1917] transition-colors self-start sm:self-auto shrink-0 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* ─── JUDGE-AMAZE TERMINAL + LIVE SCORE DIAL ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: macOS Code-Editor Terminal (8 cols on lg) */}
        <div className="lg:col-span-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col">
          {/* macOS Window Header with Traffic Lights */}
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 border border-red-600/40" />
                <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500/40" />
                <span className="w-3 h-3 rounded-full bg-green-500 border border-green-600/40" />
              </div>
              <span className="font-mono text-xs text-gray-400 font-medium hidden sm:inline">
                splitscore-math-engine --scenario=&quot;{activeScenario.key}&quot;
              </span>
            </div>

            {/* Terminal Actions */}
            <div className="flex items-center gap-2">
              {isStreaming ? (
                <button
                  onClick={handleFastForward}
                className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-gray-300 hover:text-white bg-gray-700/60 px-2.5 py-1 rounded transition-colors"
                  title="Fast forward to end"
                >
                  <FastForward className="w-3 h-3" />
                  <span>Fast forward</span>
                </button>
              ) : (
                <button
                  onClick={() => startSimulation(activeScenario)}
                className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-[#5BC5A7] hover:text-white bg-gray-700/60 px-2.5 py-1 rounded transition-colors"
                  title="Re-run simulation"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run Test</span>
                </button>
              )}

              <button
                onClick={handleCopyLogs}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-400 hover:text-white bg-gray-700/60 px-2 py-1 rounded transition-colors"
                title="Copy terminal logs"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Terminal Console Output */}
          <div className="p-4 sm:p-5 font-mono text-xs leading-relaxed overflow-y-auto max-h-[440px] min-h-[350px] space-y-2 select-text bg-gray-900">
            {displayedLogs.map((log) => {
              const style = getLogFormatting(log.level);

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-2.5 transition-all duration-150 animate-in fade-in slide-in-from-left-1"
                >
                  {/* Tag Indicator */}
                  <span
                    className={`shrink-0 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide ${style.badge}`}
                  >
                    [{log.level}]
                  </span>

                  {/* Message */}
                  <span className={`flex-1 break-words ${style.text}`}>
                    {log.message}
                  </span>

                  {/* Points delta */}
                  {log.pointsDelta !== 0 && (
                    <span
                      className={`shrink-0 font-bold text-[11px] ${
                        log.pointsDelta > 0
                          ? "text-[#5BC5A7]"
                          : "text-red-400"
                      }`}
                    >
                      {log.pointsDelta > 0
                        ? `+${log.pointsDelta}`
                        : log.pointsDelta}{" "}
                      pts
                    </span>
                  )}
                </div>
              );
            })}

            {isStreaming && (
              <div className="flex items-center gap-2 pt-2 text-gray-400 text-xs font-mono">
                <span className="w-2 h-4 bg-blue-400 animate-pulse inline-block" />
                <span>Processing next event with 300ms delay...</span>
              </div>
            )}

            <div ref={terminalEndRef} />
          </div>

          {/* Terminal Footer */}
          <div className="bg-gray-800 px-4 py-2 border-t border-gray-700/80 text-[11px] font-mono text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              Real math engine • Zero Supabase calls • Client-side latency 0ms
            </span>
            <span>{displayedLogs.length} events logged</span>
          </div>
        </div>

        {/* Right: Large Live "Current Score" Dial (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-6 soft-card-shadow flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
                Current Trust Score
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: bandStyle.bg,
                  color: bandStyle.text,
                  border: `1px solid ${bandStyle.border}`,
                }}
              >
                {band}
              </span>
            </div>

            {/* Large Dial Gauge */}
            <div className="relative w-48 h-48 mx-auto my-2 flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="66"
                  fill="none"
                  stroke="#FFF1F2"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="66"
                  fill="none"
                  stroke={bandStyle.text}
                  strokeWidth="12"
                  strokeDasharray={`${(currentScore / 900) * 2 * Math.PI * 66} ${
                    2 * Math.PI * 66
                  }`}
                  strokeLinecap="round"
                  className="transition-all duration-300 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-5xl sm:text-6xl font-extrabold tracking-tight transition-all duration-300 font-display"
                  style={{ color: bandStyle.text }}
                >
                  {currentScore}
                </span>
                <span className="text-[10px] font-medium text-[#57534E] uppercase tracking-wider mt-1">
                  out of 900
                </span>
              </div>
            </div>

            {/* Delta Box */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-xs text-[#57534E]">Total Delta:</span>
              <span
                className={`text-sm font-bold px-2 py-0.5 rounded-lg ${
                  delta > 0
                    ? "bg-[#DCFCE7] text-[#15803D]"
                    : delta < 0
                    ? "bg-[#FEE2E2] text-[#B91C1C]"
                    : "bg-rose-50 text-[#57534E] border border-[#FECDD3]"
                }`}
              >
                {delta > 0 ? `+${delta}` : delta} pts
              </span>
            </div>
          </div>

          {/* Mathematical Proof Box */}
          <div className="w-full mt-6 pt-4 border-t border-[rgba(225,29,72,0.06)] text-left text-xs space-y-1.5 text-[#57534E]">
            <div className="flex items-center gap-1.5 text-[#1C1917] font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              <span>Un-Gameable Math Rules</span>
            </div>
            <ul className="text-[10px] space-y-1 text-[#57534E] list-disc list-inside">
              <li>Minimum Amount: &lt; ₹50 gives 0 points</li>
              <li>Asymmetric Penalty: -(days_late × amount / 100)</li>
              <li>Diversity: 5 / (1 + previous_transactions)</li>
              <li>Velocity Cap: session gains clamped at +30</li>
              <li>Ring Fraud: circular cycles docked -50 pts</li>
              <li>Time Decay: 0.5x old positive, 1.5x recent negative</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Color coding mapping based on exact user specification:
// [INFO] -> White
// [SUCCESS] -> SplitScore mint
// [WARNING] -> Yellow
// [CRITICAL] -> Red
// [PENALTY] -> Red
// [SYSTEM] -> Bold White
function getLogFormatting(level: TerminalLogLevel): {
  badge: string;
  text: string;
} {
  switch (level) {
    case "INFO":
      return {
        badge: "bg-gray-800 text-gray-300 border border-gray-700",
        text: "text-gray-200 font-medium",
      };
    case "SUCCESS":
      return {
        badge: "bg-[#5BC5A7]/10 text-[#5BC5A7] border border-[#5BC5A7]/30",
        text: "text-[#5BC5A7]",
      };
    case "WARNING":
      return {
        badge: "bg-yellow-900/60 text-yellow-400 border border-yellow-600/40",
        text: "text-yellow-400",
      };
    case "CRITICAL":
      return {
        badge: "bg-red-900/70 text-red-400 border border-red-600/50",
        text: "text-red-400 font-semibold",
      };
    case "PENALTY":
      return {
        badge: "bg-red-950 text-red-500 border border-red-600 font-extrabold",
        text: "text-red-500 font-bold",
      };
    case "SYSTEM":
      return {
        badge: "bg-gray-800 text-white border border-gray-600 font-bold",
        text: "text-white font-bold",
      };
    default:
      return {
        badge: "bg-gray-800 text-gray-400",
        text: "text-gray-300",
      };
  }
}
