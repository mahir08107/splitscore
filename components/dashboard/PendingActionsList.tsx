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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-[#1F1D3D] flex items-center gap-2">
          <span>Pending Actions</span>
          {actions.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F1FA] text-[#2E2A7A] font-semibold">
              {actions.length}
            </span>
          )}
        </h2>
      </div>

      {actions.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5F0] p-6 text-center shadow-sm">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#15803D] mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-[#1F1D3D]">
            Nothing pending
          </p>
          <p className="text-xs text-[#5B5B72] mt-0.5">
            You are fully caught up on payments and confirmations.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5F0] shadow-sm divide-y divide-[#E5E5F0] overflow-hidden">
          {actions.map((action) => {
            const isConfirm = action.type === "confirm_payment";
            const settleUrl = `/group/${action.groupId}/settle?settlement=${action.settlementId}`;

            return (
              <div
                key={action.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9F9FD] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isConfirm
                        ? "bg-[#CCFBF1] text-[#0F766E]"
                        : "bg-[#FEE2E2] text-[#B91C1C]"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1F1D3D]">
                      {action.description}
                    </p>
                    <p className="text-xs text-[#5B5B72]">
                      Amount: ₹{action.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="flex sm:self-center">
                  <Link
                    href={settleUrl}
                    className={`w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-5 py-2 rounded-lg font-semibold text-xs tracking-wide uppercase transition-all shadow-sm ${
                      isConfirm
                        ? "bg-[#0F766E] hover:bg-[#0d655e] text-white"
                        : "bg-[#2E2A7A] hover:bg-[#252263] text-white"
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
