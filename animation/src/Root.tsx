import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { scenes, FPS } from "./scenes";
import { COLORS } from "./data";
import { PaperBg, Subtitle, ChapterTag } from "./Common";
import { SceneVoid, SceneTaiji, SceneLiangyi, SceneSixiang } from "./ScenesA";
import { SceneBagua, SceneLiushisi, SceneCuogua, SceneZonggua } from "./ScenesB";
import { SceneHuagua, SceneBiangua, SceneXiaoxi, SceneGuaxu } from "./ScenesC";
import { SceneShifa, SceneYili } from "./ScenesD";

const SceneComponents: Record<string, React.FC<{ localFrame: number }>> = {
  void: SceneVoid as React.FC<{ localFrame: number }>,
  taiji: SceneTaiji as React.FC<{ localFrame: number }>,
  liangyi: SceneLiangyi as React.FC<{ localFrame: number }>,
  sixiang: SceneSixiang as React.FC<{ localFrame: number }>,
  bagua: SceneBagua as React.FC<{ localFrame: number }>,
  liushisi: SceneLiushisi as React.FC<{ localFrame: number }>,
  cuogua: SceneCuogua as React.FC<{ localFrame: number }>,
  zonggua: SceneZonggua as React.FC<{ localFrame: number }>,
  huagua: SceneHuagua as React.FC<{ localFrame: number }>,
  biangua: SceneBiangua as React.FC<{ localFrame: number }>,
  xiaoxi: SceneXiaoxi as React.FC<{ localFrame: number }>,
  guaxu: SceneGuaxu as React.FC<{ localFrame: number }>,
  shifa: SceneShifa as React.FC<{ localFrame: number }>,
  yili: SceneYili as React.FC<{ localFrame: number }>,
};

export const YijingYi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 累计起始帧
  let acc = 0;
  const ranges = scenes.map((s) => {
    const from = acc;
    const dur = Math.round(s.duration * FPS);
    acc += dur;
    return { ...s, from, dur, to: from + dur };
  });

  // 当前场
  const current = ranges.find((r) => frame >= r.from && frame < r.to) || ranges[ranges.length - 1];
  const local = frame - current.from;

  // 全局字幕渐入渐出（每场首尾各 15 帧）
  const subOpacity = interpolate(
    local,
    [0, 15, current.dur - 20, current.dur - 5],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const Comp = SceneComponents[current.kind];

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <PaperBg />
      {/* 场景层 */}
      <Sequence from={current.from} durationInFrames={current.dur} name={`${current.id}. ${current.name}`}>
        <AbsoluteFill>
          <Comp localFrame={frame - current.from} />
        </AbsoluteFill>
      </Sequence>

      {/* 章节标签 */}
      <ChapterTag index={current.id} name={current.name} frame={local} />

      {/* 字幕 */}
      <Subtitle text={current.narration} opacity={subOpacity} />

      {/* 顶部细线进度条 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 3,
          width: `${(frame / (acc)) * 100}%`,
          background: `linear-gradient(90deg, ${COLORS.zhu}, ${COLORS.jin})`,
          opacity: 0.7,
        }}
      />
    </AbsoluteFill>
  );
};
