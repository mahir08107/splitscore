import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { SimulatorClient } from "@/components/simulator/SimulatorClient";
import { ShieldCheck, BookOpen, LayoutDashboard, Sparkles } from "lucide-react";

export const metadata = {
  title: "Gaming Simulator — SplitScore",
  description:
    "Interactive hackathon test bench. Attempt fraudulent behaviors like micro-transaction farming, circular loops, and velocity spamming to see the anti-gaming defense engine in action.",
};

export default function SimulatorPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] flex flex-col">
      <Header showBackToHome={true} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 my-4">
        {/* Page Header */}
        <div className="bg-white rounded-3xl border border-[rgba(225,29,72,0.09)] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0F766E] bg-[#0F766E]/10 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Hackathon Judge Demo • Interactive Test Bench</span>
            </div>
            <Link
              href="/how-scoring-works"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E11D48] hover:text-[#BE123C] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Anti-Gaming Methodology</span>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#BE123C] tracking-tight mb-2">
            Anti-Gaming Simulator
          </h1>

          <p className="text-sm sm:text-base text-[#57534E] leading-relaxed max-w-3xl">
            Test the SplitScore scoring engine against real fraud vectors. Click any pre-set cheat attempt below to watch how our mathematical defense rules neutralize manipulation in real-time.
          </p>
        </div>

        {/* Simulator Interactive Client */}
        <SimulatorClient />

        {/* Bottom Actions & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[rgba(225,29,72,0.09)]">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:bg-[#E11D48] rounded-xl transition-all shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <Link
              href="/trust-score"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#E11D48] bg-white border border-[rgba(225,29,72,0.14)] hover:bg-[#FCFBF7] rounded-xl transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              My Trust Score
            </Link>
          </div>

          <p className="text-xs text-[#57534E]">
            Simulations execute purely on-device via <code className="font-mono text-[#BE123C]">lib/trust-score-simulator.ts</code> with zero database mutations.
          </p>
        </div>
      </main>

      <footer className="w-full text-center text-xs text-[#57534E] py-6 border-t border-[rgba(225,29,72,0.09)]">
        <p>Team Null Pointers • Split fair. Score fair.</p>
      </footer>
    </div>
  );
}
