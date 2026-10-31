"use client";

/**
 * DashboardAmbientBackground
 * 
 * Two lightweight CSS-only ambient layers for the logged-in dashboard shell:
 *   Layer 1 — "Corner Aurora": soft, slowly drifting gradient blobs anchored
 *             to viewport corners, fading to transparent before the card grid.
 *   Layer 2 — "Ledger Grid": a nearly invisible dot-grid pattern evoking a
 *             ledger/spreadsheet surface.
 *
 * Both layers are pointer-events:none, -z-10, and respect prefers-reduced-motion.
 * Pure CSS keyframes — no WebGL, no canvas, no external deps.
 */

export default function DashboardAmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* ─── LAYER 2: Ledger Grid (bottom, behind aurora) ─── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(254,205,211,0.055) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* ─── LAYER 1: Corner Aurora Blobs ─── */}

      {/* Top-left blob — pale blush */}
      <div
        className="absolute motion-safe:animate-[aurora-tl_50s_ease-in-out_infinite]"
        style={{
          top: "-8%",
          left: "-6%",
          width: "45vw",
          height: "45vh",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(254,205,211,0.18), rgba(254,205,211,0.04) 60%, transparent 85%)",
          filter: "blur(140px)",
        }}
      />

      {/* Top-right blob — mid rose */}
      <div
        className="absolute motion-safe:animate-[aurora-tr_55s_ease-in-out_infinite]"
        style={{
          top: "-10%",
          right: "-8%",
          width: "40vw",
          height: "40vh",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 70% 30%, rgba(244,63,94,0.12), rgba(244,63,94,0.03) 55%, transparent 80%)",
          filter: "blur(160px)",
        }}
      />

      {/* Bottom-left blob — deep crimson whisper */}
      <div
        className="absolute motion-safe:animate-[aurora-bl_60s_ease-in-out_infinite]"
        style={{
          bottom: "-12%",
          left: "-5%",
          width: "42vw",
          height: "42vh",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 25% 70%, rgba(190,18,60,0.10), rgba(190,18,60,0.02) 50%, transparent 80%)",
          filter: "blur(150px)",
        }}
      />

      {/* Bottom-right blob — blush pink */}
      <div
        className="absolute motion-safe:animate-[aurora-br_48s_ease-in-out_infinite]"
        style={{
          bottom: "-8%",
          right: "-6%",
          width: "38vw",
          height: "38vh",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 75% 75%, rgba(255,228,230,0.16), rgba(255,228,230,0.03) 55%, transparent 82%)",
          filter: "blur(130px)",
        }}
      />
    </div>
  );
}

