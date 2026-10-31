"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GroupDetailData, MemberRole } from "@/lib/group/types";
import { GroupHeader } from "./GroupHeader";
import { GroupSummaryCards } from "./GroupSummaryCards";
import { GroupTabs, GroupTabType } from "./GroupTabs";
import { ExpensesTab } from "./ExpensesTab";
import { BalancesTab } from "./BalancesTab";
import { MembersTab } from "./MembersTab";
import { InviteMembersModal } from "./InviteMembersModal";
import { GroupSettingsModal } from "./GroupSettingsModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ToastProvider, useToast } from "./ToastContext";
import {
  updateGroupSettings,
  regenerateGroupInviteCode,
  updateMemberRole,
  removeMemberFromGroup,
  deleteGroup,
} from "@/lib/group/service";
import { GroupType, UserProfile } from "@/lib/data/dashboard";

interface GroupClientProps {
  initialData: GroupDetailData;
  isDemo?: boolean;
}

function GroupClientInner({ initialData, isDemo = false }: GroupClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [data, setData] = useState<GroupDetailData>(initialData);

  // Tab state synced with URL search params
  const tabParam = (searchParams?.get("tab") as GroupTabType) || "expenses";
  const [activeTab, setActiveTab] = useState<GroupTabType>(
    ["expenses", "balances", "members"].includes(tabParam) ? tabParam : "expenses"
  );

  // Modals state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleTabChange = (newTab: GroupTabType) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", newTab);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const handleUpdateGroup = async (updates: {
    name?: string;
    type?: GroupType;
    description?: string;
  }) => {
    try {
      const res = await updateGroupSettings(data.group.id, updates, isDemo);
      if (res.success) {
        setData((prev) => ({
          ...prev,
          group: {
            ...prev.group,
            name: updates.name ?? prev.group.name,
            type: updates.type ?? prev.group.type,
            description: updates.description ?? prev.group.description,
          },
        }));
        showToast("Group settings updated successfully!", "success");
      } else {
        showToast(res.error || "Failed to update group.", "error");
      }
    } catch {
      showToast("Error updating group settings.", "error");
    }
  };

  const handleRegenerateCode = async () => {
    try {
      const res = await regenerateGroupInviteCode(data.group.id, isDemo);
      if (res.success && res.newCode) {
        setData((prev) => ({
          ...prev,
          group: { ...prev.group, invite_code: res.newCode! },
        }));
        showToast(`New invite code generated: ${res.newCode}`, "success");
      } else {
        showToast(res.error || "Failed to regenerate invite code.", "error");
      }
    } catch {
      showToast("Error regenerating invite code.", "error");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: MemberRole) => {
    try {
      const res = await updateMemberRole(data.group.id, userId, newRole, isDemo);
      if (res.success) {
        setData((prev) => ({
          ...prev,
          members: prev.members.map((m) =>
            m.user_id === userId ? { ...m, role: newRole } : m
          ),
        }));
        showToast(`Member role updated to ${newRole}.`, "success");
      } else {
        showToast(res.error || "Failed to update role.", "error");
      }
    } catch {
      showToast("Error updating member role.", "error");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const res = await removeMemberFromGroup(data.group.id, userId, isDemo);
      if (res.success) {
        setData((prev) => {
          const nextMembers = prev.members.filter((m) => m.user_id !== userId);
          return {
            ...prev,
            members: nextMembers,
            summary: {
              ...prev.summary,
              memberCount: nextMembers.length,
            },
          };
        });
        showToast("Member removed from group.", "success");
      } else {
        showToast(res.error || "Failed to remove member.", "error");
      }
    } catch {
      showToast("Error removing member.", "error");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const res = await deleteGroup(data.group.id, isDemo);
      if (res.success) {
        showToast("Group deleted successfully.", "success");
        setIsSettingsOpen(false);
        router.push("/dashboard");
      } else {
        showToast(res.error || "Failed to delete group.", "error");
      }
    } catch {
      showToast("Error deleting group.", "error");
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const res = await removeMemberFromGroup(
        data.group.id,
        data.currentUser.id,
        isDemo
      );
      if (res.success) {
        showToast("You have left the group.", "success");
        setIsSettingsOpen(false);
        router.push("/dashboard");
      } else {
        showToast(res.error || "Failed to leave group.", "error");
      }
    } catch {
      showToast("Error leaving group.", "error");
    }
  };

  const totalAdmins = data.members.filter((m) => m.role === "admin").length;
  const isOnlyAdmin = data.currentUserRole === "admin" && totalAdmins <= 1;

  const userProfile: UserProfile = {
    id: data.currentUser.id,
    name: data.currentUser.name,
    email: data.currentUser.email,
    avatar: data.currentUser.avatar,
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#1C1917] flex flex-col font-body relative">
      {/* Ambient Background (Corner Aurora + Ledger Grid) */}
      {/* 1. Header (Reusing existing Dashboard Header) */}
      <DashboardHeader user={userProfile} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 2. Group Header */}
        <GroupHeader
          group={data.group}
          memberCount={data.summary.memberCount}
          currentUserRole={data.currentUserRole}
          onOpenInvite={() => setIsInviteOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* 3. Summary Cards */}
        <GroupSummaryCards summary={data.summary} />

        {/* 4. Tabs Navigation */}
        <GroupTabs
          activeTab={activeTab}
          onChangeTab={handleTabChange}
          expensesCount={data.expenses.length}
          membersCount={data.members.length}
        />

        {/* 5. Tab Panels */}
        <div className="tab-content">
          {activeTab === "expenses" && (
            <ExpensesTab
              groupId={data.group.id}
              expenses={data.expenses}
              currentUserId={data.currentUser.id}
              onOpenInvite={() => setIsInviteOpen(true)}
            />
          )}

          {activeTab === "balances" && (
            <BalancesTab
              groupId={data.group.id}
              members={data.members}
              suggestedSettlements={data.suggestedSettlements}
              awaitingSettlements={data.awaitingSettlements}
              currentUserId={data.currentUser.id}
            />
          )}

          {activeTab === "members" && (
            <MembersTab
              groupId={data.group.id}
              groupName={data.group.name}
              members={data.members}
              isCurrentUserOwner={data.group.owner_id === data.currentUser.id}
              currentUserId={data.currentUser.id}
              onOpenInvite={() => setIsInviteOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <InviteMembersModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        groupName={data.group.name}
        inviteCode={data.group.invite_code}
      />

      <GroupSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        group={data.group}
        currentUserRole={data.currentUserRole}
        isOnlyAdmin={isOnlyAdmin}
        onUpdateGroup={handleUpdateGroup}
        onRegenerateCode={handleRegenerateCode}
        onDeleteGroup={handleDeleteGroup}
        onLeaveGroup={handleLeaveGroup}
      />
    </div>
  );
}

export function GroupClient(props: GroupClientProps) {
  return (
    <ToastProvider>
      <GroupClientInner {...props} />
    </ToastProvider>
  );
}
