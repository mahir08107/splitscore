import Link from "next/link";
import { Header } from "@/components/layout/Header";

export const dynamic = "force-dynamic";

export default async function GroupPage({
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
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0F766E] mb-2">
            <span>Group Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2E2A7A] mb-2">
            Group Details
          </h1>
          <p className="text-sm text-[#5B5B72] mb-6">
            Group ID: <span className="font-mono text-[#1F1D3D]">{id}</span>
          </p>

          <div className="border border-dashed border-[#D1D1DF] rounded-xl p-6 bg-[#F8F8FC] mb-8 text-center sm:text-left">
            <h2 className="text-base font-semibold text-[#1F1D3D] mb-1">
              Expenses, Balances and Members Tabs
            </h2>
            <p className="text-sm text-[#5B5B72]">
              This route is set up as a placeholder. The group expense tracking, debt simplification balances, and member list with trust badges will be placed here.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/group/${id}/add-expense`}
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-[#4338CA] hover:bg-[#2E2A7A] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
            >
              Add Expense
            </Link>
            <Link
              href={`/group/${id}/settle`}
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium text-[#0F766E] border border-[#0F766E] hover:bg-[#0F766E]/5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
            >
              Settle Balances
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium text-[#5B5B72] hover:text-[#1F1D3D] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
