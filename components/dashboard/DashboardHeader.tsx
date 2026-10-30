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
    <header className="w-full bg-white border-b border-[#E5E5F0] sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-decoration-none group min-h-[44px] flex items-center"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2E2A7A] flex items-center justify-center text-white font-bold text-base shadow-sm">
              S
            </div>
            <span className="font-bold text-xl tracking-tight text-[#1F1D3D]">
              SplitScore
            </span>
          </Link>
        </div>

        {/* Right side navigation & profile */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/trust-score"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#4338CA] hover:bg-[#F1F1FA] transition-colors min-h-[44px]"
          >
            <ShieldCheck className="w-4 h-4 text-[#4338CA]" />
            <span className="hidden sm:inline">My Trust Score</span>
            <span className="sm:hidden">Trust Score</span>
          </Link>

          {/* User Profile / Avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#E5E5F0]">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-[#E5E5F0]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#2E2A7A] text-white flex items-center justify-center font-semibold text-sm shadow-inner">
                {initials}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-[#1F1D3D] leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-[#5B5B72] truncate max-w-[120px]">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
