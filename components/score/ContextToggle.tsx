"use client";

import React from "react";
import { ContextType } from "@/lib/data/score";
import { Plane, UtensilsCrossed, PartyPopper, Globe } from "lucide-react";

interface ContextToggleProps {
  active: ContextType;
  onChange: (context: ContextType) => void;
  contextScores: Record<ContextType, number | null>;
}

const contexts: {
  key: ContextType;
  label: string;
  icon: typeof Globe;
}[] = [
  { key: "overall", label: "Overall", icon: Globe },
  { key: "trip", label: "Trip", icon: Plane },
  { key: "mess", label: "Mess", icon: UtensilsCrossed },
  { key: "event", label: "Event", icon: PartyPopper },
];

export function ContextToggle({
  active,
  onChange,
  contextScores,
}: ContextToggleProps) {
  return (
    <div className="w-full bg-white rounded-xl border border-[#E5E5EF] p-1.5 sm:p-2">
      <div className="flex gap-1">
        {contexts.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          const score = contextScores[key];
          const hasData = score !== null;

          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`
                flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg
                min-h-[44px] text-xs font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-[#2E2A7A] text-white shadow-sm"
                    : hasData
                    ? "text-[#5B5B72] hover:bg-[#F1F1FA] hover:text-[#1F1D3D]"
                    : "text-[#C4C4D4] cursor-default"
                }
              `}
              disabled={!hasData && !isActive}
              aria-pressed={isActive}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              {hasData && (
                <span
                  className={`text-[10px] font-bold ${
                    isActive ? "text-white/80" : "text-[#5B5B72]"
                  }`}
                >
                  {score}
                </span>
              )}
              {!hasData && key !== "overall" && (
                <span className="text-[9px] text-[#C4C4D4]">No data</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
