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
    <div className="min-h-screen bg-[#FCFBF7] flex flex-col font-body">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-[rgba(225,29,72,0.09)] sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/group/${id}`}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#BE123C] hover:bg-[#FCFBF7] transition-colors -ml-2"
              aria-label="Back to group"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#1C1917] leading-tight flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#BE123C]" />
                <span>Add Expense</span>
              </h1>
              <p className="text-xs text-[#57534E] truncate max-w-[200px] sm:max-w-none">
                {data.groupName}
              </p>
            </div>
          </div>

          <Link
            href={`/group/${id}`}
            className="text-xs font-semibold text-[#57534E] hover:text-[#1C1917] min-h-[44px] flex items-center px-2"
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
