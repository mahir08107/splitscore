import Link from "next/link";
import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "My Trust Score — SplitScore",
  description: "View your personal trust score breakdown, reputation band, and verified settlement history.",
};

export default function MyTrustScorePage() {
  return (
    <div className="min-h-screen bg-[#F1F1FA] flex flex-col">
      <Header showBackToHome={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl border border-[#E5E5EF] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#15803D] mb-2">
            <span>Reputation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2E2A7A] mb-2">
            My Trust Score
          </h1>
          <p className="text-sm text-[#5B5B72] mb-6">
            Your personal score based on confirmed on-time settlements and counterparty diversity.
          </p>

          <div className="border border-dashed border-[#D1D1DF] rounded-xl p-6 bg-[#F8F8FC] mb-8">
            <h2 className="text-base font-semibold text-[#1F1D3D] mb-1">
              Score Dashboard Placeholder
            </h2>
            <p className="text-sm text-[#5B5B72] leading-relaxed">
              This page will display the big score with band (Excellent, Good, Building, Risky), confidence level, score history chart, metric breakdown (on-time rate, average delay, amount reliability, consistency, diversity), and the chronological reason timeline for score changes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium text-[#4338CA] border border-[#4338CA] hover:bg-[#F1F1FA] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
            >
              Back to Home
            </Link>
            <Link
              href="/how-scoring-works"
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium text-[#5B5B72] hover:text-[#1F1D3D] transition-colors"
            >
              How Scoring Works
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

