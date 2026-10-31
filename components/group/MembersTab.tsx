"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GroupMemberModel } from "@/lib/group/types";
import { MemberCard } from "./MemberCard";
import {
  UserPlus,
  AlertCircle,
  LogOut,
  Trash2,
  ArrowRightLeft,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  removeMemberAction,
  leaveGroupAction,
  transferOwnershipAction,
  readdMemberAction,
  deleteGroupAction,
  rotateInviteCodeAction,
} from "@/lib/group/actions";

interface MembersTabProps {
  groupId: string;
  groupName: string;
  members: GroupMemberModel[];
  isCurrentUserOwner: boolean;
  currentUserId: string;
  onOpenInvite: () => void;
}

export function MembersTab({
  groupId,
  groupName,
  members,
  isCurrentUserOwner,
  currentUserId,
  onOpenInvite,
}: MembersTabProps) {
  const router = useRouter();

  // Dialog states
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [memberToTransfer, setMemberToTransfer] = useState<{ id: string; name: string } | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  // Loading and error states
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [rotatingInvite, setRotatingInvite] = useState(false);

  // Active user check
  const activeMembers = members.filter((m) => !m.status || m.status === "active");

  // Handle Remove Member
  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setModalError(null);
    setActionLoading(true);

    const res = await removeMemberAction(groupId, memberToRemove.id);
    setActionLoading(false);

    if (!res.success) {
      setModalError(res.error || "Failed to remove member.");
      return;
    }

    setMemberToRemove(null);
    router.refresh();
  };

  // Handle Leave Group
  const handleConfirmLeave = async () => {
    setModalError(null);
    setActionLoading(true);

    const res = await leaveGroupAction(groupId);
    setActionLoading(false);

    if (!res.success) {
      setModalError(res.error || "Failed to leave group.");
      return;
    }

    setShowLeaveModal(false);
    router.push("/dashboard");
    router.refresh();
  };

  // Handle Transfer Ownership
  const handleConfirmTransfer = async () => {
    if (!memberToTransfer) return;
    setModalError(null);
    setActionLoading(true);

    const res = await transferOwnershipAction(groupId, memberToTransfer.id);
    setActionLoading(false);

    if (!res.success) {
      setModalError(res.error || "Failed to transfer ownership.");
      return;
    }

    setMemberToTransfer(null);
    router.refresh();
  };

  // Handle Re-add Member
  const handleReaddMember = async (userId: string, name: string) => {
    setActionLoading(true);
    const res = await readdMemberAction(groupId, userId);
    setActionLoading(false);

    if (!res.success) {
      alert(res.error || `Failed to re-add ${name}.`);
      return;
    }

    router.refresh();
  };

  // Handle Rotate Invite Code
  const handleRotateInviteCode = async () => {
    setRotatingInvite(true);
    const res = await rotateInviteCodeAction(groupId);
    setRotatingInvite(false);

    if (!res.success) {
      alert(res.error || "Failed to rotate invite code.");
      return;
    }

    alert("Invite code has been rotated successfully.");
    router.refresh();
  };

  // Handle Delete Group
  const handleConfirmDelete = async () => {
    if (deleteConfirmName.trim() !== groupName.trim()) {
      setModalError("The name you entered does not match the group name exactly.");
      return;
    }

    setModalError(null);
    setActionLoading(true);

    const res = await deleteGroupAction(groupId, deleteConfirmName.trim());
    setActionLoading(false);

    if (!res.success) {
      setModalError(res.error || "Failed to delete group.");
      return;
    }

    setShowDeleteModal(false);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <section className="space-y-8">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1F1D3D]">Group Members</h2>
          <p className="text-xs sm:text-sm text-[#5B5B72] mt-0.5">
            {activeMembers.length} active member{activeMembers.length !== 1 ? "s" : ""} in this group.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isCurrentUserOwner ? (
            <>
              <button
                type="button"
                onClick={handleRotateInviteCode}
                disabled={rotatingInvite}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E5F0] bg-white hover:bg-[#F1F1FA] text-[#5B5B72] font-semibold text-xs tracking-wide transition-all shadow-xs"
                title="Invalidate old link and create a new invite code"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${rotatingInvite ? "animate-spin" : ""}`} />
                <span>Rotate Invite Link</span>
              </button>

              <button
                type="button"
                onClick={onOpenInvite}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl bg-[#2E2A7A] hover:bg-[#252263] text-white font-semibold text-xs tracking-wide transition-all shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Members</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setModalError(null);
                setShowLeaveModal(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl border border-[#E5E5EF] bg-white hover:bg-[#FEF2F2] hover:border-[#FECACA] text-[#B91C1C] font-semibold text-xs transition-all shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Group</span>
            </button>
          )}
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <MemberCard
            key={member.user_id}
            member={member}
            isCurrentUserOwner={isCurrentUserOwner}
            currentUserId={currentUserId}
            onRemoveMember={(id, name) => {
              setModalError(null);
              setMemberToRemove({ id, name });
            }}
            onTransferOwnership={(id, name) => {
              setModalError(null);
              setMemberToTransfer({ id, name });
            }}
            onReaddMember={handleReaddMember}
          />
        ))}
      </div>

      {/* Danger Zone: Delete Group (Owner only) */}
      {isCurrentUserOwner && (
        <div className="mt-12 pt-6 border-t border-[#E5E5EF]">
          <div className="bg-[#FFF5F5] rounded-2xl border border-[#FED7D7] p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center shrink-0 text-[#B91C1C]">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#991B1B]">
                  Delete this group
                </h3>
                <p className="text-xs text-[#7F1D1D] leading-relaxed max-w-2xl">
                  Deleting a group removes it from active dashboards and disables the invite link.
                  Past payments, settlements, and Trust Score history remain permanently intact.
                  A group can only be deleted when all members have settled all balances and all payment plans are closed.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalError(null);
                  setDeleteConfirmName("");
                  setShowDeleteModal(true);
                }}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                Delete Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Remove Confirmation Dialog */}
      {memberToRemove && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => !actionLoading && setMemberToRemove(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E5E5F0] p-6 max-w-sm w-full shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-[#B91C1C]">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1F1D3D]">Remove Member?</h3>
            </div>

            <p className="text-xs sm:text-sm text-[#5B5B72] leading-relaxed">
              Are you sure you want to remove <strong>{memberToRemove.name}</strong> from this group?
              The group invite link will automatically be rotated.
            </p>

            {modalError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs font-semibold text-[#B91C1C]">
                {modalError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setMemberToRemove(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E5E5F0] text-xs font-semibold text-[#5B5B72] hover:bg-[#F1F1FA]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmRemove}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold transition-all flex items-center gap-2"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Dialog */}
      {memberToTransfer && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => !actionLoading && setMemberToTransfer(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E5E5F0] p-6 max-w-sm w-full shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-[#D97706]">
              <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-5 h-5 text-[#D97706]" />
              </div>
              <h3 className="text-base font-bold text-[#1F1D3D]">Transfer Ownership?</h3>
            </div>

            <p className="text-xs sm:text-sm text-[#5B5B72] leading-relaxed">
              Are you sure you want to transfer ownership of this group to{" "}
              <strong>{memberToTransfer.name}</strong>? You will become a regular member.
            </p>

            {modalError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs font-semibold text-[#B91C1C]">
                {modalError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setMemberToTransfer(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E5E5F0] text-xs font-semibold text-[#5B5B72] hover:bg-[#F1F1FA]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmTransfer}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold transition-all flex items-center gap-2"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Transfer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Group Dialog */}
      {showLeaveModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => !actionLoading && setShowLeaveModal(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E5E5F0] p-6 max-w-sm w-full shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-[#B91C1C]">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1F1D3D]">Leave Group?</h3>
            </div>

            <p className="text-xs sm:text-sm text-[#5B5B72] leading-relaxed">
              Are you sure you want to leave <strong>{groupName}</strong>? You can only leave if
              your net balance is ₹0 and you have no pending settlements.
            </p>

            {modalError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs font-semibold text-[#B91C1C]">
                {modalError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowLeaveModal(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E5E5F0] text-xs font-semibold text-[#5B5B72] hover:bg-[#F1F1FA]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmLeave}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold transition-all flex items-center gap-2"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Leave</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Dialog (Type-the-name confirmation) */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => !actionLoading && setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E5E5F0] p-6 max-w-md w-full shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-[#B91C1C]">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1F1D3D]">Delete Group Permanently</h3>
            </div>

            <p className="text-xs sm:text-sm text-[#5B5B72] leading-relaxed">
              This action cannot be undone. To confirm, please type the exact group name:{" "}
              <strong className="text-[#1F1D3D]">{groupName}</strong>
            </p>

            <input
              type="text"
              placeholder="Type group name to confirm"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E5EF] bg-[#F8F9FD] text-sm text-[#1F1D3D] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            />

            {modalError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs font-semibold text-[#B91C1C]">
                {modalError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowDeleteModal(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E5E5F0] text-xs font-semibold text-[#5B5B72] hover:bg-[#F1F1FA]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || deleteConfirmName.trim() !== groupName.trim()}
                onClick={handleConfirmDelete}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Forever</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
