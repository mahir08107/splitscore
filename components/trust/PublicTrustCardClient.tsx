"use client";

import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { PublicTrustCardData, TrustBand } from "@/lib/data/score";
import { VerificationModal } from "./VerificationModal";
import {
  ShieldCheck,
  Copy,
  Check,
  Share2,
  Lock,
  Wifi,
  Sparkles,
  Info,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface PublicTrustCardClientProps {
  data: PublicTrustCardData;
}

const bandConfig: Record<
  TrustBand,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    glowColor: string;
    badgeBg: string;
    label: string;
  }
> = {
  Excellent: {
    color: "#15803D",
    bgColor: "#F0FDF4",
    borderColor: "#86EFAC",
    glowColor: "rgba(21, 128, 61, 0.15)",
    badgeBg: "#DCFCE7",
    label: "Excellent",
  },
  Good: {
    color: "#0F766E",
    bgColor: "#F0FDFA",
    borderColor: "#5EEAD4",
    glowColor: "rgba(15, 118, 110, 0.15)",
    badgeBg: "#CCFBF1",
    label: "Good",
  },
  Building: {
    color: "#B45309",
    bgColor: "#FFFBEB",
    borderColor: "#FCD34D",
    glowColor: "rgba(180, 83, 9, 0.15)",
    badgeBg: "#FEF3C7",
    label: "Building",
  },
  Risky: {
    color: "#B91C1C",
    bgColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    glowColor: "rgba(185, 28, 28, 0.15)",
    badgeBg: "#FECACA",
    label: "Risky",
  },
};

export function PublicTrustCardClient({ data }: PublicTrustCardClientProps) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  const band = bandConfig[data.band] || bandConfig.Building;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const cardUrl = currentUrl || `https://splitscore.app/trust/${data.userId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${data.userName}'s SplitScore Trust Card`,
          text: `Check out ${data.userName}'s portable trust score (${data.score}) on SplitScore!`,
          url: cardUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Verification Modal */}
      <VerificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        proof={data.verificationProof}
        userName={data.userName}
      />

      {/* Top Banner / Privacy Badge */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-1.5 text-xs text-[#0F766E] font-medium bg-[#0F766E]/10 px-3 py-1 rounded-full">
          <Lock className="w-3.5 h-3.5" />
          <span>Zero Private Expenses Exposed</span>
        </div>
        <Link
          href="/how-scoring-works"
          className="text-xs text-[#E11D48] hover:underline font-medium"
        >
          How Scoring Works
        </Link>
      </div>

      {/* ─── DIGITAL ID / CREDIT CARD ─── */}
      <div className="w-full max-w-md relative perspective-1000 mb-8">
        <div
          className="relative rounded-3xl p-6 sm:p-7 text-white shadow-2xl transition-all duration-300 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #1C1917 0%, #BE123C 50%, #1C1917 100%)",
            boxShadow: `0 20px 40px -15px ${band.glowColor}, 0 10px 20px -10px rgba(0,0,0,0.3)`,
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          {/* Subtle metallic card sheen background */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div
            className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30"
            style={{ backgroundColor: band.color }}
          />

          {/* Card Top Row: Brand & Verified Button */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-white text-[#BE123C] flex items-center justify-center font-extrabold text-base shadow-sm">
                S
              </span>
              <div>
                <span className="font-bold tracking-tight text-sm text-white">
                  SplitScore
                </span>
                <span className="block text-[9px] tracking-widest uppercase text-white/60 font-semibold">
                  Portable Trust ID
                </span>
              </div>
            </div>

            {/* Clickable Verified Badge */}
            <button
              onClick={() => setShowModal(true)}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all shadow-sm active:scale-95"
              title="Click to view cryptographic signature proof"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="text-[11px] font-semibold text-white">
                Verified
              </span>
              <Info className="w-3 h-3 text-white/60 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Chip and Contactless Emblem */}
          <div className="flex items-center justify-between mb-5 relative z-10">
            {/* Golden EMV Chip */}
            <div className="w-12 h-9 rounded-md bg-gradient-to-br from-[#F59E0B] via-[#FDE68A] to-[#D97706] p-1 border border-[#B45309]/40 shadow-inner flex flex-col justify-between">
              <div className="w-full h-1 border-b border-black/20" />
              <div className="w-full h-1 border-b border-black/20" />
              <div className="w-full h-1" />
            </div>
            {/* Contactless symbol */}
            <Wifi className="w-5 h-5 text-white/50 rotate-90" />
          </div>

          {/* User Name & Big Score Display */}
          <div className="mb-6 relative z-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-wider uppercase text-white/60 font-medium">
                Cardholder
              </p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight font-display">
                {data.userName}
              </h2>
              <p className="text-xs text-white/70 mt-0.5">
                {data.confidence.label}
              </p>
            </div>

            {/* Score Highlight Box */}
            <div
              className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl border backdrop-blur-md"
              style={{
                backgroundColor: `${band.color}25`,
                borderColor: band.borderColor,
              }}
            >
              <span
                className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none font-display"
                style={{ color: "#FFFFFF" }}
              >
                {data.score}
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1"
                style={{
                  backgroundColor: band.badgeBg,
                  color: band.color,
                }}
              >
                {band.label}
              </span>
            </div>
          </div>

          {/* Card Verification Stats Row */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10 relative z-10">
            <div className="bg-white/5 rounded-xl px-3 py-2 border border-white/10">
              <span className="block text-[10px] uppercase tracking-wider text-white/60 font-medium">
                Verified By
              </span>
              <span className="text-sm font-bold text-white">
                {data.verifiedByCount}{" "}
                {data.verifiedByCount === 1 ? "Friend" : "Friends"}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl px-3 py-2 border border-white/10">
              <span className="block text-[10px] uppercase tracking-wider text-white/60 font-medium">
                Settlements
              </span>
              <span className="text-sm font-bold text-white">
                {data.confidence.totalSettlements} Completed
              </span>
            </div>
          </div>

          {/* Card Footer: Masked ID + Member Since */}
          <div className="flex items-center justify-between mt-4 text-[10px] text-white/50 relative z-10">
            <span>ID: {data.userId.slice(0, 8)}...</span>
            <span>Issued: {data.memberSince || "Active"}</span>
          </div>
        </div>
      </div>

      {/* ─── QR CODE & SHARING SECTION ─── */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-[rgba(225,29,72,0.09)] p-6 soft-card-shadow flex flex-col items-center text-center">
        <h3 className="text-base font-bold text-[#1C1917] mb-1 font-display">
          Scan to Verify In Person
        </h3>
        <p className="text-xs text-[#57534E] mb-5 max-w-xs">
          Show this QR code to new group members or roommates to instantly verify your repayment track record.
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl border-2 border-[rgba(225,29,72,0.09)] shadow-inner mb-5">
          <QRCode
            value={cardUrl}
            size={180}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox="0 0 180 180"
            level="M"
          />
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopyLink}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#BE123C] bg-rose-50 hover:bg-[#FECDD3] transition-all border border-[#FECDD3] active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#15803D]" />
                <span className="text-[#15803D]">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#BE123C]" />
                <span>Copy Card Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:shadow-lg hover:shadow-[#E11D48]/25 transition-all active:scale-[0.98] active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Card</span>
          </button>
        </div>

        {/* Cryptographic Assurance Note */}
        <div className="mt-5 pt-4 border-t border-[rgba(225,29,72,0.06)] w-full flex items-center justify-center gap-1.5 text-[11px] text-[#57534E]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>
            Cryptographically signed by SplitScore • Valid for 30 days
          </span>
        </div>
      </div>
    </div>
  );
}
