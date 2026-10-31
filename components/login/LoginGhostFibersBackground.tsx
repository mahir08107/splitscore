"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const GhostFibers = dynamic<any>(
  () => import("@/components/GhostFibers"),
  { ssr: false }
);

export default function LoginGhostFibersBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden flex items-center justify-center"
      aria-hidden="true"
    >
      <div style={{ width: "100%", height: "600px", position: "relative" }}>
        <GhostFibers
          glowColor="#ef4444"
          layers={3}
          twist={1.2}
          threads={72}
          fiberStyle="dots"
          depthOfField={0.95}
          hoverEffect="focus"
          intro
          mouseInteraction
          lineColor="#dfd1fc"
          secondaryColor="#f43f5e"
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
          sparkle={0.7}
          glow={0.8}
          brightness={1.3}
          vignette={0.3}
          grain={0.06}
          mouseStrength={0.95}
          pulseOnClick
          lightMode={false}
        />
      </div>
    </div>
  );
}
