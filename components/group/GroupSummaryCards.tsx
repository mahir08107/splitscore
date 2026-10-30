import React from "react";
import { formatRupees } from "@/lib/data/dashboard";
import { Receipt, ArrowUpRight, ArrowDownLeft, Users } from "lucide-react";
import { GroupSummaryMetrics } from "@/lib/group/types";

interface GroupSummaryCardsProps {
  summary: GroupSummaryMetrics;
}

export function GroupSummaryCards({ summary }: GroupSummaryCardsProps) {
  const { totalExpenses, youOwe, youAreOwed, memberCount } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Total Expenses */}
      <div className="bg-white rounded-xl p-5 border border-[#E5E5F0] shadow-sm flex flex-col justify-between transition-all hover:border-[#D1D1E9]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B5B72]">
            Total Expenses
          </span>
          <div className="w-8 h-8 rounded-full bg-[#F1F1FA] flex items-center justify-center text-[#2E2A7A]">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F1D3D]">
            {formatRupees(totalExpenses)}
          </p>
          <p className="text-xs text-[#5B5B72] mt-1">Group cumulative total</p>
        </div>
      </div>

      {/* 2. You Owe */}
      <div className="bg-white rounded-xl p-5 border border-[#E5E5F0] shadow-sm flex flex-col justify-between transition-all hover:border-[#D1D1E9]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B5B72]">
            You Owe
          </span>
          <div className="w-8 h-8 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#B91C1C]">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              youOwe > 0 ? "text-[#B91C1C]" : "text-[#5B5B72]"
            }`}
          >
            {formatRupees(youOwe)}
          </p>
          <p className="text-xs text-[#5B5B72] mt-1">
            {youOwe === 0 ? "All settled up" : "To group members"}
          </p>
        </div>
      </div>

      {/* 3. You Are Owed */}
      <div className="bg-white rounded-xl p-5 border border-[#E5E5F0] shadow-sm flex flex-col justify-between transition-all hover:border-[#D1D1E9]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B5B72]">
            You Are Owed
          </span>
          <div className="w-8 h-8 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#15803D]">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              youAreOwed > 0 ? "text-[#15803D]" : "text-[#5B5B72]"
            }`}
          >
            {formatRupees(youAreOwed)}
          </p>
          <p className="text-xs text-[#5B5B72] mt-1">
            {youAreOwed === 0 ? "No pending returns" : "From group members"}
          </p>
        </div>
      </div>

      {/* 4. Members */}
      <div className="bg-white rounded-xl p-5 border border-[#E5E5F0] shadow-sm flex flex-col justify-between transition-all hover:border-[#D1D1E9]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B5B72]">
            Members
          </span>
          <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#4338CA]">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F1D3D]">
            {memberCount}
          </p>
          <p className="text-xs text-[#5B5B72] mt-1">
            {memberCount === 1 ? "Active participant" : "Active participants"}
          </p>
        </div>
      </div>
    </div>
  );
}

