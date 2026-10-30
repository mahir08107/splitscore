"use client";

import React from "react";
import { ScoreEvent } from "@/lib/data/score";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

interface ScoreTimelineProps {
  events: ScoreEvent[];
}

function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ScoreTimeline({ events }: ScoreTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E5EF] p-6">
        <h2 className="text-sm font-semibold text-[#1F1D3D] mb-2">
          Why did my score change?
        </h2>
        <p className="text-xs text-[#5B5B72]">
          No score events yet. Events will appear here as you settle expenses.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5EF] p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#1F1D3D]">
          Why did my score change?
        </h2>
        <div className="flex items-center gap-1 text-[10px] text-[#5B5B72]">
          <Info className="w-3 h-3" />
          <span>Latest {events.length} events</span>
        </div>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[15px] top-3 bottom-3 w-px bg-[#E5E5EF]" />

        <div className="space-y-0">
          {events.map((event, i) => {
            const isPositive = event.points_change > 0;
            const isNegative = event.points_change < 0;
            const isNeutral = event.points_change === 0;

            return (
              <div
                key={event.id}
                className="relative flex gap-3 py-3 group"
              >
                {/* Timeline dot */}
                <div
                  className={`
                    relative z-10 flex-shrink-0 w-[30px] h-[30px] rounded-full
                    flex items-center justify-center border-2
                    transition-transform group-hover:scale-110
                    ${
                      isPositive
                        ? "bg-[#F0FDF4] border-[#22C55E]"
                        : isNegative
                        ? "bg-[#FEF2F2] border-[#EF4444]"
                        : "bg-[#F8F8FC] border-[#D1D1DF]"
                    }
                  `}
                >
                  {isPositive && (
                    <TrendingUp className="w-3.5 h-3.5 text-[#15803D]" />
                  )}
                  {isNegative && (
                    <TrendingDown className="w-3.5 h-3.5 text-[#B91C1C]" />
                  )}
                  {isNeutral && (
                    <Minus className="w-3.5 h-3.5 text-[#5B5B72]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Points badge */}
                      <span
                        className={`
                          inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1
                          ${
                            isPositive
                              ? "bg-[#DCFCE7] text-[#15803D]"
                              : isNegative
                              ? "bg-[#FECACA] text-[#B91C1C]"
                              : "bg-[#F1F1FA] text-[#5B5B72]"
                          }
                        `}
                      >
                        {isPositive ? "+" : ""}
                        {event.points_change}
                      </span>
                      {/* Reason */}
                      <p className="text-xs text-[#1F1D3D] leading-relaxed mt-0.5">
                        {event.reason}
                      </p>
                      {/* Counterparty */}
                      {event.counterparty_name && (
                        <p className="text-[10px] text-[#5B5B72] mt-0.5">
                          with {event.counterparty_name}
                        </p>
                      )}
                    </div>

                    {/* Date + running total */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[10px] text-[#9CA3AF]">
                        {formatRelativeDate(event.created_at)}
                      </p>
                      <p className="text-[10px] font-medium text-[#5B5B72] mt-0.5">
                        Score: {event.running_total}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
