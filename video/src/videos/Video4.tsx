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

/** Video 4 — "10 Rules" — 15 s */
const S1 = 0; // hook
const S2 = 54; // rule cards
const S3 = 264; // phone
const S4 = 366; // outro
export const VIDEO4_DURATION = 450;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// the five rules exactly as they appear in the app; cards arrive faster and faster
const RULES = [
  { text: "Never trade against the 4h trend", at: 4, type: 26 },
  { text: "Risk max 1% of the account per trade", at: 44, type: 22 },
  { text: "Only take setups with at least 2R to target", at: 80, type: 20 },
  { text: "No new trades after 2 losses in a day", at: 112, type: 18 },
  { text: "Wait for a candle close before entering", at: 140, type: 16 },
];
const tickAt = (i: number) => RULES[i].at + 8 + RULES[i].type + 3; // local to S2
const TICKS = RULES.map((_, i) => S2 + tickAt(i));

// rule rows on the Rules screenshot (screen coords)
const ROWS = [
  { top: 345, h: 67 },
  { top: 426, h: 68 },
  { top: 507, h: 88 },
  { top: 607, h: 68 },
  { top: 688, h: 68 },
];
const ROW_START = S3 + 44;

export const Video4: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: theme.font, background: theme.bg }}>
      <Camera
        cuts={[S1, S2, S3, S4]}
        whips={[S2, S3]}
        shakes={[
          { at: 2, amount: 8 },
          { at: 9, amount: 8 },
          { at: 16, amount: 18 },
          { at: 23, amount: 8 },
          ...TICKS.map((at, i) => ({ at, amount: 8 + i * 2, len: 10 })),
          ...ROWS.map((_, i) => ({ at: ROW_START + i * 6, amount: 5, len: 6 })),
          { at: S4 + 6, amount: 18 },
        ]}
      >
        <Background />
        <Particles />

        <Sequence from={S1} durationInFrames={S2 - S1 + 4} name="Hook">
          <Hook />
        </Sequence>
        <Sequence from={S2} durationInFrames={S3 - S2 + 6} name="Cards">
          <Cards />
        </Sequence>
        <Sequence from={S3} durationInFrames={S4 - S3 + 4} name="Phone">
          <PhoneScene />
        </Sequence>
        <Sequence from={S4} durationInFrames={VIDEO4_DURATION - S4} name="Outro">
          <Outro tagline="Your rules come first." />
        </Sequence>
      </Camera>

      <Flash at={[2, 9, 23]} strength={0.3} />
      <Flash at={[16]} color={theme.blue} strength={0.6} />
      <Flash at={TICKS} color={theme.green} strength={0.22} />
      <Flash at={[ROW_START + 24]} color={theme.green} strength={0.4} />
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
      <Caption words={["What", "are", { text: "YOUR", color: theme.blue }, "rules?"]} size={136} mode="slam" stagger={7} startDelay={2} maxWidth={900} />
    </AbsoluteFill>
  );
};

/* ---------- Scene 2: rule cards ---------- */
const Cards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = S3 - S2;
  // collapse toward the centre before the whip
  const collapse = interpolate(frame, [len - 12, len + 2], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const count = RULES.filter((_, i) => frame >= tickAt(i)).length;
  const countPop = spring({ frame: frame - (count ? tickAt(count - 1) : 0), fps, config: { damping: 8, stiffness: 240, mass: 0.6 } });
  const CARD_H = 150;
  const GAP = 22;
  const TOP = 440;

  return (
    <AbsoluteFill style={{ opacity: 1 - collapse }}>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Caption words={["Write", "them", { text: "once.", color: theme.blue }]} size={100} mode="slam" stagger={5} startDelay={6} />
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, perspective: 1800, transform: `scale(${1 - collapse * 0.55})`, transformOrigin: "50% 55%" }}>
        {RULES.map((r, i) => {
          const dir = i % 2 ? 1 : -1;
          const s = spring({ frame: frame - r.at, fps, config: { damping: 14, stiffness: 150, mass: 0.8 } });
          const typed = Math.floor(interpolate(frame, [r.at + 8, r.at + 8 + r.type], [0, r.text.length], clamp));
          const t = tickAt(i);
          const done = frame >= t;
          const check = spring({ frame: frame - t, fps, config: { damping: 9, stiffness: 220 } });
          const pop = done ? interpolate(spring({ frame: frame - t, fps, config: { damping: 8, stiffness: 240, mass: 0.6 } }), [0, 1], [1.08, 1]) : 1;
          const cursor = !done && frame >= r.at + 6 && Math.floor(frame / 4) % 2 === 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 60,
                top: TOP + i * (CARD_H + GAP),
                width: 960,
                height: CARD_H,
                padding: "0 40px",
                boxSizing: "border-box",
                borderRadius: 32,
                background: "rgba(12,16,34,0.88)",
                border: `2px solid ${done ? "rgba(34,197,94,0.75)" : "rgba(74,124,255,0.45)"}`,
                boxShadow: done ? "0 0 50px rgba(34,197,94,0.3), 0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                gap: 30,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [dir * 1100, 0])}px) rotateY(${interpolate(s, [0, 1], [dir * -70, 0])}deg) rotateZ(${interpolate(s, [0, 1], [dir * 8, 0])}deg) scale(${pop})`,
                overflow: "hidden",
              }}
            >
              <Sweep at={t + 2} len={16} />
              <div style={{ width: 70, height: 70, borderRadius: 35, background: "rgba(74,124,255,0.2)", color: theme.blue, fontSize: 36, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, fontSize: 42, fontWeight: 600, lineHeight: 1.2, color: theme.white }}>
                {r.text.slice(0, typed)}
                <span style={{ opacity: cursor ? 1 : 0, color: theme.blue }}>|</span>
              </div>
              <div style={{ width: 62, height: 62, borderRadius: 31, background: theme.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${check}) rotate(${interpolate(check, [0, 1], [-120, 0])}deg)`, boxShadow: "0 0 34px rgba(34,197,94,0.8)" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#06080F" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* counter */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", opacity: interpolate(frame, [20, 30], [0, 1], clamp) }}>
        <span style={{ display: "inline-block", fontSize: 150, fontWeight: 900, letterSpacing: -5, color: count ? theme.green : "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums", transform: `scale(${count ? interpolate(countPop, [0, 1], [1.5, 1]) : 1})`, textShadow: count ? "0 0 50px rgba(34,197,94,0.6)" : undefined }}>
          {count}
        </span>
        <span style={{ fontSize: 80, fontWeight: 800, color: "rgba(255,255,255,0.45)" }}> / 10 rules</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scene 3: phone ---------- */
const PhoneScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = S4 - S3;
  const rowStart = ROW_START - S3;

  const enter = spring({ frame: frame - 2, fps, config: { damping: 14, stiffness: 100 } });
  const rotIn = interpolate(enter, [0, 1], [-88, 0]);
  const idle = Math.sin(frame / 30) * 3;
  const push = spring({ frame: frame - 30, fps, config: { damping: 18, stiffness: 60, mass: 1.2 } });
  const scale = interpolate(enter, [0, 1], [0.45, 1]) * interpolate(push, [0, 1], [1, 1.25]);
  const y = interpolate(push, [0, 1], [0, -40]);
  const scan = interpolate(frame, [22, 46], [-60, 1300], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const out = interpolate(frame, [len - 6, len + 2], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, height: 1400 }}>
        <Phone screen="screen4.jpg" width={560} rotateY={rotIn + idle * 0.6} y={y} scale={scale} opacity={Math.min(enter * 1.5, 1)} glow="rgba(34,197,94,0.4)">
          <Sweep at={14} len={20} />
          <div style={{ position: "absolute", left: 0, right: 0, top: scan, height: 6, background: theme.green, boxShadow: `0 0 30px ${theme.green}, 0 0 80px ${theme.green}`, opacity: frame > 22 && frame < 46 ? 0.9 : 0 }} />
          {ROWS.map((r, i) => {
            const at = rowStart + i * 6;
            const hl = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 180 } });
            const tick = spring({ frame: frame - at - 4, fps, config: { damping: 9, stiffness: 220 } });
            return (
              <React.Fragment key={i}>
                <div style={{ position: "absolute", left: 14, top: r.top - 3, width: 542, height: r.h + 6, borderRadius: 20, border: `3px solid ${theme.green}`, background: `rgba(34,197,94,${0.1 * hl})`, boxShadow: "0 0 26px rgba(34,197,94,0.7), inset 0 0 20px rgba(34,197,94,0.25)", opacity: hl, transform: `scale(${interpolate(hl, [0, 1], [1.15, 1])})` }} />
                <div style={{ position: "absolute", left: 500, top: r.top + r.h / 2 - 22, width: 44, height: 44, borderRadius: 22, background: theme.green, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${tick})`, boxShadow: "0 0 24px rgba(34,197,94,0.9)" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#06080F" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                </div>
              </React.Fragment>
            );
          })}
        </Phone>
      </div>

      <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "0 60px" }}>
        <Caption words={["Injected", "into", { text: "EVERY", color: theme.green }, "analysis."]} size={86} mode="slam" stagger={4} startDelay={12} maxWidth={900} exitAt={len - 10} />
      </div>
    </AbsoluteFill>
  );
};
