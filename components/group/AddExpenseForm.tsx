"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserSummary } from "@/lib/group/types";
import { SplitMode, createExpenseAction } from "@/lib/data/expenses";
import { roundToTwo } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Tag,
  User,
  Users,
  Check,
  Percent,
  Divide,
  Hash,
  AlertCircle,
  Loader2,
  ReceiptIndianRupee,
} from "lucide-react";

interface AddExpenseFormProps {
  groupId: string;
  groupName: string;
  members: UserSummary[];
  defaultPayerId: string;
}

const CATEGORIES = ["Travel", "Food", "Stay", "Entertainment", "Other"];

export function AddExpenseForm({
  groupId,
  groupName,
  members,
  defaultPayerId,
}: AddExpenseFormProps) {
  const router = useRouter();

  // Basic Form State
  const [title, setTitle] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [paidBy, setPaidBy] = useState(
    members.some((m) => m.id === defaultPayerId)
      ? defaultPayerId
      : members[0]?.id || ""
  );
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("Food");

  // Member inclusion (default all selected)
  const [includedUserIds, setIncludedUserIds] = useState<Set<string>>(
    () => new Set(members.map((m) => m.id))
  );

  // Split mode: equal | exact | percentage | shares
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");

  // Mode specific inputs:
  // Exact: map of userId -> amount string
  const [exactInputs, setExactInputs] = useState<Record<string, string>>({});
  // Percentage: map of userId -> percentage string
  const [percentInputs, setPercentInputs] = useState<Record<string, string>>({});
  // Shares: map of userId -> shares string (default 1)
  const [sharesInputs, setSharesInputs] = useState<Record<string, string>>({});

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse numerical total amount
  const totalAmount = useMemo(() => {
    const val = parseFloat(amountStr);
    return isNaN(val) || val < 0 ? 0 : roundToTwo(val);
  }, [amountStr]);

  // Selected members list
  const selectedMembers = useMemo(() => {
    return members.filter((m) => includedUserIds.has(m.id));
  }, [members, includedUserIds]);

  // Toggle member inclusion
  const toggleMember = (userId: string) => {
    setIncludedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        if (next.size <= 1) {
          // Keep at least one member
          return prev;
        }
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (includedUserIds.size === members.length) {
      // Keep only current payer or first member
      setIncludedUserIds(new Set([paidBy || members[0]?.id]));
    } else {
      setIncludedUserIds(new Set(members.map((m) => m.id)));
    }
  };

  // Pre-populate split mode inputs when mode or selected members change
  useEffect(() => {
    if (splitMode === "shares") {
      setSharesInputs((prev) => {
        const next = { ...prev };
        selectedMembers.forEach((m) => {
          if (!next[m.id]) next[m.id] = "1";
        });
        return next;
      });
    } else if (splitMode === "percentage") {
      setPercentInputs((prev) => {
        const next = { ...prev };
        // Evenly divide initial % if empty
        if (selectedMembers.length > 0) {
          const even = roundToTwo(100 / selectedMembers.length);
          selectedMembers.forEach((m) => {
            if (next[m.id] === undefined) {
              next[m.id] = even.toString();
            }
          });
        }
        return next;
      });
    } else if (splitMode === "exact") {
      setExactInputs((prev) => {
        const next = { ...prev };
        if (selectedMembers.length > 0 && totalAmount > 0) {
          const even = roundToTwo(totalAmount / selectedMembers.length);
          selectedMembers.forEach((m) => {
            if (next[m.id] === undefined) {
              next[m.id] = even.toString();
            }
          });
        }
        return next;
      });
    }
  }, [splitMode, selectedMembers.length, totalAmount]);

  // Calculation & Validation based on active split mode
  const calculation = useMemo(() => {
    const count = selectedMembers.length;
    if (count === 0 || totalAmount <= 0) {
      return {
        splits: [],
        remaining: 0,
        isValid: false,
        validationError: "Enter an amount and select at least one member.",
      };
    }

    if (splitMode === "equal") {
      // Evenly divide with 2 decimal precision
      const baseShare = Math.floor((totalAmount / count) * 100) / 100;
      let remainder = roundToTwo(totalAmount - baseShare * count);

      const splits = selectedMembers.map((m, idx) => {
        // Distribute remainder cents to first member(s)
        const addCent = idx < Math.round(remainder * 100) ? 0.01 : 0;
        const share = roundToTwo(baseShare + addCent);
        return {
          userId: m.id,
          shareAmount: share,
          displayValue: `₹${share.toFixed(2)}`,
        };
      });

      return {
        splits,
        remaining: 0,
        isValid: true,
        validationError: null,
      };
    }

    if (splitMode === "exact") {
      let sum = 0;
      const splits = selectedMembers.map((m) => {
        const raw = parseFloat(exactInputs[m.id] || "0");
        const share = isNaN(raw) || raw < 0 ? 0 : roundToTwo(raw);
        sum = roundToTwo(sum + share);
        return {
          userId: m.id,
          shareAmount: share,
          displayValue: `₹${share.toFixed(2)}`,
        };
      });

      const remaining = roundToTwo(totalAmount - sum);
      const isValid = Math.abs(remaining) < 0.01;
      const validationError = isValid
        ? null
        : remaining > 0
        ? `₹${remaining.toFixed(2)} remaining to assign`
        : `₹${Math.abs(remaining).toFixed(2)} over allocated`;

      return {
        splits,
        remaining,
        isValid,
        validationError,
      };
    }

    if (splitMode === "percentage") {
      let totalPercent = 0;
      const parsedPercents: Record<string, number> = {};

      selectedMembers.forEach((m) => {
        const raw = parseFloat(percentInputs[m.id] || "0");
        const p = isNaN(raw) || raw < 0 ? 0 : raw;
        parsedPercents[m.id] = p;
        totalPercent = roundToTwo(totalPercent + p);
      });

      const percentDiff = roundToTwo(100 - totalPercent);
      const isValid = Math.abs(percentDiff) < 0.05;

      const splits = selectedMembers.map((m) => {
        const pct = parsedPercents[m.id] || 0;
        const share = roundToTwo((totalAmount * pct) / 100);
        return {
          userId: m.id,
          shareAmount: share,
          displayValue: `₹${share.toFixed(2)} (${pct}%)`,
        };
      });

      const validationError = isValid
        ? null
        : percentDiff > 0
        ? `Total is ${totalPercent.toFixed(1)}%. Add ${percentDiff.toFixed(1)}% more.`
        : `Total is ${totalPercent.toFixed(1)}%. Reduce by ${Math.abs(percentDiff).toFixed(1)}%.`;

      return {
        splits,
        remaining: percentDiff,
        isValid,
        validationError,
      };
    }

    if (splitMode === "shares") {
      let totalShares = 0;
      const parsedShares: Record<string, number> = {};

      selectedMembers.forEach((m) => {
        const raw = parseInt(sharesInputs[m.id] || "0", 10);
        const s = isNaN(raw) || raw < 0 ? 0 : raw;
        parsedShares[m.id] = s;
        totalShares += s;
      });

      if (totalShares <= 0) {
        return {
          splits: [],
          remaining: 0,
          isValid: false,
          validationError: "At least one member must have 1 or more shares.",
        };
      }

      // Calculate shares with clean rupee amounts
      let allocated = 0;
      const splits = selectedMembers.map((m, idx) => {
        const s = parsedShares[m.id] || 0;
        if (idx === selectedMembers.length - 1) {
          // Last person absorbs rounding difference
          const share = roundToTwo(totalAmount - allocated);
          return {
            userId: m.id,
            shareAmount: share,
            displayValue: `₹${share.toFixed(2)} (${s}/${totalShares} shares)`,
          };
        }
        const share = roundToTwo((totalAmount * s) / totalShares);
        allocated = roundToTwo(allocated + share);
        return {
          userId: m.id,
          shareAmount: share,
          displayValue: `₹${share.toFixed(2)} (${s}/${totalShares} shares)`,
        };
      });

      return {
        splits,
        remaining: 0,
        isValid: true,
        validationError: null,
      };
    }

    return {
      splits: [],
      remaining: 0,
      isValid: false,
      validationError: "Select a valid split mode.",
    };
  }, [selectedMembers, totalAmount, splitMode, exactInputs, percentInputs, sharesInputs]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Please enter an expense title.");
      return;
    }

    if (totalAmount <= 0) {
      setErrorMessage("Please enter a valid total amount.");
      return;
    }

    if (selectedMembers.length === 0) {
      setErrorMessage("Please select at least one member to split the expense.");
      return;
    }

    if (!calculation.isValid) {
      setErrorMessage(calculation.validationError || "The split math does not balance.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createExpenseAction({
        groupId,
        title: title.trim(),
        amount: totalAmount,
        paidBy,
        date,
        category,
        splitType: splitMode,
        splits: calculation.splits.map((s) => ({
          userId: s.userId,
          shareAmount: s.shareAmount,
        })),
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to record expense. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Success -> Navigate back to the group page
      router.push(`/group/${groupId}`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred while saving the expense.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* 1. Header with Cancel link and Group Context */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E5EF]">
        <Link
          href={`/group/${groupId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4338CA] hover:text-[#2E2A7A] transition-colors min-h-[44px] px-2 -ml-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E] bg-[#CCFBF1] px-2.5 py-1 rounded-full">
          {groupName}
        </span>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3 text-sm text-[#B91C1C]">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="flex-1 font-medium">{errorMessage}</p>
        </div>
      )}

      {/* 2. Basic Details Card */}
      <div className="bg-white rounded-2xl border border-[#E5E5EF] p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[#1F1D3D] flex items-center gap-2">
          <ReceiptIndianRupee className="w-4 h-4 text-[#2E2A7A]" />
          <span>Expense Details</span>
        </h2>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5B5B72] mb-1.5">
            Expense Title <span className="text-[#B91C1C]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Airport cab, Dinner, Groceries"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D1D1DF] text-[#1F1D3D] text-sm focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent transition-all placeholder:text-[#9E9EAF]"
          />
        </div>

        {/* Amount & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5B5B72] mb-1.5">
              Total Amount (₹) <span className="text-[#B91C1C]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5B5B72]">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full min-h-[44px] pl-8 pr-3.5 py-2.5 rounded-xl border border-[#D1D1DF] text-[#1F1D3D] font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent transition-all placeholder:text-[#9E9EAF]"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5B5B72] mb-1.5">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D1D1DF] text-[#1F1D3D] text-sm focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Paid By & Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Paid By */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5B5B72] mb-1.5">
              Paid By
            </label>
            <div className="relative">
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D1D1DF] bg-white text-[#1F1D3D] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.id === defaultPayerId ? "(You)" : ""}
                  </option>
                ))}
              </select>
              <User className="w-4 h-4 text-[#5B5B72] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5B5B72] mb-1.5">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D1D1DF] bg-white text-[#1F1D3D] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Tag className="w-4 h-4 text-[#5B5B72] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Member Selection */}
      <div className="bg-white rounded-2xl border border-[#E5E5EF] p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1F1D3D] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2E2A7A]" />
              <span>Split Between</span>
            </h2>
            <p className="text-xs text-[#5B5B72]">
              Select which group members share this expense
            </p>
          </div>
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-xs font-semibold text-[#4338CA] hover:text-[#2E2A7A] min-h-[44px] px-2 py-1"
          >
            {includedUserIds.size === members.length ? "Deselect all" : "Select all"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {members.map((member) => {
            const isIncluded = includedUserIds.has(member.id);
            return (
              <label
                key={member.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all min-h-[44px] ${
                  isIncluded
                    ? "bg-[#F1F1FA] border-[#4338CA] text-[#1F1D3D]"
                    : "bg-white border-[#E5E5EF] text-[#5B5B72] opacity-70 hover:opacity-100"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                    isIncluded
                      ? "bg-[#4338CA] text-white"
                      : "border border-[#D1D1DF] bg-white"
                  }`}
                >
                  {isIncluded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <input
                  type="checkbox"
                  checked={isIncluded}
                  onChange={() => toggleMember(member.id)}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#2E2A7A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold truncate">
                    {member.name} {member.id === defaultPayerId ? "(You)" : ""}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Split Mode Selector */}
      <div className="bg-white rounded-2xl border border-[#E5E5EF] p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#1F1D3D] flex items-center gap-2">
            <Divide className="w-4 h-4 text-[#2E2A7A]" />
            <span>Split Mode</span>
          </h2>
          <p className="text-xs text-[#5B5B72]">
            Choose how to divide the ₹{totalAmount.toFixed(2)} cost
          </p>
        </div>

        {/* 4 Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              { id: "equal", label: "Equal", icon: Divide },
              { id: "exact", label: "Exact", icon: ReceiptIndianRupee },
              { id: "percentage", label: "Percentage", icon: Percent },
              { id: "shares", label: "Shares", icon: Hash },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = splitMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSplitMode(tab.id)}
                className={`min-h-[44px] px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isActive
                    ? "bg-[#2E2A7A] text-white shadow-sm"
                    : "bg-[#F1F1FA] text-[#5B5B72] hover:bg-[#E5E5EF] hover:text-[#1F1D3D]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 5. Dynamic Split Inputs Area */}
        <div className="pt-2 border-t border-[#F1F1FA] space-y-3">
          {/* EQUAL MODE UI */}
          {splitMode === "equal" && (
            <div className="space-y-2">
              <p className="text-xs text-[#5B5B72]">
                Split equally among {selectedMembers.length} member
                {selectedMembers.length > 1 ? "s" : ""}:
              </p>
              <div className="divide-y divide-[#F1F1FA] border border-[#E5E5EF] rounded-xl overflow-hidden bg-white">
                {selectedMembers.map((m) => {
                  const share =
                    totalAmount > 0 && selectedMembers.length > 0
                      ? (totalAmount / selectedMembers.length).toFixed(2)
                      : "0.00";
                  return (
                    <div
                      key={m.id}
                      className="p-3 flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#E5E5EF] text-[#2E2A7A] flex items-center justify-center text-xs font-bold">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#1F1D3D]">
                          {m.name}
                        </span>
                      </div>
                      <span className="font-bold text-[#0F766E]">
                        ₹{share}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EXACT MODE UI */}
          {splitMode === "exact" && (
            <div className="space-y-2">
              <p className="text-xs text-[#5B5B72]">
                Enter exact rupees for each member. Total must equal ₹{totalAmount.toFixed(2)}.
              </p>
              <div className="space-y-2">
                {selectedMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-[#E5E5EF] bg-white"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#E5E5EF] text-[#2E2A7A] flex items-center justify-center text-xs font-bold shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm text-[#1F1D3D] truncate">
                        {m.name}
                      </span>
                    </div>
                    <div className="relative w-36 shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5B5B72]">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={exactInputs[m.id] ?? ""}
                        onChange={(e) =>
                          setExactInputs((prev) => ({
                            ...prev,
                            [m.id]: e.target.value,
                          }))
                        }
                        className="w-full min-h-[44px] pl-7 pr-3 py-2 text-right rounded-lg border border-[#D1D1DF] text-sm font-bold text-[#1F1D3D] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Status counter */}
              <div
                className={`p-3 rounded-xl flex items-center justify-between text-xs font-semibold ${
                  calculation.isValid
                    ? "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]"
                    : "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"
                }`}
              >
                <span>
                  {calculation.isValid
                    ? "Exact amounts balance perfectly"
                    : calculation.validationError}
                </span>
                <span className="font-bold">
                  Remaining: ₹{calculation.remaining.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* PERCENTAGE MODE UI */}
          {splitMode === "percentage" && (
            <div className="space-y-2">
              <p className="text-xs text-[#5B5B72]">
                Assign percentages. Must sum up to exactly 100%.
              </p>
              <div className="space-y-2">
                {selectedMembers.map((m) => {
                  const pct = parseFloat(percentInputs[m.id] || "0");
                  const rupees =
                    totalAmount > 0 && !isNaN(pct)
                      ? ((totalAmount * pct) / 100).toFixed(2)
                      : "0.00";

                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-[#E5E5EF] bg-white"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#1F1D3D] truncate">
                            {m.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#0F766E]">
                          ₹{rupees}
                        </span>
                      </div>
                      <div className="relative w-28 shrink-0">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={percentInputs[m.id] ?? ""}
                          onChange={(e) =>
                            setPercentInputs((prev) => ({
                              ...prev,
                              [m.id]: e.target.value,
                            }))
                          }
                          className="w-full min-h-[44px] pl-3 pr-7 py-2 text-right rounded-lg border border-[#D1D1DF] text-sm font-bold text-[#1F1D3D] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5B5B72]">
                          %
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status counter */}
              <div
                className={`p-3 rounded-xl flex items-center justify-between text-xs font-semibold ${
                  calculation.isValid
                    ? "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]"
                    : "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"
                }`}
              >
                <span>
                  {calculation.isValid
                    ? "Total equals 100%"
                    : calculation.validationError}
                </span>
                <span className="font-bold">
                  {calculation.isValid
                    ? "100%"
                    : `${(100 - calculation.remaining).toFixed(1)}%`}
                </span>
              </div>
            </div>
          )}

          {/* SHARES MODE UI */}
          {splitMode === "shares" && (
            <div className="space-y-2">
              <p className="text-xs text-[#5B5B72]">
                Assign share weights (e.g. 1 share, 2 shares for someone who invited a guest).
              </p>
              <div className="space-y-2">
                {selectedMembers.map((m) => {
                  const s = parseInt(sharesInputs[m.id] || "1", 10);
                  const totalShares = Object.values(sharesInputs).reduce(
                    (acc, curr) => acc + (parseInt(curr || "0", 10) || 0),
                    0
                  );
                  const rupees =
                    totalShares > 0 && totalAmount > 0
                      ? ((totalAmount * s) / totalShares).toFixed(2)
                      : "0.00";

                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-[#E5E5EF] bg-white"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-[#1F1D3D] truncate block">
                          {m.name}
                        </span>
                        <span className="text-xs font-bold text-[#0F766E]">
                          ₹{rupees}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="1"
                          value={sharesInputs[m.id] ?? "1"}
                          onChange={(e) =>
                            setSharesInputs((prev) => ({
                              ...prev,
                              [m.id]: e.target.value,
                            }))
                          }
                          className="w-24 min-h-[44px] px-3 py-2 text-center rounded-lg border border-[#D1D1DF] text-sm font-bold text-[#1F1D3D] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                        />
                        <span className="text-xs font-semibold text-[#5B5B72]">
                          share{s !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status counter */}
              <div className="p-3 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-between text-xs text-[#0F766E] font-semibold">
                <span>Auto-calculated across all member share weights</span>
                <span className="font-bold">Total: ₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. Sticky Bottom / Submit Action */}
      <div className="sticky bottom-4 z-20 pt-2">
        <button
          type="submit"
          disabled={!calculation.isValid || isSubmitting || totalAmount <= 0}
          className={`w-full min-h-[48px] rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
            !calculation.isValid || isSubmitting || totalAmount <= 0
              ? "bg-[#D1D1DF] text-[#7E7E94] cursor-not-allowed shadow-none"
              : "bg-[#2E2A7A] hover:bg-[#252263] text-white active:scale-[0.99]"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving expense...</span>
            </>
          ) : (
            <span>Save Expense</span>
          )}
        </button>
      </div>
    </form>
  );
}
