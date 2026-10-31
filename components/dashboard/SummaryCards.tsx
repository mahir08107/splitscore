import React from "react";
import Link from "next/link";
import { TrustScoreInfo, TrustBand, formatRupees } from "@/lib/data/dashboard";
import { ArrowUpRight, ArrowDownLeft, Shield } from "lucide-react";

interface SummaryCardsProps {
  totalOwe: number;
  totalOwed: number;
  trustScore: TrustScoreInfo;
}

// Band colors per SplitScore Project Context:
// Excellent: 15803D, Good: 0F766E, Building: B45309, Risky: BE123C
const bandStyleConfig: Record<
  TrustBand,
  { bg: string; text: string; badgeBg: string; border: string }
> = {
  Excellent: {
    bg: "rgba(91, 197, 167, 0.08)",
    text: "#5BC5A7",
    badgeBg: "rgba(91, 197, 167, 0.12)",
    border: "rgba(91, 197, 167, 0.35)",
  },
  Good: {
    bg: "rgba(91, 197, 167, 0.08)",
    text: "#5BC5A7",
    badgeBg: "rgba(91, 197, 167, 0.12)",
    border: "rgba(91, 197, 167, 0.35)",
  },
  Building: {
    bg: "rgba(233, 168, 73, 0.08)",
    text: "#E9A849",
    badgeBg: "rgba(233, 168, 73, 0.12)",
    border: "rgba(233, 168, 73, 0.35)",
  },
  Risky: {
    bg: "rgba(248, 113, 113, 0.08)",
    text: "#F87171",
    badgeBg: "rgba(248, 113, 113, 0.12)",
    border: "rgba(248, 113, 113, 0.35)",
  },
};

export function SummaryCards({
  totalOwe,
  totalOwed,
  trustScore,
}: SummaryCardsProps) {
  const currentBandStyle = bandStyleConfig[trustScore.band] || bandStyleConfig.Good;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
      {/* 1. You owe card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col justify-between transition-all hover:border-[#FECDD3]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Total you owe
          </span>
          <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="font-display text-2xl sm:text-3xl font-black tracking-tight text-red-400">
            {formatRupees(totalOwe)}
          </p>
          <p className="text-xs text-[#57534E] mt-1 font-medium">
            {totalOwe === 0 ? "All settled up" : "To group members"}
          </p>
        </div>
      </div>

      {/* 2. You are owed card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col justify-between transition-all hover:border-[#FECDD3]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Total you are owed
          </span>
          <div className="w-8 h-8 rounded-full bg-[#5BC5A7]/10 border border-[#5BC5A7]/30 flex items-center justify-center text-[#5BC5A7]">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="font-display text-2xl sm:text-3xl font-black tracking-tight text-[#15803D]">
            {formatRupees(totalOwed)}
          </p>
          <p className="text-xs text-[#57534E] mt-1 font-medium">
            {totalOwed === 0 ? "No pending returns" : "From group members"}
          </p>
        </div>
      </div>

      {/* 3. Trust Score card */}
      <Link
        href="/trust-score"
          className="group block rounded-xl border border-slate-700/70 bg-[#10151C] p-5 shadow-[0_0_15px_rgba(91,197,167,0.08)] transition-all hover:border-[#5BC5A7]/50 sm:p-6"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
            Trust Score
          </span>
          <div className="w-8 h-8 rounded-full bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center text-[#E11D48] group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 text-[#E11D48]" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white">
              {trustScore.score}
            </span>
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: currentBandStyle.badgeBg,
                color: currentBandStyle.text,
                borderColor: currentBandStyle.border,
              }}
            >
              {trustScore.band}
            </span>
          </div>
          <svg className="h-8 w-20 text-[#5BC5A7]" viewBox="0 0 80 32" fill="none" aria-label="Trust score trend">
            <path d="M2 25 15 20 27 22 39 12 51 16 63 7 78 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs text-[#5BC5A7] font-bold group-hover:underline">
            View details &rarr;
          </span>
        </div>
        <p className="text-xs text-[#57534E] mt-1 font-medium">
          {trustScore.confidenceNote}
        </p>
      </Link>
    </div>
  );
}
