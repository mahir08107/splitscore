"use client";

import React, { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { TrustBand } from "@/lib/data/score";
import { ShieldCheck, RotateCw, Check, Copy } from "lucide-react";

const subscribeToLocation = () => () => {};
const getClientOrigin = () => window.location.origin;
const getServerOrigin = () => "";

export interface TrustCardProps {
  score: number;
  band: TrustBand;
  userName: string;
  confidenceLabel?: string;
  userId?: string;
  cardUrlOverride?: string;
  className?: string;
  interactive?: boolean;
  stats?: {
    activeGroupsCount?: number;
    completedSettlementsCount?: number;
    networkSize?: number;
  };
}

interface TierAesthetic {
  scoreGradient: string;
  metallicText: string;
  glowColor: string;
  borderTint: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  chipGlow: string;
  tierLabel: string;
}

const tierConfig: Record<TrustBand, TierAesthetic> = {
  Excellent: {
    scoreGradient: "from-[#D1FAE5] via-[#5BC5A7] to-[#278F76]",
    metallicText: "from-[#D1FAE5] via-[#5BC5A7] to-[#278F76]",
    glowColor: "rgba(91, 197, 167, 0.25)",
    borderTint: "border-[#5BC5A7]/35",
    badgeBg: "bg-[#5BC5A7]/10",
    badgeBorder: "border-[#5BC5A7]/30",
    badgeText: "text-[#A7F3D0]",
    chipGlow: "from-[#D1FAE5] via-[#5BC5A7] to-[#278F76]",
    tierLabel: "EXCELLENT",
  },
  Good: {
    scoreGradient: "from-[#D1FAE5] via-[#5BC5A7] to-[#278F76]",
    metallicText: "from-[#D1FAE5] via-[#5BC5A7] to-[#278F76]",
    glowColor: "rgba(91, 197, 167, 0.22)",
    borderTint: "border-[#5BC5A7]/30",
    badgeBg: "bg-[#5BC5A7]/10",
    badgeBorder: "border-[#5BC5A7]/30",
    badgeText: "text-[#A7F3D0]",
    chipGlow: "from-[#D1FAE5] via-[#5BC5A7] to-[#278F76]",
    tierLabel: "GOOD",
  },
  Building: {
    scoreGradient: "from-[#D1FAE5] via-[#5BC5A7] to-[#278F76]",
    metallicText: "from-[#D1FAE5] via-[#5BC5A7] to-[#278F76]",
    glowColor: "rgba(91, 197, 167, 0.22)",
    borderTint: "border-[#5BC5A7]/30",
    badgeBg: "bg-[#5BC5A7]/10",
    badgeBorder: "border-[#5BC5A7]/30",
    badgeText: "text-[#A7F3D0]",
    chipGlow: "from-[#D1FAE5] via-[#5BC5A7] to-[#278F76]",
    tierLabel: "BUILDING",
  },
  Risky: {
    scoreGradient: "from-[#D1FAE5] via-[#5BC5A7] to-[#278F76]",
    metallicText: "from-[#D1FAE5] via-[#5BC5A7] to-[#278F76]",
    glowColor: "rgba(91, 197, 167, 0.22)",
    borderTint: "border-[#5BC5A7]/30",
    badgeBg: "bg-[#5BC5A7]/10",
    badgeBorder: "border-[#5BC5A7]/30",
    badgeText: "text-[#A7F3D0]",
    chipGlow: "from-[#D1FAE5] via-[#5BC5A7] to-[#278F76]",
    tierLabel: "RISKY",
  },
};

export function TrustCard({
  score,
  band,
  userName,
  confidenceLabel,
  userId = "00000000-0000-0000-0000-000000000000",
  cardUrlOverride,
  className = "",
  interactive = true,
  stats,
}: TrustCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const grps = stats?.activeGroupsCount ?? 4;
  const stl = stats?.completedSettlementsCount ?? 12;
  const net = stats?.networkSize ?? 8;

  const tier = tierConfig[band] || tierConfig.Good;

  const origin = useSyncExternalStore(subscribeToLocation, getClientOrigin, getServerOrigin);
  const qrUrl = cardUrlOverride || (origin ? `${origin}/trust/${userId}` : `https://splitscore.app/trust/${userId}`);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* 3D Flip Perspective Container */}
      <div
        className={`w-full max-w-[440px] group ${interactive ? "cursor-pointer" : "cursor-default"}`}
        style={{ perspective: "1200px" }}
        onClick={interactive ? () => setIsFlipped((prev) => !prev) : undefined}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? "Click to flip credit card to view QR code" : undefined}
        onKeyDown={interactive ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsFlipped((prev) => !prev);
          }
        } : undefined}
      >
        <div
          className="relative w-full aspect-[1.586/1] transition-transform duration-700 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ======================================================== */}
          {/* FRONT OF CARD                                            */}
          {/* ======================================================== */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden select-none relative after:pointer-events-none after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-tr after:from-transparent after:via-white/20 after:to-transparent hover:after:animate-shimmer"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background:
                "linear-gradient(135deg, #121A1B 0%, #0C1113 48%, #070A0B 100%)",
              boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px -5px ${tier.glowColor}`,
              border: "1px solid rgba(91, 197, 167, 0.24)",
            }}
          >
            {/* Metallic Sheen diagonal highlights */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
              style={{
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0.08) 60%, rgba(0,0,0,0.8) 100%)",
              }}
            />

            {/* Subtle Tier Ambient Glow */}
            <div
              className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: tier.glowColor }}
            />
            <div
              className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full blur-2xl pointer-events-none opacity-15"
              style={{ backgroundColor: tier.glowColor }}
            />

            {/* Fine Hairline Pattern for brushed credit card texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)",
              }}
            />

            {/* TOP ROW: Logo + Contactless Waves */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="relative h-10 w-40 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="SplitScore"
                  width={200}
                  height={112}
                  className="absolute -top-6 left-0 h-auto w-40 object-contain"
                />
              </div>

              {/* NFC Contactless Wave Symbol */}
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-zinc-400/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                  <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                  <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                </svg>
              </div>
            </div>

            {/* MIDDLE ROW: EMV Chip on left + Giant Focal Score on right */}
            <div className="relative z-10 flex items-center justify-between my-auto py-1">
              {/* Golden EMV Chip */}
              <div className="relative w-11 h-8 sm:w-13 sm:h-9 rounded-md bg-gradient-to-br from-[#D1FAE5] via-[#5BC5A7] to-[#278F76] p-[1.5px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_3px_6px_rgba(0,0,0,0.5)] border border-[#278F76]/50 overflow-hidden flex flex-col justify-between">
                <div className="w-full h-[1px] bg-black/25 mt-1" />
                <div className="flex justify-between items-center px-1">
                  <div className="w-3.5 h-2.5 rounded-[2px] border border-black/25 bg-[#F59E0B]/60" />
                  <div className="w-3.5 h-2.5 rounded-[2px] border border-black/25 bg-[#F59E0B]/60" />
                </div>
                <div className="w-full h-[1px] bg-black/25 mb-1" />
              </div>

              {/* Focal Trust Score */}
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-display drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] text-transparent bg-clip-text"
                    style={{
                      backgroundImage: "linear-gradient(135deg, #D1FAE5 0%, #5BC5A7 50%, #278F76 100%)",
                    }}
                  >
                    {score}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-medium text-zinc-400">
                    / 900
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badgeBg} ${tier.badgeBorder} ${tier.badgeText} tracking-wider font-mono`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {tier.tierLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: Embossed User Name + Verified Protocol Pill */}
            <div className="relative z-10 flex items-end justify-between gap-3 pt-1">
              <div>
                <span className="block text-[8px] sm:text-[9px] font-mono tracking-widest text-zinc-400 uppercase">
                  Cardholder
                </span>
                <span className="font-mono text-xs sm:text-sm tracking-[0.2em] uppercase font-bold text-zinc-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] line-clamp-1">
                  {userName}
                </span>
                {confidenceLabel && (
                  <span className="block text-[9px] font-sans text-zinc-400 line-clamp-1">
                    {confidenceLabel}
                  </span>
                )}
              </div>

              <div className="flex flex-col items-end">
                {/* Micro-engraved Network Stats */}
                <div className="text-[9px] md:text-[10px] text-gray-400/80 uppercase tracking-widest font-mono text-right mb-1">
                  GRPS: {grps} • STL: {stl} • NET: {net}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono text-zinc-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="tracking-wider">VERIFIED ID</span>
                  </div>
                  {/* Subtle Visa/Mastercard style logo discs */}
                  <div className="flex -space-x-1.5 items-center opacity-85">
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-rose-500/90 shadow-sm" />
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-400/90 shadow-sm mix-blend-screen" />
                  </div>
                </div>
                <span className="text-[8px] font-mono text-zinc-400 mt-0.5">
                  TAP TO FLIP ↺
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BACK OF CARD (QR Code & Verification Subtext)           */}
          {/* ======================================================== */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden select-none"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background:
                "linear-gradient(135deg, #121A1B 0%, #0C1113 48%, #070A0B 100%)",
              boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px -5px ${tier.glowColor}`,
              border: "1px solid rgba(91, 197, 167, 0.24)",
            }}
          >
            {/* Matte Magnetic Stripe across top */}
            <div className="absolute top-4 left-0 right-0 h-8 sm:h-9 bg-[#09090B] border-y border-zinc-800/90 shadow-inner" />

            {/* Top header on back */}
            <div className="relative z-10 flex items-center justify-between pt-8 sm:pt-9">
              <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                PORTABLE TRUST PASSPORT
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400">
                SPLITSCORE • ID
              </span>
            </div>

            {/* CENTER: Scannable QR Code in clean container */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-2xl border border-zinc-300/40 transition-transform group-hover:scale-105">
                <QRCode
                  value={qrUrl}
                  size={92}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox="0 0 92 92"
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                />
              </div>
              <p className="text-[10px] sm:text-xs font-mono tracking-wider text-zinc-300 mt-2 font-medium">
                Scan to verify Trust Profile.
              </p>
            </div>

            {/* BOTTOM ROW on back */}
            <div className="relative z-10 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-zinc-400 pt-1">
              <span>ZERO PRIVATE DATA EXPOSED</span>
              <span className="text-zinc-400">TAP TO FLIP ↺</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls Below Card */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={() => setIsFlipped((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono font-medium border border-zinc-700/60 shadow-sm transition-all active:scale-95"
          title="Flip card"
        >
          <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
          <span>{isFlipped ? "Show Front" : "Flip for QR Code"}</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700/60 shadow-sm transition-all active:scale-95"
          title="Copy public link"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied Link!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
