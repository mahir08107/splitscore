import Link from "next/link";
import { Header } from "@/components/layout/Header";

export const dynamic = "force-dynamic";

export default async function AddExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#F1F1FA] flex flex-col">
      <Header showBackToHome={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl border border-[#E5E5EF] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4338CA] mb-2">
            <span>Expenses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2E2A7A] mb-2">
            Add Expense
          </h1>
          <p className="text-sm text-[#5B5B72] mb-6">
            For Group: <span className="font-mono text-[#1F1D3D]">{id}</span>
          </p>

          <div className="border border-dashed border-[#D1D1DF] rounded-xl p-6 bg-[#F8F8FC] mb-8">
            <h2 className="text-base font-semibold text-[#1F1D3D] mb-1">
              Add Expense Form
            </h2>
            <p className="text-sm text-[#5B5B72]">
              Title, amount, paid by, date, category and split modes (equal, exact, percentage, shares) with member selection will be built here.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/group/${id}`}
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-[#4338CA] hover:bg-[#2E2A7A] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
            >
              Back to Group
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium text-[#5B5B72] hover:text-[#1F1D3D] transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
