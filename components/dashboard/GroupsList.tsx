"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardGroup, GroupType, formatRupees } from "@/lib/data/dashboard";
import { Plus, Users, Compass, Utensils, CalendarDays, ChevronRight, UserPlus } from "lucide-react";
import { CreateGroupModal } from "@/components/group/CreateGroupModal";
import { ToastProvider } from "@/components/group/ToastContext";

interface GroupsListProps {
  groups: DashboardGroup[];
}

const groupTypeConfig: Record<
  GroupType,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  trip: {
    label: "Trip",
    bg: "#EEF2FF",
    text: "#4338CA",
    icon: Compass,
  },
  mess: {
    label: "Mess",
    bg: "#F0FDFA",
    text: "#0F766E",
    icon: Utensils,
  },
  event: {
    label: "Event",
    bg: "#FFFBEB",
    text: "#B45309",
    icon: CalendarDays,
  },
};

export function GroupsList({ groups }: GroupsListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);

  return (
    <ToastProvider>
      <section className="mt-8 mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1F1D3D]">Your Groups</h2>
            <p className="text-xs text-[#5B5B72]">
              Trips, mess bills and event costs
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg bg-[#2E2A7A] hover:bg-[#252263] text-white font-medium text-xs tracking-wide uppercase transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
          >
            <Plus className="w-4 h-4" />
            <span>Create group</span>
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E5F0] p-8 text-center shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F1F1FA] flex items-center justify-center text-[#2E2A7A] mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#1F1D3D]">No groups yet</h3>
            <p className="text-xs text-[#5B5B72] max-w-sm mx-auto mt-1 mb-5">
              Create your first group to start splitting expenses with friends.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2 rounded-lg bg-[#2E2A7A] hover:bg-[#252263] text-white font-medium text-xs uppercase tracking-wide transition-all shadow-sm"
              >
                Create Group
              </button>
              <button
                type="button"
                onClick={() => setShowJoinPrompt((prev) => !prev)}
                className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-lg border border-[#E5E5F0] hover:bg-[#F8F9FD] text-[#1F1D3D] font-medium text-xs uppercase tracking-wide transition-all shadow-sm"
              >
                Join Group
              </button>
            </div>

            {showJoinPrompt && (
              <div className="mt-4 max-w-xs mx-auto flex items-center gap-2 animate-in fade-in">
                <input
                  type="text"
                  placeholder="Enter 8-letter code"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 min-h-[40px] rounded-lg border border-[#E5E5F0] text-xs font-mono uppercase focus:outline-none focus:border-[#4338CA]"
                />
                <Link
                  href={joinCodeInput ? `/join/${joinCodeInput}` : "#"}
                  className="min-h-[40px] px-3.5 rounded-lg bg-[#4338CA] hover:bg-[#2E2A7A] text-white text-xs font-semibold uppercase flex items-center justify-center"
                >
                  Go
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {groups.map((group) => {
              const typeInfo = groupTypeConfig[group.type] || groupTypeConfig.trip;
              const TypeIcon = typeInfo.icon;

              const isOwed = group.userBalance > 0;
              const isOwing = group.userBalance < 0;

              const balanceTextColor = isOwed
                ? "text-[#15803D]"
                : isOwing
                ? "text-[#B91C1C]"
                : "text-[#5B5B72]";

              const balanceLabel = isOwed
                ? `You are owed ${formatRupees(group.userBalance)}`
                : isOwing
                ? `You owe ${formatRupees(group.userBalance)}`
                : "Settled up";

              return (
                <Link
                  key={group.id}
                  href={`/group/${group.id}`}
                  className="bg-white rounded-xl border border-[#E5E5F0] p-4.5 shadow-sm hover:border-[#4338CA] hover:shadow-md transition-all flex flex-col justify-between group min-h-[100px]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-[#1F1D3D] truncate group-hover:text-[#4338CA] transition-colors">
                          {group.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: typeInfo.bg,
                              color: typeInfo.text,
                            }}
                          >
                            <TypeIcon className="w-3 h-3" />
                            {typeInfo.label}
                          </span>
                          <span className="text-xs text-[#5B5B72] flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {group.memberCount} member{group.memberCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#5B5B72] group-hover:text-[#4338CA] group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F1F1FA] flex items-center justify-between">
                    <span className="text-xs text-[#5B5B72]">Your balance</span>
                    <span className={`text-sm font-bold ${balanceTextColor}`}>
                      {balanceLabel}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Create Group Modal */}
        <CreateGroupModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      </section>
    </ToastProvider>
  );
}
