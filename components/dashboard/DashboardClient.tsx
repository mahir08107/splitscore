"use client";

import React, { useState, useTransition } from "react";
import { DashboardData, getDashboardData } from "@/lib/data/dashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { PendingActionsList } from "@/components/dashboard/PendingActionsList";
import { GroupsList } from "@/components/dashboard/GroupsList";
import { DashboardErrorState } from "@/components/dashboard/DashboardErrorState";
import dynamic from "next/dynamic";
import type { LightfallProps } from "@/components/ui/Lightfall";

const Lightfall = dynamic<LightfallProps>(
  () => import("@/components/ui/Lightfall"),
  { ssr: false }
);

interface DashboardClientProps {
  initialData: DashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRetry = () => {
    setError(null);
    startTransition(async () => {
      try {
        const fresh = await getDashboardData();
        setData(fresh);
      } catch (err: any) {
        setError(err?.message || "Failed to reload data");
      }
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#FCFBF7]">
        <DashboardErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#1C1917] flex flex-col font-body relative overflow-hidden">
      {/* Dashboard Ambient Lightfall Layer */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden flex items-center justify-center"
        aria-hidden="true"
      >
        <div style={{ width: "100%", height: "600px", position: "relative" }}>
          <Lightfall
            colors={["#f43f5e"]}
            backgroundColor="#ffffff"
            speed={0.3}
            streakCount={2}
            streakWidth={0.8}
            twinkle={0.3}
            backgroundGlow={0.1}
            headGlow={0.6}
            bloom={0.35}
            mouseInteraction
            holdToWarp
            intro
            streakLength={1}
            density={0.6}
            glow={1}
            depth={0.5}
            zoom={3}
            mouseStrength={0.4}
            mouseRadius={0.45}
            lens={0.5}
            fade={0}
            lightMode={false}
          />
        </div>
      </div>

      {/* 1. Header with SplitScore brand, user name/avatar and link to My Trust Score */}
      <DashboardHeader user={data.user} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Subtle refreshing indicator if background fetch is active */}
        {isPending && (
          <div className="mb-4 text-xs font-semibold text-[#BE123C] bg-[#FFF1F2] border border-[#FECDD3] px-3.5 py-1.5 rounded-xl inline-block animate-pulse">
            Updating dashboard data...
          </div>
        )}

        {/* 2. Summary cards (You owe, You are owed, Trust Score with band badge) */}
        <SummaryCards
          totalOwe={data.totalOwe}
          totalOwed={data.totalOwed}
          trustScore={data.trustScore}
        />

        {/* 3. Pending actions list with Confirm or Pay buttons */}
        <PendingActionsList actions={data.pendingActions} />

        {/* 4. Groups list with type label, member count, balance and Create group button */}
        <GroupsList groups={data.groups} />
      </main>
    </div>
  );
}
