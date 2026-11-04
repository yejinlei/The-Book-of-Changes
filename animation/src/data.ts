// 易经符号与关系数据 —— 动画的数据底座
// 爻用数组表示，从初爻（下）到上爻（上）：1 = 阳(—)，0 = 阴(- -)

// ============ 八卦 ============
// 三爻，自下而上
export interface Gua8 {
  key: string;
  name: string; // 卦名
  symbol: string; // Unicode
  lines: number[]; // 三爻，初→上
  nature: string; // 自然象
  virtue: string; // 卦德
  xiantian: string; // 先天方位
  dir: number; // 方位角度（度，正南=0，顺时针）
}

export const BAGUA: Gua8[] = [
  { key: "qian", name: "乾", symbol: "☰", lines: [1, 1, 1], nature: "天", virtue: "健", xiantian: "南", dir: 0 },
  { key: "dui", name: "兑", symbol: "☱", lines: [1, 1, 0], nature: "泽", virtue: "说", xiantian: "东南", dir: 45 },
  { key: "li", name: "离", symbol: "☲", lines: [1, 0, 1], nature: "火", virtue: "丽", xiantian: "东", dir: 90 },
  { key: "zhen", name: "震", symbol: "☳", lines: [1, 0, 0], nature: "雷", virtue: "动", xiantian: "东北", dir: 135 },
  { key: "xun", name: "巽", symbol: "☴", lines: [0, 1, 1], nature: "风", virtue: "入", xiantian: "西南", dir: 225 },
  { key: "kan", name: "坎", symbol: "☵", lines: [0, 1, 0], nature: "水", virtue: "陷", xiantian: "西", dir: 270 },
  { key: "gen", name: "艮", symbol: "☶", lines: [0, 0, 1], nature: "山", virtue: "止", xiantian: "西北", dir: 315 },
  { key: "kun", name: "坤", symbol: "☷", lines: [0, 0, 0], nature: "地", virtue: "顺", xiantian: "北", dir: 180 },
];

// 读音口诀（八卦取象歌）
export const BAGUA_KOUJUE = [
  "乾三连", "坤六断", "震仰盂", "艮覆碗",
  "离中虚", "坎中满", "兑上缺", "巽下断",
];

// ============ 四象 ============
// 两爻，下→上
export interface SiXiang {
  name: string;
  lines: number[];
  symbol: string;
  season: string;
  dir: string;
}

export const SIXIANG: SiXiang[] = [
  { name: "太阳", lines: [1, 1], symbol: "⚌", season: "夏", dir: "南" },
  { name: "少阴", lines: [1, 0], symbol: "⚍", season: "秋", dir: "西" },
  { name: "少阳", lines: [0, 1], symbol: "⚎", season: "春", dir: "东" },
  { name: "太阴", lines: [0, 0], symbol: "⚏", season: "冬", dir: "北" },
];

// ============ 六十四卦 ============
// 每卦：序号(通行本)、卦名、上卦、下卦、六爻（初→上）
// lines 直接用上卦三爻 + 下卦三爻 拼成（下卦在初二三，上卦在四五六）
function makeLines(shang: number[], xia: number[]): number[] {
  return [...xia, ...shang]; // 初二三=下卦，四五六=上卦
}

export interface Gua64 {
  seq: number;
  name: string;
  unicode: string;
  shang: string; // 上卦 key
  xia: string; // 下卦 key
  lines: number[]; // 六爻 初→上
}

const GUI: Array<[string, string, string]> = [
  // [卦名, 上卦key, 下卦key]
  ["乾", "qian", "qian"], ["坤", "kun", "kun"], ["屯", "kan", "zhen"], ["蒙", "gen", "kan"],
  ["需", "kan", "qian"], ["讼", "qian", "kan"], ["师", "kun", "kan"], ["比", "kan", "kun"],
  ["小畜", "xun", "qian"], ["履", "qian", "dui"], ["泰", "kun", "qian"], ["否", "qian", "kun"],
  ["同人", "qian", "li"], ["大有", "li", "qian"], ["谦", "kun", "gen"], ["豫", "zhen", "kun"],
  ["随", "dui", "zhen"], ["蛊", "gen", "xun"], ["临", "kun", "dui"], ["观", "xun", "kun"],
  ["噬嗑", "li", "zhen"], ["贲", "gen", "li"], ["剥", "gen", "kun"], ["复", "kun", "zhen"],
  ["无妄", "qian", "zhen"], ["大畜", "gen", "qian"], ["颐", "gen", "zhen"], ["大过", "dui", "xun"],
  ["坎", "kan", "kan"], ["离", "li", "li"], ["咸", "dui", "gen"], ["恒", "zhen", "xun"],
  ["遁", "qian", "gen"], ["大壮", "zhen", "qian"], ["晋", "li", "kun"], ["明夷", "kun", "li"],
  ["家人", "xun", "li"], ["睽", "li", "dui"], ["蹇", "kan", "gen"], ["解", "zhen", "kan"],
  ["损", "gen", "dui"], ["益", "xun", "zhen"], ["夬", "dui", "qian"], ["姤", "qian", "xun"],
  ["萃", "dui", "kun"], ["升", "kun", "xun"], ["困", "dui", "kan"], ["井", "kan", "xun"],
  ["革", "dui", "li"], ["鼎", "li", "xun"], ["震", "zhen", "zhen"], ["艮", "gen", "gen"],
  ["渐", "xun", "gen"], ["归妹", "zhen", "dui"], ["丰", "zhen", "li"], ["旅", "li", "gen"],
  ["巽", "xun", "xun"], ["兑", "dui", "dui"], ["涣", "xun", "kan"], ["节", "kan", "dui"],
  ["中孚", "xun", "dui"], ["小过", "zhen", "gen"], ["既济", "kan", "li"], ["未济", "li", "kan"],
];

const baguaMap: Record<string, Gua8> = {};
for (const g of BAGUA) baguaMap[g.key] = g;

export const LIUSHISI: Gua64[] = GUI.map(([name, shang, xia], i) => ({
  seq: i + 1,
  name,
  unicode: "",
  shang,
  xia,
  lines: makeLines(baguaMap[shang].lines, baguaMap[xia].lines),
}));

// 按名字查卦
export const guaByName: Record<string, Gua64> = {};
for (const g of LIUSHISI) guaByName[g.name] = g;

// ============ 卦变关系 ============

/** 错卦：每一爻阴阳对翻 */
export function cuo(lines: number[]): number[] {
  return lines.map((l) => (l ? 0 : 1));
}

/** 综卦：整个卦上下倒置（初爻与上爻互换） */
export function zong(lines: number[]): number[] {
  return [...lines].reverse();
}

/** 互卦：二三四爻作下卦，三四五爻作上卦 */
export function hu(lines: number[]): number[] {
  const xia = lines.slice(1, 4); // 二三四
  const shang = lines.slice(2, 5); // 三四五
  return [...xia, ...shang];
}

/** 之卦（变卦）：指定爻位（0-based 数组）由阳变阴、阴变阳 */
export function bian(lines: number[], positions: number[]): number[] {
  const out = [...lines];
  for (const p of positions) out[p] = out[p] ? 0 : 1;
  return out;
}

/** 根据六爻找卦名（可能多卦同名结构，返回第一个匹配） */
export function guaByLines(lines: number[]): Gua64 | undefined {
  return LIUSHISI.find((g) => g.lines.join("") === lines.join(""));
}

// ============ 十二消息卦 ============
// 名称、六爻（初→上）、地支、农历月
export interface XiaoxiGua {
  name: string;
  lines: number[];
  zhi: string; // 地支
  month: string; // 月份
  desc: string;
}

export const XIAOXI: XiaoxiGua[] = [
  { name: "复", lines: [1, 0, 0, 0, 0, 0], zhi: "子", month: "十一月（冬至）", desc: "一阳来复" },
  { name: "临", lines: [1, 1, 0, 0, 0, 0], zhi: "丑", month: "十二月", desc: "二阳生长" },
  { name: "泰", lines: [1, 1, 1, 0, 0, 0], zhi: "寅", month: "正月", desc: "三阳开泰" },
  { name: "大壮", lines: [1, 1, 1, 1, 0, 0], zhi: "卯", month: "二月", desc: "四阳壮盛" },
  { name: "夬", lines: [1, 1, 1, 1, 1, 0], zhi: "辰", month: "三月", desc: "五阳决阴" },
  { name: "乾", lines: [1, 1, 1, 1, 1, 1], zhi: "巳", month: "四月", desc: "六阳纯阳" },
  { name: "姤", lines: [0, 1, 1, 1, 1, 1], zhi: "午", month: "五月（夏至）", desc: "一阴始生" },
  { name: "遁", lines: [0, 0, 1, 1, 1, 1], zhi: "未", month: "六月", desc: "二阴渐长" },
  { name: "否", lines: [0, 0, 0, 1, 1, 1], zhi: "申", month: "七月", desc: "三阴塞塞" },
  { name: "观", lines: [0, 0, 0, 0, 1, 1], zhi: "酉", month: "八月", desc: "四阴观示" },
  { name: "剥", lines: [0, 0, 0, 0, 0, 1], zhi: "戌", month: "九月", desc: "五阴剥阳" },
  { name: "坤", lines: [0, 0, 0, 0, 0, 0], zhi: "亥", month: "十月", desc: "六阴纯阴" },
];

// ============ 大衍筮法 ============
export const DAYAN = {
  total: 50, // 大衍之数五十
  use: 49, // 其用四十有九
  steps: ["取一不用（象太极）", "分而为二（象两仪）", "挂一（象三才）", "揲之以四（象四时）", "归奇于扐（象闰）"],
  biansPerYao: 3, // 三变而成一爻
  yaosPerGua: 6, // 六爻成卦
  totalBians: 18, // 十有八变
  numbers: { 老阳: 9, 老阴: 6, 少阳: 7, 少阴: 8 },
};

// ============ 三套卦序 ============
export const GUA_ORDER = {
  tongxing: LIUSHISI.map((g) => g.name), // 通行本（序卦传）
  xiantian: [
    "乾", "夬", "大有", "大壮", "小畜", "需", "大畜", "泰",
    "履", "兑", "睽", "归妹", "中孚", "节", "损", "临",
    "同人", "革", "离", "丰", "家人", "既济", "贲", "明夷",
    "无妄", "随", "噬嗑", "震", "益", "屯", "颐", "复",
    "姤", "大过", "鼎", "恒", "巽", "井", "蛊", "升",
    "讼", "困", "未济", "解", "涣", "坎", "蒙", "师",
    "遁", "咸", "旅", "小过", "渐", "蹇", "艮", "谦",
    "否", "萃", "晋", "豫", "观", "比", "剥", "坤",
  ],
  // 京房八宫卦序（八宫，每宫八卦：本宫、一世…五世、游魂、归魂）简化示意
  jingfang: [
    "乾", "姤", "遁", "否", "观", "剥", "晋", "大有",
    "坤", "复", "临", "泰", "大壮", "夬", "需", "比",
  ],
  boshu: [
    "乾", "否", "遁", "履", "讼", "同人", "无妄", "姤",
    "坤", "泰", "谦", "临", "师", "明夷", "复", "升",
  ],
};

// ============ 卦象关系网（供交互用） ============
export interface GuaRelation {
  name: string;
  cuo: string; // 错卦名
  zong: string; // 综卦名
  hu: string; // 互卦名
}

export function relationOf(name: string): GuaRelation | null {
  const g = guaByName[name];
  if (!g) return null;
  const cuoG = guaByLines(cuo(g.lines));
  const zongG = guaByLines(zong(g.lines));
  const huG = guaByLines(hu(g.lines));
  return {
    name,
    cuo: cuoG ? cuoG.name : "—",
    zong: zongG ? zongG.name : "—",
    hu: huG ? huG.name : "—",
  };
}

// 配色
export const COLORS = {
  paper: "#f4ecd8", // 宣纸米黄
  paperDark: "#e8dcc0",
  zhu: "#8b0000", // 朱红
  zhuLight: "#c0392b",
  jin: "#b8860b", // 鎏金
  jinLight: "#d4a017",
  ink: "#1a1a1a", // 墨
  inkSoft: "#3d3d3d",
  qing: "#1e3a8a", // 玄青
  bg: "#0b0b10", // 虚空黑
};
