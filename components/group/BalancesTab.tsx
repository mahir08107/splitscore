"use client";

import React from "react";
import { GroupMemberModel, SuggestedSettlement, SettlementModel } from "@/lib/group/types";
import { formatRupees } from "@/lib/data/dashboard";
import { SuggestedSettlements } from "./SuggestedSettlements";
import { ArrowUpRight, ArrowDownLeft, Check, Shield } from "lucide-react";

interface BalancesTabProps {
  groupId: string;
  members: GroupMemberModel[];
  suggestedSettlements: SuggestedSettlement[];
  awaitingSettlements: SettlementModel[];
  currentUserId: string;
}

export function BalancesTab({
  groupId,
  members,
  suggestedSettlements,
  awaitingSettlements,
  currentUserId,
}: BalancesTabProps) {
  return (
    <section className="space-y-8">
      {/* Heading & Subtitle */}
      <div>
        <h2 className="text-xl font-bold text-[#1F1D3D]">Group Balances</h2>
        <p className="text-xs sm:text-sm text-[#5B5B72] mt-0.5">
          See who owes money and who should receive it.
        </p>
      </div>

      {/* 1. Member Net Balance Overview */}
      <div className="bg-white rounded-xl border border-[#E5E5F0] p-6 shadow-sm">
        <h3 className="text-sm uppercase font-bold text-[#5B5B72] tracking-wider mb-4">
          Member Net Standings ({members.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {members.map((member) => {
            const isOwed = member.netBalance > 0.01;
            const isOwing = member.netBalance < -0.01;
            const isSettled = !isOwed && !isOwing;

            const isCurrent = member.user_id === currentUserId;

            return (
              <div
                key={member.user_id}
                className="p-4 rounded-xl border border-[#E5E5F0] flex items-center justify-between gap-3 bg-[#FAFBFD]"
              >
                {/* Member Avatar & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#2E2A7A] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1F1D3D] truncate flex items-center gap-1.5">
                      <span>{member.user.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-[#EEF2FF] text-[#4338CA] px-1.5 py-0.2 rounded font-semibold">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#5B5B72] truncate">
                      Paid: {formatRupees(member.totalContributed)}
                    </p>
                  </div>
                </div>

                {/* Net status badge & amount */}
                <div className="text-right shrink-0">
                  {isOwed && (
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                        <ArrowDownLeft className="w-3 h-3" />
                        Gets back
                      </span>
                      <span className="text-base font-extrabold text-[#15803D] mt-1">
                        {formatRupees(member.netBalance)}
                      </span>
                    </div>
                  )}

                  {isOwing && (
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#FECACA]">
                        <ArrowUpRight className="w-3 h-3" />
                        Owes
                      </span>
                      <span className="text-base font-extrabold text-[#B91C1C] mt-1">
                        {formatRupees(Math.abs(member.netBalance))}
                      </span>
                    </div>
                  )}

                  {isSettled && (
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B5B72] bg-[#F1F1FA] px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        Settled
                      </span>
                      <span className="text-sm font-semibold text-[#5B5B72] mt-1">
                        ₹0
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Suggested Settlements (Simplified debt list) */}
      <SuggestedSettlements
        groupId={groupId}
        suggestedSettlements={suggestedSettlements}
        awaitingSettlements={awaitingSettlements}
        currentUserId={currentUserId}
      />
    </section>
  );
}

