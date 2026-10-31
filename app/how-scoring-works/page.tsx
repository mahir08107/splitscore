import Link from "next/link";
import { Header } from "@/components/layout/Header";
import {
  Shield,
  ShieldCheck,
  Clock,
  Timer,
  BadgePercent,
  Repeat,
  Users,
  AlertTriangle,
  Flame,
  Scale,
  Maximize2,
  Lock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

export const metadata = {
  title: "How Scoring Works — SplitScore",
  description:
    "Explore SplitScore's mathematical trust engine, 5 core repayment inputs, and 9 robust anti-gaming defense mechanisms designed for student groups.",
};

export default function HowScoringWorksPage() {
  const inputs = [
    {
      icon: Clock,
      title: "1. On-Time Repayment Rate",
      weight: "35% Weight",
      color: "#15803D",
      bgColor: "#F0FDF4",
      desc: "The percentage of shared settlements marked and confirmed on or before the agreed due date. Consistently honoring payment deadlines is the strongest foundation of peer reliability.",
    },
    {
      icon: Timer,
      title: "2. Average Delay",
      weight: "20% Weight",
      color: "#0F766E",
      bgColor: "#F0FDFA",
      desc: "Measures the average number of days past the due date when repayments are delayed. Settling 1 day late incurs only a slight nudge, while lagging for weeks causes steep score drops.",
    },
    {
      icon: BadgePercent,
      title: "3. Amount Reliability",
      weight: "20% Weight",
      color: "#E11D48",
      bgColor: "#FFF1F2",
      desc: "The ratio of total rupees owed that are successfully settled versus outstanding obligations. Repaying a high-stakes ₹2,500 trip share demonstrates higher commitment than clearing a ₹20 snack.",
    },
    {
      icon: Repeat,
      title: "4. Repayment Consistency",
      weight: "15% Weight",
      color: "#7C3AED",
      bgColor: "#F5F3FF",
      desc: "Tracks uninterrupted streaks of timely repayments. A user who pays punctually across 6 consecutive months earns higher trust than someone with erratic bursts of activity.",
    },
    {
      icon: Users,
      title: "5. Counterparty Diversity",
      weight: "10% Weight",
      color: "#0F766E",
      bgColor: "#F0FDFA",
      desc: "The count of distinct group members who have verified repayments from you. Proves financial reliability across multiple peer circles rather than within an isolated echo chamber.",
    },
  ];

  const antiGamingRules = [
    {
      num: 1,
      name: "Time Decay",
      icon: Clock,
      tag: "Recency Bias",
      desc: "Recent behavior carries substantially more weight than historical settlements. Good habits today gradually repair old mistakes.",
      example:
        "A missed payment from four months ago will gradually fade as you maintain steady, on-time repayments this month.",
    },
    {
      num: 2,
      name: "Amount Weighting",
      icon: Scale,
      tag: "Proportional Impact",
      desc: "Clearing a high-value debt proves significant solvency and intent, while trivial micro-debts contribute marginal score adjustments.",
      example:
        "Clearing a ₹2,000 hotel room share counts significantly more toward your reputation than settling a ₹15 chai bill.",
    },
    {
      num: 3,
      name: "Mutual Confirmation",
      icon: ShieldCheck,
      tag: "Dual Verification",
      desc: "Unilateral declarations do not alter scores. Repayments only award points once the receiving friend acknowledges receipt.",
      example:
        "Marking 'I Paid' will not increase your score until the receiver explicitly clicks 'Confirm Received'.",
    },
    {
      num: 4,
      name: "Counterparty Diversity",
      icon: Users,
      tag: "Sybil Defense",
      desc: "Repeated payments between the same pair yield progressively diminished returns to eliminate artificial point-farming.",
      example:
        "Two friends repeatedly sending ₹500 back and forth will see score gains quickly drop to zero after the second transaction.",
    },
    {
      num: 5,
      name: "Minimum Amount Threshold",
      icon: BadgePercent,
      tag: "Spam Filter",
      desc: "Transactions under ₹50 are deemed casual micro-transfers and do not trigger positive score adjustments.",
      example:
        "Two friends sending ₹10 back and forth will not increase their scores due to the Minimum Amount and Counterparty Diversity rules.",
    },
    {
      num: 6,
      name: "Weekly Growth Cap",
      icon: Maximize2,
      tag: "Velocity Limit",
      desc: "A hard ceiling restricts the maximum points a profile can gain within any rolling 7-day period (maximum +30 points).",
      example:
        "Settling ten large bills on the same weekend will still cap your weekly score increase to prevent artificial reputation spikes.",
    },
    {
      num: 7,
      name: "Bigger Penalty Than Reward",
      icon: AlertTriangle,
      tag: "Asymmetry",
      desc: "Defaulting or chronic delays penalize scores more severely than prompt settlements reward them. Trust takes weeks to build and moments to lose.",
      example:
        "An on-time payment adds +8 points, but delaying payment by two weeks or having a settlement disputed docks -25 points.",
    },
    {
      num: 8,
      name: "Cold Start Protection",
      icon: Sparkles,
      tag: "Neutral Baseline",
      desc: "New accounts start at a neutral 500 base score with a Low Confidence badge, preventing unverified profiles from claiming perfect standing.",
      example:
        "A brand new account starts at 500 with 'Building' status until at least 3 distinct friends verify settlements.",
    },
    {
      num: 9,
      name: "Loop Detection",
      icon: Repeat,
      tag: "Graph Analysis",
      desc: "Circular transaction rings (User A pays B, B pays C, C pays A) are automatically identified and excluded from score accrual.",
      example:
        "Three roommates creating circular ₹1,000 debts that cancel each other out are flagged and granted zero score points.",
    },
  ];

  const bands = [
    {
      name: "Excellent",
      range: "800 – 900",
      color: "#15803D",
      bgColor: "#F0FDF4",
      borderColor: "#BBF7D0",
      desc: "Consistently on time across multiple groups. Ideal for high-stakes trips and long-term apartment leases.",
    },
    {
      name: "Good",
      range: "650 – 799",
      color: "#0F766E",
      bgColor: "#F0FDFA",
      borderColor: "#99F6E4",
      desc: "Reliable payer with dependable settlement habits and active friend verifications.",
    },
    {
      name: "Building",
      range: "500 – 649",
      color: "#B45309",
      bgColor: "#FFFBEB",
      borderColor: "#FDE68A",
      desc: "New members or those with sporadic settlement histories establishing initial trustworthiness.",
    },
    {
      name: "Risky",
      range: "0 – 499",
      color: "#B91C1C",
      bgColor: "#FEF2F2",
      borderColor: "#FECACA",
      desc: "Frequent overdue balances, unresolved payment disputes, or chronic delays.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF7] flex flex-col">
      <Header showBackToHome={true} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-10 my-4">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl border border-[rgba(225,29,72,0.09)] p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0F766E] mb-3">
            <Shield className="w-4 h-4" />
            <span>Problem Statement 6 • Fintech Reputation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#BE123C] tracking-tight mb-4">
            How SplitScore Works
          </h1>

          <p className="text-base sm:text-lg text-[#1C1917] font-medium leading-relaxed max-w-3xl mb-3">
            A CIBIL score for student friendships. Everyone knows who owes money. Nobody knows who pays back.
          </p>

          <p className="text-sm sm:text-base text-[#57534E] leading-relaxed max-w-3xl mb-6">
            Traditional expense splitters merely track running balances. SplitScore turns confirmed settlement behavior into a lightweight, portable trust score that follows students across trips, mess halls, and shared flats.
          </p>

          {/* Quick Nav Badges */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <a
              href="#inputs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FCFBF7] text-[#BE123C] hover:bg-[rgba(225,29,72,0.09)] transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-[#E11D48]" />
              5 Score Inputs
            </a>
            <a
              href="#defenses"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FCFBF7] text-[#0F766E] hover:bg-[rgba(225,29,72,0.09)] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
              9 Anti-Gaming Defenses
            </a>
            <a
              href="#bands"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FCFBF7] text-[#B45309] hover:bg-[rgba(225,29,72,0.09)] transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#B45309]" />
              Score Bands
            </a>
            <Link
              href="/simulator"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E11D48] text-white hover:bg-gradient-to-r from-[#E11D48] to-[#BE123C] transition-colors ml-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Simulator
            </Link>
          </div>
        </div>

        {/* Section 1: The 5 Scoring Inputs */}
        <section id="inputs" className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#E11D48] mb-1">
              <span>Section 1</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1C1917]">
              The 5 Core Scoring Inputs
            </h2>
            <p className="text-sm text-[#57534E]">
              Every confirmed payment feeds into these five mathematical factors to calculate your net score.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inputs.map((input, idx) => {
              const Icon = input.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-5 shadow-sm flex flex-col justify-between hover:border-[#E11D48]/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: input.bgColor }}
                      >
                        <Icon className="w-5 h-5" style={{ color: input.color }} />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FCFBF7] text-[#57534E]">
                        {input.weight}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#1C1917] mb-2">
                      {input.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                      {input.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: 9 Anti-Gaming Defenses */}
        <section id="defenses" className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0F766E] mb-1">
              <span>Section 2</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1C1917]">
              9 Anti-Gaming Defenses
            </h2>
            <p className="text-sm text-[#57534E]">
              Reputation systems fail when users can game them. Here is how SplitScore mathematically thwarts fraud and collusion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {antiGamingRules.map((rule) => {
              const Icon = rule.icon;
              return (
                <div
                  key={rule.num}
                  className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white flex items-center justify-center text-xs font-bold">
                        {rule.num}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0F766E]/10 text-[#0F766E]">
                        {rule.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#1C1917] mb-1.5">
                      {rule.name}
                    </h3>

                    <p className="text-xs text-[#57534E] leading-relaxed mb-4">
                      {rule.desc}
                    </p>
                  </div>

                  {/* Practical Example Box */}
                  <div className="bg-[#F8F8FC] rounded-xl p-3 border border-[rgba(225,29,72,0.09)] text-xs">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#E11D48] mb-1">
                      Practical Example
                    </span>
                    <p className="text-[#1C1917] leading-normal italic text-[11px]">
                      "{rule.example}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Reputation Bands */}
        <section id="bands" className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#B45309] mb-1">
              <span>Section 3</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1C1917]">
              Score Bands & Interpretation
            </h2>
            <p className="text-sm text-[#57534E]">
              Every user falls into one of four calibrated bands based on verified repayment history.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bands.map((band) => (
              <div
                key={band.name}
                className="rounded-2xl p-5 border shadow-sm flex flex-col justify-between"
                style={{
                  backgroundColor: band.bgColor,
                  borderColor: band.borderColor,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${band.color}20`,
                        color: band.color,
                      }}
                    >
                      {band.name}
                    </span>
                  </div>
                  <p
                    className="text-2xl font-extrabold tracking-tight mb-2"
                    style={{ color: band.color }}
                  >
                    {band.range}
                  </p>
                  <p className="text-xs text-[#1C1917] leading-relaxed">
                    {band.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Live Demo CTA */}
        <div className="bg-gradient-to-br from-[#BE123C] to-[#1C1917] rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#99F6E4] bg-white/10 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
              Designed for Hackathon Judges
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Try the Anti-Gaming Simulator
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              Simulate fraud attempts in real time — see how our scoring engine neutralizes circular repayment loops, fake ₹10 micro-splits, and points farming.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/simulator"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 text-sm font-bold text-[#BE123C] bg-white hover:bg-[#FCFBF7] rounded-xl transition-all shadow-md active:scale-95 text-center"
            >
              Open Simulator
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
            <Link
              href="/trust-score"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all text-center"
            >
              My Trust Score
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full text-center text-xs text-[#57534E] py-8 border-t border-[rgba(225,29,72,0.09)]">
        <p>Team Null Pointers • Split fair. Score fair.</p>
      </footer>
    </div>
  );
}
