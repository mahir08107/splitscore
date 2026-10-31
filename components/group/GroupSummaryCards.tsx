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
      <div className="bg-white rounded-2xl p-5 border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col justify-between transition-all hover:border-[#FECDD3]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
            Total Expenses
          </span>
          <div className="w-8 h-8 rounded-full bg-rose-50 border border-[#FECDD3] flex items-center justify-center text-[#E11D48]">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1917] font-display">
            {formatRupees(totalExpenses)}
          </p>
          <p className="text-xs text-[#57534E] mt-1">Group cumulative total</p>
        </div>
      </div>

      {/* 2. You Owe */}
      <div className="bg-white rounded-2xl p-5 border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col justify-between transition-all hover:border-[#FECDD3]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
            You Owe
          </span>
          <div className="w-8 h-8 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#B91C1C]">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-display ${
              youOwe > 0 ? "text-[#B91C1C]" : "text-[#57534E]"
            }`}
          >
            {formatRupees(youOwe)}
          </p>
          <p className="text-xs text-[#57534E] mt-1">
            {youOwe === 0 ? "All settled up" : "To group members"}
          </p>
        </div>
      </div>

      {/* 3. You Are Owed */}
      <div className="bg-white rounded-2xl p-5 border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col justify-between transition-all hover:border-[#FECDD3]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
            You Are Owed
          </span>
          <div className="w-8 h-8 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#15803D]">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-display ${
              youAreOwed > 0 ? "text-[#15803D]" : "text-[#57534E]"
            }`}
          >
            {formatRupees(youAreOwed)}
          </p>
          <p className="text-xs text-[#57534E] mt-1">
            {youAreOwed === 0 ? "No pending returns" : "From group members"}
          </p>
        </div>
      </div>

      {/* 4. Members */}
      <div className="bg-white rounded-2xl p-5 border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col justify-between transition-all hover:border-[#FECDD3]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
            Members
          </span>
          <div className="w-8 h-8 rounded-full bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center text-[#E11D48]">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1917] font-display">
            {memberCount}
          </p>
          <p className="text-xs text-[#57534E] mt-1">
            {memberCount === 1 ? "Active participant" : "Active participants"}
          </p>
        </div>
      </div>
    </div>
  );
}
