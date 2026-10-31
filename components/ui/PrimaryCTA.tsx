"use client";

import React from "react";
import StarBorder from "@/components/ui/StarBorder";

export interface PrimaryCTAProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

/**
 * PrimaryCTA
 * 
 * Enforces the global CTA rule: Exactly ONE StarBorder-wrapped button per screen
 * for the single most important action.
 * 
 * Props & behavior:
 * - Color: #5BC5A7, trailColor: #5BC5A7
 * - clickPulse enabled for touch feedback
 * - Solid SplitScore mint styling
 * - Respects prefers-reduced-motion: reduce
 */
export default function PrimaryCTA({
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
  ...rest
}: PrimaryCTAProps) {
  return (
    <StarBorder
      as="button"
      type={type}
      onClick={onClick}
      disabled={disabled}
      color="#5BC5A7"
      trailColor="#5BC5A7"
      duration={4}
      direction="clockwise"
      stars={1}
      trailLength={0.55}
      thickness={1.5}
      radius={12}
      glow={0.7}
      hover="brighten"
      sparkle={false}
      clickPulse
      theme="dark"
      backgroundColor="#5BC5A7"
      textColor="#07110E"
      borderColor="rgba(91, 197, 167, 0.42)"
      className={`inline-flex items-center justify-center rounded-md font-display text-sm font-bold tracking-wide transition-all hover:shadow-[0_0_18px_rgba(91,197,167,0.25)] active:scale-95 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...rest}
    >
      {children}
    </StarBorder>
  );
}

