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
                className="p-4.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FFF8F8]/60 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isConfirm
                        ? "bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]"
                        : "bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1C1917] font-display">
                      {action.description}
                    </p>
                    <p className="text-xs text-[#57534E] font-medium mt-0.5">
                      Amount: ₹{action.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="flex sm:self-center">
                  <Link
                    href={settleUrl}
                    className={`w-full sm:w-auto inline-flex items-center justify-center min-h-[42px] px-5 py-2 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-sm ${
                      isConfirm
                        ? "bg-[#0F766E] hover:bg-[#0d655e] text-white"
                        : "bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:shadow-lg hover:shadow-[#E11D48]/25 text-white active:scale-95"
                    }`}
                  >
                    {isConfirm ? "Confirm" : "Pay"}
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
