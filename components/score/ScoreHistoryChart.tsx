"use client";

import React, { useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ScoreEvent, TrustBand } from "@/lib/data/score";

interface ScoreHistoryChartProps {
  events: ScoreEvent[];
  band: TrustBand;
}

const subscribeToHydration = () => () => {};
const getClientHydration = () => true;
const getServerHydration = () => false;

const bandStroke: Record<TrustBand, string> = {
  Excellent: "#5BC5A7",
  Good: "#5BC5A7",
  Building: "#E9A849",
  Risky: "#EF4444",
};

const bandFill: Record<TrustBand, string> = {
  Excellent: "rgba(91, 197, 167, 0.18)",
  Good: "rgba(91, 197, 167, 0.18)",
  Building: "rgba(233, 168, 73, 0.16)",
  Risky: "#FECACA",
};

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ScoreHistoryChart({ events, band }: ScoreHistoryChartProps) {
  const isMounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydration,
    getServerHydration
  );

  // Sort chronologically (oldest first) so the timeline progresses left-to-right
  const chronological = [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const chartData = chronological.map((e) => ({
    date: formatShortDate(e.created_at),
    score: e.running_total,
    reason: e.reason,
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-6 soft-card-shadow">
        <h2 className="text-sm font-semibold text-[#1C1917] mb-2 font-display">
          Score History
        </h2>
        <p className="text-xs text-[#57534E]">
          No score events yet. Your chart will appear here once you settle your first expense.
        </p>
      </div>
    );
  }

  const scores = chartData.map((d) => d.score);
  const minScore = Math.max(0, Math.min(...scores) - 30);
  const maxScore = Math.min(900, Math.max(...scores) + 30);

  return (
    <div className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-4 sm:p-6 soft-card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#1C1917] font-display">
          Score History
        </h2>
        <span className="text-[10px] text-[#57534E] bg-rose-50 text-[#BE123C] px-2 py-0.5 rounded-full border border-[#FECDD3]">
          {chartData.length} events
        </span>
      </div>

      <div className="w-full h-[200px] sm:h-[240px]">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={bandStroke[band]}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor={bandFill[band]}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(71,85,105,0.45)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minScore, maxScore]}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#10151C",
                  color: "#F9FAFB",
                  borderRadius: "8px",
                  border: "1px solid rgba(91,197,167,0.24)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value) => [`${value}`, "Score"]}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke={bandStroke[band]}
                strokeWidth={2.5}
                fill="url(#scoreGradient)"
                dot={{
                  r: 3,
                  fill: bandStroke[band],
                  stroke: "white",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: bandStroke[band],
                  stroke: "white",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-[#57534E]">
            Loading chart...
          </div>
        )}
      </div>
    </div>
  );
}
