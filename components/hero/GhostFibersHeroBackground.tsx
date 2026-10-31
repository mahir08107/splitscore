"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { GhostFibersProps } from "@/components/ui/GhostFibers";

// Dynamic client-only import (ssr: false) for WebGL2 canvas and window interaction
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

  // Gate mounting behind min-width: 1024px to skip the bloom framebuffer on mobile/small screens
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isDesktop) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 -z-[5] pointer-events-none overflow-hidden flex items-center justify-center"
      style={{
        mixBlendMode: "screen",
        opacity: 0.85,
        WebkitMaskImage:
          "radial-gradient(ellipse 90% 80% at 50% 45%, black 40%, transparent 92%)",
        maskImage:
          "radial-gradient(ellipse 90% 80% at 50% 45%, black 40%, transparent 92%)",
      }}
      aria-hidden="true"
    >
      <div style={{ width: "100%", height: "600px", position: "relative" }}>
        <GhostFibers
          glowColor="#f43f5e"
          layers={3}
          twist={1.2}
          threads={72}
          fiberStyle="dots"
          depthOfField={0.85}
          hoverEffect="focus"
          intro
          mouseInteraction
          lineColor="#dfd1fc"
          secondaryColor="#be123c"
          gradient="depth"
          waves={1}
          volume={0.7}
          spread={1}
          scale={1}
          rotation={18}
          perspective={0.65}
          density={1}
          thickness={1}
          tips={0}
          foldGlow={1}
          speed={0.5}
          flow={0.4}
          rollSpeed={0.15}
          focusDepth={0}
          particles={0.5}
          sparkle={0.5}
          glow={0.8}
          brightness={1}
          vignette={0.3}
          grain={0.06}
          mouseStrength={1}
          pulseOnClick
          lightMode={false}
        />
      </div>
    </div>
  );
}
