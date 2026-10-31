"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DashboardData } from "@/lib/data/dashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { PendingActionsList } from "@/components/dashboard/PendingActionsList";
import { GroupsList } from "@/components/dashboard/GroupsList";
import { DashboardErrorState } from "@/components/dashboard/DashboardErrorState";
import { Camera } from "lucide-react";

interface DashboardClientProps {
  initialData: DashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const [data] = useState<DashboardData>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRetry = () => {
    setError(null);
    startTransition(() => {
      router.refresh();
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FD]">
        <DashboardErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-[#1F1D3D] flex flex-col font-sans">
      {/* 1. Header with SplitScore brand, user name/avatar and link to My Trust Score */}
      <DashboardHeader user={data.user} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Subtle refreshing indicator if background fetch is active */}
        {isPending && (
          <div className="mb-4 text-xs font-semibold text-[#4338CA] bg-[#EEF2FF] px-3 py-1.5 rounded-md inline-block animate-pulse">
            Updating dashboard data...
          </div>
        )}

        {/* Quick action: Scan a Bill */}
        <div className="mb-5">
          <Link
            href="/receipt/new"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-[#2E2A7A] to-[#4338CA] text-white text-sm font-semibold shadow-sm hover:shadow-md hover:from-[#23205E] hover:to-[#3730A3] transition-all"
          >
            <Camera className="w-4.5 h-4.5" />
            Scan a Bill
          </Link>
        </div>

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
