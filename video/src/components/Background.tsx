import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { theme } from "../theme";

/** Deep navy background with two slowly drifting glows and a soft vignette. */
export const Background: React.FC<{ glow?: string; intensity?: number }> = ({
  glow = theme.blue,
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const x1 = 50 + Math.sin(t * 0.35) * 18;
  const y1 = 30 + Math.cos(t * 0.27) * 12;
  const x2 = 50 + Math.cos(t * 0.22) * 22;
  const y2 = 80 + Math.sin(t * 0.31) * 10;
  const a = 0.26 * intensity;
  const b = 0.16 * intensity;
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 45% at ${x1}% ${y1}%, ${hexA(glow, a)} 0%, transparent 70%),
                       radial-gradient(70% 50% at ${x2}% ${y2}%, ${hexA("#5B2FFF", b)} 0%, transparent 70%),
                       linear-gradient(180deg, ${theme.bg2} 0%, ${theme.bg} 60%)`,
        }}
      />
      {/* faint grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          maskImage:
            "radial-gradient(70% 60% at 50% 50%, black 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(70% 60% at 50% 50%, black 0%, transparent 100%)",
          opacity: interpolate(frame, [0, 30], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      />
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(80% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export function hexA(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
