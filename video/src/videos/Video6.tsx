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

/** Video 6 — "Meet The Sniper" — 15 s */
const S1 = 0; // hook
const S2 = 54; // roulette + reveal
const S3 = 180; // phone + orbiting traits
const S4 = 300; // built from your trades
const S5 = 366; // outro
export const VIDEO6_DURATION = 450;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// roulette: 7 slots like the app's profile row; the highlight slows down and lands on slot 6 (the eye)
const SLOTS = 7;
const TARGET = 5;
const STEPS = SLOTS + TARGET; // one full lap, then on to the target
const STEP_AT: number[] = [];
{
  let t = 8;
  for (let k = 0; k <= STEPS; k++) {
    STEP_AT.push(Math.round(t));
    t += 2 + 7 * Math.pow(k / STEPS, 2);
  }
}
const LOCK_LOCAL = STEP_AT[STEPS];
const LOCK = S2 + LOCK_LOCAL;
const SWAP = S4 + 36;

export const Video6: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: theme.font, background: theme.bg }}>
      <Camera
        cuts={[S1, S2, S3, S4, S5]}
        whips={[S2, S3]}
        shakes={[
          { at: 2, amount: 8 },
          { at: 23, amount: 18 },
          ...STEP_AT.slice(0, STEPS).map((t) => ({ at: S2 + t, amount: 3, len: 3 })),
          { at: LOCK, amount: 32, len: 20 },
          { at: LOCK + 10, amount: 14 },
          { at: S4, amount: 12 },
          { at: SWAP, amount: 16 },
          { at: S5 + 6, amount: 18 },
        ]}
      >
        <Background />
        <Particles color={theme.green} />

        <Sequence from={S1} durationInFrames={S2 - S1 + 4} name="Hook">
          <Hook />
        </Sequence>
        <Sequence from={S2} durationInFrames={S3 - S2 + 4} name="Roulette">
          <Roulette />
        </Sequence>
        <Sequence from={S3} durationInFrames={S5 - S3 + 4} name="Phone">
          <PhoneScene />
        </Sequence>
        <Sequence from={S5} durationInFrames={VIDEO6_DURATION - S5} name="Outro">
          <Outro tagline="Meet your trader personality." />
        </Sequence>
      </Camera>

      <Flash at={[2]} strength={0.3} />
      <Flash at={[23]} color={theme.blue} strength={0.55} />
      <Flash at={[LOCK]} color={theme.green} strength={0.85} />
      <Flash at={[SWAP]} strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Scene 1 ---------- */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const len = S2 - S1;
  const out = interpolate(frame, [len - 6, len], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80, opacity: out, transform: `scale(${interpolate(frame, [len - 6, len], [1, 1.3], clamp)})` }}>
      <Caption words={["Which", "trader", "are", { text: "YOU?", color: theme.blue }]} size={136} mode="slam" stagger={7} startDelay={2} maxWidth={900} />
    </AbsoluteFill>
  );
};

const Eye: React.FC<{ size: number; open: number; color?: string }> = ({ size, open, color = theme.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: `scaleY(${open})`, filter: `drop-shadow(0 0 ${size / 8}px ${color})` }}>
    <path d="M2 12 Q12 3.5 22 12 Q12 20.5 2 12 Z" fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3.6" fill={color} />
    <circle cx="12" cy="12" r="1.3" fill="#06140c" />
  </svg>
);

/* ---------- Scene 2: roulette + reveal ---------- */
const Roulette: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = S3 - S2;
  const lock = LOCK_LOCAL;
  const out = interpolate(frame, [len - 6, len], [1, 0], clamp);

  let step = -1;
  for (let k = 0; k <= STEPS; k++) if (frame >= STEP_AT[k]) step = k;
  const active = step < 0 ? -1 : step % SLOTS;
  const locked = frame >= lock;

  const CX = 540;
  const CY = 900;
  const R = 340;
  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 120 } });
  const reveal = spring({ frame: frame - lock, fps, config: { damping: 10, stiffness: 150, mass: 0.8 } });
  const eyeOpen = spring({ frame: frame - lock - 4, fps, config: { damping: 9, stiffness: 160 } });
  const wave = interpolate(frame, [lock, lock + 34], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const spinAll = interpolate(enter, [0, 1], [-90, 0]);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", top: 190, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: interpolate(frame, [lock - 2, lock + 4], [1, 0], clamp) }}>
        <Caption words={["Reading", "your", { text: "trades…", color: theme.blue }]} size={84} mode="slam" stagger={5} startDelay={4} />
      </div>

      {/* shockwave */}
      {locked &&
        [0, 1].map((i) => (
          <div key={i} style={{ position: "absolute", left: CX - 200, top: CY - 200, width: 400, height: 400, borderRadius: "50%", border: `${8 - i * 3}px solid ${theme.green}`, opacity: (1 - wave) * 0.9, transform: `scale(${1 + wave * (2.4 + i)})` }} />
        ))}

      {Array.from({ length: SLOTS }).map((_, i) => {
        const a = ((i / SLOTS) * 360 - 90 + spinAll) * (Math.PI / 180);
        const isTarget = i === TARGET;
        const on = active === i;
        const x0 = CX + Math.cos(a) * R;
        const y0 = CY + Math.sin(a) * R;
        const x = isTarget ? interpolate(reveal, [0, 1], [x0, CX]) : x0;
        const y = isTarget ? interpolate(reveal, [0, 1], [y0, CY]) : y0;
        const size = 150;
        const scale = (isTarget && locked ? interpolate(reveal, [0, 1], [1.2, 2.7]) : on ? 1.2 : 1) * enter;
        const opacity = locked && !isTarget ? interpolate(frame, [lock, lock + 8], [1, 0], clamp) : enter;
        const lit = on || (isTarget && locked);
        const c = isTarget && locked ? theme.green : theme.blue;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: lit ? `${c}33` : "rgba(255,255,255,0.05)",
              border: `4px solid ${lit ? c : "rgba(255,255,255,0.16)"}`,
              boxShadow: lit ? `0 0 50px ${c}, inset 0 0 30px ${c}55` : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${scale})`,
              opacity,
              fontSize: 72,
              fontWeight: 900,
              color: lit ? theme.white : "rgba(255,255,255,0.3)",
              zIndex: isTarget ? 2 : 1,
            }}
          >
            {isTarget && locked ? <Eye size={96} open={Math.max(eyeOpen, 0.05)} /> : "?"}
          </div>
        );
      })}

      {/* name */}
      <div style={{ position: "absolute", top: 1210, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <Caption words={[{ text: "THE", color: theme.green }, { text: "SNIPER", color: theme.green }]} size={150} weight={900} mode="slam" stagger={5} startDelay={lock + 8} maxWidth={1000} style={{ textShadow: "0 0 60px rgba(34,197,94,0.6)" }} />
        <Caption words={["Patient", "and", "selective."]} size={64} weight={600} mode="rise" stagger={4} startDelay={lock + 24} style={{ color: "rgba(255,255,255,0.75)" }} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scenes 3+4: phone with orbiting traits ---------- */
const TRAITS = ["Patient", "Selective", "Follows Rules", "Consistent Sizing"];

const PhoneScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s4 = S4 - S3;
  const swap = SWAP - S3;
  const len = S5 - S3;

  const enter = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90 } });
  const rotIn = interpolate(enter, [0, 1], [85, 0]);
  const idle = Math.sin(frame / 30) * 4;
  const pull = spring({ frame: frame - s4 + 4, fps, config: { damping: 16, stiffness: 90 } });
  const scale = interpolate(pull, [0, 1], [1, 0.74]);
  const y = interpolate(enter, [0, 1], [500, 0]) + interpolate(pull, [0, 1], [0, 330]);
  const scan = interpolate(frame, [22, 46], [-60, 1300], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const chipsOut = interpolate(frame, [s4 - 4, s4 + 8], [1, 0], clamp);
  const out = interpolate(frame, [len - 6, len + 2], [1, 0], clamp);

  const chips = TRAITS.map((t, i) => {
    const s = spring({ frame: frame - 30 - i * 6, fps, config: { damping: 11, stiffness: 120 } });
    const a = frame * 0.045 + (i * Math.PI) / 2;
    const depth = Math.sin(a);
    const x = 540 + Math.cos(a) * 290 * s;
    const yy = 1140 + depth * 150 * s + (i - 1.5) * 150 * s;
    return { t, s, depth, x, y: yy };
  });
  const renderChip = (c: (typeof chips)[number], i: number) => (
    <div
      key={i}
      style={{
        position: "absolute",
        left: c.x,
        top: c.y,
        transform: `translate(-50%, -50%) scale(${(0.8 + c.depth * 0.25) * c.s})`,
        padding: "22px 40px",
        borderRadius: 999,
        background: "rgba(12,22,20,0.92)",
        border: `3px solid ${theme.green}`,
        boxShadow: "0 0 40px rgba(34,197,94,0.55), 0 16px 50px rgba(0,0,0,0.5)",
        fontSize: 44,
        fontWeight: 800,
        color: theme.white,
        whiteSpace: "nowrap",
        opacity: Math.min(c.s * 1.5, 1) * chipsOut * (0.7 + (c.depth + 1) * 0.15),
        filter: c.depth < -0.3 ? "blur(2px)" : undefined,
      }}
    >
      {c.t}
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: out }}>
      {chips.map((c, i) => (c.depth < 0 ? renderChip(c, i) : null))}

      <div style={{ position: "absolute", top: 560, left: 0, right: 0, height: 1400 }}>
        <Phone screen="screen7.jpg" width={560} rotateY={rotIn + idle} y={y} scale={scale} opacity={enter} glow="rgba(34,197,94,0.45)">
          <Sweep at={18} len={20} />
          <Sweep at={swap + 2} len={18} />
          <div style={{ position: "absolute", left: 0, right: 0, top: scan, height: 6, background: theme.green, boxShadow: `0 0 30px ${theme.green}, 0 0 80px ${theme.green}`, opacity: frame > 22 && frame < 46 ? 0.9 : 0 }} />
        </Phone>
      </div>

      {chips.map((c, i) => (c.depth >= 0 ? renderChip(c, i) : null))}

      <div style={{ position: "absolute", top: 160, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "0 60px" }}>
        {frame < s4 ? (
          <Caption words={["Your", "trading", { text: "DNA.", color: theme.green }]} size={110} mode="slam" stagger={5} startDelay={12} maxWidth={940} exitAt={s4 - 8} />
        ) : frame < swap ? (
          <Caption words={["Built", "from", { text: "your", color: theme.green }, { text: "trades.", color: theme.green }]} size={108} mode="slam" stagger={4} startDelay={s4 + 2} maxWidth={940} exitAt={swap - 6} />
        ) : (
          <Caption words={[{ text: "NOT", color: theme.red }, "a", "quiz."]} size={150} weight={900} mode="slam" stagger={4} startDelay={swap} maxWidth={940} />
        )}
      </div>
    </AbsoluteFill>
  );
};
