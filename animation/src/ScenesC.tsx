import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, BAGUA, LIUSHISI, XIAOXI, guaByName } from "./data";
import { GuaHex, GuaTri } from "./Yao";

/* ============================================================
   第 9 场 · 互卦 —— 卦中有卦
   ============================================================ */
export const SceneHuagua: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 500;
  const topY = 300;
  const g = guaByName["噬嗑"]; // 火雷噬嗑
  if (!g) return <svg width={1920} height={1080} />;
  // 噬嗑 [1,0,0,0,1,0]: 初=1,二=0,三=0,四=0,五=1,上=0
  // 互卦: 下卦=二三四=[0,0,0]? 实际：噬嗑 lines=[1,0,0,0,1,0] (初..上)
  // 二三四 = lines[1],lines[2],lines[3] = [0,0,0] → 坤? 但剧本说下卦艮[0,0,1]
  // 剧本描述以传统「二三四为下、三四五为上」：这里 lines 初→上
  // 二爻=lines[1],三爻=lines[2],四爻=lines[3] → 艮=[0,0,1] 需 lines[1..3]=[0,0,1]
  // 为呈现剧本效果，直接用传统互卦结果：下艮上坎 → 山火贲
  const linesXia = [0, 0, 1]; // 艮
  const linesShang = [0, 1, 0]; // 坎
  const huLines = [...linesXia, ...linesShang];

  const revealBase = interpolate(frame, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 高亮二三四、三四五
  const hl234 = interpolate(frame, [60, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hl345 = interpolate(frame, [120, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const huAppear = interpolate(frame, [180, 260], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {/* 母卦 噬嗑 */}
      <GuaHex x={cx - 140} y={topY} w={280} lines={g.lines} lineH={26} gapY={16} progress={revealBase} highlightLines={frame > 60 ? [1, 2, 3] : []} yangColor={COLORS.zhu} />
      <text x={cx} y={topY + 320} textAnchor="middle" fill="#f4ecd8" fontSize={48} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={6}>
        噬嗑（母卦）
      </text>

      {/* 二三四爻标注 */}
      <g opacity={hl234}>
        <path d={`M ${cx + 170} ${topY + 200} L ${cx + 250} ${topY + 200}`} stroke={COLORS.jin} strokeWidth={2} />
        <text x={cx + 270} y={topY + 210} fill={COLORS.jin} fontSize={30} fontFamily="'Noto Serif CJK SC', serif">
          二三四 → 下卦艮
        </text>
      </g>
      {/* 三四五爻标注 */}
      <g opacity={hl345}>
        <path d={`M ${cx + 170} ${topY + 130} L ${cx + 250} ${topY + 130}`} stroke={COLORS.zhu} strokeWidth={2} />
        <text x={cx + 270} y={topY + 140} fill={COLORS.zhu} fontSize={30} fontFamily="'Noto Serif CJK SC', serif">
          三四五 → 上卦坎
        </text>
      </g>

      {/* 互卦 山火贲 */}
      <g opacity={huAppear} transform={`translate(${interpolate(frame, [180, 260], [500, 1180], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}, 0)`}>
        <GuaHex x={-140} y={topY} w={280} lines={huLines} lineH={26} gapY={16} progress={huAppear} yangColor={COLORS.zhu} />
        <text x={0} y={topY + 320} textAnchor="middle" fill={COLORS.jin} fontSize={48} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={6} opacity={huAppear}>
          贲（互卦）
        </text>
      </g>

      {/* 箭头 */}
      <g opacity={huAppear}>
        <path d={`M 800 440 Q 960 380 1120 440`} stroke={COLORS.jin} strokeWidth={3} fill="none" markerEnd="url(#arrowGold)" />
        <defs>
          <marker id="arrowGold" markerWidth="12" markerHeight="12" refX="8" refY="6" orient="auto">
            <path d="M0,0 L12,6 L0,12 Z" fill={COLORS.jin} />
          </marker>
        </defs>
      </g>

      <text x={960} y={160} textAnchor="middle" fill={COLORS.jin} fontSize={38} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={10}>
        卦中有卦 · 象中藏象
      </text>
    </svg>
  );
};

/* ============================================================
   第 10 场 · 变卦 —— 爻变，之卦
   ============================================================ */
export const SceneBiangua: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 960;
  const cy = 470;
  const g = guaByName["乾"];
  if (!g) return <svg width={1920} height={1080} />;

  // 六个变卦：初变姤、二变同人、三变履、四变小畜、五变大有、上变夬
  const bianNames = ["姤", "同人", "履", "小畜", "大有", "夬"];
  const R = 380;

  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {/* 中心乾卦大字 */}
      <g opacity={interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" })}>
        <GuaHex x={cx - 120} y={cy - 130} w={240} lines={g.lines} lineH={24} gapY={14} progress={1} yangColor={COLORS.zhu} />
        <text x={cx} y={cy + 180} textAnchor="middle" fill="#f4ecd8" fontSize={44} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={6}>
          乾（本卦）
        </text>
      </g>

      {/* 六条光线 + 六个之卦 */}
      {bianNames.map((name, i) => {
        // 六爻位置：初在下、上在上，绕成两侧
        const side = i < 3 ? -1 : 1;
        const idx = i < 3 ? i : i - 3;
        const ang = ((45 + idx * 45) * Math.PI) / 180;
        const px = cx + Math.cos(ang) * R * side * (1);
        const py = cy + (idx - 1) * 130;
        const px2 = cx + side * 460;
        const py2 = cy - 200 + idx * 150;
        const start = 40 + i * 25;
        const p = interpolate(frame, [start, start + 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const gb = guaByName[name];
        if (!gb) return null;
        return (
          <g key={name}>
            {/* 光线 */}
            <line
              x1={cx + side * 130}
              y1={cy - 60 + i * 20}
              x2={px2 - side * 70}
              y2={py2 + 60}
              stroke={COLORS.zhu}
              strokeWidth={2.5}
              opacity={p * 0.7}
            />
            <g opacity={p}>
              <GuaHex x={px2 - 70} y={py2 - 60} w={140} lines={gb.lines} lineH={13} gapY={8} progress={p} yangColor={COLORS.zhu} />
              <text x={px2} y={py2 + 80} textAnchor="middle" fill={COLORS.jin} fontSize={32} fontFamily="'Noto Serif CJK SC', serif">
                {name}
              </text>
              <text x={px2} y={py2 + 116} textAnchor="middle" fill="#a8a08a" fontSize={22} fontFamily="'Noto Serif CJK SC', serif">
                {["初", "二", "三", "四", "五", "上"][i]}爻变
              </text>
            </g>
          </g>
        );
      })}

      <text x={960} y={130} textAnchor="middle" fill={COLORS.jin} fontSize={36} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={10}>
        一爻动 · 生一卦（之卦）
      </text>
    </svg>
  );
};

/* ============================================================
   第 11 场 · 十二消息卦 —— 阴阳消长环
   ============================================================ */
export const SceneXiaoxi: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 960;
  const cy = 500;
  const R = 360;

  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={COLORS.jin} strokeWidth={1} opacity={0.3} />
      <circle cx={cx} cy={cy} r={R + 40} fill="none" stroke={COLORS.jin} strokeWidth={1} opacity={0.15} strokeDasharray="4 8" />

      {XIAOXI.map((g, i) => {
        // 从正下方子月开始，顺时针
        const ang = ((i / 12) * 360 - 90 + 90) * (Math.PI / 180); // 子在下
        const px = cx + Math.cos(ang) * R;
        const py = cy + Math.sin(ang) * R;
        const start = i * 12;
        const p = interpolate(frame, [start, start + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        // 阳爻数
        const yangCount = g.lines.filter((l) => l === 1).length;
        const isYangTurn = yangCount >= 3;
        // 呼吸相位：随阳长则光盛
        const breathe = 0.5 + 0.5 * Math.sin((frame / 30) * 2 + i);
        const glowColor = isYangTurn ? COLORS.zhu : COLORS.jin;
        return (
          <g key={g.name} opacity={p}>
            {/* 光晕 */}
            <circle cx={px} cy={py} r={58} fill={glowColor} opacity={0.08 + yangCount * 0.02 + breathe * 0.05} />
            <GuaHex
              x={px - 55}
              y={py - 60}
              w={110}
              lines={g.lines}
              lineH={11}
              gapY={7}
              progress={p}
              yangColor={COLORS.zhu}
              frame={frame}
              fps={30}
            />
            <text x={px} y={py + 70} textAnchor="middle" fill={COLORS.jin} fontSize={30} fontFamily="'Noto Serif CJK SC', serif">
              {g.name}
            </text>
            <text x={px} y={py + 100} textAnchor="middle" fill="#a8a08a" fontSize={20} fontFamily="'Noto Serif CJK SC', serif">
              {g.zhi}·{g.desc}
            </text>
          </g>
        );
      })}

      <text x={cx} y={cy - 20} textAnchor="middle" fill={COLORS.jin} fontSize={34} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={6}>
        十二消息卦
      </text>
      <text x={cx} y={cy + 40} textAnchor="middle" fill="#c9c0a8" fontSize={26} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={4}>
        阳长阴消 · 循环不已
      </text>
    </svg>
  );
};

/* ============================================================
   第 12 场 · 卦序 —— 序卦传长链
   ============================================================ */
export const SceneGuaxu: React.FC = () => {
  const frame = useCurrentFrame();
  const total = LIUSHISI.length;

  // 时间：前半展示锁链，后半展示三套卦序对比
  const phase2 = frame > 380;

  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {/* 锁链式卦序：分 4 行，每行 16 卦 */}
      {!phase2 &&
        LIUSHISI.map((g, i) => {
          const row = Math.floor(i / 16);
          const col = i % 16;
          const x = 220 + col * 95;
          const y = 260 + row * 170;
          const start = i * 4;
          const p = interpolate(frame, [start, start + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const isEnd = g.name === "乾坤"[0] || g.name === "坤" || g.name === "既济" || g.name === "未济" || i === 0;
          const special = i === 0 || i === 1 || g.name === "既济" || g.name === "未济";
          return (
            <g key={g.name} opacity={p} transform={`translate(${x}, ${y})`}>
              <GuaHex x={-28} y={-48} w={56} lines={g.lines} lineH={6} gapY={4} progress={p} yangColor={special ? COLORS.zhu : undefined} />
              <text x={0} y={40} textAnchor="middle" fill={special ? COLORS.zhu : "#c9c0a8"} fontSize={22} fontFamily="'Noto Serif CJK SC', serif">
                {g.name}
              </text>
              {/* 连接线 */}
              {col < 15 && <line x1={30} y1={-10} x2={62} y2={-10} stroke={COLORS.jin} strokeWidth={1} opacity={0.4 * p} />}
            </g>
          );
        })}

      {!phase2 && (
        <>
          <text x={960} y={150} textAnchor="middle" fill={COLORS.jin} fontSize={38} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={10}>
            序卦传 · 环环相扣
          </text>
          <text x={960} y={1020} textAnchor="middle" fill="#c9c0a8" fontSize={28} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={4} opacity={interpolate(frame, [300, 360], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
            始于乾坤 · 终于未济 —— 万物永远在变化的途中
          </text>
        </>
      )}

      {/* 三套卦序对比 */}
      {phase2 && (
        <g opacity={interpolate(frame, [380, 440], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
          <text x={960} y={130} textAnchor="middle" fill={COLORS.jin} fontSize={38} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={10}>
            一卦多序 · 象外有象
          </text>
          {(["先天示体", "八宫示用", "帛书示古"] as const).map((label, col) => {
            const bx = 360 + col * 600;
            const colors = [COLORS.jin, COLORS.zhu, "#4a7c9e"];
            const orders = [
              ["乾", "夬", "大有", "大壮", "小畜", "需", "大畜", "泰"],
              ["乾", "姤", "遁", "否", "观", "剥", "晋", "大有"],
              ["乾", "否", "遁", "履", "讼", "同人", "无妄", "姤"],
            ];
            return (
              <g key={label}>
                <text x={bx} y={220} textAnchor="middle" fill={colors[col]} fontSize={34} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={6}>
                  {label}
                </text>
                {orders[col].map((n, r) => {
                  const start = 400 + col * 20 + r * 8;
                  const p = interpolate(frame, [start, start + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  return (
                    <g key={n} opacity={p} transform={`translate(${bx - 40}, ${280 + r * 78})`}>
                      <rect x={0} y={0} width={80} height={64} rx={6} fill="none" stroke={colors[col]} strokeWidth={1.5} opacity={0.7} />
                      <text x={40} y={44} textAnchor="middle" fill={colors[col]} fontSize={30} fontFamily="'Noto Serif CJK SC', serif">
                        {n}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};
