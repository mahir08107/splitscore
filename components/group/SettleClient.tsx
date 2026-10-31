"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SettleUpData,
  SuggestedPayment,
  SettlementRecord,
  markAsPaidAction,
  updateSettlementStatusAction,
} from "@/lib/data/settlements";
import { formatRupees } from "@/lib/data/dashboard";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  Check,
  X,
  Sparkles,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface SettleClientProps {
  initialData: SettleUpData;
  preselectedSettlementId?: string;
  preselectedFrom?: string;
  preselectedTo?: string;
  preselectedAmount?: number;
}

export function SettleClient({
  initialData,
  preselectedSettlementId,
  preselectedFrom,
  preselectedTo,
  preselectedAmount,
}: SettleClientProps) {
  const router = useRouter();
  const [data, setData] = useState<SettleUpData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { groupId, groupName, currentUserId, suggestedPayments, activeSettlements } = data;

  // Filter settlements into pending confirmation (marked_paid), confirmed, and disputed
  const markedPaidSettlements = activeSettlements.filter(
    (s) => s.status === "marked_paid"
  );
  const otherSettlements = activeSettlements.filter(
    (s) => s.status === "confirmed" || s.status === "disputed"
  );

  // Helper to generate UPI deep link
  const getUpiDeepLink = (payeeName: string, amount: number) => {
    // Standard UPI scheme: upi://pay?pa=...&pn=...&am=...&cu=INR
    // Uses fallback demo VPA format
    const cleanPayee = encodeURIComponent(payeeName.replace(/\s+/g, ""));
    const vpa = `${cleanPayee.toLowerCase()}@upi`;
    return `upi://pay?pa=${vpa}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`SplitScore settlement for ${groupName}`)}`;
  };

  // Payer marks payment as paid
  const handleMarkAsPaid = (payment: SuggestedPayment, existingSettlementId?: string) => {
    setFeedbackMessage(null);
    const actionKey = existingSettlementId || `${payment.fromUserId}-${payment.toUserId}`;
    setActiveActionId(actionKey);

    startTransition(async () => {
      try {
        const result = await markAsPaidAction({
          groupId,
          fromUser: payment.fromUserId,
          toUser: payment.toUserId,
          amount: payment.amount,
          settlementId: existingSettlementId,
        });

        if (result.success) {
          setFeedbackMessage({
            type: "success",
            text: `Marked ₹${payment.amount} as paid to ${payment.toName}. Awaiting their confirmation.`,
          });
          // Update local state optimistically
          setData((prev) => ({
            ...prev,
            activeSettlements: [
              ...prev.activeSettlements.filter((s) => s.id !== existingSettlementId),
              {
                id: result.settlementId || existingSettlementId || "temp-" + Date.now(),
                group_id: groupId,
                from_user: payment.fromUserId,
                to_user: payment.toUserId,
                amount: payment.amount,
                status: "marked_paid",
                marked_paid_at: new Date().toISOString(),
                fromName: payment.fromName,
                toName: payment.toName,
              },
            ],
          }));
          router.refresh();
        } else {
          setFeedbackMessage({
            type: "error",
            text: result.error || "Failed to update settlement status.",
          });
        }
      } catch (err: any) {
        setFeedbackMessage({
          type: "error",
          text: err?.message || "An unexpected error occurred.",
        });
      } finally {
        setActiveActionId(null);
      }
    });
  };

  // Receiver confirms or disputes
  const handleUpdateStatus = (
    settlement: SettlementRecord,
    status: "confirmed" | "disputed"
  ) => {
    setFeedbackMessage(null);
    setActiveActionId(settlement.id);

    startTransition(async () => {
      try {
        const result = await updateSettlementStatusAction({
          settlementId: settlement.id,
          groupId,
          status,
          payerId: settlement.from_user,
          amount: settlement.amount,
        });

        if (result.success) {
          setFeedbackMessage({
            type: "success",
            text:
              status === "confirmed"
                ? `Confirmed receipt of ₹${settlement.amount} from ${settlement.fromName}! Trust score updated.`
                : `Payment from ${settlement.fromName} marked as disputed.`,
          });

          setData((prev) => ({
            ...prev,
            activeSettlements: prev.activeSettlements.map((s) =>
              s.id === settlement.id
                ? {
                    ...s,
                    status,
                    confirmed_at: status === "confirmed" ? new Date().toISOString() : s.confirmed_at,
                  }
                : s
            ),
          }));
          router.refresh();
        } else {
          setFeedbackMessage({
            type: "error",
            text: result.error || "Failed to update settlement.",
          });
        }
      } catch (err: any) {
        setFeedbackMessage({
          type: "error",
          text: err?.message || "An unexpected error occurred.",
        });
      } finally {
        setActiveActionId(null);
      }
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header with back link */}
      <div className="flex items-center justify-between pb-4 border-b border-[rgba(225,29,72,0.09)]">
        <Link
          href={`/group/${groupId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E11D48] hover:text-[#BE123C] transition-colors min-h-[44px] px-2 -ml-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Group</span>
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E] bg-[#CCFBF1] px-2.5 py-1 rounded-full">
          {groupName}
        </span>
      </div>

      {/* Feedback banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium border ${
            feedbackMessage.type === "success"
              ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]"
              : "bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <p className="flex-1">{feedbackMessage.text}</p>
        </div>
      )}

      {/* 2. SECTION: Awaiting Receiver Confirmation (marked_paid) */}
      {markedPaidSettlements.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#FDE68A] p-5 sm:p-6 shadow-sm bg-[#FFFDF5] space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1C1917]">
                Awaiting Mutual Confirmation ({markedPaidSettlements.length})
              </h2>
              <p className="text-xs text-[#57534E]">
                Payments already marked as paid. Only confirmed payments change trust scores and balances.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#FDE68A]/60 space-y-2">
            {markedPaidSettlements.map((s) => {
              const isReceiver = s.to_user === currentUserId;
              const isPayer = s.from_user === currentUserId;
              const isHighlighted = s.id === preselectedSettlementId;
              const isBusy = activeActionId === s.id && isPending;

              return (
                <div
                  key={s.id}
                  className={`pt-3 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isHighlighted ? "bg-[#FEF3C7]/40 -mx-3 px-3 rounded-xl" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#1C1917]">
                        {isPayer ? "You" : s.fromName}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#57534E]" />
                      <span className="font-bold text-sm text-[#1C1917]">
                        {isReceiver ? "You" : s.toName}
                      </span>
                      <span className="font-extrabold text-sm text-[#0F766E] bg-white px-2 py-0.5 rounded border border-[rgba(225,29,72,0.09)]">
                        {formatRupees(s.amount)}
                      </span>
                    </div>
                    <p className="text-xs text-[#57534E] mt-1">
                      Status: <span className="font-semibold text-[#B45309]">Marked as paid</span>
                    </p>
                  </div>

                  {/* Receiver Action Buttons */}
                  {isReceiver ? (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUpdateStatus(s, "disputed")}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#FECACA] bg-white hover:bg-[#FEF2F2] text-[#B91C1C] font-semibold text-xs uppercase tracking-wide transition-colors flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Dispute</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUpdateStatus(s, "confirmed")}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d655e] text-white font-bold text-xs uppercase tracking-wide transition-all shadow-sm flex items-center gap-1.5"
                      >
                        {isBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Confirm Received</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-[#B45309] font-medium bg-[#FEF3C7] px-3 py-1.5 rounded-lg self-start sm:self-auto">
                      {isPayer ? "Waiting for receiver to confirm" : "Pending confirmation"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SECTION: Suggested Settlements (Debt Simplification) */}
      <div className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1C1917]">
                Suggested Direct Payments
              </h2>
              <p className="text-xs text-[#57534E]">
                Debt simplification algorithm: eliminates middlemen to minimize total transactions.
              </p>
            </div>
          </div>
        </div>

        {suggestedPayments.length === 0 ? (
          <div className="text-center py-8 px-4 bg-[#FCFBF7] rounded-xl border border-[rgba(225,29,72,0.09)]">
            <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#1C1917]">All balances are settled</h3>
            <p className="text-xs text-[#57534E] mt-0.5">
              No one in this group currently owes money.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestedPayments.map((p, idx) => {
              const isCurrentUserPayer = p.fromUserId === currentUserId;
              const isCurrentUserReceiver = p.toUserId === currentUserId;
              const isBusy = activeActionId === `${p.fromUserId}-${p.toUserId}` && isPending;

              // Check if already marked as paid
              const existingMarkedPaid = markedPaidSettlements.find(
                (s) => s.from_user === p.fromUserId && s.to_user === p.toUserId
              );

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrentUserPayer
                      ? "bg-[#FEF2F2]/60 border-[#FECACA]"
                      : isCurrentUserReceiver
                      ? "bg-[#F0FDF4]/60 border-[#BBF7D0]"
                      : "bg-white border-[rgba(225,29,72,0.09)]"
                  }`}
                >
                  {/* Payer -> Receiver Info */}
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-sm text-[#1C1917]">
                        {isCurrentUserPayer ? "You" : p.fromName}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#57534E]" />
                      <span className="font-bold text-sm text-[#1C1917]">
                        {isCurrentUserReceiver ? "You" : p.toName}
                      </span>
                      <span className="font-extrabold text-base text-[#1C1917] bg-white px-2.5 py-0.5 rounded-md border border-[rgba(225,29,72,0.09)]">
                        {formatRupees(p.amount)}
                      </span>
                    </div>

                    <p className="text-xs text-[#57534E] mt-1">
                      {isCurrentUserPayer
                        ? "You owe this amount."
                        : isCurrentUserReceiver
                        ? "You are owed this amount."
                        : `${p.fromName} owes ${p.toName}.`}
                    </p>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                    {isCurrentUserPayer ? (
                      <>
                        {/* 1. Pay via UPI Button */}
                        <a
                          href={getUpiDeepLink(p.toName, p.amount)}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d655e] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Pay via UPI</span>
                        </a>

                        {/* 2. I Paid Button */}
                        <button
                          type="button"
                          disabled={isBusy || Boolean(existingMarkedPaid)}
                          onClick={() => handleMarkAsPaid(p, existingMarkedPaid?.id)}
                          className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 ${
                            existingMarkedPaid
                              ? "bg-[#FCFBF7] text-[#7E7E94] cursor-not-allowed border border-[#D1D1DF]"
                              : "bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:shadow-lg hover:shadow-[#E11D48]/25 active:scale-95 text-white"
                          }`}
                        >
                          {isBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {existingMarkedPaid ? "Marked as Paid" : "I Paid"}
                          </span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-[#57534E] bg-[#FCFBF7] px-3 py-2 rounded-xl">
                        {isCurrentUserReceiver ? "Waiting for payment" : "Direct settlement"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. SECTION: Past Settlements History */}
      {otherSettlements.length > 0 && (
        <div className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-5 sm:p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[#1C1917] uppercase tracking-wider text-[#57534E]">
            Recent Settlement Activity
          </h2>
          <div className="divide-y divide-[#FFF1F2]">
            {otherSettlements.map((s) => {
              const isConfirmed = s.status === "confirmed";
              return (
                <div
                  key={s.id}
                  className="py-2.5 flex items-center justify-between text-xs sm:text-sm text-[#1C1917]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{s.fromName}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#57534E]" />
                    <span className="font-semibold">{s.toName}</span>
                    <span className="font-bold text-[#0F766E]">
                      {formatRupees(s.amount)}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isConfirmed
                        ? "bg-[#DCFCE7] text-[#15803D]"
                        : "bg-[#FEE2E2] text-[#B91C1C]"
                    }`}
                  >
                    {isConfirmed ? "Confirmed" : "Disputed"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
