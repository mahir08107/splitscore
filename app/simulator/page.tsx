import Link from "next/link";
import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "Gaming Simulator — SplitScore",
  description: "Test how SplitScore's scoring logic resists fraudulent behavior and score farming.",
};

export default function SimulatorPage() {
  return (
    <div className="min-h-screen bg-[#F1F1FA] flex flex-col">
      <Header showBackToHome={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 my-4">
        <div className="bg-white rounded-2xl border border-[#E5E5EF] p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B45309] mb-2">
            <span>Interactive Demo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2E2A7A] mb-3">
            Gaming Simulator
          </h1>
          <p className="text-sm sm:text-base text-[#5B5B72] leading-relaxed mb-6">
            Explore live scenarios designed to attempt gaming or farming the trust score, and see how our defensive rules detect and neutralize manipulation.
          </p>

          <div className="border border-dashed border-[#D1D1DF] rounded-xl p-6 sm:p-8 bg-[#F8F8FC] mb-8">
            <h2 className="text-base font-semibold text-[#1F1D3D] mb-2">
              Simulator Workspace Placeholder
            </h2>
            <p className="text-sm text-[#5B5B72] leading-relaxed mb-4">
              Scenarios like &ldquo;Two friends send ₹10 back and forth&rdquo; and &ldquo;Pay only tiny debts on time while defaulting on large bills&rdquo; will be hooked up to the scoring engine simulation here for live judging demonstrations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/how-scoring-works"
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium text-[#4338CA] border border-[#4338CA] hover:bg-[#F1F1FA] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
            >
              Read Scoring Rules
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

      <footer className="w-full text-center text-xs text-[#5B5B72] py-6">
        <p>Team Null Pointers | Split fair. Score fair.</p>
      </footer>
    </div>
  );
}

