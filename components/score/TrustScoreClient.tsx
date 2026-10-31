"use client";

import React, { useState } from "react";
import { TrustScoreData, ContextType } from "@/lib/data/score";
import { HeroScoreCard } from "./HeroScoreCard";
import { ContextToggle } from "./ContextToggle";
import { ScoreHistoryChart } from "./ScoreHistoryChart";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { ScoreTimeline } from "./ScoreTimeline";
import Link from "next/link";
import { HelpCircle, ArrowLeft } from "lucide-react";

interface TrustScoreClientProps {
  data: TrustScoreData;
}

export function TrustScoreClient({ data }: TrustScoreClientProps) {
  const [activeContext, setActiveContext] = useState<ContextType>("overall");

  // Use the context-specific score if available, otherwise overall
  const displayScore =
    data.contextScores[activeContext] ?? data.currentScore;

  return (
    <div className="space-y-5">
      {/* Navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#57534E] hover:text-[#1C1917] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/how-scoring-works"
            className="inline-flex items-center gap-1.5 text-xs text-[#E11D48] hover:text-[#BE123C] transition-colors min-h-[44px] px-3 py-1.5 border border-[rgba(225,29,72,0.14)] rounded-lg hover:bg-rose-50"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            How Scoring Works
          </Link>
        </div>
      </div>

      {/* Demo banner */}
      {data.isDemo && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] rounded-lg px-4 py-2.5 text-xs leading-relaxed">
          <strong>Demo Mode:</strong> This is sample score data. Sign in and start settling expenses to see your real trust score.
        </div>
      )}

      {/* Hero Score Card */}
      <HeroScoreCard
        score={displayScore}
        band={data.band}
        userName={data.userName}
        confidenceLabel={data.confidence.label}
        userId={data.userId}
        stats={{
          activeGroupsCount: data.activeGroupsCount,
          completedSettlementsCount: data.completedSettlementsCount,
          networkSize: data.networkSize,
        }}
      />

      {/* Context Toggle */}
      <ContextToggle
        active={activeContext}
        onChange={setActiveContext}
        contextScores={data.contextScores}
      />

      {/* Score History Chart */}
      <ScoreHistoryChart events={data.events} band={data.band} />

      {/* Score Breakdown */}
      <ScoreBreakdown metrics={data.metrics} />

      {/* Score Timeline */}
      <ScoreTimeline events={data.events} />
    </div>
  );
}
