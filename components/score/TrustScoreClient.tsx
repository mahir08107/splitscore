"use client";

import React, { useState } from "react";
import { TrustScoreData, ContextType } from "@/lib/data/score";
import { HeroScoreCard } from "./HeroScoreCard";
import { ContextToggle } from "./ContextToggle";
import { ScoreHistoryChart } from "./ScoreHistoryChart";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { ScoreTimeline } from "./ScoreTimeline";
import Link from "next/link";
import { HelpCircle, ArrowLeft, QrCode, ArrowRight } from "lucide-react";

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
          className="inline-flex items-center gap-1.5 text-sm text-[#5B5B72] hover:text-[#1F1D3D] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/trust/${data.userId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0c5c56] transition-colors min-h-[44px] px-3.5 py-1.5 rounded-lg shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Public Card & QR</span>
          </Link>
          <Link
            href="/how-scoring-works"
            className="inline-flex items-center gap-1.5 text-xs text-[#4338CA] hover:text-[#2E2A7A] transition-colors min-h-[44px] px-3 py-1.5 border border-[#4338CA]/20 rounded-lg hover:bg-[#F1F1FA]"
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
      />

      {/* Shareable QR Card Banner */}
      <div className="bg-white rounded-xl border border-[#E5E5EF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1F1D3D]">
              Portable Public Trust Card & QR Code
            </p>
            <p className="text-[11px] text-[#5B5B72]">
              Share your verified reputation with zero private expense history exposed.
            </p>
          </div>
        </div>
        <Link
          href={`/trust/${data.userId}`}
          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#2E2A7A] hover:bg-[#4338CA] px-4 py-2 rounded-xl transition-all min-h-[40px] shrink-0"
        >
          <span>View Shareable QR Card</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

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
