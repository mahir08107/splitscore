"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [settled, setSettled] = useState(false);

  const handleTryDemo = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setLoadingDemo(true);
    document.cookie = "demo_mode=true; path=/; max-age=86400; SameSite=Lax";
    window.location.href = "/api/demo";
  };

  const handle1TapSettle = () => {
    setSettled(true);
    setTimeout(() => {
      setSettled(false);
    }, 4000);
  };

  return (
    <div className="bg-[#FCFBF7] font-body text-[#1C1917] antialiased selection:bg-[#FFE4E6] selection:text-[#BE123C] min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FCFBF7]/90 backdrop-blur-md border-b border-[rgba(225,29,72,0.08)]">
        <div className="h-20 max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-2.5 group" href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="SplitScore Logo"
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOOG1BOsniyP4hpxYj6t4fN4dXEct5dKu6avi_GqeVAmq84hTUnsTyKHSkDrrd4zEeGZWFuuzfsjSD0s56P5535AOdCiPxUuBguHKLJiBHQm-50R34HIGVgt3mw1iuvI_JA4qsYHeMZaaUHR1wgecOmPA00j2MGc1Y_NDo0Ftp_lBXYqtGfhoz2Xv2jLOEraaAQApfiKQ--9ZiVkNm1gm2ePZe_5lWvhX-HnqOjzXs"
              />
              <span className="font-display font-bold text-xl tracking-tight text-[#1C1917]">
                SplitScore
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-[11px] font-semibold tracking-wide">
                Beta 2.0
              </span>
            </Link>
            <nav className="hidden lg:flex items-center p-1 bg-[#FAF6F0] border border-[rgba(225,29,72,0.08)] rounded-full text-xs font-semibold">
              <a
                className="px-4 py-1.5 rounded-full text-[#57534E] hover:text-[#E11D48] transition-colors"
                href="#features"
              >
                Features
              </a>
              <a
                className="px-4 py-1.5 rounded-full text-[#57534E] hover:text-[#E11D48] transition-colors"
                href="#how-it-works"
              >
                How It Works
              </a>
              <a
                className="px-4 py-1.5 rounded-full text-[#57534E] hover:text-[#E11D48] transition-colors"
                href="#trust-hub"
              >
                Reliability
              </a>
              <a
                className="px-4 py-1.5 rounded-full text-[#57534E] hover:text-[#E11D48] transition-colors"
                href="#reviews"
              >
                Testimonials
              </a>
              <Link
                className="px-4 py-1.5 rounded-full text-[#57534E] hover:text-[#E11D48] transition-colors"
                href="/how-scoring-works"
              >
                Methodology
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTryDemo}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-[rgba(225,29,72,0.12)] text-[#1C1917] text-sm font-semibold hover:bg-[#FFF1F2] hover:text-[#E11D48] transition-all shadow-sm min-h-[40px] cursor-pointer"
            >
              {loadingDemo ? "Opening Demo..." : "Try Sandbox"}
            </button>
            <Link
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#E11D48]/25 transition-all active:scale-95 min-h-[40px]"
              href="/login"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Continue with Google</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full pt-20">
        {/* DIRECTION 2: 50/50 EDITORIAL SPLIT HERO */}
        <section className="relative w-full overflow-hidden px-6 sm:px-8 lg:px-12 pt-12 pb-24 lg:pt-16 lg:pb-32 bg-gradient-to-b from-[#FCFBF7] via-[#FFF8F8] to-[#FAF6F0]">
          {/* Blended ambient blush orbs */}
          <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#FECDD3]/25 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 right-10 w-[600px] h-[600px] bg-[#FFE4E6]/40 rounded-full blur-[160px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* LEFT COLUMN: High-impact typography, clamp header, badges, avatars, and dual CTAs */}
            <div className="lg:col-span-6 flex flex-col items-start gap-6">
              {/* Editorial Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[rgba(225,29,72,0.14)] shadow-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                <span className="font-display text-xs font-bold uppercase tracking-wider text-[#BE123C]">
                  Neo-Ledger Protocol
                </span>
                <span className="text-[rgba(225,29,72,0.3)]">|</span>
                <span className="text-xs font-medium text-[#57534E]">
                  Automated Peer Settlements
                </span>
              </div>

              {/* Headline with modern oversized clamp */}
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#1C1917] leading-[1.08]">
                Split bills with clarity. <br />
                <span className="bg-gradient-to-r from-[#E11D48] via-[#F43F5E] to-[#BE123C] bg-clip-text text-transparent underline decoration-[#FECDD3] decoration-wavy decoration-2">
                  Never chase a friend
                </span>{" "}
                for money again.
              </h1>

              {/* Body Copy */}
              <p className="font-body text-base sm:text-lg text-[#57534E] max-w-xl leading-relaxed">
                Eliminate awkward group reminders and forgotten transfers. Every on-time settlement builds a clean group payment history — transparent, automatic, and dispute-free.
              </p>

              {/* Verified Member Avatars Strip */}
              <div className="flex items-center gap-3.5 py-1">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FFE4E6] border-2 border-white text-xs font-bold text-[#BE123C]">
                    AM
                  </span>
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FAF6F0] border-2 border-white text-xs font-bold text-[#1C1917]">
                    SK
                  </span>
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FED7AA] border-2 border-white text-xs font-bold text-[#C2410C]">
                    RV
                  </span>
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#E11D48] border-2 border-white text-xs font-bold text-white">
                    +8
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-[16px] text-[#E11D48]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                    <span className="text-xs font-bold text-[#1C1917]">
                      1,200+ Verified Groups
                    </span>
                  </div>
                  <span className="text-[11px] text-[#57534E]">
                    Average settlement velocity: &lt; 2.4 hours
                  </span>
                </div>
              </div>

              {/* Dual CTAs with glowing rose button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-2">
                <Link
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#E11D48] via-[#F43F5E] to-[#BE123C] text-white font-display font-semibold text-sm soft-rose-glow hover:brightness-105 active:scale-95 transition-all min-h-[48px]"
                  href="/login"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#FFFFFF"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#FFFFFF"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FFFFFF"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#FFFFFF"
                    />
                  </svg>
                  <span>Get Started with Google</span>
                </Link>
                <button
                  onClick={handleTryDemo}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[rgba(225,29,72,0.12)] text-[#1C1917] font-display font-semibold text-sm hover:bg-[#FFF1F2] hover:border-[#FECDD3] hover:text-[#E11D48] transition-all group min-h-[48px] cursor-pointer"
                >
                  <span>{loadingDemo ? "Opening Demo..." : "Launch Live Ledger Demo"}</span>
                  <span className="material-symbols-outlined text-[18px] text-[#E11D48] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>

              {/* Micro Metric Proof Strip */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[rgba(225,29,72,0.08)] w-full">
                <div>
                  <div className="font-display font-black text-2xl text-[#1C1917]">
                    ₹2.4L+
                  </div>
                  <div className="text-xs text-[#57534E] font-medium">
                    Settled On-Time
                  </div>
                </div>
                <div>
                  <div className="font-display font-black text-2xl text-[#E11D48]">
                    99.2%
                  </div>
                  <div className="text-xs text-[#57534E] font-medium">
                    Settlement Rate
                  </div>
                </div>
                <div>
                  <div className="font-display font-black text-2xl text-[#1C1917]">
                    Zero
                  </div>
                  <div className="text-xs text-[#57534E] font-medium">
                    Awkward Pings
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: EXPANSIVE "GROUP LEDGER & TRUST HUB" APP FRAME */}
            <div className="lg:col-span-6 relative" id="trust-hub">
              {/* Subtle rose glow behind frame */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#FECDD3]/40 via-[#FFE4E6]/25 to-[#FDA4AF]/20 rounded-3xl blur-2xl -z-10" />
              <div className="w-full bg-white rounded-3xl border border-[rgba(225,29,72,0.12)] p-6 sm:p-7 soft-card-shadow relative overflow-hidden backdrop-blur-sm">
                {/* App Frame Top Header */}
                <div className="flex items-center justify-between pb-5 border-b border-[rgba(225,29,72,0.08)]">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFE4E6] to-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center font-display font-extrabold text-[#BE123C] text-base">
                        AM
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#E11D48] rounded-full border-2 border-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px] text-white">
                          check
                        </span>
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-bold text-base text-[#1C1917]">
                          Arjun Mehta
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FFF1F2] border border-[#FECDD3] text-[10px] font-bold text-[#E11D48] uppercase tracking-wider">
                          Verified Payer
                        </span>
                      </div>
                      <div className="text-xs text-[#57534E]">
                        Indiranagar Villa Friends
                      </div>
                    </div>
                  </div>

                  {/* Trust Gauge Badge */}
                  <div className="text-right flex flex-col items-end">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FCFBF7] border border-[rgba(225,29,72,0.12)]">
                      <span className="material-symbols-outlined text-[#E11D48] text-[18px]">
                        verified
                      </span>
                      <span className="font-display font-black text-base text-[#BE123C]">
                        99.4%
                      </span>
                      <span className="text-[10px] font-semibold text-[#57534E]">
                        On-Time
                      </span>
                    </div>
                    <span className="text-[10px] text-[#E11D48] font-semibold mt-1">
                      Top Punctual Settler
                    </span>
                  </div>
                </div>

                {/* Ledger Showcase Card */}
                <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-[#FCFBF7] to-[#FFF8F8] border border-[rgba(225,29,72,0.09)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏖️</span>
                      <div>
                        <h3 className="font-display font-bold text-sm text-[#1C1917]">
                          Goa Beachhouse Retreat
                        </h3>
                        <p className="text-[11px] text-[#57534E]">
                          7 members • Closes in 3 hours
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white border border-[#FECDD3] text-[#BE123C] text-[11px] font-semibold">
                      Auto-Sync On
                    </span>
                  </div>

                  {/* Live Balance Counter */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-[rgba(225,29,72,0.08)]">
                    <div>
                      <span className="text-[11px] font-medium text-[#57534E] block">
                        Group Total
                      </span>
                      <span className="font-display font-extrabold text-lg text-[#1C1917]">
                        ₹42,800
                      </span>
                    </div>
                    <div className="border-l border-[rgba(225,29,72,0.08)] pl-3">
                      <span className="text-[11px] font-semibold text-[#E11D48] block">
                        Your Balance (Owed)
                      </span>
                      <span className="font-display font-black text-xl text-[#BE123C] flex items-center gap-1">
                        +₹8,450
                        <span className="text-xs font-normal text-[#E11D48] bg-[#FFF1F2] px-1.5 py-0.5 rounded-md">
                          Instant
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Settlement Ledger Feed */}
                <div className="mt-5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#57534E] uppercase tracking-wider px-1">
                    <span>Recent Peer Settlements</span>
                    <button
                      onClick={handleTryDemo}
                      className="text-[#E11D48] font-semibold cursor-pointer hover:underline text-[11px]"
                    >
                      View All (6)
                    </button>
                  </div>

                  {/* Sanya Card */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FCFBF7] border border-[rgba(225,29,72,0.08)] hover:border-[#FECDD3] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center text-xs font-bold text-[#BE123C]">
                        SK
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1C1917]">
                          Sanya Kapoor
                        </div>
                        <div className="text-[10px] text-[#E11D48] flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined text-[12px]">
                            bolt
                          </span>{" "}
                          Paid in 12m (⚡ Auto-Settled)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-xs text-[#1C1917]">
                        ₹2,810
                      </div>
                      <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Settled UPI
                      </span>
                    </div>
                  </div>

                  {/* Rohan Card */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FCFBF7] border border-[rgba(225,29,72,0.08)] hover:border-[#FECDD3] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-[rgba(225,29,72,0.12)] flex items-center justify-center text-xs font-bold text-[#1C1917]">
                        RV
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1C1917]">
                          Rohan Verma
                        </div>
                        <div className="text-[10px] text-[#57534E] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-[#E11D48]">
                            schedule
                          </span>{" "}
                          Gentle ping queued • 2h left
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-xs text-[#57534E]">
                        ₹2,810
                      </div>
                      <span className="text-[9px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instant 1-Tap Settle CTA */}
                <div className="mt-5">
                  <button
                    onClick={handle1TapSettle}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-display font-bold text-sm flex items-center justify-center gap-2 soft-rose-glow hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      account_balance_wallet
                    </span>
                    <span>
                      {settled
                        ? "✓ Verified & Reconciled Instantly!"
                        : "1-Tap Settle via Instant UPI"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-normal ml-1">
                      Zero Fee
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM STATEMENT: TYPOGRAPHIC MARQUEE / CENTERED MANIFEST BLOCK */}
        <section className="w-full py-20 px-6 sm:px-8 border-y border-[rgba(225,29,72,0.08)] bg-gradient-to-b from-[#FAF6F0] via-[#FFF9F9] to-[#FCFBF7] relative overflow-hidden">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            {/* Delicate hairline divider */}
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#E11D48] to-transparent mb-6" />
            <span className="font-display text-xs uppercase tracking-widest font-extrabold text-[#E11D48] mb-4">
              The Social Expense Manifest
            </span>
            <blockquote className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#1C1917] tracking-tight leading-tight max-w-3xl">
              “Everyone knows who owes money. <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[#E11D48] to-[#BE123C] bg-clip-text text-transparent italic font-serif">
                Nobody knows who actually pays back on time.
              </span>”
            </blockquote>
            <p className="font-body text-base text-[#57534E] max-w-2xl mt-5 leading-relaxed">
              Traditional bill-splitters act like cold ledgers with lingering unpaid balances and zero accountability. SplitScore introduces verified peer accountability—making dependability socially celebrated and punctuality rewarding.
            </p>

            {/* High-trust micro-stats framed with hairline borders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-10">
              <div className="p-5 rounded-2xl bg-white border border-[rgba(225,29,72,0.08)] text-left hover:border-[#FECDD3] transition-all">
                <span className="material-symbols-outlined text-[#E11D48] text-2xl mb-2">
                  notifications_off
                </span>
                <div className="font-display font-bold text-sm text-[#1C1917]">
                  Zero Passive Aggression
                </div>
                <p className="text-xs text-[#57534E] mt-1">
                  Automated system pings replace awkward WhatsApp group begging.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[rgba(225,29,72,0.08)] text-left hover:border-[#FECDD3] transition-all">
                <span className="material-symbols-outlined text-[#E11D48] text-2xl mb-2">
                  speed
                </span>
                <div className="font-display font-bold text-sm text-[#1C1917]">
                  300–900 Reliability Index
                </div>
                <p className="text-xs text-[#57534E] mt-1">
                  Build a verifiable score that proves you are a top-tier friend.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[rgba(225,29,72,0.08)] text-left hover:border-[#FECDD3] transition-all">
                <span className="material-symbols-outlined text-[#BE123C] text-2xl mb-2">
                  lock_open
                </span>
                <div className="font-display font-bold text-sm text-[#1C1917]">
                  Instant Handshake Verification
                </div>
                <p className="text-xs text-[#57534E] mt-1">
                  Direct bank UPI matching means no fake payment screenshots.
                </p>
              </div>
            </div>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#E11D48] to-transparent mt-10" />
          </div>
        </section>

        {/* CORE FEATURES: 3 HORIZONTAL INTERACTIVE SHOWCASE ROWS */}
        <section className="w-full py-24 px-6 sm:px-8 max-w-7xl mx-auto" id="features">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-[#E11D48] mb-2">
              Pillars of Accountability
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#1C1917] tracking-tight">
              Engineered to eliminate friction, built to elevate trust.
            </h2>
            <p className="text-sm sm:text-base text-[#57534E] mt-3">
              Explore the three core capabilities designed to make shared finances completely peaceful.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* SHOWCASE ROW 1: Algorithmic Scoring */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col lg:flex-row items-center justify-between gap-8 group hover:border-[#FECDD3] transition-all">
              <div className="lg:w-1/2 flex flex-col items-start gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FECDD3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-ping" />
                  <span className="text-xs font-bold text-[#BE123C]">
                    Smart Velocity Engine
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-2xl text-[#1C1917]">
                  Punctual Settlement Tracker
                </h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  Our patent-pending velocity model monitors on-time settlements, dispute rates, and historical parity. Consistently settle within 24 hours to maintain verified standing.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="px-3 py-1.5 rounded-lg bg-[#FAF6F0] border border-[rgba(225,29,72,0.08)] text-xs font-bold text-[#1C1917]">
                    &lt; 2h median settle time
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#FFF1F2] text-xs font-bold text-[#BE123C]">
                    Verified Badging
                  </span>
                </div>
              </div>
              <div className="lg:w-1/2 w-full bg-gradient-to-br from-[#FAF6F0] to-[#FFF1F2] p-6 rounded-2xl border border-[rgba(225,29,72,0.08)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
                    Real-Time Score Meter
                  </span>
                  <span className="text-xs font-bold text-[#E11D48] bg-white px-2.5 py-0.5 rounded-full border border-[#FECDD3]">
                    Top 3% Tier
                  </span>
                </div>
                {/* Progress Bar Simulation */}
                <div className="w-full bg-white h-3 rounded-full overflow-hidden p-0.5 border border-[#FECDD3]">
                  <div className="bg-gradient-to-r from-[#FDA4AF] via-[#E11D48] to-[#9F1239] h-full rounded-full w-[88%]" />
                </div>
                <div className="flex justify-between items-center mt-3 text-xs text-[#57534E]">
                  <span>Average</span>
                  <span className="font-display font-extrabold text-sm text-[#BE123C]">
                    Fast Settle Speed (&lt;2h)
                  </span>
                  <span>Instant</span>
                </div>
              </div>
            </div>

            {/* SHOWCASE ROW 2: Frictionless UPI Settlements */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col lg:flex-row-reverse items-center justify-between gap-8 group hover:border-[#FECDD3] transition-all">
              <div className="lg:w-1/2 flex flex-col items-start gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FECDD3]">
                  <span className="material-symbols-outlined text-[14px] text-[#E11D48]">
                    bolt
                  </span>
                  <span className="text-xs font-bold text-[#BE123C]">
                    Zero Manual Screenshot Validation
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-2xl text-[#1C1917]">
                  Frictionless 1-Tap UPI Settlements
                </h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  Connect Google Pay, PhonePe, or BHIM. SplitScore orchestrates direct bank handshakes that close debt ledgers instantaneously without waiting for confirmations or screenshot sharing.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="px-3 py-1.5 rounded-lg bg-[#FAF6F0] border border-[rgba(225,29,72,0.08)] text-xs font-bold text-[#1C1917]">
                    Live Bank Handshake
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#FFF1F2] text-xs font-bold text-[#BE123C]">
                    0% Fee Rail
                  </span>
                </div>
              </div>
              <div className="lg:w-1/2 w-full bg-gradient-to-br from-[#FAF6F0] to-[#FFF1F2] p-6 rounded-2xl border border-[rgba(225,29,72,0.08)]">
                <div className="bg-white p-4 rounded-xl border border-[rgba(225,29,72,0.08)] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E11D48] to-[#BE123C] flex items-center justify-center text-white font-bold">
                      <span className="material-symbols-outlined text-[20px]">
                        qr_code_2
                      </span>
                    </div>
                    <div>
                      <div className="font-display font-bold text-xs text-[#1C1917]">
                        Direct UPI Deep Link
                      </div>
                      <div className="text-[11px] text-[#57534E]">
                        Auto-reconciles in 400ms
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* SHOWCASE ROW 3: Social Group Dynamics & Pings */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col lg:flex-row items-center justify-between gap-8 group hover:border-[#FECDD3] transition-all">
              <div className="lg:w-1/2 flex flex-col items-start gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FECDD3]">
                  <span className="material-symbols-outlined text-[14px] text-[#E11D48]">
                    self_improvement
                  </span>
                  <span className="text-xs font-bold text-[#BE123C]">
                    Friendship Preserving
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-2xl text-[#1C1917]">
                  Gentle Algorithmic Nudges
                </h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  Say goodbye to awkward text messages. SplitScore&apos;s thoughtful scheduling sends courteous, respectful notifications to pending members while protecting social harmony.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="px-3 py-1.5 rounded-lg bg-[#FAF6F0] border border-[rgba(225,29,72,0.08)] text-xs font-bold text-[#1C1917]">
                    Smart Schedule Pings
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#FFF1F2] text-xs font-bold text-[#BE123C]">
                    Custom Deadlines
                  </span>
                </div>
              </div>
              <div className="lg:w-1/2 w-full bg-gradient-to-br from-[#FAF6F0] to-[#FFF1F2] p-6 rounded-2xl border border-[rgba(225,29,72,0.08)]">
                <div className="bg-white p-4 rounded-xl border border-[rgba(225,29,72,0.08)] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#E11D48] text-2xl">
                      schedule_send
                    </span>
                    <div>
                      <div className="font-display font-bold text-xs text-[#1C1917]">
                        System ping: 2h remaining
                      </div>
                      <div className="text-[11px] text-[#57534E]">
                        Sent politely on your behalf
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#BE123C] bg-[#FFF1F2] px-2.5 py-1 rounded-md">
                    Automated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROTOCOL: STEPPED VERTICAL PATHWAY */}
        <section className="w-full py-24 px-6 sm:px-8 bg-gradient-to-b from-[#FAF6F0] via-[#FFF9F9] to-[#FCFBF7] border-y border-[rgba(225,29,72,0.08)]" id="how-it-works">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="text-center max-w-xl mb-16">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-[#E11D48]">
                The Protocol
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-[#1C1917] mt-1">
                Stepped Pathway to Friction-Free Living
              </h2>
              <p className="text-sm text-[#57534E] mt-2">
                A linear progression designed to move group debt out of the way in seconds.
              </p>
            </div>

            {/* Vertical Stepped Pathway with Flowing Dashed Line */}
            <div className="relative w-full max-w-2xl pl-6 sm:pl-10">
              {/* Flowing dashed line connecting steps */}
              <div className="absolute left-10 sm:left-14 top-8 bottom-12 w-0.5 border-l-2 border-dashed border-[#FECDD3]" />

              {/* Step 1 */}
              <div className="relative flex items-start gap-6 pb-12 group">
                <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-[#E11D48] to-[#BE123C] text-white flex items-center justify-center font-display font-black text-lg shadow-md shadow-[#E11D48]/20 flex-shrink-0">
                  1
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[rgba(225,29,72,0.08)] soft-card-shadow flex-1 hover:border-[#FECDD3] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-display font-bold text-base text-[#1C1917]">
                      Create Group or Trip
                    </h4>
                    <span className="material-symbols-outlined text-[#E11D48] text-xl">
                      group_add
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    Launch a shared flat, weekend getaway, or event group via a single 1-tap invite link without forced app downloads.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-6 pb-12 group">
                <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-[#E11D48] to-[#BE123C] text-white flex items-center justify-center font-display font-black text-lg shadow-md shadow-[#E11D48]/20 flex-shrink-0">
                  2
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[rgba(225,29,72,0.08)] soft-card-shadow flex-1 hover:border-[#FECDD3] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-display font-bold text-base text-[#1C1917]">
                      Add Bill or Snap Receipt
                    </h4>
                    <span className="material-symbols-outlined text-[#E11D48] text-xl">
                      receipt_long
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    Itemize dinners, grocery orders, or rental balances with weighted split ratios and automated bill OCR detection.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-6 pb-12 group">
                <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-[#E11D48] to-[#BE123C] text-white flex items-center justify-center font-display font-black text-lg shadow-md shadow-[#E11D48]/20 flex-shrink-0">
                  3
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[rgba(225,29,72,0.08)] soft-card-shadow flex-1 hover:border-[#FECDD3] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-display font-bold text-base text-[#1C1917]">
                      Instant 1-Tap UPI Settlement
                    </h4>
                    <span className="material-symbols-outlined text-[#E11D48] text-xl">
                      payments
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    Direct bank-to-bank settlement channels. Balances close instantly without wallet lock-in or escrow holds.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-6 group">
                <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-[#E11D48] to-[#BE123C] text-white flex items-center justify-center font-display font-black text-lg shadow-md shadow-[#E11D48]/20 flex-shrink-0">
                  4
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[rgba(225,29,72,0.08)] soft-card-shadow flex-1 hover:border-[#FECDD3] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-display font-bold text-base text-[#1C1917]">
                      Keep Clean Social Ledgers
                    </h4>
                    <span className="material-symbols-outlined text-[#BE123C] text-xl">
                      workspace_premium
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    Each punctual settlement keeps group balances clear and eliminates awkward payment reminders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF: 2X2 HIGH-FIDELITY REVIEWS GRID */}
        <section className="w-full py-24 px-6 sm:px-8 max-w-7xl mx-auto" id="reviews">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-[#E11D48] mb-2">
              Verified Feedback
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#1C1917] tracking-tight">
              What friends and co-travelers say
            </h2>
            <p className="text-sm sm:text-base text-[#57534E] mt-3">
              Real experiences from high-reputation members who swapped awkward reminders for SplitScore.
            </p>
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Review 1 */}
            <div className="p-7 rounded-2xl bg-white border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col justify-between hover:border-[#FECDD3] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-[#E11D48]">
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                    ✓ Verified Settle History
                  </span>
                </div>
                <p className="font-body text-sm sm:text-base text-[#1C1917] leading-relaxed italic">
                  “Finally know who actually pays back before planning our next Bangalore trip. The accountability is effortless and completely non-awkward.”
                </p>
              </div>
              <div className="pt-5 mt-5 border-t border-[rgba(225,29,72,0.08)] flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-sm text-[#1C1917]">
                    Rohit S.
                  </div>
                  <div className="text-xs text-[#57534E]">
                    Indiranagar Friend Group
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF1F2] border border-[#FECDD3]">
                  <span className="material-symbols-outlined text-[15px] text-[#E11D48]">
                    verified
                  </span>
                  <span className="font-display font-black text-xs text-[#BE123C]">
                    Indiranagar Friend Group
                  </span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="p-7 rounded-2xl bg-white border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col justify-between hover:border-[#FECDD3] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-[#E11D48]">
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                    ✓ Verified Settle History
                  </span>
                </div>
                <p className="font-body text-sm sm:text-base text-[#1C1917] leading-relaxed italic">
                  “Our apartment rent splits used to take 2 weeks of nagging in our WhatsApp group. Now everyone settles within 3 hours. Best friend app ever.”
                </p>
              </div>
              <div className="pt-5 mt-5 border-t border-[rgba(225,29,72,0.08)] flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-sm text-[#1C1917]">
                    Priya M.
                  </div>
                  <div className="text-xs text-[#57534E]">
                    HSR Shared Friends
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF1F2] border border-[#FECDD3]">
                  <span className="material-symbols-outlined text-[15px] text-[#E11D48]">
                    verified
                  </span>
                  <span className="font-display font-black text-xs text-[#BE123C]">
                    HSR Shared Friends
                  </span>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="p-7 rounded-2xl bg-white border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col justify-between hover:border-[#FECDD3] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-[#E11D48]">
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                    ✓ Verified Settle History
                  </span>
                </div>
                <p className="font-body text-sm sm:text-base text-[#1C1917] leading-relaxed italic">
                  “Having a 100% on-time settle record is unironically my biggest flex among friends. Nobody ever questions picking up tabs because they know it’s settled immediately.”
                </p>
              </div>
              <div className="pt-5 mt-5 border-t border-[rgba(225,29,72,0.08)] flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-sm text-[#1C1917]">
                    Dev K.
                  </div>
                  <div className="text-xs text-[#57534E]">
                    Goa Trip Co-organizer
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF1F2] border border-[#FECDD3]">
                  <span className="material-symbols-outlined text-[15px] text-[#E11D48]">
                    verified
                  </span>
                  <span className="font-display font-black text-xs text-[#BE123C]">
                    Verified Payer
                  </span>
                </div>
              </div>
            </div>

            {/* Review 4 */}
            <div className="p-7 rounded-2xl bg-white border border-[rgba(225,29,72,0.09)] soft-card-shadow flex flex-col justify-between hover:border-[#FECDD3] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-[#E11D48]">
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                    ✓ Verified Settle History
                  </span>
                </div>
                <p className="font-body text-sm sm:text-base text-[#1C1917] leading-relaxed italic">
                  “The instant UPI verification means zero fake screenshots ever again. The status is binary, verified, and clears immediately.”
                </p>
              </div>
              <div className="pt-5 mt-5 border-t border-[rgba(225,29,72,0.08)] flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-sm text-[#1C1917]">
                    Ananya R.
                  </div>
                  <div className="text-xs text-[#57534E]">
                    Weekend Trekkers Club
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF1F2] border border-[#FECDD3]">
                  <span className="material-symbols-outlined text-[15px] text-[#E11D48]">
                    verified
                  </span>
                  <span className="font-display font-black text-xs text-[#BE123C]">
                    Instant Settle
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA: FLOATING CARD OVER MILKY-ROSE RADIAL GLOW */}
        <section className="w-full px-6 sm:px-8 pb-24 relative overflow-hidden">
          {/* Milky-rose radial glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            <div className="w-[700px] h-[350px] bg-gradient-to-r from-[#FECDD3]/40 via-[#FDA4AF]/30 to-[#FFE4E6]/50 rounded-full blur-[140px]" />
          </div>

          <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-[rgba(225,29,72,0.14)] p-8 sm:p-14 soft-card-shadow text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FECDD3] mb-4">
              <span className="font-display text-xs font-bold text-[#BE123C] uppercase tracking-wider">
                Join The High-Trust Ledger
              </span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] tracking-tight max-w-2xl mx-auto leading-tight">
              Ready for clean splits with zero social friction?
            </h2>
            <p className="font-body text-base sm:text-lg text-[#57534E] max-w-xl mx-auto mt-4 leading-relaxed">
              Create your first ledger in 30 seconds. Protect friendships, eliminate awkward reminders, and automate settlements today.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-display font-bold text-sm soft-rose-glow hover:brightness-105 active:scale-95 transition-all min-h-[48px]"
                href="/login"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#FFFFFF"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#FFFFFF"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FFFFFF"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#FFFFFF"
                  />
                </svg>
                <span>Continue with Google</span>
              </Link>
              <button
                onClick={handleTryDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#FCFBF7] border border-[rgba(225,29,72,0.14)] text-[#1C1917] font-display font-bold text-sm hover:bg-[#FFF1F2] hover:text-[#E11D48] transition-all min-h-[48px] cursor-pointer"
              >
                <span>{loadingDemo ? "Opening Demo..." : "Open Sandbox Demo"}</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </button>
            </div>

            {/* Value Prop Checklist */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs font-medium text-[#57534E]">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#E11D48]">
                  check_circle
                </span>
                No payment details required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#E11D48]">
                  check_circle
                </span>
                Instant 30s onboarding
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#E11D48]">
                  check_circle
                </span>
                100% Free for friends &amp; groups
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#FAF6F0] border-t border-[rgba(225,29,72,0.08)] py-14">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="SplitScore Logo"
                  className="h-7 w-auto object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOOG1BOsniyP4hpxYj6t4fN4dXEct5dKu6avi_GqeVAmq84hTUnsTyKHSkDrrd4zEeGZWFuuzfsjSD0s56P5535AOdCiPxUuBguHKLJiBHQm-50R34HIGVgt3mw1iuvI_JA4qsYHeMZaaUHR1wgecOmPA00j2MGc1Y_NDo0Ftp_lBXYqtGfhoz2Xv2jLOEraaAQApfiKQ--9ZiVkNm1gm2ePZe_5lWvhX-HnqOjzXs"
                />
                <span className="font-display font-bold text-lg text-[#1C1917]">
                  SplitScore
                </span>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed max-w-xs">
                Editorial Split &amp; Warm Alabaster Canvas. The reputation-first shared ledger built for financial clarity without awkward reminders.
              </p>
              <div>
                <span className="px-2.5 py-1 rounded-full bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-[11px] font-semibold">
                  Smart Settle Rail
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#1C1917] mb-1">
                Product
              </h4>
              <a
                className="text-xs text-[#57534E] hover:text-[#E11D48] transition-colors"
                href="#features"
              >
                Smart Expense Split
              </a>
              <Link
                className="text-xs text-[#57534E] hover:text-[#E11D48] transition-colors"
                href="/trust-score"
              >
                Settlement Velocity
              </Link>
              <a
                className="text-xs text-[#57534E] hover:text-[#E11D48] transition-colors"
                href="#how-it-works"
              >
                Automated Settlements
              </a>
              <button
                onClick={handleTryDemo}
                className="text-xs text-[#57534E] hover:text-[#E11D48] transition-colors text-left cursor-pointer"
              >
                Interactive Sandbox
              </button>
              <Link
                className="text-xs text-[#57534E] hover:text-[#E11D48] transition-colors"
                href="/how-scoring-works"
              >
                How Scoring Works
              </Link>
              <Link
                className="text-xs text-[#57534E] hover:text-[#E11D48] transition-colors"
                href="/simulator"
              >
                Gaming Simulator
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#1C1917] mb-1">
                Company
              </h4>
              <a
                className="text-xs text-[#57534E] hover:text-[#E11D48] transition-colors"
                href="#features"
              >
                About SplitScore
              </a>
              <span className="text-xs text-[#57534E] cursor-default">
                Team Null Pointers
              </span>
              <span className="text-xs text-[#57534E] cursor-default">
                Support &amp; Contact
              </span>
              <span className="text-xs text-[#57534E] cursor-default">
                Press Kit
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#1C1917] mb-1">
                Legal &amp; Security
              </h4>
              <span className="text-xs text-[#57534E] cursor-default">
                Privacy Policy
              </span>
              <span className="text-xs text-[#57534E] cursor-default">
                Terms of Service
              </span>
              <span className="text-xs text-[#57534E] cursor-default">
                Security Standards
              </span>
              <span className="text-xs text-[#57534E] cursor-default">
                SOC2 Compliance
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-[rgba(225,29,72,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#57534E]">
              © 2026 SplitScore Inc. All rights reserved. Team Null Pointers.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-[#57534E] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#E11D48]">
                  verified_user
                </span>
                256-bit Encrypted
              </span>
              <span className="text-xs text-[#57534E] cursor-pointer hover:text-[#E11D48]">
                Terms
              </span>
              <span className="text-xs text-[#57534E] cursor-pointer hover:text-[#E11D48]">
                Privacy
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
