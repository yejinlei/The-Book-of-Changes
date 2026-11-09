/*!
 * 易经卦变演算引擎 v1.0 —— 纯计算模块（零依赖）
 * ------------------------------------------------------------------
 * 能力：
 *   错卦（六爻全变） / 综卦（上下颠倒） / 互卦（二至四爻、三至五爻重组） / 交卦（上下卦互换）
 *   变卦（指定爻动） / 六爻变卦表
 *   十二消息卦识别 + 卦气（月建、节气）
 *   卦变来源：依虞翻「一阴一阳自复姤、二阴二阳自临遁、三阴三阳自泰否」卦变说形式化
 * ------------------------------------------------------------------
 * 依赖：window.YJ_GUA_FULL（64 卦本体，用于卦名索引）
 *   未加载时，六爻级运算（错/综/互/交）仍可用，仅名称解析不可用
 * ------------------------------------------------------------------
 * 约定：六爻数组自下而上，[0]=初爻 … [5]=上爻；1=阳(—) 0=阴(--)
 * 暴露：window.YJ_BIAN
 */
(function (root) {
  'use strict';

  /* ---- 八经卦三爻（自下而上），1=阳 0=阴 ---- */
  var TRI = {
    '乾': [1, 1, 1], '兑': [1, 1, 0], '离': [1, 0, 1], '震': [1, 0, 0],
    '巽': [0, 1, 1], '坎': [0, 1, 0], '艮': [0, 0, 1], '坤': [0, 0, 0]
  };
  var BIN2TRI = {};
  Object.keys(TRI).forEach(function (k) { BIN2TRI[TRI[k].join('')] = k; });

  var POS = ['初', '二', '三', '四', '五', '上'];
  var TRI_SYMBOL = { '乾': '☰', '兑': '☱', '离': '☲', '震': '☳', '巽': '☴', '坎': '☵', '艮': '☶', '坤': '☷' };

  /* ---- 索引 ---- */
  var _n2l = {}, _l2n = {}, _meta = {}, _ready = false;
  function ensure() {
    if (_ready) return;
    _ready = true;
    var raw = root.YJ_GUA_FULL;
    if (!raw) return;
    var arr = Array.isArray(raw) ? raw : Object.keys(raw).map(function (k) { return raw[k]; });
    for (var i = 0; i < arr.length; i++) {
      var g = arr[i];
      if (!g || !g.name || !TRI[g.xia] || !TRI[g.shang]) continue;
      var lines = TRI[g.xia].concat(TRI[g.shang]);   // 下卦为初二三，上卦为四五六
      _n2l[g.name] = lines;
      _l2n[lines.join('')] = g.name;
      _meta[g.name] = { num: g.num, shang: g.shang, xia: g.xia, wuxing: g.wuxing, jing: g.jing };
    }
  }

  function linesOf(name) { ensure(); return _n2l[name] ? _n2l[name].slice() : null; }
  function nameOfLines(lines) { ensure(); return _l2n[lines.join('')] || null; }
  function metaOf(name) { ensure(); return _meta[name] ? JSON.parse(JSON.stringify(_meta[name])) : null; }
  function flip(lines) { return lines.map(function (x) { return x ? 0 : 1; }); }
  function yangCount(lines) { var n = 0; for (var i = 0; i < lines.length; i++) n += lines[i] === 1 ? 1 : 0; return n; }
  function hexSymbol(name) { var m = metaOf(name); return m ? String.fromCodePoint(0x4DC0 + m.num - 1) : ''; }
  function yaoTitles(lines) {
    return lines.map(function (x, i) {
      if (i === 0) return x ? '初九' : '初六';
      if (i === 5) return x ? '上九' : '上六';
      return (x ? '九' : '六') + POS[i];
    });
  }
  function linesBin(lines) { return lines.join(''); }

  /* ---- 十二消息卦（辟卦）：卦气配月建、节气 ---- */
  // 自下而上六爻硬编码，避免依赖 YJ_GUA_FULL
  function mk(t) { return TRI[t[0]].concat(TRI[t[1]]); }
  var MSG_TABLE = [
    { name: '复', xia: '震', shang: '坤', month: '十一月', jieqi: '冬至', kind: '一阳', lines: mk(['震', '坤']) },
    { name: '临', xia: '兑', shang: '坤', month: '十二月', jieqi: '大寒', kind: '二阳', lines: mk(['兑', '坤']) },
    { name: '泰', xia: '乾', shang: '坤', month: '正月', jieqi: '雨水', kind: '三阳', lines: mk(['乾', '坤']) },
    { name: '大壮', xia: '乾', shang: '震', month: '二月', jieqi: '春分', kind: '四阳', lines: mk(['乾', '震']) },
    { name: '夬', xia: '乾', shang: '兑', month: '三月', jieqi: '谷雨', kind: '五阳', lines: mk(['乾', '兑']) },
    { name: '乾', xia: '乾', shang: '乾', month: '四月', jieqi: '小满', kind: '六阳', lines: mk(['乾', '乾']) },
    { name: '姤', xia: '巽', shang: '乾', month: '五月', jieqi: '夏至', kind: '一阴', lines: mk(['巽', '乾']) },
    { name: '遁', xia: '艮', shang: '乾', month: '六月', jieqi: '大暑', kind: '二阴', lines: mk(['艮', '乾']) },
    { name: '否', xia: '坤', shang: '乾', month: '七月', jieqi: '处暑', kind: '三阴', lines: mk(['坤', '乾']) },
    { name: '观', xia: '坤', shang: '巽', month: '八月', jieqi: '秋分', kind: '四阴', lines: mk(['坤', '巽']) },
    { name: '剥', xia: '坤', shang: '艮', month: '九月', jieqi: '霜降', kind: '五阴', lines: mk(['坤', '艮']) },
    { name: '坤', xia: '坤', shang: '坤', month: '十月', jieqi: '小雪', kind: '六阴', lines: mk(['坤', '坤']) }
  ];

  function msgInfo(lines) {
    for (var i = 0; i < MSG_TABLE.length; i++) {
      if (linesBin(MSG_TABLE[i].lines) === linesBin(lines)) {
        return { name: MSG_TABLE[i].name, month: MSG_TABLE[i].month, jieqi: MSG_TABLE[i].jieqi, kind: MSG_TABLE[i].kind };
      }
    }
    return null;
  }

  /* ---- 四象基本变换 ---- */
  function cuoLines(lines) { return flip(lines); }                              // 错卦：六爻全变
  function zongLines(lines) { return lines.slice().reverse(); }                 // 综卦：上下颠倒
  function huLines(lines) {                                                     // 互卦：2-4 为下，3-5 为上
    return [lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]];
  }
  function jiaoLines(lines) {                                                   // 交卦：上下卦互换
    return [lines[3], lines[4], lines[5], lines[0], lines[1], lines[2]];
  }
  function bianLines(lines, positions) {                                        // 变卦：指定爻（1-6）动
    var out = lines.slice();
    (positions || []).forEach(function (p) { var i = p - 1; if (i >= 0 && i < 6) out[i] = out[i] ? 0 : 1; });
    return out;
  }

  /* ---- 卦变来源：虞翻卦变说 ---- */
  // 规则：一阴一阳自复、姤；二阴二阳自临、遁；三阴三阳自泰、否（另一半自观、大壮、剥、夬，双向）
  function sourceMsgCandidates(lines) {
    var n = yangCount(lines);
    switch (n) {
      case 1: return ['复', '剥'];
      case 2: return ['临', '观'];
      case 3: return ['泰', '否'];
      case 4: return ['遁', '大壮'];
      case 5: return ['姤', '夬'];
      default: return []; // 乾坤本体
    }
  }
  function shiftPath(fromName, toLines) {
    var from = null;
    for (var i = 0; i < MSG_TABLE.length; i++) if (MSG_TABLE[i].name === fromName) from = MSG_TABLE[i].lines;
    if (!from) return null;
    var drop = [], rise = [];
    for (var k = 0; k < 6; k++) {
      if (from[k] === 1 && toLines[k] === 0) drop.push(k);
      else if (from[k] === 0 && toLines[k] === 1) rise.push(k);
    }
    if (drop.length !== rise.length || drop.length === 0) return null;
    var segs = drop.map(function (d, j) { return fromName + POS[d] + '之' + POS[rise[j]]; });
    return { from: fromName, drop: drop.map(function (d) { return d + 1; }), rise: rise.map(function (r) { return r + 1; }), text: segs.join('、') };
  }
  function guaBianSource(name) {
    var lines = linesOf(name);
    if (!lines) return null;
    var cands = sourceMsgCandidates(lines);
    var out = [];
    cands.forEach(function (c) { var p = shiftPath(c, lines); if (p) out.push(p); });
    return { name: name, yang: yangCount(lines), candidates: cands, paths: out };
  }

  /* ---- 综合关系网 ---- */
  function relations(name) {
    var lines = linesOf(name);
    if (!lines) return null;
    var cuo = nameOfLines(cuoLines(lines));
    var zong = nameOfLines(zongLines(lines));
    var hu = nameOfLines(huLines(lines));
    var jiao = nameOfLines(jiaoLines(lines));
    var bian = [];
    for (var i = 0; i < 6; i++) {
      var bl = bianLines(lines, [i + 1]);
      bian.push({ move: i + 1, title: yaoTitles(lines)[i], name: nameOfLines(bl), symbol: hexSymbol(nameOfLines(bl)), lines: bl });
    }
    return {
      name: name,
      lines: lines,
      symbol: hexSymbol(name),
      yaoTitles: yaoTitles(lines),
      yang: yangCount(lines),
      message: msgInfo(lines),
      cuo: cuo, zong: zong, hu: hu, jiao: jiao,
      huOfHu: hu ? nameOfLines(huLines(linesOf(hu))) : null,
      cuoOfZong: zong ? nameOfLines(cuoLines(linesOf(zong))) : null,
      bian: bian,
      source: guaBianSource(name)
    };
  }

  function trace(name, depth) {   // 递归互卦链
    depth = depth || 6;
    var chain = [], cur = name, guard = 0;
    while (cur && guard < depth) {
      chain.push(cur);
      var l = linesOf(cur);
      if (!l) break;
      cur = nameOfLines(huLines(l));
      guard++;
      if (chain.indexOf(cur) !== -1) break;
    }
    return chain;
  }

  var API = {
    TRI: TRI, TRI_SYMBOL: TRI_SYMBOL, MSG_TABLE: MSG_TABLE,
    linesOf: linesOf, nameOfLines: nameOfLines, metaOf: metaOf,
    hexSymbol: hexSymbol, yaoTitles: yaoTitles, yangCount: yangCount, linesBin: linesBin,
    cuoLines: cuoLines, zongLines: zongLines, huLines: huLines, jiaoLines: jiaoLines, bianLines: bianLines,
    cuo: function (n) { return nameOfLines(cuoLines(linesOf(n))); },
    zong: function (n) { return nameOfLines(zongLines(linesOf(n))); },
    hu: function (n) { return nameOfLines(huLines(linesOf(n))); },
    jiao: function (n) { return nameOfLines(jiaoLines(linesOf(n))); },
    bian: function (n, pos) { return nameOfLines(bianLines(linesOf(n), pos)); },
    msgInfo: msgInfo, guaBianSource: guaBianSource, relations: relations, trace: trace,
    allGuiBianTable: function () {
      ensure();
      return Object.keys(_n2l).map(function (n) { return relations(n); });
    }
  };

  root.YJ_BIAN = API;
})(typeof window !== 'undefined' ? window : this);
