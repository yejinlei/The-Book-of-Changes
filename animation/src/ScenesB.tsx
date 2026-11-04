import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, BAGUA, LIUSHISI, guaByName, cuo, zong, guaByLines } from "./data";
import { GuaTri, GuaHex } from "./Yao";

/* ============================================================
   第 5 场 · 八卦 —— 三爻成卦，绕成先天圆环
   ============================================================ */
export const SceneBagua: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 960;
  const cy = 480;
  const R = 300;

  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {/* 中央先天八卦方位图 */}
      <g opacity={interpolate(frame, [120, 180], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        <circle cx={cx} cy={cy} r={120} fill="none" stroke={COLORS.jin} strokeWidth={1.5} opacity={0.5} />
        <circle cx={cx} cy={cy} r={180} fill="none" stroke={COLORS.jin} strokeWidth={1} opacity={0.3} strokeDasharray="6 6" />
      </g>

      {BAGUA.map((g, i) => {
        const ang = ((g.dir - 90) * Math.PI) / 180; // dir: 南=0 → SVG 上为 -90
        const px = cx + Math.cos(ang) * R;
        const py = cy + Math.sin(ang) * R;
        const start = 20 + i * 12;
        const p = interpolate(frame, [start, start + 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const appear = interpolate(frame, [110 + i * 6, 140 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const isYang = g.lines.join("") === "111";
        const isKun = g.lines.join("") === "000";
        return (
          <g key={g.key} opacity={p}>
            <GuaTri cx={px} cy={py} w={130} lines={g.lines} lineH={17} gapY={12} progress={p} frame={frame} fps={30} color={isYang ? COLORS.zhu : isKun ? COLORS.ink : undefined} />
            <text x={px} y={py + 75} textAnchor="middle" fill={COLORS.jin} fontSize={40} fontFamily="'Noto Serif CJK SC', serif" opacity={appear}>
              {g.symbol} {g.name}
            </text>
            <text x={px} y={py + 118} textAnchor="middle" fill="#c9c0a8" fontSize={26} fontFamily="'Noto Serif CJK SC', serif" opacity={appear}>
              {g.nature} · {g.xiantian}
            </text>
          </g>
        );
      })}

      <text x={cx} y={cy + 12} textAnchor="middle" fill={COLORS.jin} fontSize={44} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={12} opacity={interpolate(frame, [140, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        先天八卦
      </text>
    </svg>
  );
};

/* ============================================================
   第 6 场 · 六十四卦 —— 八卦相重，圆图 + 方图
   ============================================================ */
export const SceneLiushisi: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 960;
  const cy = 470;

  // 圆图：以先天八卦序排列，64 卦环布
  const outerR = 380;
  const innerR = 300;
  const order64 = LIUSHISI; // 简化：按通行本序绕环（视觉上均匀分布）
  const N = 64;
  const guaIdx: Record<string, number> = {};
  order64.forEach((g, i) => (guaIdx[g.name] = i));

  // 方图 8x8，位于右下角缩小呈现（整体上移，避让底部字幕带）
  const fx = 1350;
  const fy = 590;
  const cell = 34;

  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {/* 圆图外圈 */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={COLORS.jin} strokeWidth={1} opacity={0.25} />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={COLORS.jin} strokeWidth={1} opacity={0.25} />

      {/* 中心太极暗示 */}
      <circle cx={cx} cy={cy} r={70} fill="none" stroke={COLORS.jin} strokeWidth={2} opacity={interpolate(frame, [0, 40], [0, 0.6], { extrapolateRight: "clamp" })} />
      <path
        d={`M ${cx} ${cy - 70} A 70 70 0 0 0 ${cx} ${cy + 70} A 35 35 0 0 1 ${cx} ${cy} A 35 35 0 0 0 ${cx} ${cy - 70} Z`}
        fill={COLORS.ink}
        opacity={interpolate(frame, [0, 40], [0, 0.5], { extrapolateRight: "clamp" })}
      />

      {/* 64 卦绕圆 */}
      {order64.map((g, i) => {
        const ang = ((i / N) * 360 - 90) * (Math.PI / 180);
        const px = cx + Math.cos(ang) * outerR;
        const py = cy + Math.sin(ang) * outerR;
        const start = i * 1.2;
        const p = interpolate(frame, [start, start + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        // 每个卦用 6 条极短线画卦画
        const H = 4;
        const gapY = 2.5;
        const W = 38;
        const total = 6 * H + 5 * gapY;
        return (
          <g key={g.name} opacity={p} transform={`translate(${px}, ${py}) rotate(${(i / N) * 360})`}>
            {g.lines.map((ln, k) => {
              const yy = total / 2 - (6 - k) * (H + gapY) + gapY; // 初爻在下
              const isY = ln === 1;
              return (
                <g key={k}>
                  {isY ? (
                    <rect x={-W / 2} y={yy} width={W} height={H} fill={COLORS.ink} opacity={0.85} rx={1} />
                  ) : (
                    <>
                      <rect x={-W / 2} y={yy} width={W * 0.4} height={H} fill={COLORS.ink} opacity={0.85} rx={1} />
                      <rect x={W / 2 - W * 0.4} y={yy} width={W * 0.4} height={H} fill={COLORS.ink} opacity={0.85} rx={1} />
                    </>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* ===== 方图 8x8 ===== */}
      <g opacity={interpolate(frame, [260, 340], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 8 }).map((_, c) => {
            const g = LIUSHISI[(r * 8 + c) % 64];
            const x = fx + c * cell;
            const y = fy + r * cell;
            return (
              <g key={`${r}-${c}`} transform={`translate(${x}, ${y})`}>
                <rect x={0} y={0} width={cell - 4} height={cell - 4} fill="none" stroke={COLORS.jin} strokeWidth={0.8} opacity={0.5} />
                {g.lines.map((ln, k) => {
                  const H2 = 1.8;
                  const yy = 2 + (5 - k) * 4; // 初在下
                  return ln === 1 ? (
                    <rect key={k} x={3} y={yy} width={cell - 10} height={H2} fill={COLORS.ink} opacity={0.7} />
                  ) : (
                    <>
                      <rect key={`l${k}`} x={3} y={yy} width={(cell - 10) * 0.4} height={H2} fill={COLORS.ink} opacity={0.7} />
                      <rect key={`r${k}`} x={cell - 7 - (cell - 10) * 0.4} y={yy} width={(cell - 10) * 0.4} height={H2} fill={COLORS.ink} opacity={0.7} />
                    </>
                  );
                })}
              </g>
            );
          })
        )}
        <text x={fx + 4 * cell} y={fy + 8 * cell + 40} textAnchor="middle" fill={COLORS.jin} fontSize={30} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={6}>
          方 图（象地）
        </text>
      </g>

      <text x={cx} y={cy + outerR + 70} textAnchor="middle" fill={COLORS.jin} fontSize={34} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={8} opacity={interpolate(frame, [180, 260], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        六十四卦 · 圆图象天
      </text>
    </svg>
  );
};

/* ============================================================
   第 7 场 · 错卦 —— 阴阳对翻
   ============================================================ */
export const SceneCuogua: React.FC = () => {
  const frame = useCurrentFrame();
  const leftX = 440;
  const rightX = 1480;
  const topY = 320;

  // 演示对：乾坤、坎离、颐大过、中孚小过
  const pairs: Array<[string, string]> = [
    ["乾", "坤"],
    ["坎", "离"],
    ["颐", "大过"],
    ["中孚", "小过"],
  ];

  const pairIdx = Math.min(pairs.length - 1, Math.floor(frame / 45));
  const [a, b] = pairs[pairIdx];
  const ga = guaByName[a];
  const gb = guaByName[b];

  // 每次切换时重放翻转动画
  const localF = frame - pairIdx * 45;
  const flip = interpolate(localF, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 左卦逐步转成右卦（错卦）的中间态
  if (!ga || !gb) return <svg width={1920} height={1080} />;
  const midLines = ga.lines.map((l, i) => (flip > (i + 1) / 6 ? gb.lines[i] : l));

  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {/* 左：原卦 */}
      <GuaHex x={leftX - 140} y={topY} w={280} lines={ga.lines} lineH={26} gapY={16} progress={1} yangColor={COLORS.zhu} />
      <text x={leftX} y={topY + 320} textAnchor="middle" fill="#f4ecd8" fontSize={54} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={8}>
        {a}
      </text>

      {/* 中间：翻转过程 */}
      <g transform={`translate(${960 - 140}, 0)`}>
        <GuaHex x={0} y={topY} w={280} lines={midLines} lineH={26} gapY={16} progress={1} yangColor={COLORS.zhu} />
      </g>

      {/* 右：错卦 */}
      <GuaHex x={rightX - 140} y={topY} w={280} lines={gb.lines} lineH={26} gapY={16} progress={interpolate(localF, [15, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} yangColor={COLORS.zhu} />
      <text x={rightX} y={topY + 320} textAnchor="middle" fill="#f4ecd8" fontSize={54} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={8} opacity={interpolate(localF, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        {b}
      </text>

      {/* 朱红连线 + "错"字 */}
      <line x1={leftX + 60} y1={topY + 130} x2={rightX - 60} y2={topY + 130} stroke={COLORS.zhu} strokeWidth={3} opacity={flip * 0.8} strokeDasharray="10 6" />
      <circle cx={960} cy={topY + 130} r={46} fill={COLORS.bg} stroke={COLORS.zhu} strokeWidth={3} opacity={flip} />
      <text x={960} y={topY + 148} textAnchor="middle" fill={COLORS.zhu} fontSize={48} fontFamily="'Noto Serif CJK SC', serif" opacity={flip}>
        错
      </text>

      {/* 顶部提示 */}
      <text x={960} y={180} textAnchor="middle" fill={COLORS.jin} fontSize={38} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={10}>
        阴阳全反 · 对面而立
      </text>

      {/* 下方其余对 */}
      <g opacity={0.7}>
        {pairs.map(([x, y], i) => (
          <text key={i} x={400 + i * 380} y={920} textAnchor="middle" fill={i === pairIdx ? COLORS.jin : "#8a8570"} fontSize={30} fontFamily="'Noto Serif CJK SC', serif">
            {x} ⇄ {y}
          </text>
        ))}
      </g>
    </svg>
  );
};

/* ============================================================
   第 8 场 · 综卦 —— 上下倒置
   ============================================================ */
export const SceneZonggua: React.FC = () => {
  const frame = useCurrentFrame();
  const leftX = 480;
  const rightX = 1440;
  const topY = 300;

  const pairs: Array<[string, string]> = [
    ["屯", "蒙"],
    ["需", "讼"],
    ["泰", "否"],
    ["既济", "未济"],
  ];
  const pairIdx = Math.min(pairs.length - 1, Math.floor(frame / 45));
  const [a, b] = pairs[pairIdx];
  const ga = guaByName[a];
  const gb = guaByName[b];
  if (!ga || !gb) return <svg width={1920} height={1080} />;
  const localF = frame - pairIdx * 45;

  // 左卦旋转 180 度（视觉上翻转）
  const rot = interpolate(localF, [5, 40], [0, 180], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {/* 左：原卦 旋转到倒置 */}
      <g transform={`rotate(${rot} ${leftX} ${topY + 150})`}>
        <GuaHex x={leftX - 140} y={topY} w={280} lines={ga.lines} lineH={26} gapY={16} progress={1} yangColor={COLORS.jin} />
      </g>
      <text x={leftX} y={topY + 340} textAnchor="middle" fill="#f4ecd8" fontSize={52} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={8} opacity={interpolate(localF, [0, 10, 30], [1, 1, 0.3], { extrapolateRight: "clamp" })}>
        {a}
      </text>

      {/* 右：综卦 */}
      <GuaHex x={rightX - 140} y={topY} w={280} lines={gb.lines} lineH={26} gapY={16} progress={interpolate(localF, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} yangColor={COLORS.jin} />
      <text x={rightX} y={topY + 340} textAnchor="middle" fill="#f4ecd8" fontSize={52} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={8} opacity={interpolate(localF, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        {b}
      </text>

      {/* 鎏金连线 */}
      <line x1={leftX + 60} y1={topY + 150} x2={rightX - 60} y2={topY + 150} stroke={COLORS.jin} strokeWidth={3} opacity={interpolate(localF, [25, 40], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} strokeDasharray="10 6" />
      <circle cx={(leftX + rightX) / 2} cy={topY + 150} r={46} fill={COLORS.bg} stroke={COLORS.jin} strokeWidth={3} opacity={interpolate(localF, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <text x={(leftX + rightX) / 2} y={topY + 168} textAnchor="middle" fill={COLORS.jin} fontSize={48} fontFamily="'Noto Serif CJK SC', serif" opacity={interpolate(localF, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        综
      </text>

      <text x={960} y={170} textAnchor="middle" fill={COLORS.jin} fontSize={38} fontFamily="'Noto Serif CJK SC', serif" letterSpacing={10}>
        上下倒置 · 如印翻转
      </text>

      <g opacity={0.7}>
        {pairs.map(([x, y], i) => (
          <text key={i} x={430 + i * 360} y={930} textAnchor="middle" fill={i === pairIdx ? COLORS.jin : "#8a8570"} fontSize={30} fontFamily="'Noto Serif CJK SC', serif">
            {x} ⇄ {y}
          </text>
        ))}
      </g>
    </svg>
  );
};
