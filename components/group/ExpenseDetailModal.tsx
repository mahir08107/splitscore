"use client";

import React, { useEffect } from "react";
import { ExpenseModel } from "@/lib/group/types";
import { formatRupees } from "@/lib/data/dashboard";
import { X, Calendar, Tag, User, Receipt } from "lucide-react";

interface ExpenseDetailModalProps {
  expense: ExpenseModel | null;
  onClose: () => void;
}

export function ExpenseDetailModal({ expense, onClose }: ExpenseDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (expense) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [expense, onClose]);

  if (!expense) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl border border-[#E5E5F0] shadow-xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#5B5B72] hover:text-[#1F1D3D] hover:bg-[#F1F1FA] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4338CA] flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4338CA]">
              Expense Breakdown
            </span>
            <h2 id="expense-detail-title" className="text-xl font-bold text-[#1F1D3D]">
              {expense.title}
            </h2>
          </div>
        </div>

        {/* Total Amount Card */}
        <div className="bg-[#F8F9FD] rounded-xl p-4 border border-[#E5E5F0] mb-5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase font-semibold text-[#5B5B72]">Total Bill</span>
            <span className="text-2xl font-extrabold text-[#1F1D3D]">
              {formatRupees(expense.amount)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#E5E5F0] text-xs text-[#5B5B72]">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#4338CA]" />
              <span>Paid by: <strong className="text-[#1F1D3D]">{expense.payerName || "Member"}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#4338CA]" />
              <span>{expense.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#4338CA]" />
              <span>Category: <strong className="text-[#1F1D3D]">{expense.category}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Split: <strong className="capitalize text-[#1F1D3D]">{expense.split_type}</strong></span>
            </div>
          </div>
        </div>

        {/* Individual Member Shares */}
        <div>
          <h3 className="text-xs uppercase tracking-wider font-bold text-[#5B5B72] mb-3">
            Member Shares ({expense.splits.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {expense.splits.map((split, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-[#E5E5F0] bg-white text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#2E2A7A] text-white text-xs font-semibold flex items-center justify-center">
                    {(split.userName || "M").charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-[#1F1D3D]">
                    {split.userName || `Member (${split.user_id.slice(0, 6)})`}
                  </span>
                </div>
                <span className="font-semibold text-[#1F1D3D]">
                  {formatRupees(split.share_amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-[#E5E5F0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-lg bg-[#F1F1FA] hover:bg-[#E5E5F5] text-[#1F1D3D] font-semibold text-xs uppercase tracking-wide transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

