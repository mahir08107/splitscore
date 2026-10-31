"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { TrustCard } from "@/components/trust-score/trust-card";

const metrics = [
  { value: "₹50", label: "MIN AMOUNT", detail: "Noise filtered" },
  { value: "30d", label: "TIME DECAY", detail: "Recent behavior counts" },
  { value: "−50", label: "LOOP DETECTION", detail: "Ring fraud penalty" },
];

export default function LandingPage() {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTryDemo = () => {
    setLoadingDemo(true);
    document.cookie = "demo_mode=true; path=/; max-age=86400; SameSite=Lax";
    window.location.href = "/api/demo";
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#0A0C10] text-white selection:bg-[#5BC5A7]/30 selection:text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-700/50 bg-[#0A0C10]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="SplitScore home" className="flex items-center gap-2">
            <Image src="/logo.png" alt="SplitScore" width={140} height={28} className="h-7 w-[140px] object-cover" />
          </Link>
          <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 md:flex">
            <a className="transition-colors hover:text-[#5BC5A7]" href="#home">Home</a>
            <a className="transition-colors hover:text-[#5BC5A7]" href="#features">Features</a>
            <Link className="transition-colors hover:text-[#5BC5A7]" href="/trust-score">Trust Score</Link>
            <Link className="transition-colors hover:text-[#5BC5A7]" href="/simulator">Simulator</Link>
          </nav>
          <div className="hidden items-center gap-5 md:flex">
            <Link href="/login" className="text-sm text-gray-300 transition-colors hover:text-white">Login</Link>
            <Link href="/signup" className="rounded-md border border-[#5BC5A7]/70 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-[#5BC5A7] hover:bg-[#5BC5A7]/10 active:scale-95">Sign Up</Link>
          </div>
          <button className="rounded-md border border-slate-700 p-2 text-gray-200 md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && <nav className="grid gap-1 border-t border-slate-700/60 bg-[#0A0C10] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-300 md:hidden">
          <a onClick={() => setMenuOpen(false)} className="rounded px-3 py-3 hover:bg-slate-800" href="#home">Home</a>
          <a onClick={() => setMenuOpen(false)} className="rounded px-3 py-3 hover:bg-slate-800" href="#features">Features</a>
          <Link onClick={() => setMenuOpen(false)} className="rounded px-3 py-3 hover:bg-slate-800" href="/trust-score">Trust Score</Link>
          <Link onClick={() => setMenuOpen(false)} className="rounded px-3 py-3 hover:bg-slate-800" href="/simulator">Simulator</Link>
          <div className="mt-2 flex gap-3 border-t border-slate-800 pt-3"><Link href="/login" className="px-3 py-2">Login</Link><Link href="/signup" className="rounded border border-[#5BC5A7] px-3 py-2 text-[#5BC5A7]">Sign Up</Link></div>
        </nav>}
      </header>

      <main id="home" className="pt-[72px]">
        <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.95fr_1.05fr] lg:gap-4 lg:py-28">
          <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#5BC5A7]/10 blur-[130px]" />
          <div className="relative z-10">
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#5BC5A7]">Exclusive financial engine</p>
            <h1 className="max-w-2xl font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">SPLIT FAIR.<br />SCORE FAIR.</h1>
            <p className="mt-6 text-xl font-semibold text-gray-200">Dominate your group expenses.</p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">Engineered for students. Built for trust. Experience peer-to-peer accountability, global netting, and zero-touch expense tracking.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#features" className="group inline-flex min-h-12 items-center gap-3 rounded-md border border-[#5BC5A7] px-6 text-xs font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-[#5BC5A7]/10 hover:shadow-[0_0_25px_rgba(91,197,167,0.22)] active:scale-95">Explore now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
              <button onClick={handleTryDemo} className="min-h-12 rounded-md px-5 text-xs font-semibold uppercase tracking-wider text-gray-400 transition-colors hover:text-white active:scale-95">{loadingDemo ? "Opening demo…" : "Try live demo"}</button>
            </div>
          </div>
          <div className="relative flex min-h-[300px] items-center justify-center py-3 sm:min-h-[390px]">
            <div className="absolute h-56 w-56 rounded-full bg-[#5BC5A7]/15 blur-[100px] sm:h-80 sm:w-80" />
            <div className="relative z-10 w-full max-w-[480px] -rotate-2 transition-transform duration-700 hover:rotate-0 hover:scale-[1.025]">
              <TrustCard interactive={false} score={750} band="Good" userName="ALEX MORGAN" confidenceLabel="VERIFIED TRUST PROFILE" stats={{ activeGroupsCount: 4, completedSettlementsCount: 12, networkSize: 8 }} />
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#5BC5A7]">Built for accountability</p><h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">The trust engine, at a glance</h2></div>
            <Link href="/how-scoring-works" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-[#5BC5A7]">Explore the methodology →</Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-xl border border-slate-700/70 bg-slate-900/30 p-5 transition-colors hover:border-[#5BC5A7]/50 sm:p-7">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300">Advanced anti-gaming system</h3>
              <div className="mt-6 grid grid-cols-3 divide-x divide-slate-700/70">
                {metrics.map((metric) => <div key={metric.label} className="px-3 first:pl-0 last:pr-0"><div className="font-mono text-2xl font-bold text-[#5BC5A7] sm:text-3xl">{metric.value}</div><div className="mt-2 text-[9px] font-bold tracking-widest text-gray-300 sm:text-[10px]">{metric.label}</div><div className="mt-1 hidden text-[10px] text-gray-500 sm:block">{metric.detail}</div></div>)}
              </div>
            </article>
            <article className="rounded-xl border border-slate-700/70 bg-slate-900/30 p-5 transition-colors hover:border-[#5BC5A7]/50 sm:p-7">
              <div className="flex items-center justify-between gap-3"><h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300">Trust performance</h3><span className="text-[9px] uppercase tracking-widest text-gray-600">Sample metrics</span></div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[{ value: "94%", label: "ON-TIME RATE" }, { value: "0.4d", label: "AVG. DELAY" }, { value: "120", label: "NETWORK" }].map((stat) => <div key={stat.label} className="rounded-lg border border-slate-800 bg-black/30 p-3 sm:p-4"><div className="font-mono text-2xl font-bold text-white sm:text-3xl">{stat.value}</div><div className="mt-2 text-[9px] font-bold tracking-widest text-gray-500">{stat.label}</div></div>)}
              </div>
            </article>
            <article className="rounded-xl border border-slate-700/70 bg-slate-900/30 p-5 transition-colors hover:border-[#5BC5A7]/50 sm:p-7 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300">Benchmark performance</h3><p className="mt-1 text-xs text-gray-500">Illustrative concept · cross-group netting is in development</p></div><span className="rounded border border-[#5BC5A7]/30 px-2 py-1 font-mono text-[10px] text-[#5BC5A7]">CONCEPT PREVIEW</span></div>
              <div className="mt-7 space-y-5">
                <div className="grid grid-cols-[92px_1fr] items-center gap-3 text-[10px] sm:grid-cols-[140px_1fr] sm:text-xs"><span className="text-gray-400">Separate balances</span><div className="h-3 rounded-sm bg-slate-800"><div className="h-full w-[86%] rounded-sm bg-slate-500" /></div></div>
                <div className="grid grid-cols-[92px_1fr] items-center gap-3 text-[10px] sm:grid-cols-[140px_1fr] sm:text-xs"><span className="text-gray-200">Netting concept</span><div className="h-3 rounded-sm bg-slate-800"><div className="h-full w-[34%] rounded-sm bg-[#5BC5A7] shadow-[0_0_14px_rgba(91,197,167,0.35)]" /></div></div>
              </div>
            </article>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="mb-7 max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#5BC5A7]">More than an expense tracker</p>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Shared expenses become a record of trust.</h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">SplitScore helps student groups keep a clear ledger, settle what they owe, and build a verified payment history together.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-slate-700/70 bg-[#0D1117] p-5 sm:p-6 transition-colors hover:border-[#5BC5A7]/50">
              <span className="font-mono text-xs font-bold tracking-widest text-[#5BC5A7]">01 / RECORD</span>
              <h3 className="mt-4 text-base font-bold text-white">One shared ledger</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">Add group expenses manually or scan a receipt. Assign the payer, choose who shared each item, and keep the split visible to everyone.</p>
            </article>
            <article className="rounded-xl border border-slate-700/70 bg-[#0D1117] p-5 sm:p-6 transition-colors hover:border-[#5BC5A7]/50">
              <span className="font-mono text-xs font-bold tracking-widest text-[#5BC5A7]">02 / SETTLE</span>
              <h3 className="mt-4 text-base font-bold text-white">Clear, fair balances</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">See who owes whom, simplify repayments within a group, and confirm a settlement so the shared record stays accurate.</p>
            </article>
            <article className="rounded-xl border border-slate-700/70 bg-[#0D1117] p-5 sm:p-6 transition-colors hover:border-[#5BC5A7]/50">
              <span className="font-mono text-xs font-bold tracking-widest text-[#5BC5A7]">03 / BUILD TRUST</span>
              <h3 className="mt-4 text-base font-bold text-white">A score grounded in behavior</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">Confirmed on-time repayments can improve a member’s trust score. Minimum thresholds, time decay, diversity limits, and loop detection help resist score farming.</p>
            </article>
          </div>
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-800 bg-black/20 px-4 py-3 text-xs leading-5 text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Receipt images are processed for item details and are not retained as group attachments.</span>
            <Link href="/how-scoring-works" className="shrink-0 font-semibold text-[#5BC5A7] hover:text-[#9BE7D0]">Read how scoring works →</Link>
          </div>
        </section>

        <section className="border-y border-slate-800 bg-[#0D1117] px-5 py-14 text-center sm:py-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#5BC5A7]">Make every split count</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">The ultimate tool for group finances.</h2>
          <Link href="/signup" className="mt-7 inline-flex min-h-12 items-center rounded-md bg-[#5BC5A7] px-7 text-xs font-extrabold uppercase tracking-[0.15em] text-black transition-all hover:bg-[#79d9bd] active:scale-95">Start splitting now <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </section>
      </main>
      <footer className="border-t border-slate-800 px-5 py-6 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-gray-500 sm:flex-row"><Link href="/" aria-label="SplitScore" className="flex items-center"><Image src="/logo.png" alt="SplitScore" width={140} height={28} className="h-7 w-[140px] object-cover" /></Link><div className="flex items-center gap-5"><a href="https://instagram.com" aria-label="Instagram" className="hover:text-[#5BC5A7]"><svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r=".8" fill="currentColor"/></svg></a><a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-[#5BC5A7]"><svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="currentColor"><path d="M5.2 3.5a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.4 9.5H7v11H3.4zM9 9.5h3.4V11h.1a3.7 3.7 0 0 1 3.3-1.8c3.5 0 4.2 2.3 4.2 5.2v6.1h-3.6v-5.4c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.5H9z"/></svg></a><a href="https://github.com" aria-label="GitHub" className="hover:text-[#5BC5A7]"><svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="currentColor"><path d="M12 .9a11.1 11.1 0 0 0-3.5 21.6c.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.6-1.3-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.3.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.3.8 1 .8 2v3.2c0 .3.2.7.8.6A11.1 11.1 0 0 0 12 .9Z"/></svg></a></div><div className="flex gap-4"><Link href="/how-scoring-works" className="hover:text-gray-200">Methodology</Link><Link href="/login" className="hover:text-gray-200">Login</Link><Link href="/signup" className="hover:text-gray-200">Sign up</Link></div></div><p className="mx-auto mt-4 max-w-7xl text-center text-[10px] text-gray-600">© {new Date().getFullYear()} SplitScore. Split fair. Score fair.</p></footer>
    </div>
  );
}
