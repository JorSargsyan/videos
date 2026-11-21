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
import { Camera, Flash, Particles, Sweep } from "../components/Fx";
import { theme } from "../theme";

/** Video 5 — "The Pattern You Can't See" — 18 s */
const S1 = 0; // hook
const S2 = 90; // bars
const S3 = 210; // phone + key finding
const S4 = 360; // pull back, stats
const S5 = 450; // outro
export const VIDEO5_DURATION = 540;

const HIT1 = 48;
const HIT2 = 62;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type BarType = "W" | "L" | "B";
const BARS: { size: number; type: BarType }[] = [
  { size: 1, type: "W" },
  { size: 1, type: "L" },
  { size: 2.2, type: "B" },
  { size: 1, type: "W" },
  { size: 1, type: "L" },
  { size: 2.6, type: "B" },
  { size: 1, type: "W" },
  { size: 1, type: "L" },
  { size: 3, type: "B" },
];
const barAt = (i: number) => 14 + i * 10; // local to S2
const SPIKES = BARS.map((b, i) => (b.type === "B" ? S2 + barAt(i) + 4 : -1)).filter((x) => x > 0);

// key stat tiles on the Insights screenshot (screen coords)
const STATS = [
  { x: 18, color: theme.green },
  { x: 154, color: theme.red },
  { x: 290, color: theme.green },
  { x: 426, color: theme.red },
];
const STAT_START = S4 + 22;

export const Video5: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: theme.font, background: theme.bg }}>
      <Camera
        cuts={[S1, S2, S3, S4, S5]}
        whips={[S2, S3]}
        shakes={[
          { at: 2, amount: 9 },
          { at: HIT1, amount: 26, len: 12 },
          { at: HIT2, amount: 32, len: 16 },
          ...SPIKES.map((at, i) => ({ at, amount: 12 + i * 6, len: 10 })),
          { at: S3 + 62, amount: 12 },
          ...STATS.map((_, i) => ({ at: STAT_START + i * 7, amount: 6, len: 6 })),
          { at: S5 + 6, amount: 18 },
        ]}
      >
        <Background />
        <Particles />

        <Sequence from={S1} durationInFrames={S2 - S1 + 4} name="Hook">
          <Hook />
        </Sequence>
        <Sequence from={S2} durationInFrames={S3 - S2 + 4} name="Bars">
          <Bars />
        </Sequence>
        <Sequence from={S3} durationInFrames={S5 - S3 + 4} name="Phone">
          <PhoneScene />
        </Sequence>
        <Sequence from={S5} durationInFrames={VIDEO5_DURATION - S5} name="Outro">
          <Outro tagline="See your edge in numbers." />
        </Sequence>
      </Camera>

      <Flash at={[2]} strength={0.3} />
      <Flash at={[HIT1, HIT2]} color={theme.red} strength={0.6} />
      <Flash at={SPIKES} color={theme.amber} strength={0.3} />
      <Flash at={[S3 + 62]} color={theme.amber} strength={0.4} />
    </AbsoluteFill>
  );
};

/* ---------- Scene 1 ---------- */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const len = S2 - S1;
  const out = interpolate(frame, [len - 6, len], [1, 0], clamp);
  const red = interpolate(frame, [HIT1, HIT1 + 6], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: out, transform: `scale(${interpolate(frame, [len - 6, len], [1, 1.3], clamp)})` }}>
      <AbsoluteFill style={{ background: `radial-gradient(70% 55% at 50% 50%, rgba(239,68,68,${red * 0.4}) 0%, transparent 70%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 70 }}>
        {frame < HIT1 - 2 ? (
          <Caption words={["You", "size", "up", "after", "a", { text: "loss.", color: theme.red }]} size={118} mode="slam" stagger={5} startDelay={2} maxWidth={900} exitAt={HIT1 - 10} />
        ) : (
          <Caption words={[{ text: "EVERY.", color: theme.white }, { text: "TIME.", color: theme.red }]} size={190} weight={900} mode="slam" stagger={HIT2 - HIT1} startDelay={HIT1} maxWidth={900} lineHeight={1.02} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Scene 2: the pattern in bars ---------- */
const Bars: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = S3 - S2;
  const out = interpolate(frame, [len - 6, len], [1, 0], clamp);
  const UNIT = 190;
  const BW = 78;
  const GAP = 26;
  const LEFT = (1080 - (BARS.length * BW + (BARS.length - 1) * GAP)) / 2;
  const BASE = 1400;
  const col = (t: BarType) => (t === "W" ? theme.green : t === "L" ? theme.red : theme.amber);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "0 60px" }}>
        <Caption words={[{ text: "Loss.", color: theme.red }, "Then", { text: "bigger", color: theme.amber }, { text: "size.", color: theme.amber }]} size={104} mode="slam" stagger={6} startDelay={6} maxWidth={900} />
      </div>

      <div style={{ position: "absolute", left: LEFT - 10, top: 640, fontSize: 30, fontWeight: 800, letterSpacing: 5, color: "rgba(255,255,255,0.45)", opacity: interpolate(frame, [8, 18], [0, 1], clamp) }}>
        POSITION SIZE
      </div>
      {/* baseline */}
      <div style={{ position: "absolute", left: LEFT - 20, top: BASE, width: (1080 - 2 * LEFT + 40) * interpolate(frame, [4, 24], [0, 1], clamp), height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 2 }} />

      {BARS.map((b, i) => {
        const at = barAt(i);
        const big = b.type === "B";
        const s = spring({ frame: frame - at, fps, config: big ? { damping: 8, stiffness: 200, mass: 0.7 } : { damping: 14, stiffness: 180 } });
        const h = b.size * UNIT * s;
        const c = col(b.type);
        const label = spring({ frame: frame - at - 6, fps, config: { damping: 9, stiffness: 220 } });
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: LEFT + i * (BW + GAP),
                top: BASE - h,
                width: BW,
                height: Math.max(h, 0),
                borderRadius: "16px 16px 4px 4px",
                background: `linear-gradient(180deg, ${c}, ${c}99)`,
                boxShadow: `0 0 ${big ? 60 : 24}px ${c}${big ? "cc" : "66"}`,
              }}
            />
            <div style={{ position: "absolute", left: LEFT + i * (BW + GAP) - 20, width: BW + 40, top: BASE + 22, textAlign: "center", fontSize: 30, fontWeight: 800, color: c, opacity: Math.min(s * 1.5, 1) }}>
              {b.type === "W" ? "WIN" : b.type === "L" ? "LOSS" : "↑"}
            </div>
            {big && (
              <div style={{ position: "absolute", left: LEFT + i * (BW + GAP) - 40, width: BW + 80, top: BASE - b.size * UNIT - 92, textAlign: "center", fontSize: 60, fontWeight: 900, color: theme.amber, transform: `scale(${interpolate(label, [0, 1], [2.4, 1])})`, opacity: Math.min(label * 1.6, 1), textShadow: "0 0 30px rgba(245,158,11,0.8)" }}>
                {b.size}×
              </div>
            )}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- Scenes 3+4: phone ---------- */
const PhoneScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s4 = S4 - S3;
  const len = S5 - S3;
  const statStart = STAT_START - S3;
  const pushAt = 40;
  const swap = 96; // second caption

  const enter = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90 } });
  const rotIn = interpolate(enter, [0, 1], [-85, 8]);
  const idle = Math.sin(frame / 30) * 3;
  const push = spring({ frame: frame - pushAt, fps, config: { damping: 18, stiffness: 70, mass: 1.1 } });
  const pull = spring({ frame: frame - s4 + 2, fps, config: { damping: 16, stiffness: 80 } });
  const zoom = push - pull;
  const scale = interpolate(zoom, [0, 1], [1, 1.3]);
  const y = interpolate(enter, [0, 1], [500, 0]) + interpolate(zoom, [0, 1], [0, -110]);
  const rotY = interpolate(push, [0, 1], [rotIn, 0]) + idle * (1 - zoom * 0.6);

  const scan = interpolate(frame, [24, 48], [-60, 1300], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const card = spring({ frame: frame - 56, fps, config: { damping: 12, stiffness: 150 } });
  const pct = spring({ frame: frame - 62, fps, config: { damping: 8, stiffness: 240, mass: 0.6 } });
  const hlOut = interpolate(frame, [s4 + 4, s4 + 16], [1, 0], clamp);
  const out = interpolate(frame, [len - 6, len + 2], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, height: 1400 }}>
        <Phone screen="screen6.jpg" width={560} rotateY={rotY} y={y} scale={scale} opacity={enter} glow={frame < s4 ? "rgba(245,158,11,0.4)" : "rgba(74,124,255,0.4)"}>
          <Sweep at={18} len={20} />
          <div style={{ position: "absolute", left: 0, right: 0, top: scan, height: 6, background: theme.amber, boxShadow: `0 0 30px ${theme.amber}, 0 0 80px ${theme.amber}`, opacity: frame > 24 && frame < 48 ? 0.9 : 0 }} />
          {/* key finding card */}
          <div style={{ position: "absolute", left: 12, top: 701, width: 546, height: 157, borderRadius: 24, border: `4px solid ${theme.amber}`, background: `rgba(245,158,11,${0.07 * card})`, boxShadow: "0 0 40px rgba(245,158,11,0.8), inset 0 0 30px rgba(245,158,11,0.2)", opacity: card * hlOut, transform: `scale(${interpolate(card, [0, 1], [1.2, 1])})` }} />
          {/* ring around 100% */}
          <div style={{ position: "absolute", left: 134, top: 760, width: 88, height: 46, borderRadius: 14, border: `4px solid ${theme.white}`, boxShadow: "0 0 24px rgba(255,255,255,0.9)", opacity: Math.min(pct * 1.5, 1) * hlOut, transform: `scale(${interpolate(pct, [0, 1], [2.6, 1])})` }} />
          {/* key stats pop one by one */}
          {STATS.map((s, i) => {
            const at = statStart + i * 7;
            const hl = spring({ frame: frame - at, fps, config: { damping: 10, stiffness: 190 } });
            return (
              <div key={i} style={{ position: "absolute", left: s.x - 3, top: 615, width: 132, height: 74, borderRadius: 16, border: `3px solid ${s.color}`, background: `${s.color}22`, boxShadow: `0 0 26px ${s.color}`, opacity: hl, transform: `scale(${interpolate(hl, [0, 1], [1.5, 1])})` }} />
            );
          })}
        </Phone>
      </div>

      <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "0 40px" }}>
        {frame < swap ? (
          <Caption words={["Shugo", "finds", "the", { text: "pattern.", color: theme.amber }]} size={68} mode="slam" stagger={4} startDelay={12} maxWidth={1000} exitAt={swap - 8} />
        ) : frame < s4 ? (
          <Caption words={["Your", "filter", "is", { text: "too", color: theme.amber }, { text: "loose.", color: theme.amber }]} size={68} mode="slam" stagger={4} startDelay={swap} maxWidth={1000} exitAt={s4 - 8} />
        ) : (
          <Caption words={["Your", "history", "is", { text: "talking.", color: theme.blue }]} size={100} mode="slam" stagger={4} startDelay={s4 + 4} maxWidth={900} exitAt={len - 10} />
        )}
      </div>
    </AbsoluteFill>
  );
};
