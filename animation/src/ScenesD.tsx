import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, DAYAN } from "./data";
import { GuaHex } from "./Yao";
import { ThreeDust } from "./ThreeDust";

/* ============================================================
   第 13 场 · 大衍筮法 —— 五十策蓍草，十八变
   ============================================================ */
export const SceneShifa: React.FC = () => {
  const frame = useCurrentFrame();

  // 蓍草堆：多根细线
  const stalks = Array.from({ length: 50 });

  // 阶段：0-120 铺开，120-260 四营演示，260-400 成爻，400-520 成卦
  const spread = interpolate(frame, [0, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const siying = interpolate(frame, [120, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const yaoGrow = interpolate(frame, [280, 420], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // 结果卦（示例：得「乾」，含老阳动爻）
  const resultLines = [1, 1, 1, 1, 1, 1];

  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {/* 五十策蓍草 */}
      <g transform="translate(400, 520)">
        {stalks.map((_, i) => {
          if (i === 0 && frame > 60) return null; // 取一不用
          const col = Math.floor(i / 10);
          const row = i % 10;
          const x = col * 28 - 60;
          const y = (row - 5) * 26 + (i % 2 === 0 ? 0 : 4);
          const o = interpolate(frame, [i * 1.5, i * 1.5 + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const rot = (i - 25) * 0.4 * spread;
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x + Math.sin(rot) * 8}
              y2={y - 300}
              stroke={i % 3 === 0 ? COLORS.jin : "#8a7a4a"}
              strokeWidth={2}
              opacity={o * 0.85}
            />
          );
        })}
      </g>

      {/* 四营标注 */}
      {siying > 0 && (
        <g transform="translate(400, 180)" opacity={siying}>
          {DAYAN.steps.slice(1).map((s, i) => {
            const p = interpolate(frame, [120 + i * 20, 130 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <text key={i} x={0} y={i * 40} fill={i % 2 === 0 ? COLORS.jin : COLORS.zhu} fontSize={26} fontFamily="'Noto Serif CJK SC', serif" opacity={p}>
                {s}
              </text>
            );
          })}
        </g>
      )}

      {/* 右侧：成卦 */}
      <g transform="translate(1240, 300)" opacity={yaoGrow}>
        <GuaHex x={-100} y={0} w={200} lines={resultLines} lineH={22} gapY={13} progress={yaoGrow} highlightLines={[0, 2, 4]} yangColor={COLORS.zhu} frame={frame} fps={30} breathe />
        <text x={0} y={260} textAnchor="middle" fill={COLORS.jin} fontSize={40} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={6} opacity={yaoGrow}>
          十有八变 · 成卦
        </text>
        <text x={0} y={310} textAnchor="middle" fill="#c9c0a8" fontSize={24} fontFamily="'Noto Serif CJK SC', serif" opacity={yaoGrow}>
          朱色微颤者为动爻（老阳九 / 老阴六）
        </text>
      </g>

      {/* 大衍数字 */}
      <g opacity={interpolate(frame, [40, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        <text x={960} y={130} textAnchor="middle" fill={COLORS.jin} fontSize={38} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={10}>
          大衍之数五十 · 其用四十有九
        </text>
      </g>

      {/* 数字说明 */}
      <g transform="translate(960, 960)" opacity={interpolate(frame, [200, 280], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        {[
          ["老阳", 9],
          ["少阴", 8],
          ["少阳", 7],
          ["老阴", 6],
        ].map(([n, v], i) => (
          <g key={n as string} transform={`translate(${(i - 1.5) * 300}, 0)`}>
            <text x={0} y={0} textAnchor="middle" fill={COLORS.zhu} fontSize={42} fontFamily="'Noto Serif CJK SC', serif">
              {v}
            </text>
            <text x={0} y={40} textAnchor="middle" fill="#c9c0a8" fontSize={26} fontFamily="'Noto Serif CJK SC', serif">
              {n}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};

/* ============================================================
   第 14 场 · 易理 —— 万变归一，三义浮现
   ============================================================ */
export const SceneYili: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 960;
  const cy = 420;

  // 从六爻卦 → 八卦 → 四象 → 两仪 → 太极 → 一点 层层回退
  const collapse = interpolate(frame, [0, 200], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pointGrow = interpolate(frame, [180, 280], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pointFade = interpolate(frame, [380, 460], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 三维星尘：开头万象流散（三生万物），末尾逐渐聚合归一
  const dustConverge = interpolate(frame, [0, 300], [0.35, 0.99], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dustOpacity = interpolate(frame, [0, 60, 420, 540], [0, 0.9, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const threeYis: Array<[string, string]> = [
    ["变易", "万象流转无一刻停"],
    ["简易", "千变万化不过一阴一阳"],
    ["不易", "变本身万古不变"],
  ];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, opacity: dustOpacity }}>
        <ThreeDust count={1000} converge={dustConverge} spin={0.01} radius={700} />
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {/* 回退的符号环 */}
      <g opacity={collapse} transform={`translate(${cx}, ${cy}) scale(${1 + (1 - collapse) * 0.5})`}>
        {/* 六爻环 */}
        {Array.from({ length: 6 }).map((_, i) => {
          const ang = (i / 6) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(ang) * 260} cy={Math.sin(ang) * 260} r={3} fill={COLORS.jin} opacity={0.5} />;
        })}
        {/* 八卦环 */}
        {Array.from({ length: 8 }).map((_, i) => {
          const ang = (i / 8) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(ang) * 200} cy={Math.sin(ang) * 200} r={2.5} fill={COLORS.zhu} opacity={0.5} />;
        })}
        {/* 四象 */}
        {Array.from({ length: 4 }).map((_, i) => {
          const ang = (i / 4) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(ang) * 140} cy={Math.sin(ang) * 140} r={2} fill={COLORS.jin} opacity={0.5} />;
        })}
        {/* 两仪 */}
        <circle cx={-70} cy={0} r={2} fill={COLORS.zhu} opacity={0.6} />
        <circle cx={70} cy={0} r={2} fill={COLORS.ink} opacity={0.6} />
        {/* 太极 */}
        <circle cx={0} cy={0} r={60} fill="none" stroke={COLORS.jin} strokeWidth={1.5} opacity={0.7} />
      </g>

      {/* 归于一点 */}
      {frame >= 180 && (
        <g transform={`translate(${cx}, ${cy})`} opacity={pointGrow * pointFade}>
          <circle r={80} fill={COLORS.jin} opacity={0.15} />
          <circle r={12} fill="#fffbe8" style={{ filter: "blur(1px)" }} />
        </g>
      )}

      {/* 三义 */}
      <g opacity={interpolate(frame, [200, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        {threeYis.map(([t, d], i) => {
          const p = interpolate(frame, [220 + i * 40, 280 + i * 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <g key={t} transform={`translate(${cx + 0}, ${700 + i * 90})`} opacity={p}>
              <text x={-140} y={0} textAnchor="middle" fill={COLORS.zhu} fontSize={56} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={8}>
                {t}
              </text>
              <text x={140} y={0} textAnchor="middle" fill={COLORS.jin} fontSize={34} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={2}>
                {d}
              </text>
            </g>
          );
        })}
      </g>

      {/* 结尾古语 */}
      <text
        x={960}
        y={1000}
        textAnchor="middle"
        fill="#c9c0a8"
        fontSize={32}
        fontFamily="'Noto Serif CJK SC', serif"
        letterSpacing={6}
        opacity={interpolate(frame, [440, 520], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      >
        天下同归而殊途 · 一致而百虑
      </text>
      </svg>
    </div>
  );
};
