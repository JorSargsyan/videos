import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";
import { Background } from "../components/Background";
import { Caption } from "../components/Caption";
import { Phone } from "../components/Phone";
import { Outro } from "../components/Outro";
import { Camera, Flash, Particles, Sweep, rnd } from "../components/Fx";
import { theme } from "../theme";

/** Video 7 — "The Journal That Grades You" — 18 s */
const S1 = 0; // flat opener
const S2 = 60; // glitch + GRADES
const S3 = 120; // phone + stamps
const S4 = 330; // column
const S5 = 444; // outro
export const VIDEO7_DURATION = 540;

const ORANGE = "#F97316";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// one stamp per beat; `row` is the matching card on the History screenshot (screen coords)
const STAMPS = [
  { label: "CLEAN SETUP", sub: "+$450", color: theme.green, at: 34, x: 420, y: 800, rot: -7, row: { top: 478, h: 131 } },
  { label: "WEAK SETUP", sub: "−$300", color: ORANGE, at: 70, x: 650, y: 1010, rot: 6, row: { top: 621, h: 131 } },
  { label: "NO EDGE", sub: "", color: theme.red, at: 106, x: 350, y: 1250, rot: -5, row: { top: 908, h: 130 } },
  { label: "REASONABLE", sub: "", color: theme.blue, at: 142, x: 730, y: 1450, rot: 7, row: { top: 765, h: 130 } },
];
const HITS = STAMPS.map((s) => S3 + s.at);

export const Video7: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: theme.font, background: theme.bg }}>
      <Camera
        cuts={[S2, S3, S4, S5]}
        whips={[S3]}
        shakes={[
          { at: S2, amount: 30, len: 10 },
          { at: S2 + 22, amount: 26, len: 14 },
          { at: HITS[0], amount: 14 },
          { at: HITS[1], amount: 32, len: 18 },
          { at: HITS[2], amount: 18 },
          { at: HITS[3], amount: 14 },
          { at: S4 + 4, amount: 12 },
          { at: S5 + 6, amount: 18 },
        ]}
      >
        <Background />
        <Particles />

        <Sequence from={S1} durationInFrames={S2 - S1} name="Flat">
          <Flat />
        </Sequence>
        <Sequence from={S2} durationInFrames={S3 - S2 + 4} name="Grades">
          <Grades />
        </Sequence>
        <Sequence from={S3} durationInFrames={S5 - S3 + 4} name="Phone">
          <PhoneScene />
        </Sequence>
        <Sequence from={S5} durationInFrames={VIDEO7_DURATION - S5} name="Outro">
          <Outro tagline="One journal that tells the truth." />
        </Sequence>
      </Camera>

      <Flash at={[S2]} strength={0.9} />
      <Flash at={[S2 + 22]} color={theme.blue} strength={0.5} />
      <Flash at={[HITS[0]]} color={theme.green} strength={0.3} />
      <Flash at={[HITS[1]]} color={ORANGE} strength={0.55} />
      <Flash at={[HITS[2]]} color={theme.red} strength={0.35} />
      <Flash at={[HITS[3]]} color={theme.blue} strength={0.3} />
    </AbsoluteFill>
  );
};

/* ---------- Scene 1: deliberately flat ---------- */
const Flat: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [6, 20], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "rgba(6,8,15,0.82)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 62, fontWeight: 500, color: "rgba(255,255,255,0.55)", opacity: o, letterSpacing: -0.5 }}>Most journals store trades.</div>
    </AbsoluteFill>
  );
};

/* ---------- Scene 2: glitch + slam ---------- */
const Grades: React.FC = () => {
  const frame = useCurrentFrame();
  const len = S3 - S2;
  const out = interpolate(frame, [len - 6, len], [1, 0], clamp);
  const g = interpolate(frame, [0, 12], [1, 0], clamp); // glitch amount
  const dx = g * 26 * (rnd(frame, 41) > 0.5 ? 1 : -1);
  return (
    <AbsoluteFill style={{ opacity: out, transform: `scale(${interpolate(frame, [len - 6, len], [1, 1.3], clamp)})` }}>
      {/* glitch slices */}
      {g > 0 &&
        Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (rnd(frame * 3 + i, 42) - 0.5) * 300,
              top: rnd(frame + i, 43) * 1920,
              width: 1380,
              height: 14 + rnd(frame + i, 44) * 90,
              background: i % 3 === 0 ? "rgba(239,68,68,0.5)" : i % 3 === 1 ? "rgba(34,211,238,0.5)" : "rgba(255,255,255,0.35)",
              opacity: g,
            }}
          />
        ))}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 70 }}>
        <div style={{ transform: `translateX(${dx}px) skewX(${g * 12}deg)` }}>
          <Caption
            words={["This", "one", { text: "GRADES", color: theme.blue }, "them."]}
            size={140}
            weight={900}
            mode="slam"
            stagger={5}
            startDelay={8}
            maxWidth={900}
            style={{ textShadow: g > 0 ? `${g * 18}px 0 rgba(239,68,68,0.9), ${-g * 18}px 0 rgba(34,211,238,0.9)` : undefined }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Scenes 3+4: phone, stamps, column ---------- */
const PhoneScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s4 = S4 - S3;
  const len = S5 - S3;

  const enter = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90 } });
  const rotIn = interpolate(enter, [0, 1], [-85, 0]);
  const idle = Math.sin(frame / 30) * 3;
  const recede = spring({ frame: frame - s4, fps, config: { damping: 18, stiffness: 90 } });
  const scale = interpolate(recede, [0, 1], [1, 0.88]);
  const phoneOpacity = enter * interpolate(recede, [0, 1], [1, 0.28]);
  const y = interpolate(enter, [0, 1], [500, 0]);
  const scan = interpolate(frame, [18, 34], [-60, 1300], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const out = interpolate(frame, [len - 6, len + 2], [1, 0], clamp);

  let glow = "rgba(74,124,255,0.4)";
  for (const s of STAMPS) if (frame >= s.at) glow = s.color + "77";

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, height: 1400 }}>
        <Phone screen="screen5.jpg" width={560} rotateY={rotIn + idle} y={y} scale={scale} opacity={phoneOpacity} glow={glow}>
          <Sweep at={14} len={18} />
          <div style={{ position: "absolute", left: 0, right: 0, top: scan, height: 6, background: theme.blue, boxShadow: `0 0 30px ${theme.blue}, 0 0 80px ${theme.blue}`, opacity: frame > 18 && frame < 34 ? 0.9 : 0 }} />
          {STAMPS.map((s, i) => {
            const hl = spring({ frame: frame - s.at + 4, fps, config: { damping: 11, stiffness: 180 } });
            return (
              <div key={i} style={{ position: "absolute", left: 13, top: s.row.top - 4, width: 544, height: s.row.h + 8, borderRadius: 24, border: `4px solid ${s.color}`, background: `${s.color}22`, boxShadow: `0 0 34px ${s.color}`, opacity: hl, transform: `scale(${interpolate(hl, [0, 1], [1.15, 1])})` }} />
            );
          })}
        </Phone>
      </div>

      {/* stamps */}
      {STAMPS.map((s, i) => {
        const hit = spring({ frame: frame - s.at, fps, config: { damping: 11, stiffness: 240, mass: 0.6 } });
        const col = spring({ frame: frame - s4 - i * 3, fps, config: { damping: 13, stiffness: 140 } });
        const x = interpolate(col, [0, 1], [s.x, 540]);
        const yy = interpolate(col, [0, 1], [s.y, 700 + i * 200]);
        const rot = interpolate(col, [0, 1], [s.rot, 0]);
        const sc = interpolate(hit, [0, 1], [3.4, 1]) * interpolate(col, [0, 0.5, 1], [1, 1.12, 1]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: yy,
              width: s.sub ? 780 : 600,
              marginLeft: s.sub ? -390 : -300,
              whiteSpace: "nowrap",
              padding: "24px 0",
              boxSizing: "border-box",
              textAlign: "center",
              color: s.color,
              border: `7px solid ${s.color}`,
              borderRadius: 26,
              background: "rgba(6,8,15,0.88)",
              boxShadow: `0 0 70px ${s.color}88`,
              transform: `translateY(-50%) rotate(${rot}deg) scale(${sc})`,
              opacity: Math.min(hit * 1.6, 1),
              filter: `blur(${interpolate(hit, [0, 0.8, 1], [10, 1, 0], clamp)}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 26,
            }}
          >
            <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: 3 }}>{s.label}</span>
            {s.sub ? <span style={{ fontSize: 58, fontWeight: 900, color: theme.white }}>{s.sub}</span> : null}
          </div>
        );
      })}

      <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "0 60px" }}>
        {frame < s4 ? (
          <Caption words={["Every", "trade", "gets", "a", { text: "verdict.", color: theme.blue }]} size={96} mode="slam" stagger={4} startDelay={10} maxWidth={900} exitAt={s4 - 8} />
        ) : (
          <Caption
            words={["Every", "idea.", "Every", "outcome.", { text: "One", color: theme.blue }, { text: "verdict", color: theme.blue }, { text: "each.", color: theme.blue }]}
            size={84}
            mode="slam"
            stagger={5}
            startDelay={s4 + 6}
            maxWidth={820}
            exitAt={len - 10}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
