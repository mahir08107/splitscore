"use client";

import dynamic from "next/dynamic";

interface GhostFibersProps {
  glowColor: string; layers: number; twist: number; threads: number;
  fiberStyle: string; depthOfField: number; hoverEffect: string;
  intro: boolean; mouseInteraction: boolean; lineColor: string;
  secondaryColor: string; gradient: string; waves: number; volume: number;
  spread: number; scale: number; rotation: number; perspective: number;
  density: number; thickness: number; tips: number; foldGlow: number;
  speed: number; flow: number; rollSpeed: number; focusDepth: number;
  particles: number; sparkle: number; glow: number; brightness: number;
  vignette: number; grain: number; mouseStrength: number;
  pulseOnClick: boolean; lightMode: boolean;
  dpr: number;
}

const GhostFibers = dynamic<GhostFibersProps>(
  () => import("@/components/GhostFibers"),
  { ssr: false }
);

export default function LoginGhostFibersBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden flex items-center justify-center"
      aria-hidden="true"
    >
      <div style={{ width: "100%", height: "600px", position: "relative" }}>
        <GhostFibers
          glowColor="#5BC5A7"
          layers={3}
          twist={1.2}
          threads={72}
          fiberStyle="dots"
          depthOfField={0.95}
          hoverEffect="focus"
          intro
          mouseInteraction
          lineColor="#9BE7D0"
          secondaryColor="#278F76"
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
          dpr={1}
          lightMode={false}
        />
      </div>
    </div>
  );
}
