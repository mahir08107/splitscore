"use client";

import React from "react";
import { Receipt, Scale, Users } from "lucide-react";

export type GroupTabType = "expenses" | "balances" | "members";

interface GroupTabsProps {
  activeTab: GroupTabType;
  onChangeTab: (tab: GroupTabType) => void;
  expensesCount?: number;
  membersCount?: number;
}

export function GroupTabs({
  activeTab,
  onChangeTab,
  expensesCount,
  membersCount,
}: GroupTabsProps) {
  const tabs: Array<{
    id: GroupTabType;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }> = [
    {
      id: "expenses",
      label: "Expenses",
      icon: Receipt,
      badge: expensesCount,
    },
    {
      id: "balances",
      label: "Balances",
      icon: Scale,
    },
    {
      id: "members",
      label: "Members",
      icon: Users,
      badge: membersCount,
    },
  ];

  return (
    <div className="border-b border-[#E5E5F0] mb-6">
      <div
        role="tablist"
        aria-label="Group sections"
        className="flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-none"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-2 py-3.5 px-3 sm:px-4 text-sm font-semibold transition-all relative whitespace-nowrap min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] rounded-t-lg ${
                isActive
                  ? "text-[#4338CA]"
                  : "text-[#5B5B72] hover:text-[#1F1D3D]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.badge === "number" && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isActive
                      ? "bg-[#EEF2FF] text-[#4338CA]"
                      : "bg-[#F1F1FA] text-[#5B5B72]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              {/* Active tab bottom indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4338CA] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

