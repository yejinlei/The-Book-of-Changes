import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { COLORS } from "./data";

/**
 * 三维星尘——用 three.js 做 3D 数学计算（旋转、透视投影、粒子分布），
 * 再投影到 2D 用 SVG 渲染。这样既用足 three.js 的三维能力，
 * 又避开 Remotion 逐帧渲染时 WebGL 上下文不稳定的问题。
 */

interface DustProps {
  count?: number;
  // 0-1，聚合程度：0=完全分散，1=聚合为一点
  converge?: number;
  // 整体旋转速度
  spin?: number;
  radius?: number;
  palette?: string[];
}

export const ThreeDust: React.FC<DustProps> = ({
  count = 900,
  converge: convergeProp,
  spin = 0.009,
  radius = 620,
  palette,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const colors = palette || [COLORS.zhu, COLORS.jin, "#f4ecd8", "#c0392b", "#d4a017"];

  // 用 three.js 生成稳定的粒子初始分布（球面均匀分布）
  const base = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      arr.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
    }
    return arr;
  }, [count]);

  const rands = useMemo(
    () =>
      base.map((_, i) => ({
        ph: (i * 0.618) % 1,
        size: 1 + ((i * 104729) % 100) / 50,
        colorIdx: i % colors.length,
      })),
    [base, colors.length]
  );

  const converge = convergeProp ?? 0.5;
  const cx = 960;
  const cy = 540;
  const fov = 900;

  const rotY = t * spin * 60;
  const rotX = Math.sin(t * 0.3) * 0.25;

  const projected = base.map((v, i) => {
    const vec = v.clone().multiplyScalar(radius * (1 - converge * 0.92));
    vec.applyEuler(new THREE.Euler(rotX, rotY, 0));
    const breathe = 1 + 0.04 * Math.sin(t * 1.2 + rands[i].ph * Math.PI * 2);
    vec.multiplyScalar(breathe);
    const z = vec.z + 1400;
    const scale = fov / Math.max(1, z);
    const x = cx + vec.x * scale;
    const y = cy + vec.y * scale;
    const depth = (vec.z + radius) / (radius * 2);
    return {
      x,
      y,
      r: rands[i].size * (0.4 + depth * 0.9),
      o: 0.25 + depth * 0.7,
      c: colors[rands[i].colorIdx],
    };
  });

  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="dustCenter">
          <stop offset="0%" stopColor="#fffbe8" stopOpacity={0.9} />
          <stop offset="50%" stopColor={COLORS.jin} stopOpacity={0.3} />
          <stop offset="100%" stopColor={COLORS.jin} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={140 + converge * 220} fill="url(#dustCenter)" opacity={0.5 + converge * 0.5} />
      {projected.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.c} opacity={p.o} />
      ))}
    </svg>
  );
};
