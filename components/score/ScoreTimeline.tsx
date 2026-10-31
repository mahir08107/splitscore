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
      <div className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-6 soft-card-shadow">
        <h2 className="text-sm font-semibold text-[#1C1917] mb-2 font-display">
          Why did my score change?
        </h2>
        <p className="text-xs text-[#57534E]">
          No score events yet. Events will appear here as you settle expenses.
        </p>
      </div>
    );
  }

  // Sort newest first for chronological timeline
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-4 sm:p-6 soft-card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#1C1917] font-display">
          Why did my score change?
        </h2>
        <div className="flex items-center gap-1 text-[10px] text-[#57534E]">
          <Info className="w-3 h-3" />
          <span>Latest {sortedEvents.length} events</span>
        </div>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[15px] top-3 bottom-3 w-px bg-stone-100" />

        <div className="space-y-0">
          {sortedEvents.map((event) => {
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
                    <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" />
                  )}
                  {isNegative && (
                    <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />
                  )}
                  {isNeutral && (
                    <Minus className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  )}
                </div>

                {/* Event info */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[#1C1917] leading-tight">
                      {event.reason}
                    </p>
                    <span
                      className={`
                        text-xs font-bold shrink-0 px-2 py-0.5 rounded-full
                        ${
                          isPositive
                            ? "bg-[#DCFCE7] text-[#15803D]"
                            : isNegative
                            ? "bg-[#FEE2E2] text-[#B91C1C]"
                            : "bg-rose-50 text-[#57534E] border border-[#FECDD3]"
                        }
                      `}
                    >
                      {isPositive ? `+${event.points_change}` : event.points_change}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-[10px] text-[#9CA3AF]">
                    <span>{formatRelativeDate(event.created_at)}</span>
                    <span>•</span>
                    <span>
                      Score after:{" "}
                      <strong className="text-[#57534E]">
                        {event.running_total}
                      </strong>
                    </span>
                    {event.counterparty_name && (
                      <>
                        <span>•</span>
                        <span>with {event.counterparty_name}</span>
                      </>
                    )}
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
