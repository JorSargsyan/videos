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

/** Video 10 — "Process Over Prediction" — 18 s */
const S1 = 0; // chaos
const S2 = 90; // quiet: process
const S3 = 150; // montage
const S4 = 390; // personal coach
const S5 = 450; // outro
export const VIDEO10_DURATION = 540;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// montage beats get shorter and shorter
const BEATS = [
  { word: "DEFINE.", screen: "screen4.jpg", color: theme.blue, len: 60 },
  { word: "CHECK.", screen: "screen2.jpg", color: "#F97316", len: 54 },
  { word: "CALM.", screen: "screen3.jpg", color: theme.green, len: 48 },
  { word: "REVIEW.", screen: "screen5.jpg", color: theme.blue, len: 42 },
  { word: "IMPROVE.", screen: "screen6.jpg", color: theme.green, len: 36 },
];
const BEAT_AT: number[] = [];
{
  let t = S3;
  for (const b of BEATS) {
    BEAT_AT.push(t);
    t += b.len;
  }
}
const FLICKERS = [10, 27, 41, 58, 73];
const chaosShakes = Array.from({ length: 17 }).map((_, i) => ({ at: 4 + i * 5, amount: 7 + (i % 3) * 4, len: 5 }));

export const Video10: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: theme.font, background: theme.bg }}>
      <Camera
        cuts={[...BEAT_AT, S4, S5]}
        whips={[S3]}
        shakes={[
          ...chaosShakes,
          { at: S2 + 12, amount: 10 },
          ...BEAT_AT.map((at) => ({ at: at + 6, amount: 18, len: 10 })),
          { at: S4 + 8, amount: 24, len: 16 },
          { at: S5 + 6, amount: 28, len: 22 },
        ]}
      >
        <Background />
        <Particles />

        <Sequence from={S1} durationInFrames={S3 - S1 + 4} name="Chaos">
          <Chaos />
        </Sequence>
        <Sequence from={S3} durationInFrames={S5 - S3 + 4} name="Montage">
          <Montage />
        </Sequence>
        <Sequence from={S5} durationInFrames={VIDEO10_DURATION - S5} name="Outro">
          <Outro tagline="Process over prediction." />
        </Sequence>
      </Camera>

      <Flash at={FLICKERS} color={theme.red} strength={0.32} />
      <Flash at={BEAT_AT.map((a) => a + 6)} strength={0.4} />
      <Flash at={[S4 + 8]} strength={0.75} />
      <Flash at={[S5 + 10]} color={theme.blue} strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Scenes 1+2: chaos, then quiet ---------- */
const Chaos: React.FC = () => {
  const frame = useCurrentFrame();
  const quietAt = S2 - S1;
  const len = S3 - S1;
  const quiet = frame >= quietAt;
  const t = Math.min(frame, quietAt); // the chart freezes when things go quiet
  const calm = interpolate(frame, [quietAt, quietAt + 10], [0, 1], clamp);
  const out = interpolate(frame, [len - 6, len], [1, 0], clamp);

  const W = 1200;
  const H = 1100;
  const n = 70;
  const pts: string[] = [];
  let last = 0;
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * W;
    const v =
      Math.sin(i * 0.33 + t * 0.55) * 0.3 +
      Math.sin(i * 0.11 - t * 0.37) * 0.28 +
      Math.sin(i * 0.71 + t * 0.9) * 0.12 +
      (rnd(i + Math.floor(t / 2) * 100, 51) - 0.5) * 0.22;
    const y = H / 2 + v * H * 0.5;
    pts.push(`${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`);
    last = y;
  }
  const up = Math.sin(t * 0.8) > 0;
  const col = quiet ? theme.blue : up ? theme.green : theme.red;
  const drawn = interpolate(frame, [0, 10], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: `radial-gradient(75% 60% at 50% 50%, rgba(239,68,68,${(1 - calm) * (0.22 + (up ? 0 : 0.16))}) 0%, transparent 72%)` }} />
      <div style={{ position: "absolute", left: -60, top: 410, opacity: interpolate(calm, [0, 1], [1, 0.22]), filter: quiet ? `blur(${calm * 4}px)` : undefined }}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <path d={pts.join(" ")} fill="none" stroke={col} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={9000} strokeDashoffset={9000 * (1 - drawn)} style={{ filter: `drop-shadow(0 0 22px ${col})` }} />
          <circle cx={W} cy={last} r={18} fill={col} style={{ filter: `drop-shadow(0 0 26px ${col})` }} />
        </svg>
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 70 }}>
        {!quiet ? (
          <Caption
            words={["Nobody", "can", { text: "predict", color: theme.red }, "the", "market."]}
            size={126}
            weight={900}
            mode="slam"
            stagger={7}
            startDelay={6}
            maxWidth={920}
            exitAt={quietAt - 6}
            style={{ textShadow: "0 6px 40px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)" }}
          />
        ) : (
          <Caption
            words={["But", "you", "control", "your", { text: "PROCESS.", color: theme.blue }]}
            size={124}
            weight={900}
            mode="slam"
            stagger={0}
            startDelay={quietAt + 12}
            maxWidth={920}
            style={{ textShadow: "0 0 60px rgba(74,124,255,0.45)" }}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Scenes 3+4: flip montage, then the coach ---------- */
const Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const abs = frame + S3;
  const s4 = S4 - S3;
  const len = S5 - S3;
  const FLIP = 6;

  // which beat are we in?
  let k = 0;
  for (let i = 0; i < BEATS.length; i++) if (abs >= BEAT_AT[i]) k = i;
  const final = abs >= S4;
  const beatStart = final ? S4 : BEAT_AT[k];
  const beatEnd = final ? S5 : k < BEATS.length - 1 ? BEAT_AT[k + 1] : S4;
  const local = abs - beatStart;
  const toEnd = beatEnd - abs;

  // flip in from -90, hold, flip out to +90 (except the final screen, which stays)
  const flipIn = interpolate(local, [0, FLIP + 2], [-90, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const flipOut = final ? 0 : interpolate(toEnd, [0, FLIP], [90, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const enter = spring({ frame: frame - 2, fps, config: { damping: 14, stiffness: 110 } });
  const idle = Math.sin(frame / 26) * 3;
  const rotY = (k === 0 && !final ? interpolate(enter, [0, 1], [-85, 0]) : flipIn) + flipOut + idle;

  const pop = spring({ frame: local - FLIP, fps, config: { damping: 9, stiffness: 220, mass: 0.6 } });
  const scale = interpolate(pop, [0, 1], [0.86, 1]) * (final ? interpolate(spring({ frame: local - 8, fps, config: { damping: 10, stiffness: 160 } }), [0, 1], [1.12, 1]) : 1);
  const color = final ? theme.blue : BEATS[k].color;
  const screen = final ? "screen1.jpg" : BEATS[k].screen;
  const wave = interpolate(frame, [s4 + 8, s4 + 42], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const out = interpolate(frame, [len - 6, len + 2], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: `radial-gradient(70% 55% at 50% 60%, ${color}33 0%, transparent 70%)` }} />

      {/* step dots */}
      <div style={{ position: "absolute", top: 440, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18, opacity: final ? interpolate(local, [0, 8], [1, 0], clamp) : Math.min(enter * 2, 1) }}>
        {BEATS.map((b, i) => (
          <div key={i} style={{ width: i === k ? 90 : 26, height: 14, borderRadius: 7, background: i <= k ? b.color : "rgba(255,255,255,0.18)", boxShadow: i === k ? `0 0 24px ${b.color}` : undefined }} />
        ))}
      </div>

      {final &&
        [0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: 540 - 260, top: 1180 - 260, width: 520, height: 520, borderRadius: "50%", border: `${9 - i * 3}px solid ${i === 1 ? theme.green : theme.blue}`, opacity: (1 - wave) * 0.9, transform: `scale(${1 + wave * (2 + i * 0.9)})` }} />
        ))}

      <div style={{ position: "absolute", top: 560, left: 0, right: 0, height: 1400 }}>
        <Phone screen={screen} width={560} rotateY={rotY} scale={scale} y={k === 0 && !final ? interpolate(enter, [0, 1], [500, 0]) : 0} opacity={k === 0 && !final ? enter : 1} glow={`${color}88`}>
          <Sweep at={(final ? s4 : BEAT_AT[k] - S3) + FLIP + 2} len={14} />
        </Phone>
      </div>

      <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "0 50px" }}>
        {final ? (
          <Caption words={["Your", "personal", { text: "AI", color: theme.blue }, { text: "trading", color: theme.blue }, { text: "coach.", color: theme.blue }]} size={100} weight={900} mode="slam" stagger={3} startDelay={s4 + 6} maxWidth={920} />
        ) : (
          <div key={k} style={{ opacity: interpolate(toEnd, [0, 5], [0, 1], clamp) }}>
            <Caption key={k} words={[{ text: BEATS[k].word, color }]} size={176} weight={900} mode="slam" startDelay={BEAT_AT[k] - S3 + 4} maxWidth={1040} style={{ textShadow: `0 0 70px ${color}99` }} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
