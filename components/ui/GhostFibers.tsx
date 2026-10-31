"use client";

import React, { useRef, useEffect } from "react";
import "./GhostFibers.css";

export interface GhostFibersProps {
  lightMode?: boolean;
  glowColor?: string;
  secondaryColor?: string;
  lineColor?: string;
  gradient?: string;
  layers?: number;
  threads?: number;
  density?: number;
  thickness?: number;
  twist?: number;
  volume?: number;
  spread?: number;
  waves?: number;
  flow?: number;
  speed?: number;
  rollSpeed?: number;
  rotation?: number;
  perspective?: number;
  fiberStyle?: string;
  tips?: number;
  foldGlow?: number;
  depthOfField?: number;
  focusDepth?: number;
  particles?: number;
  sparkle?: number;
  glow?: number;
  brightness?: number;
  vignette?: number;
  grain?: number;
  mouseInteraction?: boolean;
  hoverEffect?: string;
  mouseStrength?: number;
  pulseOnClick?: boolean;
  intro?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function GhostFibers(props: GhostFibersProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // WebGL2 initialization hook
    const canvas = canvasRef.current;
    if (!canvas) return;
  }, [props]);

  return (
    <div
      className={`ghost-fibers-container ${props.className || ""}`}
      style={props.style}
    >
      <canvas ref={canvasRef} className="ghost-fibers-canvas" />
    </div>
  );
}
