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
          <h2 className="text-xl font-bold text-[#1C1917] font-display">Group Expenses</h2>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            All expenses recorded in this group.
          </p>
        </div>
        <Link
          href={`/group/${groupId}/add-expense`}
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:shadow-lg hover:shadow-[#E11D48]/25 text-white font-semibold text-xs uppercase tracking-wide transition-all shadow-sm self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </Link>
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#57534E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or payer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 min-h-[44px] rounded-lg border border-[rgba(225,29,72,0.09)] bg-white text-xs sm:text-sm text-[#1C1917] placeholder:text-[#57534E] focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-[#57534E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-8 min-h-[44px] rounded-lg border border-[rgba(225,29,72,0.09)] bg-white text-xs sm:text-sm text-[#1C1917] appearance-none focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
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
          <ArrowUpDown className="w-4 h-4 text-[#57534E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            className="w-full pl-10 pr-8 min-h-[44px] rounded-lg border border-[rgba(225,29,72,0.09)] bg-white text-xs sm:text-sm text-[#1C1917] appearance-none focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
          >
            <option value="newest">Sort by Date: Newest First</option>
            <option value="oldest">Sort by Date: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Expense List / Rows */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-10 text-center soft-card-shadow">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 border border-[#FECDD3] flex items-center justify-center text-[#E11D48] mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1C1917] font-display">No expenses found</h3>
          <p className="text-xs text-[#57534E] max-w-sm mx-auto mt-1 mb-6">
            {expenses.length === 0
              ? "No expenses have been recorded in this group yet. Add your first shared bill to get started."
              : "No expenses match your search or filter criteria."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/group/${groupId}/add-expense`}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-5 py-2 rounded-lg bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:shadow-lg hover:shadow-[#E11D48]/25 text-white font-semibold text-xs uppercase tracking-wide transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add first expense</span>
            </Link>
            <button
              type="button"
              onClick={onOpenInvite}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg border border-[rgba(225,29,72,0.09)] bg-white hover:bg-rose-50 text-[#1C1917] font-semibold text-xs uppercase tracking-wide transition-all shadow-sm"
            >
              <UserPlus className="w-4 h-4 text-[#E11D48]" />
              <span>Invite members</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] soft-card-shadow divide-y divide-stone-100 overflow-hidden">
          {filteredExpenses.map((expense) => {
            const CategoryIcon = getCategoryIcon(expense.category);

            // Compute current user's share
            const userSplit = expense.splits.find((s) => s.user_id === currentUserId);
            const isPayer = expense.paid_by === currentUserId;

            let shareLabel = "Not involved";
            let shareColor = "text-[#57534E]";

            if (userSplit) {
              shareLabel = `Your share: ${formatRupees(userSplit.share_amount)}`;
              shareColor = "text-[#1C1917]";
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
                className="p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FFF8F8] cursor-pointer transition-colors focus:outline-none focus:bg-[#FFF8F8]"
                title="Click to view detailed member splits"
              >
                {/* Left: Category Icon + Title, Date, Payer */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#E11D48] flex items-center justify-center shrink-0">
                    <CategoryIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-[#1C1917] truncate">
                      {expense.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-[#57534E]">
                      <span className="font-medium text-[#E11D48]">{expense.category}</span>
                      <span>•</span>
                      <span>Paid by <strong className="text-[#1C1917]">{expense.payerName || "Member"}</strong></span>
                      <span>•</span>
                      <span>{expense.date}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Total Amount & User Share */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end shrink-0 pl-13 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[rgba(225,29,72,0.06)]">
                  <span className="text-base sm:text-lg font-extrabold text-[#1C1917]">
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
