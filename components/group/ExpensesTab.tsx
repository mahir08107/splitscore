"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ExpenseModel } from "@/lib/group/types";
import { formatRupees } from "@/lib/data/dashboard";
import { ExpenseDetailModal } from "./ExpenseDetailModal";
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Receipt,
  UserPlus,
  Coffee,
  Plane,
  Home,
  ShoppingBag,
  Sparkles,
  Camera,
} from "lucide-react";

interface ExpensesTabProps {
  groupId: string;
  expenses: ExpenseModel[];
  currentUserId: string;
  onOpenInvite: () => void;
}

// Category icon helper
function getCategoryIcon(cat: string) {
  const lower = cat.toLowerCase();
  if (lower.includes("food") || lower.includes("dinner") || lower.includes("meal")) return Coffee;
  if (lower.includes("travel") || lower.includes("flight") || lower.includes("transport")) return Plane;
  if (lower.includes("hotel") || lower.includes("stay") || lower.includes("rent")) return Home;
  if (lower.includes("shopping") || lower.includes("grocer")) return ShoppingBag;
  return Sparkles;
}

export function ExpensesTab({
  groupId,
  expenses,
  currentUserId,
  onOpenInvite,
}: ExpensesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedExpense, setSelectedExpense] = useState<ExpenseModel | null>(null);

  // Available categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [expenses]);

  // Filtered & sorted expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        const matchesSearch =
          e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.payerName && e.payerName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory =
          selectedCategory === "all" ||
          e.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [expenses, searchTerm, selectedCategory, sortOrder]);

  return (
    <section>
      {/* Heading & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1F1D3D]">Group Expenses</h2>
          <p className="text-xs sm:text-sm text-[#5B5B72] mt-0.5">
            All expenses recorded in this group.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href={`/receipt/new?group_id=${groupId}`}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-md border border-[#5BC5A7]/50 bg-transparent hover:bg-[#5BC5A7]/10 text-[#5BC5A7] font-semibold text-xs uppercase tracking-wide transition-all shadow-sm active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Bill</span>
          </Link>
          <Link
            href={`/group/${groupId}/add-expense`}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-md bg-[#5BC5A7] hover:bg-[#79D9BD] text-black font-bold text-xs uppercase tracking-wide transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#5B5B72] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or payer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 min-h-[44px] rounded-lg border border-[#E5E5F0] bg-white text-xs sm:text-sm text-[#1F1D3D] placeholder:text-[#5B5B72] focus:outline-none focus:border-[#4338CA] focus:ring-1 focus:ring-[#4338CA]"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-[#5B5B72] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-8 min-h-[44px] rounded-lg border border-[#E5E5F0] bg-white text-xs sm:text-sm text-[#1F1D3D] appearance-none focus:outline-none focus:border-[#4338CA] focus:ring-1 focus:ring-[#4338CA]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="relative">
          <ArrowUpDown className="w-4 h-4 text-[#5B5B72] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            className="w-full pl-10 pr-8 min-h-[44px] rounded-lg border border-[#E5E5F0] bg-white text-xs sm:text-sm text-[#1F1D3D] appearance-none focus:outline-none focus:border-[#4338CA] focus:ring-1 focus:ring-[#4338CA]"
          >
            <option value="newest">Sort by Date: Newest First</option>
            <option value="oldest">Sort by Date: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Expense List / Rows */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5F0] p-10 text-center shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F1F1FA] flex items-center justify-center text-[#2E2A7A] mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1F1D3D]">No expenses found</h3>
          <p className="text-xs text-[#5B5B72] max-w-sm mx-auto mt-1 mb-6">
            {expenses.length === 0
              ? "No expenses have been recorded in this group yet. Add your first shared bill to get started."
              : "No expenses match your search or filter criteria."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/group/${groupId}/add-expense`}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-5 py-2 rounded-lg bg-[#2E2A7A] hover:bg-[#252263] text-white font-semibold text-xs uppercase tracking-wide transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add first expense</span>
            </Link>
            <button
              type="button"
              onClick={onOpenInvite}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg border border-[#E5E5F0] bg-white hover:bg-[#F1F1FA] text-[#1F1D3D] font-semibold text-xs uppercase tracking-wide transition-all shadow-sm"
            >
              <UserPlus className="w-4 h-4 text-[#4338CA]" />
              <span>Invite members</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-700/70 bg-[#080A0D] font-mono shadow-[0_0_15px_rgba(91,197,167,0.06)] divide-y divide-slate-800">
          {filteredExpenses.map((expense) => {
            const CategoryIcon = getCategoryIcon(expense.category);

            // Compute current user's share
            const userSplit = expense.splits.find((s) => s.user_id === currentUserId);
            const isPayer = expense.paid_by === currentUserId;

            let shareLabel = "Not involved";
            let shareColor = "text-[#5B5B72]";

            if (userSplit) {
              shareLabel = `Your share: ${formatRupees(userSplit.share_amount)}`;
              shareColor = "text-[#1F1D3D]";
            }
            if (isPayer) {
              shareLabel = `You paid ${formatRupees(expense.amount)}`;
              shareColor = "text-[#15803D]";
            }

            return (
              <div
                key={expense.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedExpense(expense)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedExpense(expense);
                  }
                }}
                className="flex cursor-pointer flex-col justify-between gap-3 p-4 transition-colors hover:bg-[#10151C] focus:bg-[#10151C] focus:outline-none sm:flex-row sm:items-center sm:p-4.5"
                title="Click to view detailed member splits"
              >
                {/* Left: Category Icon + Title, Date, Payer */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#5BC5A7]/25 bg-[#5BC5A7]/[0.08] text-[#5BC5A7]">
                    <CategoryIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 text-[9px] uppercase tracking-wider text-gray-500">[{expense.date}] · {(expense.payerName || "MEMBER").toUpperCase()} ADDED {expense.category.toUpperCase()}</div>
                    <h3 className="truncate text-sm font-bold text-white sm:text-base">
                      {expense.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] uppercase tracking-wider text-gray-500">
                      <span>SPLIT: {expense.split_type.toUpperCase()}</span>
                      <span>•</span>
                      <span>{expense.splits.length} participants</span>
                    </div>
                  </div>
                </div>

                {/* Right: Total Amount & User Share */}
                <div className="flex shrink-0 items-center justify-between border-t border-slate-800 pt-2 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                  <span className="text-base font-extrabold text-white sm:text-lg">
                    {formatRupees(expense.amount)}
                  </span>
                  <span className={`text-xs font-semibold ${shareColor}`}>
                    {shareLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
      />
    </section>
  );
}

