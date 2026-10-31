"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { GhostFibersProps } from "@/components/ui/GhostFibers";

// Client-only dynamic import with ssr: false (uses WebGL2 and browser globals)
const GhostFibers = dynamic<GhostFibersProps>(
  () => import("@/components/ui/GhostFibers"),
  { ssr: false }
);

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export default function GhostFibersHeroBackground() {
  const [mounted, setMounted] = useState(false);

  // Gate mounting behind min-width: 1024px to skip the 5-level bloom framebuffer on mobile/small screens
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isDesktop) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 -z-[5] pointer-events-none"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    >
      <GhostFibers
        lightMode={true}
        glowColor="#FDA4AF"
        secondaryColor="#E11D48"
        lineColor="#FFE4E6"
        gradient="depth"
        layers={2}
        threads={48}
        density={0.8}
        thickness={0.85}
        twist={0.8}
        volume={0.5}
        spread={0.9}
        waves={0.7}
        flow={0.25}
        speed={0.3}
        rollSpeed={0.08}
        rotation={14}
        perspective={0.5}
        fiberStyle="dots"
        tips={0.15}
        foldGlow={0.6}
        depthOfField={0.7}
        focusDepth={0}
        particles={0.25}
        sparkle={0.2}
        glow={0.35}
        brightness={0.65}
        vignette={0.45}
        grain={0.02}
        mouseInteraction
        hoverEffect="focus"
        mouseStrength={0.4}
        pulseOnClick={false}
        intro
      />
    </div>
  );
}
