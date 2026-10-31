"use client";

import React, { useState } from "react";
import { GroupMemberModel, MemberRole } from "@/lib/group/types";
import { MemberCard } from "./MemberCard";
import { UserPlus, Users, AlertCircle } from "lucide-react";

interface MembersTabProps {
  groupId: string;
  members: GroupMemberModel[];
  currentUserRole: MemberRole;
  currentUserId: string;
  onOpenInvite: () => void;
  onUpdateRole: (userId: string, newRole: MemberRole) => void;
  onRemoveMember: (userId: string) => void;
}

export function MembersTab({
  groupId,
  members,
  currentUserRole,
  currentUserId,
  onOpenInvite,
  onUpdateRole,
  onRemoveMember,
}: MembersTabProps) {
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);

  const totalAdmins = members.filter((m) => m.role === "admin").length;

  const handleConfirmRemove = () => {
    if (memberToRemove) {
      onRemoveMember(memberToRemove.id);
      setMemberToRemove(null);
    }
  };

  return (
    <section>
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1C1917] font-display">Group Members</h2>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            Everyone participating in this group.
          </p>
        </div>

        {/* Invite Members button (Admins only) */}
        {currentUserRole === "admin" && (
          <button
            type="button"
            onClick={onOpenInvite}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:shadow-lg hover:shadow-[#E11D48]/25 text-white font-semibold text-xs uppercase tracking-wide transition-all shadow-sm self-start sm:self-auto active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Members</span>
          </button>
        )}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <MemberCard
            key={member.user_id}
            member={member}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            totalAdmins={totalAdmins}
            onUpdateRole={onUpdateRole}
            onRemoveMember={(id, name) => setMemberToRemove({ id, name })}
          />
        ))}
      </div>

      {/* Remove Confirmation Dialog */}
      {memberToRemove && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setMemberToRemove(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3 text-[#B91C1C]">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1917] font-display">Remove Member?</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#57534E] mb-6 leading-relaxed">
              Are you sure you want to remove <strong>{memberToRemove.name}</strong> from this group? Existing past expenses will remain in the group history.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[rgba(225,29,72,0.09)] text-xs font-semibold text-[#57534E] hover:bg-[#FCFBF7] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991b1b] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
