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
 * - Color: #f43f5e, trailColor: #f43f5e
 * - clickPulse enabled for touch feedback
 * - Solid crimson styling: gradient from #E11D48 to #BE123C
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
      color="#f43f5e"
      trailColor="#f43f5e"
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
      className={`inline-flex items-center justify-center font-display font-bold text-sm tracking-wide text-white bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:shadow-lg hover:shadow-[#E11D48]/25 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none rounded-xl cursor-pointer ${className}`}
      {...rest}
    >
      {children}
    </StarBorder>
  );
}

