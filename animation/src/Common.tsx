import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { COLORS } from "./data";

/** 宣纸底 + 微光晕 背景 */
export const PaperBg: React.FC<{ darkness?: number }> = ({ darkness = 0 }) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 42%, #26242e 0%, #15141c 45%, #0a0a10 75%, #050508 100%)`,
      }}
    >
      {/* 宣纸纹理感：细微噪点用极淡的圆点排布 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #f4ecd8 0.5px, transparent 1px), radial-gradient(circle at 70% 60%, #f4ecd8 0.5px, transparent 1px)",
          backgroundSize: "48px 48px, 66px 66px",
        }}
      />
      {/* 中心暖色光雾，让主体有依托 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 44%, rgba(184,134,11,0.10) 0%, transparent 42%)",
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${darkness})` }} />
    </div>
  );
};

/** 竖排标题（古籍感） */
export const VerticalTitle: React.FC<{
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  frame?: number;
  start?: number;
  stagger?: number;
}> = ({ text, x, y, size = 64, color = COLORS.jin, frame = 0, start = 0, stagger = 4 }) => {
  return (
    <div style={{ position: "absolute", left: x, top: y, writingMode: "vertical-rl" }}>
      {text.split("").map((ch, i) => {
        const f = frame - start - i * stagger;
        const o = interpolate(f, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const ty = interpolate(f, [0, 14], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <span
            key={i}
            style={{
              display: "block",
              opacity: o,
              transform: `translateY(${ty}px)`,
              fontSize: size,
              color,
              fontFamily: "'Noto Serif CJK SC', serif",
              textShadow: `0 0 24px ${color}55`,
              letterSpacing: 6,
              fontWeight: 700,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** 底部旁白字幕：贴到底边，自身高度极薄，不遮挡画面主体 */
export const Subtitle: React.FC<{
  text: string;
  opacity?: number;
  size?: number;
}> = ({ text, opacity = 1, size = 26 }) => {
  return (
    <>
      {/* 底部渐变暗条：极窄，仅在最底边 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 70,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0) 100%)",
          pointerEvents: "none",
          opacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity,
          padding: "0 180px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            textAlign: "center",
            fontSize: size,
            lineHeight: 1.35,
            color: "#f4ecd8",
            fontFamily: "'Noto Serif CJK SC', serif",
            letterSpacing: 1,
            textShadow:
              "0 1px 3px rgba(0,0,0,0.98), 0 0 10px rgba(0,0,0,0.9)",
            padding: "4px 14px",
            background: "transparent",
            whiteSpace: "normal",
          }}
        >
          {text}
        </div>
      </div>
    </>
  );
};

/** 顶部章节标签 */
export const ChapterTag: React.FC<{ index: number; name: string; frame: number }> = ({ index, name, frame }) => {
  const o = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const x = interpolate(frame, [0, 18], [-30, 0], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        left: 60,
        opacity: o * 0.9,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: `2px solid ${COLORS.zhu}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          color: COLORS.zhu,
          fontFamily: "'Noto Serif CJK SC', serif",
          fontWeight: 700,
          background: "rgba(139,0,0,0.12)",
        }}
      >
        {String(index).padStart(2, "0")}
      </div>
      <div style={{ fontSize: 30, color: COLORS.jin, fontFamily: "'Noto Serif CJK SC', serif", letterSpacing: 4 }}>
        {name}
      </div>
    </div>
  );
};

/** 一句古语浮现在暗处 */
export const AncientQuote: React.FC<{ text: string; frame: number; start?: number; color?: string }> = ({
  text,
  frame,
  start = 0,
  color = COLORS.jin,
}) => {
  const f = frame - start;
  const o = interpolate(f, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const size = interpolate(f, [0, 40], [30, 38], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: "30%",
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: o,
        fontSize: size,
        color,
        fontFamily: "'Noto Serif CJK SC', serif",
        letterSpacing: 8,
        textShadow: `0 0 30px ${color}66`,
      }}
    >
      {text}
    </div>
  );
};
