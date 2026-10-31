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
  scale?: number;
  waves?: number;
  flow?: number;
  speed?: number;
  rollSpeed?: number;
  rotation?: number;
  perspective?: number;
  fiberStyle?: "dots" | "lines" | string;
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
  hoverEffect?: "focus" | "deflect" | string;
  mouseStrength?: number;
  pulseOnClick?: boolean;
  intro?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function GhostFibers({
  lightMode = false,
  glowColor = "#f43f5e",
  secondaryColor = "#be123c",
  lineColor = "#dfd1fc",
  layers = 3,
  threads = 72,
  density = 1,
  thickness = 1,
  twist = 1.2,
  volume = 0.7,
  spread = 1,
  scale = 1,
  waves = 1,
  flow = 0.4,
  speed = 0.5,
  rollSpeed = 0.15,
  rotation = 18,
  perspective = 0.65,
  fiberStyle = "dots",
  depthOfField = 0.85,
  focusDepth = 0,
  particles = 0.5,
  sparkle = 0.5,
  glow = 0.8,
  brightness = 1,
  mouseInteraction = true,
  mouseStrength = 1,
  pulseOnClick = true,
  intro = true,
  className = "",
  style,
}: GhostFibersProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize);

    // Mouse coordinates (normalized -1 to 1)
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let pulse = 0;

    const handlePointerMove = (e: PointerEvent) => {
      if (!mouseInteraction) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouse.targetX = (clientX / width - 0.5) * 2;
      mouse.targetY = (clientY / height - 0.5) * 2;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!pulseOnClick) return;
      // Skip interactive UI elements
      const target = e.target as HTMLElement | null;
      if (
        target?.closest?.(
          'a, button, input, textarea, select, label, [role="button"]'
        )
      ) {
        return;
      }
      pulse = 1.0;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);

    // Sparkle particles
    const particleCount = Math.floor(60 * particles);
    const particleList = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.5 ? glowColor : lineColor,
    }));

    let time = 0;
    let introProgress = intro ? 0 : 1;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const render = () => {
      time += (prefersReducedMotion ? 0.002 : 0.016) * speed;
      if (introProgress < 1) {
        introProgress += 0.015;
      }

      // Smooth mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.06 * mouseStrength;
      mouse.y += (mouse.targetY - mouse.y) * 0.06 * mouseStrength;

      if (pulse > 0) {
        pulse = Math.max(0, pulse - 0.02);
      }

      // Background clear
      if (lightMode) {
        ctx.fillStyle = "#FCFBF7";
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
      }

      const cx = width * 0.5;
      const cy = height * 0.5;
      const radRot = (rotation * Math.PI) / 180;

      // Draw particle sparkles
      if (sparkle > 0) {
        for (const p of particleList) {
          p.phase += p.speed;
          const alpha =
            (0.3 + 0.7 * Math.sin(p.phase)) *
            brightness *
            introProgress *
            (1 + pulse * 0.5);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha * sparkle));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Fiber configuration
      const numThreads = Math.floor(threads * density);
      const pointsPerThread = fiberStyle === "dots" ? 36 : 48;
      const spreadX = width * 0.55 * spread * scale;
      const spreadY = height * 0.35 * volume * scale;

      // Draw ribbons across depth layers
      for (let layer = 0; layer < layers; layer++) {
        const layerDepth = layer / Math.max(1, layers - 1);
        const depthBlur = Math.abs(layerDepth - focusDepth) * depthOfField;
        const layerAlpha =
          Math.max(0.15, 1 - depthBlur * 0.6) * brightness * introProgress;

        for (let t = 0; t < numThreads; t++) {
          const threadFraction = t / numThreads;
          const phaseOffset = threadFraction * Math.PI * 2 * twist;

          // Color calculation
          let threadColor = lineColor;
          if (t % 3 === 0) threadColor = glowColor;
          else if (t % 3 === 1) threadColor = secondaryColor;

          ctx.fillStyle = threadColor;
          ctx.strokeStyle = threadColor;
          ctx.globalAlpha = layerAlpha * 0.85;

          if (glow > 0) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = glow * 10 * thickness * (1 + pulse);
          } else {
            ctx.shadowBlur = 0;
          }

          if (fiberStyle !== "dots") {
            ctx.beginPath();
            ctx.lineWidth = thickness * (1 - depthBlur * 0.4);
          }

          for (let p = 0; p <= pointsPerThread; p++) {
            const progress = p / pointsPerThread; // 0 to 1
            const u = (progress - 0.5) * 2; // -1 to 1

            // Wave harmonics
            const wave1 =
              Math.sin(u * Math.PI * 2 * waves + time * flow + phaseOffset) *
              spreadY;
            const wave2 =
              Math.cos(
                u * Math.PI * 3 + time * rollSpeed + threadFraction * 4
              ) *
              spreadY *
              0.4;

            // Mouse deflect & pulse distortion
            const distFromMouse = Math.hypot(
              u * (width * 0.5) - mouse.x * (width * 0.4),
              wave1 - mouse.y * (height * 0.3)
            );
            const mouseEffect =
              Math.exp(-distFromMouse / 180) * 45 * mouseStrength;
            const pulseDisplacement =
              Math.sin(u * 10 - time * 8) * pulse * 28;

            // 3D coordinates
            let px = u * spreadX + mouse.x * 20;
            let py = wave1 + wave2 + mouseEffect + pulseDisplacement;
            let pz =
              Math.sin(phaseOffset + time * rollSpeed) * 120 * perspective;

            // Rotation
            const rotX = px * Math.cos(radRot) - py * Math.sin(radRot);
            const rotY = px * Math.sin(radRot) + py * Math.cos(radRot);

            const screenX = cx + rotX;
            const screenY = cy + rotY;

            if (fiberStyle === "dots") {
              const dotRadius = Math.max(
                0.7,
                (1.4 + 0.8 * Math.sin(progress * Math.PI)) *
                  thickness *
                  (1 - depthBlur * 0.3) *
                  (1 + pulse * 0.4)
              );
              ctx.beginPath();
              ctx.arc(screenX, screenY, dotRadius, 0, Math.PI * 2);
              ctx.fill();
            } else {
              if (p === 0) ctx.moveTo(screenX, screenY);
              else ctx.lineTo(screenX, screenY);
            }
          }

          if (fiberStyle !== "dots") {
            ctx.stroke();
          }
        }
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [
    lightMode,
    glowColor,
    secondaryColor,
    lineColor,
    layers,
    threads,
    density,
    thickness,
    twist,
    volume,
    spread,
    scale,
    waves,
    flow,
    speed,
    rollSpeed,
    rotation,
    perspective,
    fiberStyle,
    depthOfField,
    focusDepth,
    particles,
    sparkle,
    glow,
    brightness,
    mouseInteraction,
    mouseStrength,
    pulseOnClick,
    intro,
  ]);

  return (
    <div
      className={`ghost-fibers-container ${className}`}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        className="ghost-fibers-canvas"
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
