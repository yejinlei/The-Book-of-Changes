import React from "react";
import { Composition } from "remotion";
import { YijingYi } from "./Root";
import { totalFrames, FPS } from "./scenes";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="YijingYi"
      component={YijingYi}
      durationInFrames={totalFrames}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
