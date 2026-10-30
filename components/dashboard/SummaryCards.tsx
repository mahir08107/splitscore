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
// Excellent: 15803D, Good: 0F766E, Building: B45309, Risky: B91C1C
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
    bg: "#FEF2F2",
    text: "#B91C1C",
    badgeBg: "#FEE2E2",
    border: "#FECACA",
  },
};

export function SummaryCards({
  totalOwe,
  totalOwed,
  trustScore,
}: SummaryCardsProps) {
  const currentBandStyle = bandStyleConfig[trustScore.band] || bandStyleConfig.Good;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. You owe card */}
      <div className="bg-white rounded-xl p-5 border border-[#E5E5F0] shadow-sm flex flex-col justify-between transition-all hover:border-[#D1D1E9]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B5B72]">
            You owe
          </span>
          <div className="w-8 h-8 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#B91C1C]">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#B91C1C]">
            {formatRupees(totalOwe)}
          </p>
          <p className="text-xs text-[#5B5B72] mt-1">
            {totalOwe === 0 ? "All settled up" : "To group members"}
          </p>
        </div>
      </div>

      {/* 2. You are owed card */}
      <div className="bg-white rounded-xl p-5 border border-[#E5E5F0] shadow-sm flex flex-col justify-between transition-all hover:border-[#D1D1E9]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B5B72]">
            You are owed
          </span>
          <div className="w-8 h-8 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#15803D]">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#15803D]">
            {formatRupees(totalOwed)}
          </p>
          <p className="text-xs text-[#5B5B72] mt-1">
            {totalOwed === 0 ? "No pending returns" : "From group members"}
          </p>
        </div>
      </div>

      {/* 3. Trust Score card */}
      <Link
        href="/trust-score"
        className="block bg-white rounded-xl p-5 border border-[#E5E5F0] shadow-sm flex flex-col justify-between transition-all hover:border-[#4338CA] group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B5B72]">
            Trust Score
          </span>
          <div className="w-8 h-8 rounded-full bg-[#F1F1FA] flex items-center justify-center text-[#2E2A7A]">
            <Shield className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F1D3D]">
              {trustScore.score}
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: currentBandStyle.badgeBg,
                color: currentBandStyle.text,
                borderColor: currentBandStyle.border,
              }}
            >
              {trustScore.band}
            </span>
          </div>
          <span className="text-xs text-[#4338CA] font-medium group-hover:underline">
            View details &rarr;
          </span>
        </div>
        <p className="text-xs text-[#5B5B72] mt-1">
          {trustScore.confidenceNote}
        </p>
      </Link>
    </div>
  );
}
