"use client";

import React from "react";
import { TrustBand } from "@/lib/data/score";
import { TrustCard } from "@/components/trust-score/trust-card";

interface HeroScoreCardProps {
  score: number;
  band: TrustBand;
  userName: string;
  confidenceLabel: string;
  userId?: string;
  stats?: {
    activeGroupsCount?: number;
    completedSettlementsCount?: number;
    networkSize?: number;
  };
}

export function HeroScoreCard({
  score,
  band,
  userName,
  confidenceLabel,
  userId,
  stats,
}: HeroScoreCardProps) {
  return (
    <div className="w-full flex flex-col items-center py-2">
      <TrustCard
        score={score}
        band={band}
        userName={userName}
        confidenceLabel={confidenceLabel}
        userId={userId}
        stats={stats}
      />
    </div>
  );
}

export { TrustCard };
