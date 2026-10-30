"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

export default function LandingPage() {
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleTryDemo = () => {
    setLoadingDemo(true);
    document.cookie = "demo_mode=true; path=/; max-age=86400; SameSite=Lax";
    window.location.href = "/api/demo";
  };

  const pillars = [
    {
      title: "Split easily",
      desc: "Equal, exact, percentage, or shares. Split group bills fairly across trips, mess accounts, and college events.",
      icon: (
        <svg
          className="w-5 h-5 text-[#4338CA]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Settle with mutual confirmation",
      desc: "Pay via UPI deep links. A payment is recorded as completed only when the receiving person confirms receipt.",
      icon: (
        <svg
          className="w-5 h-5 text-[#0F766E]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      title: "Score every confirmed repayment",
      desc: "Repayments update your portable trust score based on speed, amount, and counterparty diversity.",
      icon: (
        <svg
          className="w-5 h-5 text-[#2E2A7A]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
  ];

  const steps = [
    { number: "1", title: "Create a group" },
    { number: "2", title: "Add expenses" },
    { number: "3", title: "Settle via UPI" },
    { number: "4", title: "Receiver confirms" },
    { number: "5", title: "Score updates" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-14 sm:pt-20 sm:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F1F1FA] border border-[#E0E0F0] text-xs font-semibold text-[#4338CA] mb-6">
            <span>SplitScore</span>
            <span className="w-1 h-1 rounded-full bg-[#5B5B72]"></span>
            <span>Reputation-Driven Expense Sharing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#2E2A7A] mb-4">
            SplitScore
          </h1>

          <p className="text-xl sm:text-2xl font-semibold text-[#4338CA] mb-4">
            Split fair. Score fair.
          </p>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#5B5B72] leading-relaxed mb-8">
            Split group expenses fairly and build a trust score from how you pay back.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#4338CA] hover:bg-[#2E2A7A] text-white font-semibold text-sm sm:text-base flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
            >
              Continue with Google
            </Link>
            <a
              href="/api/demo"
              onClick={handleTryDemo}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#F1F1FA] hover:bg-[#E5E5F5] text-[#2E2A7A] font-semibold text-sm sm:text-base border border-[#E0E0F0] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
            >
              {loadingDemo ? "Opening Demo..." : "Try Demo"}
            </a>
          </div>
        </section>

        {/* Problem Strip */}
        <section className="w-full bg-[#F1F1FA] border-y border-[#E5E5EF] py-8 sm:py-10 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg sm:text-2xl font-bold text-[#1F1D3D] tracking-tight">
              Everyone knows who owes money. Nobody knows who pays back.
            </p>
          </div>
        </section>

        {/* Three Pillars */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#E5E5EF] p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F1F1FA] flex items-center justify-center mb-4">
                    {pillar.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#1F1D3D] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#5B5B72] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works - 5 Steps */}
        <section className="w-full bg-[#F1F1FA]/60 border-t border-[#E5E5EF] py-14 sm:py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#0F766E] mb-2">
                Step-by-Step Flow
              </h2>
              <p className="text-2xl sm:text-3xl font-bold text-[#2E2A7A]">
                How it works
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="bg-white rounded-xl border border-[#E5E5EF] p-5 text-center flex flex-col items-center justify-center min-h-[110px]"
                >
                  <span className="w-7 h-7 rounded-full bg-[#2E2A7A] text-white font-bold text-xs flex items-center justify-center mb-2.5">
                    {step.number}
                  </span>
                  <span className="text-sm font-semibold text-[#1F1D3D]">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E5E5EF] bg-white py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#5B5B72]">
          <p className="font-medium text-[#1F1D3D]">
            Team Null Pointers
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/how-scoring-works"
              className="min-h-[44px] inline-flex items-center hover:text-[#4338CA] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] rounded"
            >
              How Scoring Works
            </Link>
            <Link
              href="/simulator"
              className="min-h-[44px] inline-flex items-center hover:text-[#4338CA] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] rounded"
            >
              Simulator
            </Link>
            <Link
              href="/login"
              className="min-h-[44px] inline-flex items-center hover:text-[#4338CA] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] rounded"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
