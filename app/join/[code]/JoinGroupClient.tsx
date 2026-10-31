"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { joinGroupByCode } from "@/lib/group/service";
import { Users, Compass, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

interface JoinGroupClientProps {
  inviteCode: string;
  groupName: string;
  memberCount: number;
  groupId: string;
  isAlreadyMember: boolean;
  isAuthenticated: boolean;
  currentUserId: string;
  isDemo: boolean;
}

export function JoinGroupClient({
  inviteCode,
  groupName,
  memberCount,
  groupId,
  isAlreadyMember,
  isAuthenticated,
  currentUserId,
  isDemo,
}: JoinGroupClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await joinGroupByCode(inviteCode, currentUserId, isDemo);
      if (res.success && res.groupId) {
        router.push(`/group/${res.groupId}`);
      } else {
        setError(res.error || "Unable to join group.");
        setLoading(false);
      }
    } catch {
      setError("An unexpected error occurred while joining.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar */}
      <div className="w-full max-w-md mx-auto pt-4 sm:pt-8 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#2E2A7A] font-bold text-lg tracking-tight"
        >
          <div className="w-8 h-8 rounded-lg bg-[#2E2A7A] flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <span>SplitScore</span>
        </Link>
      </div>

      {/* Main Join Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white rounded-2xl border border-[#E5E5F0] p-6 sm:p-8 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EEF2FF] text-[#4338CA] flex items-center justify-center mb-4">
            <Compass className="w-7 h-7" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-[#4338CA] bg-[#EEF2FF] px-3 py-1 rounded-full">
            Group Invitation
          </span>

          <h1 className="text-2xl font-extrabold text-[#1F1D3D] mt-3 mb-1">
            {groupName}
          </h1>

          <p className="text-xs text-[#5B5B72] flex items-center justify-center gap-1.5 mb-6">
            <Users className="w-3.5 h-3.5 text-[#5B5B72]" />
            <span>{memberCount} active member{memberCount !== 1 ? "s" : ""}</span>
          </p>

          {error && (
            <div
              role="alert"
              className="mb-5 p-3 bg-red-50 border border-[#FECACA] rounded-xl text-xs text-[#B91C1C] flex items-center gap-2 text-left"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isAlreadyMember ? (
            <div className="space-y-4">
              <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-xs text-[#15803D] flex items-center justify-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>You are already a member of this group.</span>
              </div>

              <Link
                href={`/group/${groupId}`}
                className="w-full min-h-[48px] px-5 py-2.5 rounded-xl bg-[#2E2A7A] hover:bg-[#252263] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>Go to Group Page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-xs text-[#5B5B72] leading-relaxed">
                You will be able to view expenses, split bills, and settle payments with this group.
              </p>

              <button
                type="button"
                onClick={handleJoin}
                disabled={loading}
                className="w-full min-h-[48px] px-5 py-2.5 rounded-xl bg-[#2E2A7A] hover:bg-[#252263] text-white font-semibold text-sm flex items-center justify-center transition-colors shadow-sm disabled:opacity-60"
              >
                {loading ? "Joining Group..." : "Join Group"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#5B5B72] leading-relaxed mb-4">
                You need an account to join this group. Sign in, create an account, or continue with demo mode.
              </p>

              <Link
                href={`/login?redirect=/join/${inviteCode}`}
                className="w-full min-h-[48px] px-5 py-2.5 rounded-xl bg-[#2E2A7A] hover:bg-[#23205E] text-white font-semibold text-sm flex items-center justify-center transition-colors shadow-sm"
              >
                Sign In to Join
              </Link>

              <Link
                href={`/signup`}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white font-semibold text-xs flex items-center justify-center transition-colors shadow-sm"
              >
                Create Account
              </Link>

              <a
                href={`/api/demo`}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#F1F1FA] hover:bg-[#E5E5F5] text-[#2E2A7A] font-semibold text-xs flex items-center justify-center border border-[#E0E0F0] transition-colors"
              >
                Try Demo
              </a>
            </div>
          )}
        </div>
      </div>

      <footer className="w-full max-w-md mx-auto text-center text-xs text-[#5B5B72] pb-4">
        <p>SplitScore — Split fair. Score fair.</p>
      </footer>
    </div>
  );
}
