"use client";

import React from "react";
import { ScoreMetrics } from "@/lib/data/score";
import {
  Clock,
  Timer,
  BadgeDollarSign,
  Repeat,
  Users,
} from "lucide-react";

interface ScoreBreakdownProps {
  metrics: ScoreMetrics;
}

interface MetricCardProps {
  icon: typeof Clock;
  label: string;
  value: string;
  subtitle: string;
  color: string;
  bgColor: string;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
  bgColor,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5EF] p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: bgColor }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="text-[11px] font-medium text-[#5B5B72] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold text-[#1F1D3D] mb-0.5">{value}</p>
      <p className="text-[10px] text-[#9CA3AF]">{subtitle}</p>
    </div>
  );
}

export function ScoreBreakdown({ metrics }: ScoreBreakdownProps) {
  const cards: MetricCardProps[] = [
    {
      icon: Clock,
      label: "On-Time Rate",
      value: `${metrics.onTimeRate}%`,
      subtitle: "payments made on or before due",
      color: "#15803D",
      bgColor: "#F0FDF4",
    },
    {
      icon: Timer,
      label: "Avg Delay",
      value: metrics.averageDelay === 0 ? "None" : `${metrics.averageDelay}d`,
      subtitle: "average days past due date",
      color: metrics.averageDelay <= 1 ? "#0F766E" : "#B45309",
      bgColor: metrics.averageDelay <= 1 ? "#F0FDFA" : "#FFFBEB",
    },
    {
      icon: BadgeDollarSign,
      label: "Amount Reliability",
      value: `${metrics.amountReliability}%`,
      subtitle: "of owed amounts fully settled",
      color: "#4338CA",
      bgColor: "#EEF2FF",
    },
    {
      icon: Repeat,
      label: "Consistency",
      value: `${metrics.consistency}%`,
      subtitle: "streak of on-time payments",
      color: "#7C3AED",
      bgColor: "#F5F3FF",
    },
    {
      icon: Users,
      label: "People Diversity",
      value: `${metrics.diversityOfPeople}`,
      subtitle: "unique counterparties",
      color: "#0F766E",
      bgColor: "#F0FDFA",
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-[#1F1D3D]">
        Score Breakdown
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
