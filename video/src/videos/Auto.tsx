import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Background } from "../components/Background";
import { Caption } from "../components/Caption";
import { Phone } from "../components/Phone";
import { Outro } from "../components/Outro";
import { Camera, Flash, Particles } from "../components/Fx";
import { theme } from "../theme";

/** Script-driven video. All timings (frames) are computed by pipeline/make.py from the voice. */
export type Word = { text: string; color?: string };
export type Line = { words: Word[]; at: number; chars: number };
export type Scene = {
  type: "hook" | "stack" | "phone" | "list";
  from: number;
  dur: number;
  accent: string;
  screen?: string;
  lines: Line[];
};
export type AutoProps = { scenes: Scene[]; outro: { from: number; tagline: string }; duration: number };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sizeFor = (chars: number, max = 150) =>
  Math.min(max, chars <= 12 ? 160 : chars <= 20 ? 128 : chars <= 32 ? 104 : chars <= 48 ? 86 : 72);
const stag = (n: number) => (n <= 3 ? 6 : n <= 6 ? 4 : 3);

const SceneFade: React.FC<{ dur: number; accent: string; glow?: number; children: React.ReactNode }> = ({ dur, accent, glow = 0.22, children }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [dur - 6, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out, transform: `scale(${interpolate(frame, [dur - 6, dur], [1, 1.12], clamp)})` }}>
      <AbsoluteFill style={{ background: `radial-gradient(70% 55% at 50% 50%, ${accent}${Math.round(glow * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)` }} />
      {children}
    </AbsoluteFill>
  );
};

/** One line at a time, huge, centre. */
const Hook: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  let idx = 0;
  s.lines.forEach((l, i) => { if (frame >= l.at - 2) idx = i; });
  const l = s.lines[idx];
  const next = s.lines[idx + 1];
  return (
    <SceneFade dur={s.dur} accent={s.accent} glow={0.3}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 70 }}>
        <Caption key={idx} words={l.words} size={sizeFor(l.chars, 170)} weight={900} mode="slam" stagger={stag(l.words.length)} startDelay={l.at} maxWidth={940} lineHeight={1.04} exitAt={next ? next.at - 8 : undefined} />
      </AbsoluteFill>
    </SceneFade>
  );
};

/** Lines accumulate in a column. */
const Stack: React.FC<{ s: Scene }> = ({ s }) => {
  const longest = Math.max(...s.lines.map((l) => l.chars));
  const size = Math.min(sizeFor(longest, 110), s.lines.length > 3 ? 80 : 110);
  return (
    <SceneFade dur={s.dur} accent={s.accent}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80, gap: size * 0.55, flexDirection: "column", display: "flex" }}>
        {s.lines.map((l, i) => (
          <Caption key={i} words={l.words} size={size} mode={i === 0 ? "slam" : "rise"} stagger={stag(l.words.length)} startDelay={l.at} maxWidth={920} />
        ))}
      </AbsoluteFill>
    </SceneFade>
  );
};

/** App screenshot in a phone, caption on top swaps per line. */
const PhoneScene: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 15, stiffness: 110, mass: 0.9 } });
  let idx = 0;
  s.lines.forEach((l, i) => { if (frame >= l.at - 2) idx = i; });
  const l = s.lines[idx];
  const next = s.lines[idx + 1];
  const drift = interpolate(frame, [0, s.dur], [0, 1], clamp);
  return (
    <SceneFade dur={s.dur} accent={s.accent} glow={0.16}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470 }}>
        <Phone screen={s.screen ?? "screen1.jpg"} width={560} y={interpolate(inn, [0, 1], [900, 0])} rotateY={interpolate(inn, [0, 1], [-28, 0]) + interpolate(drift, [0, 1], [5, -5])} rotateX={4} scale={1 + drift * 0.05} glow={`${s.accent}66`} />
      </div>
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, height: 290, display: "flex", justifyContent: "center", alignItems: "center", padding: "0 50px" }}>
        <Caption key={idx} words={l.words} size={Math.min(sizeFor(l.chars), 84)} mode="slam" stagger={stag(l.words.length)} startDelay={l.at} maxWidth={980} exitAt={next ? next.at - 8 : undefined} />
      </div>
    </SceneFade>
  );
};

/** First line is the title; the rest appear as numbered cards. */
const List: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [title, ...items] = s.lines;
  const cardH = items.length > 4 ? 170 : 210;
  const top = 620;
  return (
    <SceneFade dur={s.dur} accent={s.accent} glow={0.14}>
      <div style={{ position: "absolute", top: 190, left: 0, right: 0, height: 300, display: "flex", justifyContent: "center", alignItems: "center", padding: "0 60px" }}>
        <Caption words={title.words} size={Math.min(sizeFor(title.chars), 96)} mode="slam" stagger={stag(title.words.length)} startDelay={title.at} maxWidth={940} />
      </div>
      {items.map((l, i) => {
        const p = spring({ frame: frame - l.at, fps, config: { damping: 14, stiffness: 170, mass: 0.7 } });
        const active = frame >= l.at && (i === items.length - 1 || frame < items[i + 1].at);
        return (
          <div key={i} style={{ position: "absolute", left: 70, right: 70, top: top + i * (cardH + 26), height: cardH, borderRadius: 34, display: "flex", alignItems: "center", gap: 30, padding: "0 40px", background: "rgba(255,255,255,0.06)", border: `3px solid ${active ? s.accent : "rgba(255,255,255,0.12)"}`, boxShadow: active ? `0 0 70px ${s.accent}55` : "none", opacity: frame < l.at ? 0 : interpolate(p, [0, 0.5], [0, 1], clamp), transform: `translateX(${interpolate(p, [0, 1], [i % 2 ? 260 : -260, 0])}px) scale(${active ? 1.03 : 1})` }}>
            <div style={{ width: 88, height: 88, borderRadius: 44, flexShrink: 0, background: s.accent, color: "#06080F", fontWeight: 900, fontSize: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
            <div style={{ fontSize: l.chars > 26 ? 50 : 64, fontWeight: 700, color: theme.white, lineHeight: 1.12, letterSpacing: -1 }}>
              {l.words.map((w, k) => (<span key={k} style={{ color: w.color ?? theme.white }}>{w.text + " "}</span>))}
            </div>
          </div>
        );
      })}
    </SceneFade>
  );
};

export const Auto: React.FC<AutoProps> = ({ scenes, outro, duration }) => {
  const cuts = [...scenes.map((s) => s.from), outro.from];
  const shakes = [
    ...scenes.flatMap((s) => s.lines.filter(() => s.type === "hook").map((l) => ({ at: s.from + l.at, amount: 18, len: 10 }))),
    { at: outro.from + 6, amount: 18 },
  ];
  return (
    <AbsoluteFill style={{ fontFamily: theme.font, background: theme.bg }}>
      <Camera cuts={cuts} whips={cuts.slice(1, -1)} shakes={shakes}>
        <Background />
        <Particles />
        {scenes.map((s, i) => (
          <Sequence key={i} from={s.from} durationInFrames={s.dur + 2} name={s.type}>
            {s.type === "hook" ? <Hook s={s} /> : s.type === "phone" ? <PhoneScene s={s} /> : s.type === "list" ? <List s={s} /> : <Stack s={s} />}
          </Sequence>
        ))}
        <Sequence from={outro.from} durationInFrames={duration - outro.from} name="Outro">
          <Outro tagline={outro.tagline} taglineSize={outro.tagline.length > 26 ? 46 : 56} />
        </Sequence>
      </Camera>
      <Flash at={[2]} strength={0.3} />
      {scenes.filter((s) => s.type === "hook").map((s, i) => (<Flash key={i} at={s.lines.map((l) => s.from + l.at)} color={s.accent} strength={0.35} />))}
    </AbsoluteFill>
  );
};
