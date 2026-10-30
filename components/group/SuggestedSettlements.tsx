"use client";

import React from "react";
import Link from "next/link";
import { SuggestedSettlement, SettlementModel } from "@/lib/group/types";
import { formatRupees } from "@/lib/data/dashboard";
import { ArrowRight, Sparkles, CheckCircle2, Clock } from "lucide-react";

interface SuggestedSettlementsProps {
  groupId: string;
  suggestedSettlements: SuggestedSettlement[];
  awaitingSettlements: SettlementModel[];
  currentUserId: string;
}

export function SuggestedSettlements({
  groupId,
  suggestedSettlements,
  awaitingSettlements,
  currentUserId,
}: SuggestedSettlementsProps) {
  return (
    <div className="space-y-6">
      {/* 1. Awaiting confirmation list (marked_paid settlements that do NOT yet affect balance) */}
      {awaitingSettlements.length > 0 && (
        <div className="bg-white rounded-xl border border-[#FDE68A] p-5 shadow-sm bg-[#FFFDF5]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B45309] mb-2">
            <Clock className="w-4 h-4" />
            <span>Awaiting Mutual Confirmation ({awaitingSettlements.length})</span>
          </div>
          <p className="text-xs text-[#5B5B72] mb-3">
            These payments have been marked as paid by the sender, but will only update balances and trust scores once verified by the receiver.
          </p>

          <div className="divide-y divide-[#FDE68A]/60">
            {awaitingSettlements.map((s) => {
              const isReceiver = s.to_user === currentUserId;
              return (
                <div
                  key={s.id}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="text-xs sm:text-sm text-[#1F1D3D]">
                    <strong>{s.fromName || "Member"}</strong> marked payment of{" "}
                    <span className="font-bold text-[#0F766E]">{formatRupees(s.amount)}</span> to{" "}
                    <strong>{s.toName || "Member"}</strong>
                  </div>

                  {isReceiver ? (
                    <Link
                      href={`/group/${groupId}/settle?settlement=${s.id}`}
                      className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0c5d57] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm self-start sm:self-auto"
                    >
                      Confirm receipt
                    </Link>
                  ) : (
                    <span className="text-xs text-[#B45309] font-medium bg-[#FEF3C7] px-2.5 py-1 rounded-md self-start sm:self-auto">
                      Pending receiver confirmation
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Suggested Settlements Card (Debt Simplification) */}
      <div className="bg-white rounded-xl border border-[#E5E5F0] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4338CA] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1F1D3D]">
                Suggested Settlements
              </h3>
              <p className="text-xs text-[#5B5B72]">
                Simplified to the fewest direct payments using Minimum Cash Flow.
              </p>
            </div>
          </div>
        </div>

        {suggestedSettlements.length === 0 ? (
          <div className="text-center py-6 px-4 bg-[#F8F9FD] rounded-xl border border-[#E5E5F0]">
            <CheckCircle2 className="w-8 h-8 text-[#15803D] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1F1D3D]">All balances are settled up</p>
            <p className="text-xs text-[#5B5B72] mt-0.5">
              No pending settlements are needed in this group right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestedSettlements.map((s, idx) => {
              const isCurrentUserPayer = s.fromUserId === currentUserId;
              const isCurrentUserReceiver = s.toUserId === currentUserId;

              const settleUrl = `/group/${groupId}/settle?from=${s.fromUserId}&to=${s.toUserId}&amount=${s.amount}`;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isCurrentUserPayer
                      ? "bg-[#FEF2F2]/60 border-[#FECACA]"
                      : isCurrentUserReceiver
                      ? "bg-[#F0FDF4]/60 border-[#BBF7D0]"
                      : "bg-white border-[#E5E5F0]"
                  }`}
                >
                  {/* Settlement Flow Info */}
                  <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
                    <span className="font-semibold text-sm text-[#1F1D3D]">
                      {isCurrentUserPayer ? "You" : s.fromName}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#5B5B72]" />
                    <span className="font-semibold text-sm text-[#1F1D3D]">
                      {isCurrentUserReceiver ? "You" : s.toName}
                    </span>
                    <span className="ml-auto sm:ml-2 font-extrabold text-base text-[#1F1D3D] bg-white px-2.5 py-1 rounded-md border border-[#E5E5F0]">
                      {formatRupees(s.amount)}
                    </span>
                  </div>

                  {/* Settle Up Action */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <Link
                      href={settleUrl}
                      className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-lg bg-[#2E2A7A] hover:bg-[#252263] text-white font-semibold text-xs uppercase tracking-wide transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
                    >
                      {isCurrentUserPayer ? "Pay via UPI" : "Settle Up"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

