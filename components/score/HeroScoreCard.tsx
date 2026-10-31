"use client";

import React from "react";
import { TrustBand } from "@/lib/data/score";
import { Shield, TrendingUp, Users, Star } from "lucide-react";

interface HeroScoreCardProps {
  score: number;
  band: TrustBand;
  userName: string;
  confidenceLabel: string;
}

const bandConfig: Record<
  TrustBand,
  {
    color: string;
    bgGradientFrom: string;
    bgGradientTo: string;
    lightBg: string;
    ringColor: string;
    label: string;
    icon: typeof Star;
  }
> = {
  Excellent: {
    color: "#15803D",
    bgGradientFrom: "#F0FDF4",
    bgGradientTo: "#DCFCE7",
    lightBg: "#BBF7D0",
    ringColor: "#22C55E",
    label: "Excellent",
    icon: Star,
  },
  Good: {
    color: "#0F766E",
    bgGradientFrom: "#F0FDFA",
    bgGradientTo: "#CCFBF1",
    lightBg: "#99F6E4",
    ringColor: "#14B8A6",
    label: "Good",
    icon: TrendingUp,
  },
  Building: {
    color: "#B45309",
    bgGradientFrom: "#FFFBEB",
    bgGradientTo: "#FEF3C7",
    lightBg: "#FDE68A",
    ringColor: "#F59E0B",
    label: "Building",
    icon: TrendingUp,
  },
  Risky: {
    color: "#B91C1C",
    bgGradientFrom: "#FEF2F2",
    bgGradientTo: "#FECACA",
    lightBg: "#FCA5A5",
    ringColor: "#EF4444",
    label: "Risky",
    icon: Shield,
  },
};

export function HeroScoreCard({
  score,
  band,
  userName,
  confidenceLabel,
}: HeroScoreCardProps) {
  const config = bandConfig[band];
  const BandIcon = config.icon;

  // Calculate score arc (0–900 range for display)
  const normalizedScore = Math.min(Math.max(score, 0), 900);
  const percentage = (normalizedScore / 900) * 100;

  return (
    <div
      className="relative rounded-2xl overflow-hidden border"
      style={{
        background: `linear-gradient(135deg, ${config.bgGradientFrom} 0%, ${config.bgGradientTo} 100%)`,
        borderColor: config.lightBg,
      }}
    >
      {/* Decorative gradient overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          background: `radial-gradient(ellipse at 70% 20%, ${config.color} 0%, transparent 70%)`,
        }}
      />

      <div className="relative px-5 py-6 sm:px-8 sm:py-8">
        {/* Top label row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: config.color }} />
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: config.color }}
            >
              Trust Score
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: config.lightBg,
              color: config.color,
            }}
          >
            <BandIcon className="w-3 h-3" />
            {config.label}
          </div>
        </div>

        {/* Score + ring visual */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
          {/* Circular score gauge */}
          <div className="relative w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] flex-shrink-0">
            <svg
              viewBox="0 0 160 160"
              className="w-full h-full -rotate-90"
            >
              {/* Background ring */}
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="white"
                strokeWidth="10"
                opacity="0.6"
              />
              {/* Progress ring */}
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke={config.ringColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 2 * Math.PI * 68} ${2 * Math.PI * 68}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Score number in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none font-display"
                style={{ color: config.color }}
              >
                {score}
              </span>
              <span
                className="text-[10px] font-medium uppercase tracking-wider mt-1"
                style={{ color: config.color, opacity: 0.7 }}
              >
                out of 900
              </span>
            </div>
          </div>

          {/* Info section */}
          <div className="text-center sm:text-left flex-1">
            <p className="text-sm font-medium text-[#1C1917] mb-1">
              {userName}
            </p>
            <p className="text-xs text-[#57534E] leading-relaxed mb-3">
              {confidenceLabel}
            </p>

            {/* Score bar */}
            <div className="w-full max-w-[260px] mx-auto sm:mx-0">
              <div className="flex justify-between text-[10px] text-[#57534E] mb-1">
                <span>0</span>
                <span>300</span>
                <span>500</span>
                <span>650</span>
                <span>800</span>
                <span>900</span>
              </div>
              <div className="h-2 rounded-full bg-white/60 overflow-hidden relative">
                {/* Gradient bar segments */}
                <div className="absolute inset-0 flex">
                  <div className="flex-1" style={{ background: "#FECACA" }} />
                  <div className="flex-1" style={{ background: "#FDE68A" }} />
                  <div className="flex-1" style={{ background: "#99F6E4" }} />
                  <div className="flex-1" style={{ background: "#BBF7D0" }} />
                </div>
                {/* Score indicator */}
                <div
                  className="absolute top-[-2px] w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all duration-700"
                  style={{
                    left: `${percentage}%`,
                    transform: "translateX(-50%)",
                    background: config.ringColor,
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] mt-1" style={{ color: "#9CA3AF" }}>
                <span>Risky</span>
                <span>Building</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom confidence chip */}
        <div className="mt-5 flex items-center justify-center sm:justify-start gap-2">
          <Users className="w-3.5 h-3.5 text-[#57534E]" />
          <span className="text-xs text-[#57534E]">{confidenceLabel}</span>
        </div>
      </div>
    </div>
  );
}
