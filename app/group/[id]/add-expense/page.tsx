import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGroupForExpense } from "@/lib/data/expenses";
import { AddExpenseForm } from "@/components/group/AddExpenseForm";
import { ArrowLeft, PlusCircle } from "lucide-react";

export const metadata = {
  title: "Add Expense | SplitScore",
  description: "Record a new shared expense with equal, exact, percentage or shares split",
};

export default async function AddExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getGroupForExpense(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col font-sans">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-[#E5E5EF] sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/group/${id}`}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#2E2A7A] hover:bg-[#F1F1FA] transition-colors -ml-2"
              aria-label="Back to group"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#1F1D3D] leading-tight flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#2E2A7A]" />
                <span>Add Expense</span>
              </h1>
              <p className="text-xs text-[#5B5B72] truncate max-w-[200px] sm:max-w-none">
                {data.groupName}
              </p>
            </div>
          </div>

          <Link
            href={`/group/${id}`}
            className="text-xs font-semibold text-[#5B5B72] hover:text-[#1F1D3D] min-h-[44px] flex items-center px-2"
          >
            Cancel
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AddExpenseForm
          groupId={id}
          groupName={data.groupName}
          members={data.members}
          defaultPayerId={data.currentUserId}
        />
      </main>
    </div>
  );
}
