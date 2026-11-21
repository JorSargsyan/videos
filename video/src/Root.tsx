import React from "react";
import { Composition } from "remotion";
import { Video1, VIDEO1_DURATION } from "./videos/Video1";
import { Video2, VIDEO2_DURATION } from "./videos/Video2";
import { Video3, VIDEO3_DURATION } from "./videos/Video3";
import { Video4, VIDEO4_DURATION } from "./videos/Video4";
import { Video5, VIDEO5_DURATION } from "./videos/Video5";
import { Video6, VIDEO6_DURATION } from "./videos/Video6";
import { Video7, VIDEO7_DURATION } from "./videos/Video7";
import { Video8, VIDEO8_DURATION } from "./videos/Video8";
import { Video9, VIDEO9_DURATION } from "./videos/Video9";
import { Video10, VIDEO10_DURATION } from "./videos/Video10";
import { Auto } from "./videos/Auto";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="Video1"
        component={Video1}
        durationInFrames={VIDEO1_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition id="Video2" component={Video2} durationInFrames={VIDEO2_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Video3" component={Video3} durationInFrames={VIDEO3_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Video4" component={Video4} durationInFrames={VIDEO4_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Video5" component={Video5} durationInFrames={VIDEO5_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Video6" component={Video6} durationInFrames={VIDEO6_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Video7" component={Video7} durationInFrames={VIDEO7_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Video8" component={Video8} durationInFrames={VIDEO8_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Video9" component={Video9} durationInFrames={VIDEO9_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Video10" component={Video10} durationInFrames={VIDEO10_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Auto" component={Auto as any} durationInFrames={450} fps={FPS} width={WIDTH} height={HEIGHT}
        defaultProps={{ scenes: [], outro: { from: 360, tagline: "Your rules come first." }, duration: 450 } as any}
        calculateMetadata={({ props }: any) => ({ durationInFrames: props.duration })} />
    </>
  );
};
