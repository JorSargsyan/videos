import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Img,
  staticFile,
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

/** Video 9 — "Works Where You Trade" — 15 s */
const BEAT = 30;
const S2 = 90; // triangle
const S3 = 230; // push through + one account
const S4 = 330; // outro
export const VIDEO9_DURATION = 450;

const LINK = S2 + 52; // connection lines fire
const PUSH = S3; // camera dives into the phone
const SLAM = S3 + 16;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Video9: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: theme.font, background: theme.bg }}>
      <Camera
        cuts={[0, BEAT, BEAT * 2, S2, S4]}
        whips={[BEAT, BEAT * 2, S2]}
        shakes={[
          { at: 3, amount: 14 },
          { at: BEAT + 5, amount: 14 },
          { at: BEAT * 2 + 5, amount: 14 },
          { at: LINK, amount: 12 },
          { at: SLAM, amount: 30, len: 18 },
          { at: SLAM + 20, amount: 14 },
          { at: S4 + 6, amount: 20 },
        ]}
      >
        <Background />
        <Particles />

        {DEVICES.map((d, i) => (
          <Sequence key={i} from={i * BEAT} durationInFrames={BEAT + 2} name={d.word}>
            <DeviceBeat index={i} />
          </Sequence>
        ))}
        <Sequence from={S2} durationInFrames={S3 - S2 + 20} name="Triangle">
          <Triangle />
        </Sequence>
        <Sequence from={S3} durationInFrames={S4 - S3 + 4} name="One account">
          <OneAccount />
        </Sequence>
        <Sequence from={S4} durationInFrames={VIDEO9_DURATION - S4} name="Outro">
          <Outro tagline="Free · 1 month of Starter · No card needed" taglineSize={42} />
        </Sequence>
      </Camera>

      <Flash at={[3, BEAT + 5, BEAT * 2 + 5]} strength={0.35} />
      <Flash at={[LINK]} color={theme.blue} strength={0.4} />
      <Flash at={[SLAM]} strength={0.9} />
    </AbsoluteFill>
  );
};

/* ---------- little drawings ---------- */
const Candles: React.FC<{ w: number; h: number; n?: number; seed?: number }> = ({ w, h, n = 16, seed = 1 }) => {
  const bw = w / n;
  let price = 0.65;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      {Array.from({ length: n }).map((_, i) => {
        const move = (rnd(i, seed) - 0.42) * 0.16;
        const open = price;
        const close = Math.max(0.12, Math.min(0.9, price - move));
        price = close;
        const up = close < open;
        const top = Math.min(open, close) * h;
        const bh = Math.max(Math.abs(open - close) * h, 4);
        const c = up ? theme.green : theme.red;
        return (
          <g key={i}>
            <rect x={i * bw + bw / 2 - 1.5} y={top - 10} width={3} height={bh + 20} fill={c} opacity={0.7} />
            <rect x={i * bw + bw * 0.2} y={top} width={bw * 0.6} height={bh} rx={2} fill={c} />
          </g>
        );
      })}
    </svg>
  );
};

const frameStyle = (w: number, h: number): React.CSSProperties => ({
  width: w,
  height: h,
  borderRadius: 26,
  background: "rgba(10,13,28,0.95)",
  border: `4px solid ${theme.blue}`,
  boxShadow: "0 0 60px rgba(74,124,255,0.5), 0 30px 80px rgba(0,0,0,0.6)",
  overflow: "hidden",
  position: "relative",
  boxSizing: "border-box",
});

const ShugoBadge: React.FC<{ size: number }> = ({ size }) => (
  <Img src={staticFile("icon.png")} style={{ width: size, height: size, borderRadius: size * 0.24, boxShadow: "0 0 24px rgba(74,124,255,0.8)" }} />
);

/** Desktop monitor with a chart and a docked Shugo panel (illustrative). */
const Monitor: React.FC<{ w: number }> = ({ w }) => {
  const h = w * 0.62;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ ...frameStyle(w, h), display: "flex" }}>
        <div style={{ flex: 1, padding: w * 0.05, display: "flex", alignItems: "center" }}>
          <Candles w={w * 0.56} h={h * 0.7} seed={3} />
        </div>
        <div style={{ width: w * 0.28, borderLeft: "2px solid rgba(255,255,255,0.12)", padding: w * 0.035, display: "flex", flexDirection: "column", gap: w * 0.03, alignItems: "center" }}>
          <ShugoBadge size={w * 0.12} />
          {[0.9, 0.7, 0.8].map((k, i) => (
            <div key={i} style={{ width: `${k * 100}%`, height: w * 0.03, borderRadius: 8, background: i === 0 ? theme.green : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      <div style={{ width: w * 0.1, height: w * 0.09, background: theme.blue, opacity: 0.8 }} />
      <div style={{ width: w * 0.36, height: 12, borderRadius: 6, background: theme.blue }} />
    </div>
  );
};

/** Browser window with a chart and the extension pinned in the toolbar (illustrative). */
const Browser: React.FC<{ w: number }> = ({ w }) => {
  const h = w * 0.72;
  return (
    <div style={frameStyle(w, h)}>
      <div style={{ height: h * 0.16, borderBottom: "2px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", gap: w * 0.022, padding: `0 ${w * 0.04}px` }}>
        {[theme.red, theme.amber, theme.green].map((c) => (
          <div key={c} style={{ width: w * 0.032, height: w * 0.032, borderRadius: "50%", background: c }} />
        ))}
        <div style={{ flex: 1, height: h * 0.07, borderRadius: 99, background: "rgba(255,255,255,0.1)", marginLeft: w * 0.03 }} />
        <ShugoBadge size={h * 0.11} />
      </div>
      <div style={{ padding: w * 0.05 }}>
        <Candles w={w * 0.88} h={h * 0.62} n={20} seed={7} />
      </div>
    </div>
  );
};

const PhoneOutline: React.FC<{ w: number }> = ({ w }) => {
  const h = w * 2;
  return (
    <div style={{ ...frameStyle(w, h), borderRadius: w * 0.2, display: "flex", flexDirection: "column", alignItems: "center", padding: w * 0.1, gap: w * 0.08 }}>
      <div style={{ width: w * 0.34, height: w * 0.08, borderRadius: 99, background: "rgba(255,255,255,0.2)" }} />
      <ShugoBadge size={w * 0.34} />
      <Candles w={w * 0.74} h={h * 0.3} n={10} seed={5} />
      <div style={{ width: "100%", height: w * 0.14, borderRadius: 14, background: theme.blue }} />
    </div>
  );
};

/* ---------- Scene 1: three beats ---------- */
const DEVICES = [
  { word: "Phone.", color: theme.blue },
  { word: "Desktop.", color: theme.green },
  { word: "TradingView.", color: theme.amber },
];

const DeviceBeat: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = DEVICES[index];
  const s = spring({ frame: frame - 1, fps, config: { damping: 11, stiffness: 190, mass: 0.7 } });
  const out = interpolate(frame, [BEAT - 5, BEAT], [1, 0], clamp);
  const dir = index % 2 ? 1 : -1;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out }}>
      <div style={{ perspective: 1600, height: 620, display: "flex", alignItems: "center" }}>
        <div style={{ transform: `rotateY(${interpolate(s, [0, 1], [dir * 70, dir * -8])}deg) scale(${interpolate(s, [0, 1], [0.4, 1])})`, opacity: Math.min(s * 2, 1) }}>
          {index === 0 ? <PhoneOutline w={290} /> : index === 1 ? <Monitor w={700} /> : <Browser w={700} />}
        </div>
      </div>
      <div style={{ marginTop: 70 }}>
        <Caption words={[{ text: d.word, color: d.color }]} size={index === 2 ? 132 : 150} weight={900} mode="slam" startDelay={3} maxWidth={1040} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scene 2: the triangle ---------- */
const Triangle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pushAt = S3 - S2;
  const link = LINK - S2;

  const eM = spring({ frame: frame - 2, fps, config: { damping: 13, stiffness: 110 } });
  const eB = spring({ frame: frame - 10, fps, config: { damping: 13, stiffness: 110 } });
  const eP = spring({ frame: frame - 20, fps, config: { damping: 13, stiffness: 100 } });
  const float = (k: number) => Math.sin(frame / 22 + k) * 10;

  // dive into the phone
  const push = interpolate(frame, [pushAt, pushAt + 16], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const scale = 1 + push * 7;
  const opacity = interpolate(push, [0.55, 1], [1, 0], clamp);

  const drawn = interpolate(frame, [link, link + 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const P = { x: 540, y: 1180 };
  const M = { x: 300, y: 830 };
  const B = { x: 790, y: 870 };
  const lines = [
    [M, P],
    [B, P],
    [M, B],
  ];
  const pulse = ((frame - link) % 36) / 36;

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: "540px 1250px", opacity }}>
      <div style={{ position: "absolute", top: 170, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "0 60px", opacity: 1 - push * 3 }}>
        <Caption words={["Same", "coach.", { text: "Everywhere.", color: theme.blue }]} size={100} mode="slam" stagger={5} startDelay={14} maxWidth={900} />
      </div>

      {/* monitor, back left */}
      <div style={{ position: "absolute", left: M.x, top: M.y + float(0), transform: `translate(-50%, -50%) translateX(${interpolate(eM, [0, 1], [-800, 0])}px) perspective(1600px) rotateY(${interpolate(eM, [0, 1], [-60, 18])}deg)`, opacity: Math.min(eM * 2, 1) }}>
        <Monitor w={470} />
      </div>
      {/* browser, back right */}
      <div style={{ position: "absolute", left: B.x, top: B.y + float(2), transform: `translate(-50%, -50%) translateX(${interpolate(eB, [0, 1], [800, 0])}px) perspective(1600px) rotateY(${interpolate(eB, [0, 1], [60, -18])}deg)`, opacity: Math.min(eB * 2, 1) }}>
        <Browser w={430} />
      </div>

      {/* links */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {lines.map(([a, b], i) => {
          const len = Math.hypot(b.x - a.x, b.y - a.y);
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={theme.blue} strokeWidth={6} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - drawn)} style={{ filter: `drop-shadow(0 0 14px ${theme.blue})` }} opacity={0.9} />
              {frame > link + 16 && (
                <circle cx={a.x + (b.x - a.x) * pulse} cy={a.y + (b.y - a.y) * pulse} r={12} fill={theme.white} style={{ filter: `drop-shadow(0 0 16px ${theme.blue})` }} />
              )}
            </g>
          );
        })}
      </svg>

      {/* phone, front */}
      <div style={{ position: "absolute", top: 900 + float(4), left: 0, right: 0, height: 1000 }}>
        <Phone screen="screen1.jpg" width={380} y={interpolate(eP, [0, 1], [900, 0])} rotateY={interpolate(eP, [0, 1], [40, 0])} opacity={Math.min(eP * 2, 1)} glow="rgba(74,124,255,0.5)">
          <Sweep at={link + 2} len={18} />
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scene 3: one account, every chart ---------- */
const TICKERS = [
  { t: "NQ", x: 190, y: 560, c: theme.green },
  { t: "BTC", x: 880, y: 600, c: theme.amber },
  { t: "ES", x: 860, y: 1330, c: theme.blue },
  { t: "AAPL", x: 210, y: 1380, c: theme.green },
  { t: "EUR/USD", x: 540, y: 1520, c: theme.blue },
  { t: "GOLD", x: 540, y: 430, c: theme.amber },
];

const OneAccount: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = S4 - S3;
  const slam = SLAM - S3;
  const out = interpolate(frame, [len - 6, len + 2], [1, 0], clamp);
  const wave = interpolate(frame, [slam, slam + 34], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {frame >= slam &&
        [0, 1].map((i) => (
          <div key={i} style={{ position: "absolute", left: 540 - 250, top: 960 - 250, width: 500, height: 500, borderRadius: "50%", border: `${8 - i * 3}px solid ${theme.blue}`, opacity: (1 - wave) * 0.9, transform: `scale(${1 + wave * (2.4 + i)})` }} />
        ))}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 60 }}>
        <Caption words={["One", "account."]} size={140} weight={900} mode="slam" stagger={4} startDelay={slam} maxWidth={1000} />
        <div style={{ height: 16 }} />
        <Caption words={[{ text: "EVERY", color: theme.blue }, "chart."]} size={140} weight={900} mode="slam" stagger={5} startDelay={slam + 20} maxWidth={1000} />
      </AbsoluteFill>
      {TICKERS.map((k, i) => {
        const s = spring({ frame: frame - slam - 26 - i * 4, fps, config: { damping: 10, stiffness: 180 } });
        const fl = Math.sin(frame / 18 + i) * 10;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: k.x,
              top: k.y + fl,
              transform: `translate(-50%, -50%) scale(${s}) rotate(${interpolate(s, [0, 1], [(i % 2 ? 1 : -1) * 25, (i % 2 ? 1 : -1) * 4])}deg)`,
              padding: "20px 38px",
              borderRadius: 999,
              border: `3px solid ${k.c}`,
              background: "rgba(10,13,28,0.92)",
              boxShadow: `0 0 40px ${k.c}88`,
              fontSize: 52,
              fontWeight: 800,
              color: theme.white,
              whiteSpace: "nowrap",
            }}
          >
            {k.t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
