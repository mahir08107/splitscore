import Link from "next/link";
import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "How Scoring Works — SplitScore",
  description: "Transparent explanation of the SplitScore trust scoring engine and anti-gaming rules.",
};

export default function HowScoringWorksPage() {
  const rules = [
    {
      title: "1. Mutual Confirmation",
      desc: "Only settlements confirmed by the receiving party count toward your score. A payment marked as sent does nothing until verified.",
    },
    {
      title: "2. Counterparty Diversity",
      desc: "Repeated dealings with the same person give diminishing score increases. This prevents two friends from farming points by repeatedly passing funds.",
    },
    {
      title: "3. Amount Weighting",
      desc: "Clearing a ₹2,000 debt on time reflects significantly higher trust and commitment than clearing a ₹10 debt.",
    },
    {
      title: "4. Asymmetric Penalties",
      desc: "Defaulting or chronic delays damage reputation much faster than prompt payments build it. Trust takes weeks to earn and moments to lose.",
    },
    {
      title: "5. Time Decay",
      desc: "Recent repayment patterns carry far more weight than behaviour from six months ago, reflecting current financial habits.",
    },
    {
      title: "6. Weekly Growth Caps",
      desc: "Reputation score gains are capped on a rolling weekly basis to stop sudden artificial spikes or bulk manipulation.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F1F1FA] flex flex-col">
      <Header showBackToHome={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 my-4">
        <div className="bg-white rounded-2xl border border-[#E5E5EF] p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0F766E] mb-2">
            <span>Methodology</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2E2A7A] mb-3">
            How Scoring Works
          </h1>
          <p className="text-sm sm:text-base text-[#5B5B72] leading-relaxed mb-8">
            Most expense splitters only track running tallies of debts. SplitScore turns settlement history into a portable, verifiable reputation score. Here is how our scoring engine resists gaming.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 mb-10">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-[#E5E5EF] bg-[#F8F8FC]"
              >
                <h3 className="font-semibold text-base text-[#1F1D3D] mb-1.5">
                  {rule.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5B5B72] leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E5E5EF] pt-6 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/simulator"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-sm font-semibold text-white bg-[#4338CA] hover:bg-[#2E2A7A] rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
            >
              Test in Gaming Simulator
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

