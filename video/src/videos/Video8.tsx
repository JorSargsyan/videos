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

/** Video 8 — "Prop Firm Mode" — 15 s */
const S1 = 0; // hook
const S2 = 54; // drawdown bar
const S3 = 210; // phone + shield
const S4 = 366; // outro
export const VIDEO8_DURATION = 450;

const FREEZE_LOCAL = 104;
const FREEZE = S2 + FREEZE_LOCAL;
const SHIELD_LOCAL = 38;
const SHIELD = S3 + SHIELD_LOCAL;
const CAP_B = 68; // local to S3
const CAP_C = 114;

const LIMIT = 5000; // illustrative daily-loss limit
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const climbShakes = Array.from({ length: 14 }).map((_, i) => ({
  at: S2 + 18 + i * 6,
  amount: 3 + i * 1.5,
  len: 6,
}));

export const Video8: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: theme.font, background: theme.bg }}>
      <Camera
        cuts={[S1, S2, S3, S4]}
        whips={[S2, S3]}
        shakes={[
          { at: 2, amount: 9 },
          { at: 10, amount: 16 },
          ...climbShakes,
          { at: FREEZE + 14, amount: 16 },
          { at: SHIELD, amount: 28, len: 18 },
          { at: S3 + CAP_B, amount: 10 },
          { at: S3 + CAP_C, amount: 14 },
          { at: S4 + 6, amount: 18 },
        ]}
      >
        <Background />
        <Particles />

        <Sequence from={S1} durationInFrames={S2 - S1 + 4} name="Hook">
          <Hook />
        </Sequence>
        <Sequence from={S2} durationInFrames={S3 - S2 + 4} name="Drawdown">
          <Drawdown />
        </Sequence>
        <Sequence from={S3} durationInFrames={S4 - S3 + 4} name="Phone">
          <PhoneScene />
        </Sequence>
        <Sequence from={S4} durationInFrames={VIDEO8_DURATION - S4} name="Outro">
          <Outro tagline="Shugo watches the limits." />
        </Sequence>
      </Camera>

      <Flash at={[2]} strength={0.3} />
      <Flash at={[10]} color={theme.blue} strength={0.5} />
      <Flash at={[FREEZE]} strength={0.9} />
      <Flash at={[SHIELD]} color={theme.green} strength={0.8} />
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
      <Caption words={[{ text: "Funded", color: theme.blue }, "account?"]} size={150} weight={900} mode="slam" stagger={8} startDelay={2} maxWidth={900} lineHeight={1.05} />
    </AbsoluteFill>
  );
};

/* ---------- Scene 2: the bar creeps toward the limit ---------- */
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const barColor = (f: number) => {
  const g = [34, 197, 94];
  const a = [245, 158, 11];
  const r = [239, 68, 68];
  const c = f < 0.5 ? mix(g, a, f / 0.5) : mix(a, r, Math.min((f - 0.5) / 0.35, 1));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

const Drawdown: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = S3 - S2;
  const frozen = frame >= FREEZE_LOCAL;
  const out = interpolate(frame, [len - 6, len], [1, 0], clamp);
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 130 } });

  // stuttering climb: lurches, pauses, lurches again
  const f = interpolate(frame, [14, 38, 48, 70, 78, FREEZE_LOCAL], [0, 0.34, 0.37, 0.7, 0.73, 0.974], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const loss = Math.round((f * LIMIT) / 10) * 10;
  const dd = interpolate(frame, [14, FREEZE_LOCAL], [0.2, 0.64], clamp);
  const c = barColor(f);
  const red = f * f;
  const pulse = frozen ? 0.5 + 0.5 * Math.sin((frame - FREEZE_LOCAL) / 2.5) : 0;
  const W = 860;

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: `radial-gradient(75% 60% at 50% 50%, rgba(239,68,68,${red * 0.42}) 0%, transparent 72%)` }} />

      <div style={{ position: "absolute", top: 170, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "0 60px" }}>
        {!frozen ? (
          <Caption words={["The", "limit", "is", { text: "close…", color: theme.amber }]} size={96} mode="slam" stagger={5} startDelay={8} exitAt={FREEZE_LOCAL - 8} />
        ) : (
          <Caption words={["One", "bad", { text: "afternoon.", color: theme.red }]} size={116} weight={900} mode="slam" stagger={5} startDelay={FREEZE_LOCAL + 6} maxWidth={940} />
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: 60,
          top: 560,
          width: 960,
          boxSizing: "border-box",
          padding: "50px 50px 56px",
          borderRadius: 44,
          background: "rgba(10,13,28,0.9)",
          border: `2px solid ${frozen ? theme.red : "rgba(255,255,255,0.14)"}`,
          boxShadow: `0 30px 100px rgba(0,0,0,0.6), 0 0 ${red * 120}px rgba(239,68,68,${red * 0.6})`,
          transform: `translateY(${interpolate(enter, [0, 1], [300, 0])}px) scale(${interpolate(enter, [0, 1], [0.9, 1])})`,
          opacity: enter,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 5, color: "rgba(255,255,255,0.5)" }}>FUNDED ACCOUNT</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: theme.white }}>$100,000</div>
        </div>

        <div style={{ marginTop: 54, fontSize: 34, fontWeight: 800, letterSpacing: 5, color: "rgba(255,255,255,0.6)" }}>DAILY LOSS</div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 22 }}>
          <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: -5, lineHeight: 1, color: c, fontVariantNumeric: "tabular-nums", textShadow: `0 0 50px ${c}` }}>
            −${loss.toLocaleString("en-US")}
          </div>
        </div>
        <div style={{ marginTop: 6, fontSize: 40, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>of ${LIMIT.toLocaleString("en-US")} limit</div>

        {/* main bar */}
        <div style={{ position: "relative", marginTop: 40, width: W, height: 64 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 32, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: W * f, borderRadius: 32, background: `linear-gradient(90deg, ${theme.green}, ${c})`, boxShadow: `0 0 40px ${c}` }} />
          {/* limit line */}
          <div style={{ position: "absolute", left: W - 4, top: -26, width: 8, height: 116, borderRadius: 4, background: theme.red, boxShadow: `0 0 ${20 + pulse * 40}px ${theme.red}` }} />
          <div style={{ position: "absolute", left: W - 216, top: -74, width: 220, textAlign: "right", fontSize: 30, fontWeight: 900, letterSpacing: 4, color: theme.red }}>LIMIT</div>
        </div>

        {/* secondary bar */}
        <div style={{ marginTop: 74, display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 800, letterSpacing: 4, color: "rgba(255,255,255,0.55)" }}>
          <span>MAX DRAWDOWN</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(dd * 100)}%</span>
        </div>
        <div style={{ position: "relative", marginTop: 16, width: W, height: 28 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: W * dd, borderRadius: 14, background: theme.amber, boxShadow: `0 0 24px ${theme.amber}` }} />
        </div>
      </div>

      {/* frozen callout */}
      {frozen && (
        <div style={{ position: "absolute", top: 1560, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Caption words={["$130", "from", "the", "line."]} size={72} weight={700} mode="rise" stagger={4} startDelay={FREEZE_LOCAL + 22} style={{ color: "rgba(255,255,255,0.8)" }} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- Scene 3: phone + shield ---------- */
const Shield: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: `drop-shadow(0 0 ${size / 8}px ${theme.green})` }}>
    <path d="M12 2.2 L20 5.2 V11.5 C20 16.4 16.6 20.2 12 21.8 C7.4 20.2 4 16.4 4 11.5 V5.2 Z" fill="rgba(6,20,12,0.92)" stroke={theme.green} strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M8 12.2 L11 15.2 L16.2 9.2" fill="none" stroke={theme.green} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PILLS = ["Daily loss", "Max drawdown"];

const PhoneScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = S4 - S3;

  const enter = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90 } });
  const rotIn = interpolate(enter, [0, 1], [85, 0]);
  const idle = Math.sin(frame / 30) * 3;
  const y = interpolate(enter, [0, 1], [500, 0]);
  const scan = interpolate(frame, [20, 36], [-60, 1300], { ...clamp, easing: Easing.inOut(Easing.quad) });

  const hit = spring({ frame: frame - SHIELD_LOCAL, fps, config: { damping: 10, stiffness: 200, mass: 0.7 } });
  const dock = spring({ frame: frame - SHIELD_LOCAL - 26, fps, config: { damping: 15, stiffness: 90 } });
  const wave = interpolate(frame, [SHIELD_LOCAL, SHIELD_LOCAL + 34], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shieldSize = 460;
  const sx = interpolate(dock, [0, 1], [540, 820]);
  const sy = interpolate(dock, [0, 1], [1150, 700]);
  const sScale = interpolate(hit, [0, 1], [3.2, 1]) * interpolate(dock, [0, 1], [1, 0.48]);
  const out = interpolate(frame, [len - 6, len + 2], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, height: 1400 }}>
        <Phone screen="screen1.jpg" width={560} rotateY={rotIn + idle} y={y} opacity={enter} glow={frame >= SHIELD_LOCAL ? "rgba(34,197,94,0.5)" : "rgba(74,124,255,0.4)"}>
          <Sweep at={14} len={18} />
          <Sweep at={SHIELD_LOCAL + 2} len={18} />
          <div style={{ position: "absolute", left: 0, right: 0, top: scan, height: 6, background: theme.blue, boxShadow: `0 0 30px ${theme.blue}, 0 0 80px ${theme.blue}`, opacity: frame > 20 && frame < 36 ? 0.9 : 0 }} />
          {/* green wash when protected */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(34,197,94,0.14)", opacity: interpolate(frame, [SHIELD_LOCAL, SHIELD_LOCAL + 4, SHIELD_LOCAL + 40], [0, 1, 0.25], clamp) }} />
        </Phone>
      </div>

      {/* shockwave */}
      {frame >= SHIELD_LOCAL &&
        [0, 1].map((i) => (
          <div key={i} style={{ position: "absolute", left: 540 - 220, top: 1150 - 220, width: 440, height: 440, borderRadius: "50%", border: `${8 - i * 3}px solid ${theme.green}`, opacity: (1 - wave) * 0.9, transform: `scale(${1 + wave * (2.2 + i)})` }} />
        ))}

      {/* shield */}
      <div style={{ position: "absolute", left: sx - shieldSize / 2, top: sy - shieldSize / 2, width: shieldSize, height: shieldSize, transform: `scale(${sScale})`, opacity: Math.min(hit * 1.6, 1), filter: `blur(${interpolate(hit, [0, 0.8, 1], [10, 1, 0], clamp)}px)` }}>
        <Shield size={shieldSize} />
      </div>

      {/* limit pills */}
      {PILLS.map((p, i) => {
        const s = spring({ frame: frame - CAP_B - 4 - i * 8, fps, config: { damping: 11, stiffness: 170 } });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540,
              top: 1420 + i * 150,
              transform: `translate(-50%, -50%) translateX(${interpolate(s, [0, 1], [(i ? 1 : -1) * 700, 0])}px) rotate(${interpolate(s, [0, 1], [(i ? 1 : -1) * 10, 0])}deg)`,
              padding: "24px 44px",
              borderRadius: 999,
              background: "rgba(8,20,14,0.94)",
              border: `3px solid ${theme.green}`,
              boxShadow: "0 0 50px rgba(34,197,94,0.55), 0 16px 50px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              gap: 22,
              fontSize: 56,
              fontWeight: 800,
              color: theme.white,
              whiteSpace: "nowrap",
              opacity: Math.min(s * 1.5, 1),
            }}
          >
            <div style={{ width: 60, height: 60, borderRadius: 30, background: theme.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#06080F" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7" />
              </svg>
            </div>
            {p}
          </div>
        );
      })}

      <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "0 60px" }}>
        {frame < CAP_B ? (
          <Caption words={["Shugo", "watches", "the", { text: "limits.", color: theme.green }]} size={100} mode="slam" stagger={4} startDelay={10} maxWidth={900} exitAt={CAP_B - 8} />
        ) : frame < CAP_C ? (
          <Caption words={["Tracked", "on", { text: "EVERY", color: theme.green }, "check."]} size={100} mode="slam" stagger={4} startDelay={CAP_B} maxWidth={900} exitAt={CAP_C - 8} />
        ) : (
          <Caption words={["Protect", "the", { text: "evaluation.", color: theme.blue }]} size={108} mode="slam" stagger={4} startDelay={CAP_C} maxWidth={940} />
        )}
      </div>
    </AbsoluteFill>
  );
};
