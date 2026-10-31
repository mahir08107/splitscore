"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardGroup, GroupType, formatRupees } from "@/lib/data/dashboard";
import { Plus, Users, Compass, Utensils, CalendarDays, ChevronRight } from "lucide-react";
import { CreateGroupModal } from "@/components/group/CreateGroupModal";
import { ToastProvider } from "@/components/group/ToastContext";

interface GroupsListProps {
  groups: DashboardGroup[];
}

const groupTypeConfig: Record<
  GroupType,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  trip: {
    label: "Trip",
    bg: "#FFF1F2",
    text: "#BE123C",
    border: "#FECDD3",
    icon: Compass,
  },
  mess: {
    label: "Mess",
    bg: "#F0FDFA",
    text: "#0F766E",
    border: "#99F6E4",
    icon: Utensils,
  },
  event: {
    label: "Event",
    bg: "#FFFBEB",
    text: "#B45309",
    border: "#FDE68A",
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
            <h2 className="font-display font-bold text-lg text-[#1C1917]">Your Groups</h2>
            <p className="text-xs text-[#57534E] font-medium mt-0.5">
              Trips, mess bills and event costs
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:shadow-lg hover:shadow-[#E11D48]/25 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create group</span>
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] soft-card-shadow p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-display text-base font-bold text-[#1C1917]">No groups yet</h3>
            <p className="text-xs text-[#57534E] max-w-sm mx-auto mt-1 mb-5 font-medium leading-relaxed">
              Create your first group to start splitting expenses with friends.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center justify-center min-h-[42px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:shadow-lg hover:shadow-[#E11D48]/25 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
              >
                Create Group
              </button>
              <button
                type="button"
                onClick={() => setShowJoinPrompt((prev) => !prev)}
                className="inline-flex items-center justify-center min-h-[42px] px-4 py-2 rounded-xl border border-[rgba(225,29,72,0.14)] bg-white hover:bg-[#FFF1F2] hover:text-[#E11D48] text-[#1C1917] font-semibold text-xs uppercase tracking-wider transition-all shadow-sm"
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
                  className="w-full px-3.5 py-2 min-h-[40px] rounded-xl border border-[rgba(225,29,72,0.14)] text-xs font-mono uppercase focus:outline-none focus:border-[#E11D48]"
                />
                <Link
                  href={joinCodeInput ? `/join/${joinCodeInput}` : "#"}
                  className="min-h-[40px] px-4 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white text-xs font-bold uppercase flex items-center justify-center hover:shadow-md transition-all"
                >
                  Go
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => {
              const typeInfo = groupTypeConfig[group.type] || groupTypeConfig.trip;
              const TypeIcon = typeInfo.icon;

              const isOwed = group.userBalance > 0;
              const isOwing = group.userBalance < 0;

              const balanceTextColor = isOwed
                ? "text-[#15803D]"
                : isOwing
                ? "text-[#BE123C]"
                : "text-[#57534E]";

              const balanceLabel = isOwed
                ? `You are owed ${formatRupees(group.userBalance)}`
                : isOwing
                ? `You owe ${formatRupees(group.userBalance)}`
                : "Settled up";

              return (
                <Link
                  key={group.id}
                  href={`/group/${group.id}`}
                  className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] soft-card-shadow p-5 hover:border-[#FECDD3] hover:shadow-md transition-all flex flex-col justify-between group min-h-[110px]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base font-bold text-[#1C1917] truncate group-hover:text-[#E11D48] transition-colors">
                          {group.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: typeInfo.bg,
                              color: typeInfo.text,
                              borderColor: typeInfo.border,
                            }}
                          >
                            <TypeIcon className="w-3 h-3" />
                            {typeInfo.label}
                          </span>
                          <span className="text-xs text-[#57534E] flex items-center gap-1 font-medium">
                            <Users className="w-3.5 h-3.5 opacity-60" />
                            {group.memberCount} member{group.memberCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#57534E] group-hover:text-[#E11D48] group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[rgba(225,29,72,0.06)] flex items-center justify-between">
                    <span className="text-xs text-[#57534E] font-medium">Your balance</span>
                    <span className={`font-display text-sm font-bold ${balanceTextColor}`}>
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
