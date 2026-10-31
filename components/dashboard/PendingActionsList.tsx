import React from "react";
import Link from "next/link";
import { PendingAction } from "@/lib/data/dashboard";
import { CheckCircle2, Clock } from "lucide-react";

interface PendingActionsListProps {
  actions: PendingAction[];
}

export function PendingActionsList({ actions }: PendingActionsListProps) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="font-display font-bold text-lg text-[#1C1917] flex items-center gap-2">
          <span>Pending Actions</span>
          {actions.length > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-[#BE123C] border border-[#FECDD3] font-bold">
              {actions.length}
            </span>
          )}
        </h2>
      </div>

      {actions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] soft-card-shadow p-6 text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#15803D] mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="font-display text-sm font-bold text-[#1C1917]">
            Nothing pending
          </p>
          <p className="text-xs text-[#57534E] mt-0.5">
            You are fully caught up on payments and confirmations.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] soft-card-shadow divide-y divide-stone-100 overflow-hidden">
          {actions.map((action) => {
            const isConfirm = action.type === "confirm_payment";
            const settleUrl = `/group/${action.groupId}/settle?settlement=${action.settlementId}`;

            return (
              <div
                key={action.id}
                className="flex flex-col justify-between gap-3 p-4 transition-colors hover:bg-[#10151C] sm:flex-row sm:items-center sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#5BC5A7]/30 bg-[#5BC5A7]/10 font-bold text-[#5BC5A7]">
                    {action.counterpartyName.slice(0, 1).toUpperCase()}
                    <span className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-[#10151C] ${isConfirm ? "bg-[#5BC5A7] text-black" : "bg-orange-400 text-black"}`}>
                      <Clock className="h-2.5 w-2.5" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-white">
                      {action.counterpartyName}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="font-mono text-sm font-bold text-white">₹{action.amount.toLocaleString("en-IN")}</span>
                  <Link
                    href={settleUrl}
                    className={`inline-flex min-h-[42px] items-center justify-center rounded-md border px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                      isConfirm
                        ? "border-[#5BC5A7] bg-[#5BC5A7] text-black hover:bg-[#79D9BD]"
                        : "border-[#5BC5A7]/70 bg-transparent text-[#5BC5A7] hover:bg-[#5BC5A7]/10"
                    }`}
                  >
                    {isConfirm ? "Confirm" : "Settle"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
