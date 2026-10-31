import React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserProfile } from "@/lib/data/dashboard";
import { ShieldCheck, Home, FlaskConical } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";

interface DashboardHeaderProps {
  user: UserProfile;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  // First letter for avatar fallback
  const initials = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-700/60 bg-[#0A0C10]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-decoration-none group min-h-[44px] flex items-center"
          >
            <Image src="/logo.png" alt="SplitScore" width={140} height={28} className="h-7 w-[140px] object-cover" />
          </Link>
        </div>

        {/* Right side navigation & profile */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-slate-800/60 hover:text-white transition-colors min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            href="/trust-score"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#5BC5A7] hover:bg-slate-800/60 transition-colors min-h-[44px]"
          >
            <ShieldCheck className="w-4 h-4 text-[#5BC5A7]" />
            <span className="hidden sm:inline">Trust Score</span>
          </Link>
          <Link
            href="/simulator"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-slate-800/60 hover:text-[#5BC5A7] transition-colors min-h-[44px]"
          >
            <FlaskConical className="w-4 h-4 text-[#5BC5A7]" />
            <span className="hidden sm:inline">Simulator</span>
          </Link>

          {/* User Profile / Avatar */}
          <details className="group relative pl-2 border-l border-slate-700/70">
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-slate-800/50 [&::-webkit-details-marker]:hidden">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-600"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#5BC5A7]/15 text-[#5BC5A7] border border-[#5BC5A7]/30 flex items-center justify-center font-semibold text-sm shadow-inner">
                {initials}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-white leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[120px]">
                {user.email}
              </p>
            </div>
              <span className="text-xs text-gray-500 transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="absolute right-0 top-full mt-2 min-w-52 rounded-lg border border-slate-700 bg-[#10151C] p-3 shadow-xl">
              <p className="truncate px-2 pb-2 text-xs text-gray-400">{user.email}</p>
              <SignOutButton isDemo={user.id === "00000000-0000-0000-0000-000000000000"} />
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
