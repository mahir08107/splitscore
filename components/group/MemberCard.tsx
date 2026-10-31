"use client";

import React, { useState } from "react";
import { GroupMemberModel } from "@/lib/group/types";
import { formatRupees } from "@/lib/data/dashboard";
import {
  Crown,
  ShieldCheck,
  MoreVertical,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  ArrowRightLeft,
  UserPlus,
} from "lucide-react";

interface MemberCardProps {
  member: GroupMemberModel;
  isCurrentUserOwner: boolean;
  currentUserId: string;
  onRemoveMember: (userId: string, memberName: string) => void;
  onTransferOwnership: (userId: string, memberName: string) => void;
  onReaddMember: (userId: string, memberName: string) => void;
}

export function MemberCard({
  member,
  isCurrentUserOwner,
  currentUserId,
  onRemoveMember,
  onTransferOwnership,
  onReaddMember,
}: MemberCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const isSelf = member.user_id === currentUserId;
  const isOwner = Boolean(member.isOwner);
  const isRemoved = member.status === "removed";
  const hasLeft = member.status === "left";
  const isActive = !isRemoved && !hasLeft;

  const isOwed = member.netBalance > 0.01;
  const isOwing = member.netBalance < -0.01;

  return (
    <div
      className={`bg-white rounded-xl border p-4 sm:p-5 shadow-sm transition-all flex flex-col justify-between relative ${
        isRemoved || hasLeft
          ? "border-gray-200 bg-gray-50/70 opacity-75"
          : "border-[#E5E5F0] hover:border-[#D1D1E9]"
      }`}
    >
      {/* Top: Avatar, Name, Email & Admin Options */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {member.user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.user.avatar}
                alt={member.user.name}
                className="w-11 h-11 rounded-full object-cover border border-[#E5E5F0] shrink-0"
              />
            ) : (
              <div
                className={`w-11 h-11 rounded-full font-bold text-base flex items-center justify-center shrink-0 ${
                  isOwner
                    ? "bg-[#D97706] text-white"
                    : "bg-[#2E2A7A] text-white"
                }`}
              >
                {member.user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm font-bold text-[#1F1D3D] truncate">
                  {member.user.name}
                </h4>
                {isSelf && (
                  <span className="text-[10px] bg-[#EEF2FF] text-[#4338CA] px-1.5 py-0.5 rounded font-semibold">
                    You
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5B5B72] truncate">
                {member.user.email || "No email available"}
              </p>
            </div>
          </div>

          {/* Owner Actions Menu */}
          {isCurrentUserOwner && !isSelf && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((prev) => !prev)}
                className="p-2 text-[#5B5B72] hover:text-[#1F1D3D] rounded-lg hover:bg-[#F1F1FA] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-[#E5E5F0] py-1 z-30 animate-in fade-in">
                    {isActive && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            onTransferOwnership(member.user_id, member.user.name);
                          }}
                          className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-[#1F1D3D] hover:bg-[#F8F9FD] flex items-center gap-2 min-h-[44px]"
                        >
                          <ArrowRightLeft className="w-4 h-4 text-[#D97706]" />
                          <span>Transfer Ownership</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            onRemoveMember(member.user_id, member.user.name);
                          }}
                          className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] flex items-center gap-2 min-h-[44px]"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove from group</span>
                        </button>
                      </>
                    )}

                    {isRemoved && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onReaddMember(member.user_id, member.user.name);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-[#0F766E] hover:bg-[#F0FDFA] flex items-center gap-2 min-h-[44px]"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Re-add to group</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Badges: Owner / Status + Trust Score */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {isOwner ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
              <Crown className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Owner</span>
            </span>
          ) : isRemoved ? (
            <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
              Removed
            </span>
          ) : hasLeft ? (
            <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
              Left
            </span>
          ) : (
            <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F1F1FA] text-[#5B5B72]">
              Member
            </span>
          )}

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
      <div className="mt-4 pt-3 border-t border-[#F1F1FA] grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[#5B5B72] block">Contributed</span>
          <span className="font-bold text-[#1F1D3D] text-sm">
            {formatRupees(member.totalContributed)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[#5B5B72] block">Net Balance</span>
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
            <span className="font-semibold text-[#5B5B72] text-sm flex items-center justify-end gap-0.5">
              <Check className="w-3 h-3" />
              Settled
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
