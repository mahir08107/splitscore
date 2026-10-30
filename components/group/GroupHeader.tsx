"use client";

import React from "react";
import Link from "next/link";
import { GroupModel, MemberRole } from "@/lib/group/types";
import {
  Compass,
  Utensils,
  CalendarDays,
  Users,
  Calendar,
  Settings,
  UserPlus,
  Plus,
  ChevronRight,
} from "lucide-react";
import { GroupType } from "@/lib/data/dashboard";

interface GroupHeaderProps {
  group: GroupModel;
  memberCount: number;
  currentUserRole: MemberRole;
  onOpenInvite: () => void;
  onOpenSettings: () => void;
}

const typeConfig: Record<
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

export function GroupHeader({
  group,
  memberCount,
  currentUserRole,
  onOpenInvite,
  onOpenSettings,
}: GroupHeaderProps) {
  const currentType = typeConfig[group.type] || typeConfig.trip;
  const TypeIcon = currentType.icon;

  const formattedDate = new Date(group.created_at).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mb-6">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex items-center gap-1.5 text-xs text-[#5B5B72]">
          <li>
            <Link
              href="/dashboard"
              className="hover:text-[#4338CA] transition-colors"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </li>
          <li>
            <Link
              href="/dashboard"
              className="hover:text-[#4338CA] transition-colors"
            >
              Your Groups
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </li>
          <li className="font-semibold text-[#1F1D3D] truncate max-w-[200px] sm:max-w-none">
            {group.name}
          </li>
        </ol>
      </nav>

      {/* 2. Title & Action Buttons Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1D3D] tracking-tight">
            {group.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#5B5B72] mt-1 max-w-xl">
            {group.description ||
              "Manage shared expenses, track balances and keep your group financially organised."}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenInvite}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg border border-[#E5E5F0] bg-white hover:bg-[#F1F1FA] text-[#1F1D3D] font-semibold text-xs uppercase tracking-wide transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
          >
            <UserPlus className="w-4 h-4 text-[#4338CA]" />
            <span>Invite Members</span>
          </button>

          <Link
            href={`/group/${group.id}/add-expense`}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#2E2A7A] hover:bg-[#252263] text-white font-semibold text-xs uppercase tracking-wide transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {/* 3. Metadata strip: Type Badge, Member Count, Created Date, Settings */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Group Type Badge */}
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: currentType.bg,
              color: currentType.text,
            }}
          >
            <TypeIcon className="w-3.5 h-3.5" />
            <span>{currentType.label}</span>
          </span>

          {/* Member Count */}
          <span className="inline-flex items-center gap-1 text-xs text-[#5B5B72]">
            <Users className="w-3.5 h-3.5" />
            <span>
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </span>
          </span>

          {/* Creation Date */}
          <span className="inline-flex items-center gap-1 text-xs text-[#5B5B72]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created {formattedDate}</span>
          </span>
        </div>

        {/* Group Settings Icon */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5B5B72] hover:text-[#1F1D3D] p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#E5E5F0] transition-all min-h-[44px] min-w-[44px] justify-center"
          title="Group Settings"
          aria-label="Open group settings"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </div>
  );
}

