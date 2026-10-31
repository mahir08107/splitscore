"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamic client-only import (ssr: false) for React Bits WebGL2 component
const GhostFibers = dynamic<any>(
  () => import("@/components/GhostFibers"),
  { ssr: false }
);

export default function GhostFibersHeroBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center"
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
