import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";
import { theme } from "../theme";
import { Caption } from "./Caption";
import { rnd, Flash } from "./Fx";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Shared outro: icon drops in with a shockwave + particle burst, name, tagline, URL. */
export const Outro: React.FC<{ tagline?: string; taglineSize?: number }> = ({
  tagline = "Your rules come first.",
  taglineSize = 56,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame, fps, config: { damping: 9, stiffness: 170, mass: 0.9 } });
  const spin = interpolate(drop, [0, 1], [-180, 0]);
  const scale = interpolate(drop, [0, 1], [3.2, 1]);
  const wave = interpolate(frame, [6, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const burst = interpolate(frame, [6, 50], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const fadeIn = (at: number) => interpolate(frame, [at, at + 10], [0, 1], clamp);
  const up = (at: number) => interpolate(fadeIn(at), [0, 1], [40, 0]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: theme.font }}>
      <Flash at={[6]} strength={0.7} />
      {/* shockwave rings */}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: `${6 - i * 2}px solid ${i ? theme.green : theme.blue}`,
            opacity: (1 - wave) * 0.9,
            transform: `scale(${1 + wave * (5 + i * 2)})`,
            top: "50%",
            left: "50%",
            marginLeft: -150,
            marginTop: -150 - 250,
          }}
        />
      ))}
      {/* particle burst */}
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i / 36) * Math.PI * 2 + rnd(i, 11) * 0.3;
        const r = 120 + burst * (500 + rnd(i, 12) * 500);
        const s = 4 + rnd(i, 13) * 10;
        return (
          <div
            key={"p" + i}
            style={{
              position: "absolute",
              left: 540 + Math.cos(a) * r,
              top: 960 - 250 + Math.sin(a) * r,
              width: s,
              height: s,
              borderRadius: "50%",
              background: i % 3 ? theme.blue : theme.green,
              opacity: (1 - burst) * 0.9,
              boxShadow: `0 0 ${s * 2}px ${i % 3 ? theme.blue : theme.green}`,
            }}
          />
        );
      })}

      <div style={{ transform: "translateY(-250px)", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img
          src={staticFile("icon.png")}
          style={{
            width: 300,
            height: 300,
            borderRadius: 68,
            transform: `scale(${scale}) rotate(${spin}deg)`,
            opacity: Math.min(drop * 2, 1),
            boxShadow: `0 30px 90px rgba(0,0,0,0.6), 0 0 140px rgba(74,124,255,0.55)`,
          }}
        />
        <div style={{ marginTop: 60 }}>
          <Caption words={["Shugo"]} size={120} mode="slam" startDelay={10} />
        </div>
        <div style={{ marginTop: 18 }}>
          <Caption
            words={tagline.split(" ")}
            size={taglineSize}
            maxWidth={980}
            weight={600}
            startDelay={20}
            stagger={3}
            style={{ color: "rgba(255,255,255,0.7)" }}
          />
        </div>
        <div style={{ marginTop: 64, display: "flex", gap: 20, opacity: fadeIn(34), transform: `translateY(${up(34)}px)` }}>
          <Pill>App Store</Pill>
          <Pill>Google Play</Pill>
          <Pill>Chrome</Pill>
        </div>
        <div style={{ marginTop: 50, fontSize: 48, fontWeight: 800, color: theme.blue, opacity: fadeIn(40), transform: `translateY(${up(40)}px)`, textShadow: `0 0 30px rgba(74,124,255,0.6)` }}>
          shugo.pro · Free to start
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 90, fontSize: 26, fontWeight: 500, color: "rgba(255,255,255,0.35)", opacity: fadeIn(46) }}>
        Educational tool. Not financial advice.
      </div>
    </AbsoluteFill>
  );
};

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      padding: "18px 34px",
      borderRadius: 999,
      border: "2px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.06)",
      fontSize: 32,
      fontWeight: 600,
      color: theme.white,
    }}
  >
    {children}
  </div>
);
