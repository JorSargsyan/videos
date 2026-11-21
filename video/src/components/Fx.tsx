import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** deterministic pseudo random */
export const rnd = (i: number, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Camera: zoom punch on every cut, optional whip-pan, continuous slow breathing.
 * `cuts` are absolute frames; `whips` are absolute frames where a horizontal whip happens.
 */
export const Camera: React.FC<{
  cuts: number[];
  whips?: number[];
  shakes?: { at: number; amount: number; len?: number }[];
  children: React.ReactNode;
}> = ({ cuts, whips = [], shakes = [], children }) => {
  const frame = useCurrentFrame();
  let scale = 1 + Math.sin(frame / 55) * 0.012 + 0.01;
  let x = 0;
  let y = 0;
  let blur = 0;

  for (const c of cuts) {
    if (frame < c) continue;
    const p = interpolate(frame, [c, c + 14], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
    scale += p * 0.14;
  }
  for (const w of whips) {
    const t = interpolate(frame, [w - 8, w, w + 8], [0, 1, 0], { ...clamp, easing: Easing.inOut(Easing.quad) });
    x += (frame < w ? -1 : 1) * t * 180 * (frame < w ? 1 : -1);
    blur += t * 26;
  }
  for (const s of shakes) {
    const len = s.len ?? 14;
    if (frame < s.at) continue;
    const env = interpolate(frame, [s.at, s.at + len], [1, 0], clamp);
    if (env > 0) {
      x += (rnd(frame, 1) - 0.5) * 2 * s.amount * env;
      y += (rnd(frame, 2) - 0.5) * 2 * s.amount * env;
    }
  }

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Full-frame flash at given frames (white or colored). */
export const Flash: React.FC<{ at: number[]; color?: string; strength?: number }> = ({
  at,
  color = "#ffffff",
  strength = 0.9,
}) => {
  const frame = useCurrentFrame();
  let o = 0;
  for (const a of at) {
    if (frame < a) continue;
    o += interpolate(frame, [a, a + 1, a + 7], [0, strength, 0], clamp);
  }
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: Math.min(o, 1), pointerEvents: "none" }} />;
};

/** Drifting particles + diagonal light streaks. */
export const Particles: React.FC<{ count?: number; color?: string }> = ({ count = 40, color = "#4A7CFF" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const speed = 0.6 + rnd(i, 3) * 1.6;
        const x = rnd(i, 4) * 1080 + Math.sin(frame / 40 + i) * 30;
        const y = ((rnd(i, 5) * 1920 - frame * speed) % 1920 + 1920) % 1920;
        const size = 2 + rnd(i, 6) * 5;
        const o = 0.15 + rnd(i, 7) * 0.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: o,
              boxShadow: `0 0 ${size * 3}px ${color}`,
            }}
          />
        );
      })}
      {[0, 1, 2].map((i) => {
        const t = ((frame * (1.4 + i * 0.5) + i * 700) % 2600) - 600;
        return (
          <div
            key={"s" + i}
            style={{
              position: "absolute",
              left: -400,
              top: t,
              width: 1900,
              height: 220,
              transform: "rotate(-24deg)",
              background: `linear-gradient(180deg, transparent, rgba(255,255,255,${0.035 + i * 0.01}), transparent)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Light sweep across a surface (use inside an overflow:hidden box). */
export const Sweep: React.FC<{ at: number; len?: number; angle?: number }> = ({ at, len = 26, angle = 20 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + len], [-1, 2], clamp);
  if (p <= -1 || p >= 2) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(${90 + angle}deg, transparent ${p * 50 - 15}%, rgba(255,255,255,0.35) ${p * 50}%, transparent ${p * 50 + 15}%)`,
        pointerEvents: "none",
      }}
    />
  );
};

/** Animated line chart: rises, then (optionally) crashes after `crashAt`. */
export const Chart: React.FC<{
  width: number;
  height: number;
  startAt: number;
  crashAt?: number;
  color?: string;
  crashColor?: string;
}> = ({ width, height, startAt, crashAt, color = "#22C55E", crashColor = "#EF4444" }) => {
  const frame = useCurrentFrame();
  const n = 60;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    let v = 0.75 - t * 0.55 + Math.sin(t * 18) * 0.05 + (rnd(i, 9) - 0.5) * 0.06;
    pts.push([t * width, v * height]);
  }
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const len = 4000;
  const drawn = interpolate(frame, [startAt, startAt + 70], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const crash = crashAt !== undefined ? interpolate(frame, [crashAt, crashAt + 18], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  const cx = pts[n][0];
  const cy = pts[n][1];
  const crashLen = height * 0.95 - cy;
  const col = crash > 0 ? crashColor : color;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={col} stopOpacity="0.35" />
          <stop offset="1" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={col}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len - drawn * len}
        style={{ filter: `drop-shadow(0 0 18px ${col})` }}
      />
      {drawn >= 1 && (
        <>
          <path
            d={`M${cx},${cy} L${cx + 40 * crash},${cy + crashLen * crash}`}
            stroke={crashColor}
            strokeWidth={9}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 22px ${crashColor})` }}
          />
          <circle
            cx={cx + 40 * crash}
            cy={cy + crashLen * crash}
            r={14 + Math.sin(frame / 3) * 3}
            fill={col}
            style={{ filter: `drop-shadow(0 0 20px ${col})` }}
          />
        </>
      )}
    </svg>
  );
};
