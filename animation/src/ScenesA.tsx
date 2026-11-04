import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, BAGUA, SIXIANG, LIUSHISI, XIAOXI, DAYAN } from "./data";
import { GuaHex, GuaTri, YaoLine } from "./Yao";
import { ThreeDust } from "./ThreeDust";

/* ============================================================
   第 1 场 · 太虚 —— 微弱光点自黑暗中浮出
   ============================================================ */
export const SceneVoid: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // 光点浮现
  const appear = interpolate(frame, [40, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const radius = interpolate(frame, [40, 150], [0, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glowR = interpolate(frame, [40, 150], [0, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 末尾微震动
  const shake = frame > 130 ? Math.sin(frame * 0.5) * 2 : 0;
  // 三维星尘：从高度聚合逐渐散开，暗示"一"中蕴含万象
  const dustConverge = interpolate(frame, [0, 160], [0.98, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dustOpacity = interpolate(frame, [30, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, opacity: dustOpacity * 0.85 }}>
        <ThreeDust count={700} converge={dustConverge} spin={0.006} radius={560} />
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="voidGlow">
            <stop offset="0%" stopColor="#fffbe8" stopOpacity={0.95} />
            <stop offset="35%" stopColor={COLORS.jin} stopOpacity={0.5} />
            <stop offset="100%" stopColor={COLORS.jin} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g transform={`translate(${960 + shake}, ${470})`}>
          <circle r={glowR} fill="url(#voidGlow)" opacity={appear} />
          <circle r={radius} fill="#fffbe8" opacity={appear} style={{ filter: "blur(1px)" }} />
        </g>
      </svg>
    </div>
  );
};

/* ============================================================
   第 2 场 · 太极 —— 光点晕开为圆，墨色渗入旋成双鱼
   ============================================================ */
export const SceneTaiji: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const R = 240;
  const cx = 960;
  const cy = 440;

  // 阶段1: 0-60 光点晕开成白圆
  const grow = interpolate(frame, [0, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 阶段2: 60-180 墨色渗入，旋成双鱼
  const swirl = interpolate(frame, [60, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rot = frame * 0.15;

  // 太极 S 曲线：用两个半圆构成
  const rOuter = R * grow;

  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs>
        <clipPath id="taijiClip">
          <circle cx={cx} cy={cy} r={rOuter} />
        </clipPath>
      </defs>
      {grow > 0.01 && (
        <g transform={`rotate(${rot} ${cx} ${cy})`}>
          {/* 白底（阳） */}
          <circle cx={cx} cy={cy} r={rOuter} fill="#f4ecd8" />
          {/* 墨（阴）—— 用旋转的黑色扇形表示渗入 */}
          <g clipPath="url(#taijiClip)">
            <path
              d={`M ${cx} ${cy - R} A ${R} ${R} 0 0 0 ${cx} ${cy + R} A ${R / 2} ${R / 2} 0 0 1 ${cx} ${cy} A ${R / 2} ${R / 2} 0 0 0 ${cx} ${cy - R} Z`}
              fill={COLORS.ink}
              opacity={swirl}
              transform={`rotate(${(1 - swirl) * -120} ${cx} ${cy})`}
            />
            {/* 黑鱼白眼（阴中有阳） */}
            <circle cx={cx} cy={cy - R / 2} r={R / 8} fill={COLORS.ink} opacity={swirl} />
            <circle cx={cx} cy={cy - R / 2} r={R / 20} fill="#f4ecd8" opacity={swirl} />
            {/* 白鱼黑眼（阳中有阴） */}
            <circle cx={cx} cy={cy + R / 2} r={R / 8} fill="#f4ecd8" opacity={swirl} />
            <circle cx={cx} cy={cy + R / 2} r={R / 20} fill={COLORS.ink} opacity={swirl} />
          </g>
          {/* 外圈 */}
          <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke={COLORS.jin} strokeWidth={2} opacity={0.5 * swirl} />
        </g>
      )}
      {/* 中心提示字 */}
      <text
        x={cx}
        y={cy + R + 90}
        textAnchor="middle"
        fill={COLORS.jin}
        fontSize={52}
        fontFamily="'Noto Serif CJK SC', serif"
        letterSpacing={16}
        opacity={swirl}
        style={{ textShadow: `0 0 24px ${COLORS.jin}66` }}
      >
        太 极
      </text>
    </svg>
  );
};

/* ============================================================
   第 3 场 · 两仪 —— S 曲线剖分，阳爻阴爻初生
   ============================================================ */
export const SceneLiangyi: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 960;
  const cy = 440;
  const R = 240;

  // 太极缩到左上，中间出现分判
  const split = interpolate(frame, [0, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const yaoAppear = interpolate(frame, [60, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelAppear = interpolate(frame, [130, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // 白气升、黑气沉
  const whiteY = interpolate(frame, [0, 90], [cy, cy - 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blackY = interpolate(frame, [0, 90], [cy, cy + 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {/* 分开的两团气 */}
      <circle cx={cx} cy={whiteY} r={120 * (1 - split * 0.4)} fill="#f4ecd8" opacity={0.25} />
      <circle cx={cx} cy={blackY} r={120 * (1 - split * 0.4)} fill={COLORS.ink} opacity={0.5} />

      {/* 阳爻 */}
      <g opacity={yaoAppear}>
        <YaoLine x={cx - 320} y={cy - 230} w={640} h={34} yang progress={interpolate(frame, [70, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} color={COLORS.zhu} />
        <text x={cx - 320 - 90} y={cy - 205} textAnchor="middle" fill={COLORS.zhu} fontSize={44} fontFamily="'Noto Serif CJK SC', serif" opacity={labelAppear}>
          阳
        </text>
        <text x={cx + 320 + 90} y={cy - 205} textAnchor="middle" fill={COLORS.ink} fontSize={30} fontFamily="'Noto Serif CJK SC', serif" opacity={labelAppear}>
          —
        </text>
      </g>

      {/* 阴爻 */}
      <g opacity={yaoAppear}>
        <YaoLine x={cx - 320} y={cy + 190} w={640} h={34} yang={false} progress={interpolate(frame, [90, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} color={COLORS.ink} />
        <text x={cx - 320 - 90} y={cy + 215} textAnchor="middle" fill={COLORS.ink} fontSize={44} fontFamily="'Noto Serif CJK SC', serif" opacity={labelAppear}>
          阴
        </text>
        <text x={cx + 320 + 90} y={cy + 215} textAnchor="middle" fill={COLORS.ink} fontSize={30} fontFamily="'Noto Serif CJK SC', serif" opacity={labelAppear}>
          - -
        </text>
      </g>

      {/* 中央剖分线 */}
      <line x1={cx} y1={cy - 320} x2={cx} y2={cy + 320} stroke={COLORS.jin} strokeWidth={2} opacity={0.4 * split} strokeDasharray="8 8" />
    </svg>
  );
};

/* ============================================================
   第 4 场 · 四象 —— 两爻组合排成半弧
   ============================================================ */
export const SceneSixiang: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 960;
  const cy = 560;
  const rad = 340;

  // 位置：从右上太阳 到 左下太阴 排成弧
  const angleStart = -70;
  const angleEnd = 70;

  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {/* 底部阳爻/阴爻基座 */}
      <g opacity={interpolate(frame, [0, 30], [1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        <YaoLine x={cx - 360} y={cy + 300} w={300} h={26} yang progress={1} color={COLORS.zhu} />
        <YaoLine x={cx + 60} y={cy + 300} w={300} h={26} yang={false} progress={1} color={COLORS.ink} />
      </g>

      {SIXIANG.map((s, i) => {
        const ang = ((angleStart + (angleEnd - angleStart) * (i / (SIXIANG.length - 1))) * Math.PI) / 180;
        const px = cx + Math.sin(ang) * rad;
        const py = cy - Math.cos(ang) * rad * 0.55 + 120;
        const start = 20 + i * 18;
        const p = interpolate(frame, [start, start + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const isYang = s.lines[0] === 1 && s.lines[1] === 1;
        return (
          <g key={s.name} opacity={p} transform={`translate(0, ${interpolate(frame, [start, start + 40], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`}>
            <GuaTri cx={px} cy={py} w={150} lines={s.lines} lineH={18} gapY={14} progress={p} frame={frame} fps={30} color={isYang ? COLORS.zhu : undefined} />
            <text x={px} y={py + 90} textAnchor="middle" fill={COLORS.jin} fontSize={40} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={4}>
              {s.name}
            </text>
            <text x={px} y={py + 140} textAnchor="middle" fill="#c9c0a8" fontSize={26} fontFamily="'Noto Serif CJK SC', serif">
              {s.season} · {s.dir}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
