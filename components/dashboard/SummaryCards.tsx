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
    bg: "#F0FDF4",
    text: "#15803D",
    badgeBg: "#DCFCE7",
    border: "#BBF7D0",
  },
  Good: {
    bg: "#F0FDFA",
    text: "#0F766E",
    badgeBg: "#CCFBF1",
    border: "#99F6E4",
  },
  Building: {
    bg: "#FFFBEB",
    text: "#B45309",
    badgeBg: "#FEF3C7",
    border: "#FDE68A",
  },
  Risky: {
    bg: "#FFF1F2",
    text: "#BE123C",
    badgeBg: "#FFE4E6",
    border: "#FECDD3",
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
          <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
            You owe
          </span>
          <div className="w-8 h-8 rounded-full bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center text-[#BE123C]">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="font-display text-2xl sm:text-3xl font-black tracking-tight text-[#BE123C]">
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
          <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
            You are owed
          </span>
          <div className="w-8 h-8 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#15803D]">
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
        className="block bg-white rounded-2xl p-5 sm:p-6 border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col justify-between transition-all hover:border-[#E11D48] group"
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
            <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-[#1C1917]">
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
          <span className="text-xs text-[#E11D48] font-bold group-hover:underline">
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
