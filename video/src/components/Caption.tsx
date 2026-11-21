import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../theme";

type Word = { text: string; color?: string };

/**
 * Kinetic caption: words spring up one after another.
 * `exitAt` (frames, relative to the sequence) fades + lifts the whole block out.
 */
export const Caption: React.FC<{
  words: (string | Word)[];
  size?: number;
  startDelay?: number;
  stagger?: number;
  exitAt?: number;
  align?: "center" | "left";
  weight?: number;
  maxWidth?: number;
  lineHeight?: number;
  style?: React.CSSProperties;
  /** "rise" = gentle spring up; "slam" = scale down from huge with blur + slight rotation */
  mode?: "rise" | "slam";
}> = ({
  mode = "rise",
  words,
  size = 84,
  startDelay = 0,
  stagger = 4,
  exitAt,
  align = "center",
  weight = 800,
  maxWidth = 900,
  lineHeight = 1.1,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let exitOpacity = 1;
  let exitY = 0;
  if (exitAt !== undefined) {
    exitOpacity = interpolate(frame, [exitAt, exitAt + 12], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    exitY = interpolate(frame, [exitAt, exitAt + 12], [0, -40], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  return (
    <div
      style={{
        fontFamily: theme.font,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing: -size * 0.025,
        color: theme.white,
        textAlign: align,
        maxWidth,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: `0 ${size * 0.26}px`,
        opacity: exitOpacity,
        transform: `translateY(${exitY}px)`,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const word: Word = typeof w === "string" ? { text: w } : w;
        const local = frame - startDelay - i * stagger;
        const s = spring({
          frame: local,
          fps,
          config:
            mode === "slam"
              ? { damping: 13, stiffness: 260, mass: 0.6 }
              : { damping: 14, stiffness: 160, mass: 0.7 },
        });
        const y = mode === "slam" ? 0 : interpolate(s, [0, 1], [50, 0]);
        const sc = mode === "slam" ? interpolate(s, [0, 1], [2.0, 1]) : 1;
        const rot = mode === "slam" ? interpolate(s, [0, 1], [(i % 2 ? 1 : -1) * 8, 0]) : 0;
        const bl = mode === "slam" ? interpolate(s, [0, 0.7, 1], [14, 2, 0], { extrapolateRight: "clamp" }) : 0;
        const o = interpolate(s, [0, 0.5], [0, 1], {
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px) scale(${sc}) rotate(${rot}deg)`,
              filter: bl > 0.3 ? `blur(${bl}px)` : undefined,
              opacity: local < 0 ? 0 : o,
              color: word.color ?? theme.white,
              whiteSpace: "pre",
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};
