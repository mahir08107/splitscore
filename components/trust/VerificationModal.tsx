"use client";

import React from "react";
import { VerificationProof } from "@/lib/crypto/jwt";
import { ShieldCheck, Lock, Copy, Check, X, KeyRound } from "lucide-react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: VerificationProof | null;
  userName: string;
}

export function VerificationModal({
  isOpen,
  onClose,
  proof,
  userName,
}: VerificationModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !proof) return null;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(proof.rawToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5E5EF] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#2E2A7A] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#22C55E]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Cryptographic Proof
              </h3>
              <p className="text-xs text-white/70">
                Tamper-proof authenticity verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Validity Banner */}
          <div
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
              proof.isValid
                ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]"
                : "bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]"
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              {proof.isValid
                ? `Cryptographic signature is valid for ${userName}. Generated directly by SplitScore.`
                : "Signature verification failed."}
            </span>
          </div>

          {/* Details Table */}
          <div className="bg-[#F8F8FC] rounded-xl border border-[#E5E5EF] p-4 text-xs space-y-2.5">
            <div className="flex justify-between items-center py-1 border-b border-[#E5E5EF]/60">
              <span className="text-[#5B5B72]">Signing Algorithm</span>
              <span className="font-mono font-semibold text-[#1F1D3D] bg-white px-2 py-0.5 rounded border border-[#E5E5EF]">
                HMAC-SHA256 ({proof.algorithm})
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#E5E5EF]/60">
              <span className="text-[#5B5B72]">Issuer</span>
              <span className="font-medium text-[#1F1D3D]">{proof.issuer}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#E5E5EF]/60">
              <span className="text-[#5B5B72]">Subject (User ID)</span>
              <span className="font-mono text-[#1F1D3D] text-[11px] truncate max-w-[180px]">
                {proof.subject}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#E5E5EF]/60">
              <span className="text-[#5B5B72]">Issued At</span>
              <span className="text-[#1F1D3D]">
                {new Date(proof.issuedAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#5B5B72]">Signature Hash</span>
              <span className="font-mono text-[#0F766E] font-medium text-[11px]">
                {proof.signaturePreview}
              </span>
            </div>
          </div>

          {/* Token Snippet */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#1F1D3D] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#4338CA]" />
                Signed JWT Token
              </span>
              <button
                onClick={handleCopyToken}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4338CA] hover:text-[#2E2A7A] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#15803D]" />
                    <span className="text-[#15803D]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Token</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-[#1F1D3D] text-[#CCFBF1] rounded-xl font-mono text-[10px] break-all leading-relaxed select-all">
              {proof.rawToken}
            </div>
            <p className="text-[11px] text-[#5B5B72] mt-2 leading-relaxed">
              Anyone can independently verify this JWT against SplitScore's public key or server endpoint without seeing any of your private expense records.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F8F8FC] border-t border-[#E5E5EF] px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#2E2A7A] hover:bg-[#4338CA] rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
