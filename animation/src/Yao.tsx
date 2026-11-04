import React from "react";
import { COLORS } from "./data";

/** 一道爻的 SVG 组件。
 *  x,y 为爻左上角；w 宽；h 高；yang=真为阳爻
 *  progress: 0-1 绘制进度（从中间向两端展开）
 *  glow: 发光强度 0-1
 *  ring: 是否带圈选高亮
 *  idx: 爻序号（用于呼吸相位）
 */
export const YaoLine: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  yang: boolean;
  progress?: number;
  glow?: number;
  color?: string;
  ring?: boolean;
  phase?: number;
  frame?: number;
  fps?: number;
  breathe?: boolean;
}> = ({
  x,
  y,
  w,
  h = 18,
  yang,
  progress = 1,
  glow = 0,
  color,
  ring = false,
  phase = 0,
  frame = 0,
  fps = 30,
  breathe = false,
}) => {
  const t = frame / fps;
  // 呼吸 0.5~1
  const breatheK = breathe ? 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2 + phase)) : 1;
  const baseColor = color || (yang ? COLORS.zhu : COLORS.ink);
  const gap = w * 0.16; // 阴爻中间缺口

  // 绘制进度：从中心向两端
  const half = (w / 2) * Math.min(1, Math.max(0, progress));

  const elements: React.ReactNode[] = [];
  const cx = x + w / 2;

  if (yang) {
    elements.push(
      <rect
        key="yang"
        x={cx - half}
        y={y}
        width={half * 2}
        height={h}
        rx={h * 0.25}
        fill={baseColor}
      />
    );
  } else {
    const seg = (w - gap) / 2;
    const segHalf = seg * Math.min(1, Math.max(0, progress));
    elements.push(
      <rect key="l" x={cx - gap / 2 - segHalf} y={y} width={segHalf} height={h} rx={h * 0.25} fill={baseColor} />,
      <rect key="r" x={cx + gap / 2} y={y} width={segHalf} height={h} rx={h * 0.25} fill={baseColor} />
    );
  }

  return (
    <g>
      {(glow > 0 || ring) && (
        <rect
          x={x - 8}
          y={y - 8}
          width={w + 16}
          height={h + 16}
          rx={h}
          fill="none"
          stroke={ring ? COLORS.jin : baseColor}
          strokeWidth={ring ? 3 : glow * 8}
          opacity={ring ? 0.9 : glow * 0.5 * breatheK}
        />
      )}
      <g opacity={breathe ? 0.7 + 0.3 * breatheK : 1}>{elements}</g>
      {glow > 0 && (
        <rect
          x={x - 4}
          y={y - 4}
          width={w + 8}
          height={h + 8}
          rx={h * 0.5}
          fill="none"
          stroke={baseColor}
          strokeWidth={2}
          opacity={glow * 0.8 * breatheK}
          style={{ filter: "blur(3px)" }}
        />
      )}
    </g>
  );
};

/** 绘制一个六爻卦（从初爻在下到上爻在上） */
export const GuaHex: React.FC<{
  x: number;
  y: number; // 卦顶
  w: number;
  lines: number[];
  lineH?: number;
  gapY?: number;
  progress?: number; // 整体绘制进度
  highlightLines?: number[]; // 高亮爻位
  yangColor?: string;
  yinColor?: string;
  frame?: number;
  fps?: number;
  breathe?: boolean;
  label?: string;
  labelColor?: string;
}> = ({
  x,
  y,
  w,
  lines,
  lineH = 18,
  gapY = 12,
  progress = 1,
  highlightLines = [],
  yangColor,
  yinColor,
  frame = 0,
  fps = 30,
  breathe = false,
  label,
  labelColor,
}) => {
  const n = lines.length;
  const totalH = n * lineH + (n - 1) * gapY;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    // 从初爻（下）到上爻（上）：lines[0] 在最下
    const rowFromBottom = i;
    const yy = y + totalH - (rowFromBottom + 1) * lineH - rowFromBottom * gapY;
    // 逐爻绘制的进度
    const yaoStart = (i / n) * 0.7;
    const p = Math.min(1, Math.max(0, (progress - yaoStart) / 0.3));
    const isHl = highlightLines.includes(i);
    out.push(
      <YaoLine
        key={i}
        x={x}
        y={yy}
        w={w}
        h={lineH}
        yang={lines[i] === 1}
        progress={p}
        glow={isHl ? 1 : 0}
        ring={isHl}
        color={lines[i] === 1 ? yangColor : yinColor}
        phase={i * 0.6}
        frame={frame}
        fps={fps}
        breathe={breathe && isHl}
      />
    );
  }
  return (
    <g>
      {out}
      {label && (
        <text
          x={x + w / 2}
          y={y + totalH + lineH + 8}
          textAnchor="middle"
          fill={labelColor || COLORS.ink}
          fontSize={lineH * 1.3}
          fontFamily="'Noto Serif CJK SC', serif"
        >
          {label}
        </text>
      )}
    </g>
  );
};

/** 三爻卦（单卦）小图 */
export const GuaTri: React.FC<{
  cx: number;
  cy: number;
  w: number;
  lines: number[];
  progress?: number;
  lineH?: number;
  gapY?: number;
  frame?: number;
  fps?: number;
  color?: string;
  nameLabel?: string;
  nameColor?: string;
  nameDy?: number;
}> = ({ cx, cy, w, lines, progress = 1, lineH = 14, gapY = 10, frame = 0, fps = 30, color, nameLabel, nameDy = 0, nameColor }) => {
  const n = lines.length;
  const totalH = n * lineH + (n - 1) * gapY;
  const top = cy - totalH / 2;
  return (
    <g>
      <GuaHex
        x={cx - w / 2}
        y={top}
        w={w}
        lines={lines}
        lineH={lineH}
        gapY={gapY}
        progress={progress}
        frame={frame}
        fps={fps}
        yangColor={color}
        yinColor={color}
        label={nameLabel}
        labelColor={nameColor}
      />
      {nameLabel && nameDy !== 0 && (
        <text x={cx} y={cy + totalH / 2 + nameDy} textAnchor="middle" fill={nameColor || COLORS.ink} fontSize={lineH * 1.2} fontFamily="'Noto Serif CJK SC', serif">
          {nameLabel}
        </text>
      )}
    </g>
  );
};
