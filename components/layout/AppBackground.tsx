"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { LightfallProps } from "@/components/ui/Lightfall";

// Dynamic client-only import (ssr: false) for WebGL canvas
const Lightfall = dynamic<LightfallProps>(
  () => import("@/components/ui/Lightfall"),
  { ssr: false }
);

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export default function AppBackground() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Responsive gating: disable on mobile (< 768px) per instructions to preserve battery/perf
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Exclude auth routes completely (login, signup, auth callbacks)
  // Zero WebGL context creation on these routes
  const isAuthRoute =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/auth/") ||
    pathname === "/signup" ||
    pathname === "/forgot-password";

  if (isAuthRoute) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Layer 1: Base Warm Cream */}
      <div className="absolute inset-0 bg-[#FCFBF7]" />

      {/* Layer 2: Lightfall WebGL Layer (exactly one WebGL canvas app-wide) */}
      {mounted && isDesktop && !prefersReducedMotion && (
        <div className="absolute inset-0">
          <Lightfall
            colors={["#f43f5e"]}
            backgroundColor="#FCFBF7"
            speed={0.3}
            streakCount={2}
            streakWidth={0.8}
            twinkle={0.3}
            backgroundGlow={0.1}
            headGlow={0.5}
            bloom={0.25}
            mouseInteraction
            holdToWarp={false}
            intro
            streakLength={1}
            density={0.5}
            glow={0.7}
            depth={0.5}
            zoom={3}
            mouseStrength={0.3}
            mouseRadius={0.45}
            lens={0.5}
            fade={0}
            lightMode={true}
          />
        </div>
      )}

      {/* Layer 3: Faint Ledger Grid Texture (CSS-only, masked) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(254,205,211,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          WebkitMaskImage:
            "radial-gradient(ellipse 95% 85% at 50% 50%, transparent 35%, black 90%)",
          maskImage:
            "radial-gradient(ellipse 95% 85% at 50% 50%, transparent 35%, black 90%)",
        }}
      />
    </div>
  );
}
