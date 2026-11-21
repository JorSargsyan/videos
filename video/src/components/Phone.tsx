import React from "react";
import { Img, staticFile } from "remotion";

export const SCREEN_W = 570;
export const SCREEN_H = 1244;

/**
 * Phone mockup. `width` is the screen width in px; children are overlaid on
 * the screen in screen coordinates (570 x 1244) and scale with it.
 */
export const Phone: React.FC<{
  screen: string;
  width?: number;
  rotateY?: number;
  rotateX?: number;
  scale?: number;
  x?: number;
  y?: number;
  opacity?: number;
  glow?: string;
  /** optional second screen crossfaded on top, 0..1 */
  screenB?: string;
  mix?: number;
  children?: React.ReactNode;
}> = ({
  screen,
  screenB,
  mix = 0,
  width = 560,
  rotateY = 0,
  rotateX = 0,
  scale = 1,
  x = 0,
  y = 0,
  opacity = 1,
  glow = "rgba(74,124,255,0.35)",
  children,
}) => {
  const bezel = 16;
  const s = width / SCREEN_W;
  const h = SCREEN_H * s;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 0,
        width: width + bezel * 2,
        height: h + bezel * 2,
        marginLeft: -(width + bezel * 2) / 2,
        transform: `translate(${x}px, ${y}px) perspective(2400px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
        transformStyle: "preserve-3d",
        opacity,
        borderRadius: 72 * s + bezel,
        background: "#0A0A0C",
        boxShadow: `0 0 0 2px rgba(255,255,255,0.14), 0 40px 120px rgba(0,0,0,0.6), 0 0 160px ${glow}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: bezel,
          top: bezel,
          width,
          height: h,
          borderRadius: 72 * s,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <Img
          src={staticFile(screen)}
          style={{ width, height: h, display: "block" }}
        />
        {screenB ? (
          <Img
            src={staticFile(screenB)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width,
              height: h,
              display: "block",
              opacity: mix,
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: SCREEN_W,
            height: SCREEN_H,
            transform: `scale(${s})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
