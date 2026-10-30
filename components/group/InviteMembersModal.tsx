"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Check, Share2, Users } from "lucide-react";
import { useToast } from "./ToastContext";

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  inviteCode: string;
}

export function InviteMembersModal({
  isOpen,
  onClose,
  groupName,
  inviteCode,
}: InviteMembersModalProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const inviteUrl = `${origin}/join/${inviteCode}`;
  const whatsappMessage = encodeURIComponent(
    `Join our expense group "${groupName}" on SplitScore! Click here to split expenses and build trust: ${inviteUrl}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      showToast("Invite link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("Failed to copy link. Please copy manually.", "error");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl border border-[#E5E5F0] shadow-xl p-6 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#5B5B72] hover:text-[#1F1D3D] hover:bg-[#F1F1FA] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4338CA] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4338CA]">
              Invite Friends
            </span>
            <h2 id="invite-modal-title" className="text-xl font-bold text-[#1F1D3D]">
              {groupName}
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5B5B72] mb-5 leading-relaxed">
          Share this link with your friends to join the group. Only invited members can add expenses and view balances.
        </p>

        {/* Invite Code & Link Display */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold uppercase tracking-wider text-[#5B5B72] block">
            Invite Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 min-h-[44px] px-3.5 rounded-lg border border-[#E5E5F0] bg-[#F8F9FD] text-xs sm:text-sm text-[#1F1D3D] select-all font-mono focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-lg bg-[#2E2A7A] hover:bg-[#252263] text-white text-xs font-semibold uppercase tracking-wide transition-colors shrink-0 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#BBF7D0]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5B5B72] pt-1">
            <span>Invite Code:</span>
            <span className="font-mono font-bold text-[#1F1D3D] tracking-wider text-sm bg-[#F1F1FA] px-2 py-0.5 rounded">
              {inviteCode}
            </span>
          </div>
        </div>

        {/* WhatsApp Share Button */}
        <div className="pt-4 border-t border-[#E5E5F0]">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 min-h-[46px] px-4 rounded-xl bg-[#0F766E] hover:bg-[#0c5d57] text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
