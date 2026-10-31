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
      <div className="min-h-screen bg-[#FCFBF7]">
        <DashboardErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#1C1917] flex flex-col font-body relative overflow-hidden">
      {/* 1. Header with SplitScore brand, user name/avatar and link to My Trust Score */}
      <DashboardHeader user={data.user} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Subtle refreshing indicator if background fetch is active */}
        {isPending && (
          <div className="mb-4 inline-block rounded-md border border-[#5BC5A7]/30 bg-[#5BC5A7]/10 px-3.5 py-1.5 text-xs font-semibold text-[#5BC5A7] animate-pulse">
            Updating dashboard data...
          </div>
        )}

        {/* Quick action: Scan a Bill */}
        <div className="mb-5">
          <Link
            href="/receipt/new"
            className="inline-flex items-center gap-2.5 rounded-md border border-[#5BC5A7]/70 bg-[#5BC5A7] px-5 py-3 text-sm font-bold text-black transition-all hover:bg-[#79D9BD] active:scale-95"
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

        <section className="mt-5 flex flex-col gap-3 rounded-xl border border-[#5BC5A7]/25 bg-[#0D1117] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#5BC5A7] shadow-[0_0_10px_rgba(91,197,167,0.8)]" />
            <div><h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5BC5A7]">Global netting · in development</h2><p className="mt-1 text-xs leading-5 text-gray-400">Cross-group debt optimization is being built. Balances below currently reflect each group separately.</p></div>
          </div>
          <Link href="/how-scoring-works" className="shrink-0 pl-5 text-xs font-semibold text-gray-300 hover:text-[#5BC5A7]">How settlements work →</Link>
        </section>

        {/* 3. Pending actions list with Confirm or Pay buttons */}
        <PendingActionsList actions={data.pendingActions} />

        {/* 4. Groups list with type label, member count, balance and Create group button */}
        <GroupsList groups={data.groups} />
      </main>
    </div>
  );
}
