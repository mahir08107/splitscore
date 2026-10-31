"use client";

import React, { useState } from "react";
import { GroupMemberModel, MemberRole } from "@/lib/group/types";
import { formatRupees } from "@/lib/data/dashboard";
import { Shield, ShieldCheck, MoreVertical, Trash2, ArrowUpRight, ArrowDownLeft, Check, ShieldAlert } from "lucide-react";

interface MemberCardProps {
  member: GroupMemberModel;
  currentUserRole: MemberRole;
  currentUserId: string;
  totalAdmins: number;
  onUpdateRole: (userId: string, newRole: MemberRole) => void;
  onRemoveMember: (userId: string, memberName: string) => void;
}

export function MemberCard({
  member,
  currentUserRole,
  currentUserId,
  totalAdmins,
  onUpdateRole,
  onRemoveMember,
}: MemberCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const isSelf = member.user_id === currentUserId;
  const isAdmin = member.role === "admin";
  const canManage = currentUserRole === "admin" && (!isAdmin || totalAdmins > 1 || !isSelf);

  const isOwed = member.netBalance > 0.01;
  const isOwing = member.netBalance < -0.01;

  return (
    <div className="bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-4 sm:p-5 soft-card-shadow hover:border-[#FECDD3] transition-all flex flex-col justify-between relative">
      {/* Top: Avatar, Name, Email & Admin Options */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {member.user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.user.avatar}
                alt={member.user.name}
                className="w-11 h-11 rounded-full object-cover border border-[rgba(225,29,72,0.09)] shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-bold text-base flex items-center justify-center shrink-0">
                {member.user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm font-bold text-[#1C1917] truncate">
                  {member.user.name}
                </h4>
                {isSelf && (
                  <span className="text-[10px] bg-[#FFF1F2] text-[#E11D48] px-1.5 py-0.2 rounded font-semibold">
                    You
                  </span>
                )}
              </div>
              <p className="text-xs text-[#57534E] truncate">
                {member.user.email || "No email available"}
              </p>
            </div>
          </div>

          {/* Admin Role Actions Menu */}
          {currentUserRole === "admin" && !isSelf && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((prev) => !prev)}
                className="p-1.5 text-[#57534E] hover:text-[#1C1917] rounded-lg hover:bg-rose-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Member options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-[rgba(225,29,72,0.09)] py-1 z-30 animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onUpdateRole(member.user_id, isAdmin ? "member" : "admin");
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#FFF8F8] flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#E11D48]" />
                      <span>{isAdmin ? "Demote to Member" : "Promote to Admin"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onRemoveMember(member.user_id, member.user.name);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove from group</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Badges: Admin/Member Role + Trust Score */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isAdmin
                ? "bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white"
                : "bg-rose-50 text-[#57534E] border border-[#FECDD3]"
            }`}
          >
            {isAdmin ? "Admin" : "Member"}
          </span>

          {member.trustScore && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] bg-[#F0FDFA] px-2 py-0.5 rounded-full border border-[#CCFBF1]">
              <ShieldCheck className="w-3 h-3 text-[#0F766E]" />
              <span>Trust: {member.trustScore}</span>
              {member.trustBand && <span>({member.trustBand})</span>}
            </span>
          )}
        </div>
      </div>

      {/* Bottom: Financial Stats */}
      <div className="mt-4 pt-3 border-t border-[rgba(225,29,72,0.06)] grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[#57534E] block">Contributed</span>
          <span className="font-bold text-[#1C1917] text-sm">
            {formatRupees(member.totalContributed)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[#57534E] block">Net Balance</span>
          {isOwed && (
            <span className="font-extrabold text-[#15803D] text-sm flex items-center justify-end gap-0.5">
              <ArrowDownLeft className="w-3 h-3" />
              +{formatRupees(member.netBalance)}
            </span>
          )}
          {isOwing && (
            <span className="font-extrabold text-[#B91C1C] text-sm flex items-center justify-end gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              -{formatRupees(Math.abs(member.netBalance))}
            </span>
          )}
          {!isOwed && !isOwing && (
            <span className="font-semibold text-[#57534E] text-sm flex items-center justify-end gap-0.5">
              <Check className="w-3 h-3" />
              Settled
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
