import React from "react";
import Link from "next/link";
import { UserProfile } from "@/lib/data/dashboard";
import { ShieldCheck } from "lucide-react";

interface DashboardHeaderProps {
  user: UserProfile;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  // First letter for avatar fallback
  const initials = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="w-full bg-[#FCFBF7]/90 backdrop-blur-md border-b hairline-rose-border sticky top-0 z-30 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-decoration-none group min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] rounded-xl"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#BE123C] flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-[#E11D48]/20">
              S
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-[#1C1917]">
              SplitScore
            </span>
          </Link>
        </div>

        {/* Right side navigation & profile */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/trust-score"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#E11D48] hover:bg-[#FFF1F2] border border-[rgba(225,29,72,0.12)] transition-all min-h-[44px]"
          >
            <ShieldCheck className="w-4 h-4 text-[#E11D48]" />
            <span className="hidden sm:inline">My Trust Score</span>
            <span className="sm:hidden">Trust Score</span>
          </Link>

          {/* User Profile / Avatar */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-[rgba(225,29,72,0.14)]">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-[#FECDD3]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E11D48] to-[#BE123C] text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-[#E11D48]/20">
                {initials}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-[#1C1917] leading-tight font-display">
                {user.name}
              </p>
              <p className="text-xs text-[#57534E] truncate max-w-[120px]">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
