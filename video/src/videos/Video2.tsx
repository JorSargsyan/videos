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

/** Video 2 — "88 Calm" — 15 s */
const S1 = 0; // hook
const S2 = 72; // gauge
const S3 = 192; // phone
const S4 = 282; // revenge trades
const S5 = 384; // outro
export const VIDEO2_DURATION = 490;

const LOCK = S2 + 70; // gauge locks on 88
const SWAP = S4 + 76; // "Not a chart."

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const climbShakes = Array.from({ length: 10 }).map((_, i) => ({
  at: S2 + 8 + i * 6,
  amount: 3 + i * 0.8,
  len: 6,
}));

export const Video2: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: theme.font, background: theme.bg }}>
      <Camera
        cuts={[S1, S2, S3, S4, S5]}
        whips={[S2, S3]}
        shakes={[
          { at: 2, amount: 9 },
          { at: 42, amount: 9 },
          { at: 50, amount: 16 },
          ...climbShakes,
          { at: LOCK, amount: 30, len: 20 },
          { at: S3 + 78, amount: 8 },
          { at: S4, amount: 18, len: 18 },
          { at: SWAP, amount: 12 },
          { at: S5 + 6, amount: 18 },
        ]}
      >
        <Background />
        <Particles color={theme.green} />

        <Sequence from={S1} durationInFrames={S2 - S1 + 4} name="Hook">
          <Hook />
        </Sequence>

        <Sequence from={S2} durationInFrames={S3 - S2 + 30} name="Gauge">
          <GaugeScene />
        </Sequence>

        <Sequence from={S3} durationInFrames={S5 - S3 + 4} name="Phone">
          <PhoneScene />
        </Sequence>

        <Sequence from={S5} durationInFrames={VIDEO2_DURATION - S5} name="Outro">
          <Outro tagline="Know your state before every trade." taglineSize={50} />
        </Sequence>
      </Camera>

      <Flash at={[2, 42]} strength={0.3} />
      <Flash at={[50]} strength={0.6} />
      <Flash at={[LOCK]} color={theme.green} strength={0.8} />
      <Flash at={[S4]} color={theme.red} strength={0.6} />
      <Flash at={[SWAP]} color={theme.green} strength={0.5} />
    </AbsoluteFill>
  );
};

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
    {children}
  </AbsoluteFill>
);

/* ---------- Scene 1 ---------- */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const len = S2 - S1;
  const out = interpolate(frame, [len - 6, len], [1, 0], clamp);
  return (
    <Center>
      <div style={{ opacity: out, transform: `scale(${interpolate(frame, [len - 6, len], [1, 1.3], clamp)})` }}>
        {frame < 40 ? (
          <Caption words={["Before", "the", "chart…"]} size={110} mode="slam" stagger={6} startDelay={2} exitAt={32} maxWidth={960} />
        ) : (
          <Caption words={["check", { text: "YOURSELF.", color: theme.blue }]} size={132} mode="slam" stagger={8} startDelay={42} maxWidth={980} />
        )}
      </div>
    </Center>
  );
};

/* ---------- Scene 2: the gauge ---------- */
const stateFor = (v: number) =>
  v < 20
    ? { label: "TILTED", color: theme.red }
    : v < 40
      ? { label: "HEATED", color: "#F97316" }
      : v < 60
        ? { label: "ACTIVE", color: theme.amber }
        : v < 80
          ? { label: "FOCUSED", color: "#84CC16" }
          : { label: "CALM", color: theme.green };

const GaugeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lock = LOCK - S2;
  const shrinkAt = S3 - S2;

  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 130 } });
  const raw = interpolate(frame, [6, lock], [0, 88], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const jitter = frame < lock && frame > 6 ? (rnd(frame, 21) - 0.5) * 6 : 0;
  const v = Math.max(0, Math.min(99, raw + jitter));
  const shown = frame >= lock ? 88 : Math.round(v);
  const st = stateFor(shown);

  const pop = spring({ frame: frame - lock, fps, config: { damping: 8, stiffness: 220, mass: 0.7 } });
  const lockScale = frame >= lock ? interpolate(pop, [0, 1], [1.25, 1]) : 1;
  const ring = interpolate(frame, [lock, lock + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  // shrink into the phone
  const shrink = interpolate(frame, [shrinkAt - 4, shrinkAt + 20], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const scale = enter * lockScale * interpolate(shrink, [0, 1], [1, 0.52]);
  const y = interpolate(shrink, [0, 1], [-60, -20]);
  const opacity = interpolate(shrink, [0.5, 1], [1, 0], clamp);

  const R = 300;
  const C = 2 * Math.PI * R;
  const arc = 0.78; // portion of the circle used by the gauge
  const filled = (v / 100) * arc * C;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {/* caption above the gauge */}
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 1 - shrink }}>
        <Caption words={["Your", "emotional", "state."]} size={72} mode="slam" stagger={5} startDelay={6} weight={700} />
      </div>

      <div style={{ position: "relative", width: 760, height: 760, transform: `translateY(${y}px) scale(${scale})`, opacity }}>
        {/* shockwave on lock */}
        {frame >= lock &&
          [0, 1].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 40,
                borderRadius: "50%",
                border: `${8 - i * 3}px solid ${theme.green}`,
                opacity: (1 - ring) * 0.9,
                transform: `scale(${1 + ring * (1.2 + i * 0.7)})`,
              }}
            />
          ))}
        <svg width={760} height={760} viewBox="-380 -380 760 760" style={{ position: "absolute", inset: 0, transform: "rotate(130deg)" }}>
          <circle r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={46} strokeLinecap="round" strokeDasharray={`${arc * C} ${C}`} />
          <circle
            r={R}
            fill="none"
            stroke={st.color}
            strokeWidth={46}
            strokeLinecap="round"
            strokeDasharray={`${Math.max(filled, 0.01)} ${C}`}
            style={{ filter: `drop-shadow(0 0 28px ${st.color})` }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              fontSize: 260,
              fontWeight: 900,
              letterSpacing: -10,
              lineHeight: 1,
              color: st.color,
              fontVariantNumeric: "tabular-nums",
              textShadow: `0 0 60px ${st.color}`,
            }}
          >
            {shown}
          </div>
          <div style={{ marginTop: 14, fontSize: 64, fontWeight: 800, letterSpacing: 8, color: st.color }}>{st.label}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scenes 3+4: phone ---------- */
const SEGS: { x: number; w: number; color: string }[] = [
  { x: 18, w: 104, color: theme.red },
  { x: 126, w: 104, color: "#F97316" },
  { x: 233, w: 104, color: theme.amber },
  { x: 341, w: 103, color: "#84CC16" },
  { x: 448, w: 104, color: theme.green },
];

const PhoneScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s4 = S4 - S3;
  const swap = SWAP - S3;
  const len = S5 - S3;

  const enter = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90 } });
  const rotIn = interpolate(enter, [0, 1], [-80, 8]);
  const idle = Math.sin(frame / 30) * 3;

  // push in on the scale
  const push = spring({ frame: frame - 44, fps, config: { damping: 18, stiffness: 60, mass: 1.2 } });
  // pull back for scene 4
  const pull = spring({ frame: frame - s4 + 4, fps, config: { damping: 16, stiffness: 90 } });
  const scale = interpolate(push, [0, 1], [1, 1.32]) * interpolate(pull, [0, 1], [1, 0.72]);
  const y = interpolate(enter, [0, 1], [500, 0]) + interpolate(push, [0, 1], [0, -40]) + interpolate(pull, [0, 1], [0, 330]);
  const rotY = interpolate(push, [0, 1], [rotIn, 0]) + idle * (1 - push * 0.6);

  const scan = interpolate(frame, [30, 56], [-60, 1300], { ...clamp, easing: Easing.inOut(Easing.quad) });

  const red = interpolate(frame, [s4, s4 + 6, swap - 2, swap + 4], [0, 1, 1, 0], clamp);
  const green = interpolate(frame, [swap, swap + 6], [0, 1], clamp);
  const out = interpolate(frame, [len - 6, len + 2], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: `radial-gradient(75% 60% at 50% 45%, rgba(239,68,68,${red * 0.45}) 0%, transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(75% 60% at 50% 45%, rgba(34,197,94,${green * 0.25}) 0%, transparent 70%)` }} />

      {/* phone */}
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, height: 1400 }}>
        <Phone
          screen="screen3.jpg"
          width={560}
          rotateY={rotY}
          y={y}
          scale={scale}
          opacity={enter}
          glow={red > 0.5 ? "rgba(239,68,68,0.45)" : "rgba(34,197,94,0.4)"}
        >
          <Sweep at={22} len={22} />
          <div style={{ position: "absolute", left: 0, right: 0, top: scan, height: 6, background: theme.green, boxShadow: `0 0 30px ${theme.green}, 0 0 80px ${theme.green}`, opacity: scan > 0 && scan < 1250 ? 0.9 : 0 }} />
          {/* scale segments light up one by one */}
          {SEGS.map((s, i) => {
            const at = 58 + i * 5;
            const last = i === SEGS.length - 1;
            const hit = interpolate(frame, [at, at + 2, at + 12], [0, 1, last ? 1 : 0], clamp);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: s.x,
                  top: 571,
                  width: s.w,
                  height: 13,
                  borderRadius: 7,
                  background: s.color,
                  opacity: hit,
                  boxShadow: `0 0 24px ${s.color}, 0 0 60px ${s.color}`,
                  transform: `scaleY(${1 + hit * 0.8})`,
                }}
              />
            );
          })}
          {/* lock box on Calm */}
          {(() => {
            const hl = spring({ frame: frame - 80, fps, config: { damping: 11, stiffness: 170 } });
            return (
              <div
                style={{
                  position: "absolute",
                  left: 436,
                  top: 556,
                  width: 128,
                  height: 66,
                  borderRadius: 16,
                  border: `3px solid ${theme.green}`,
                  boxShadow: `0 0 30px rgba(34,197,94,0.8), inset 0 0 20px rgba(34,197,94,0.3)`,
                  opacity: hl,
                  transform: `scale(${interpolate(hl, [0, 1], [1.6, 1])})`,
                }}
              />
            );
          })()}
        </Phone>
      </div>

      {/* captions (above the phone) */}
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "0 60px" }}>
        {frame < s4 ? (
          <Caption
            words={[{ text: "Tilted?", color: theme.red }, { text: "Heated?", color: theme.amber }, { text: "CALM?", color: theme.green }]}
            size={82}
            mode="slam"
            stagger={16}
            startDelay={14}
            maxWidth={980}
            exitAt={s4 - 10}
          />
        ) : frame < swap ? (
          <Caption
            words={["Revenge", "trades", "start", "with", "a", { text: "FEELING.", color: theme.red }]}
            size={104}
            mode="slam"
            stagger={9}
            startDelay={s4 + 1}
            maxWidth={960}
            exitAt={swap - 5}
          />
        ) : (
          <Caption words={["Not", "a", { text: "chart.", color: theme.green }]} size={128} mode="slam" stagger={4} startDelay={swap} maxWidth={960} />
        )}
      </div>
    </AbsoluteFill>
  );
};
