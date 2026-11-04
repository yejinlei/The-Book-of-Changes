/* ============================================================
 * 《易·化》SVG 卦爻动画控制器
 * ------------------------------------------------------------
 * 单一 rAF 时间轴，驱动一块 <svg> 上的卦爻逐帧变化。
 * 复用 window.GuaAnim 的爻绘制/翻转能力，但为剧本所需，
 * 本文件自行管理 SVG 元素的「帧状态」（避免 DOM 频繁重建）。
 *
 * API:
 *   const stage = ChangeSVG.create(el, storyboard, ONT)
 *   stage.render(t)      // 按秒 t 渲染一帧
 *   stage.hitTest()      // 返回当前可点击的卦/爻（调试用）
 * ============================================================ */
(function () {
  'use strict';

  const C = {
    bg: '#f4ecd8', ink: '#2a1f14', verm: '#8b0000', gold: '#b8860b',
    gray: '#9a8f7a', yin: '#3a2c1c'
  };
  const NS = 'http://www.w3.org/2000/svg';
  const W = 960, H = 520;

  // 八经卦三爻（自下而上，1=阳）
  const BAGUA_BITS = {
    乾: [1, 1, 1], 兑: [1, 1, 0], 离: [1, 0, 1], 震: [1, 0, 0],
    巽: [0, 1, 1], 坎: [0, 1, 0], 艮: [0, 0, 1], 坤: [0, 0, 0]
  };
  const BAGUA_ORDER = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
  const BAGUA_NATURE = { 乾: '天', 兑: '泽', 离: '火', 震: '雷', 巽: '风', 坎: '水', 艮: '山', 坤: '地' };
  const SIXIANG = [
    { name: '太阳', bits: [1, 1] }, { name: '少阴', bits: [1, 0] },
    { name: '少阳', bits: [0, 1] }, { name: '太阴', bits: [0, 0] }
  ];

  function el(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function txt(x, y, s, o) {
    o = o || {};
    const t = el('text', {
      x, y, 'text-anchor': o.anchor || 'middle', 'dominant-baseline': o.base || 'middle',
      'font-family': "'Songti SC','STSong','SimSun',serif",
      'font-size': o.size || 16, fill: o.fill || C.ink,
      'letter-spacing': o.ls || 0, opacity: o.opacity == null ? 1 : o.opacity
    });
    t.textContent = s;
    if (o.weight) t.setAttribute('font-weight', o.weight);
    return t;
  }
  // 画一根爻（分阴阳）。y 为爻中心线，len 爻长，th 厚度
  function yaoEl(x, y, len, th, yang, o) {
    o = o || {};
    const g = el('g');
    const fill = o.fill || (yang ? C.ink : C.yin);
    const rx = th / 2.6;
    if (yang) {
      const r = el('rect', { x: x - len / 2, y: y - th / 2, width: len, height: th, rx, fill });
      if (o.opacity != null) r.setAttribute('opacity', o.opacity);
      g.appendChild(r);
      g._bars = [r];
    } else {
      const gap = len * 0.22, segW = (len - gap) / 2;
      const l = el('rect', { x: x - len / 2, y: y - th / 2, width: segW, height: th, rx, fill });
      const r = el('rect', { x: x + gap / 2, y: y - th / 2, width: segW, height: th, rx, fill });
      if (o.opacity != null) { l.setAttribute('opacity', o.opacity); r.setAttribute('opacity', o.opacity); }
      g.appendChild(l); g.appendChild(r);
      g._bars = [l, r];
    }
    return g;
  }
  // 画一卦（6 爻，自下而上 arr[0]=初爻）。返回 g，附 ._yaos
  function guaEl(cx, cy, arr6, o) {
    o = o || {};
    const th = o.th || 7, gap = o.gap || 11, len = o.len || 64;
    const g = el('g');
    const totalH = 6 * th + 5 * gap;
    const top = cy - totalH / 2;
    const list = [];
    for (let i = 0; i < 6; i++) {
      const y = top + (5 - i) * (th + gap) + th / 2;
      const yg = yaoEl(cx, y, len, th, arr6[i] === 1, { fill: o.fill, opacity: o.opacity });
      g.appendChild(yg); list.push(yg);
    }
    g._yaos = list; g._arr = arr6.slice();
    g._cx = cx; g._cy = cy; g._o = o;
    return g;
  }
  function setGua(g, arr6, o) {
    o = o || {};
    const th = o.th || g._o.th || 7, gap = o.gap || g._o.gap || 11, len = o.len || g._o.len || 64;
    const cy = g._cy, top = cy - (6 * th + 5 * gap) / 2;
    g._yaos.forEach((yg, i) => {
      const yang = arr6[i] === 1;
      const y = top + (5 - i) * (th + gap) + th / 2;
      const newG = yaoEl(g._cx, y, len, th, yang, { fill: o.fill || g._o.fill, opacity: o.opacity });
      g.replaceChild(newG, yg);
      g._yaos[i] = newG;
    });
    g._arr = arr6.slice();
  }

  function create(elRoot, sb, ONT) {
    const svg = el('svg', {
      viewBox: `0 0 ${W} ${H}`, width: '100%', height: '100%',
      xmlns: NS, preserveAspectRatio: 'xMidYMid meet',
      style: 'display:block;background:transparent;'
    });
    elRoot.innerHTML = '';
    elRoot.appendChild(svg);

    // 图层
    const gAura = el('g');        // 气晕/背景
    const gStage = el('g');       // 主舞台（卦爻）
    const gSub = el('g');         // 字幕/标注
    svg.appendChild(gAura); svg.appendChild(gStage); svg.appendChild(gSub);

    // 气晕（宣纸光）
    const aura = el('circle', { cx: W / 2, cy: H / 2, r: 4, fill: C.verm, opacity: 0 });
    gAura.appendChild(aura);
    const auraRing = el('circle', { cx: W / 2, cy: H / 2, r: 10, fill: 'none', stroke: C.gold, 'stroke-width': 1, opacity: 0 });
    gAura.appendChild(auraRing);

    // 64 卦星阵（懒建）
    let starGroup = null, starGuas = null;
    function buildStars() {
      if (starGroup) return;
      starGroup = el('g'); gAura.appendChild(starGroup);
      starGuas = [];
      const cols = 8, rows = 8, pad = 24;
      const cw = (W - pad * 2) / cols, ch = (H - pad * 2) / rows;
      sb.gua64.forEach((gd, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const x = pad + cw * (c + 0.5), y = pad + ch * (r + 0.5);
        const arr6 = (gd.yao || []).map(y => y.yinYang === '阳' ? 1 : 0);
        while (arr6.length < 6) arr6.unshift(0);
        const g = guaEl(x, y, arr6, { th: 3.2, gap: 4.2, len: Math.min(cw * .62, 64), opacity: 0 });
        g._id = gd.id; g._name = gd.name;
        starGroup.appendChild(g); starGuas.push(g);
      });
      gAura.insertBefore(starGroup, aura);
    }

    // 各幕的临时元素容器
    let dyn = el('g'); gStage.appendChild(dyn);
    function clearDyn() { gStage.removeChild(dyn); dyn = el('g'); gStage.appendChild(dyn); }

    // ---------- 分幕绘制 ----------
    const frameCache = { lastScene: null };

    function drawWuji(p, t) {
      const a = Math.sin(p * Math.PI);            // 0→1→0
      aura.setAttribute('opacity', a * 0.9);
      aura.setAttribute('r', 3 + a * 3);
      auraRing.setAttribute('r', 10 + p * 90);
      auraRing.setAttribute('opacity', (1 - p) * 0.5);
    }

    function drawDaosheng(p, t) {
      // 0-0.2 道→一（竖线→点）; 0.2-0.5 一→二; 0.5-0.8 二→三; 0.8-1 三才定格+字
      aura.setAttribute('opacity', 0.5);
      const cx = W / 2, cy = H / 2;
      if (p < 0.22) {
        const q = p / 0.22;
        const hh = 120 * (1 - q) + 6 * q;
        dyn.appendChild(el('rect', { x: cx - 2, y: cy - hh / 2, width: 4, height: hh, rx: 2, fill: C.verm, opacity: 0.2 + q * 0.8 }));
      } else if (p < 0.5) {
        const q = (p - 0.22) / 0.28;
        dyn.appendChild(el('circle', { cx: cx, cy, r: 6, fill: C.verm, opacity: 0.9 }));
        const dx = q * 150;
        dyn.appendChild(el('circle', { cx: cx - dx, cy, r: 6, fill: C.verm, opacity: 0.9 }));
        dyn.appendChild(el('circle', { cx: cx + dx, cy, r: 6, fill: C.ink, opacity: 0.9 }));
      } else {
        const q = Math.min(1, (p - 0.5) / 0.3);
        dyn.appendChild(el('circle', { cx: cx - 150, cy, r: 7, fill: C.verm }));
        dyn.appendChild(el('circle', { cx: cx + 150, cy, r: 7, fill: C.ink }));
        const lift = q * 70;
        dyn.appendChild(el('circle', { cx, cy: cy - lift, r: 7, fill: C.gold, opacity: q }));
        if (q > 0.4) {
          const op = (q - 0.4) / 0.6;
          dyn.appendChild(txt(cx - 150, cy + 46, '天 · 阳', { size: 15, fill: C.verm, opacity: op }));
          dyn.appendChild(txt(cx, cy - lift - 30, '人 · 中', { size: 15, fill: C.gold, opacity: op }));
          dyn.appendChild(txt(cx + 150, cy + 46, '地 · 阴', { size: 15, fill: C.ink, opacity: op }));
        }
      }
    }

    function drawTaiji(p, t) {
      const cx = W / 2, cy = H / 2, R = 84;
      aura.setAttribute('opacity', 0.35);
      // 双鱼：用两段路径近似阴阳（简化：两个半圆 + 两个小圆）
      const rot = p * 360;
      const gTai = el('g', { transform: `translate(${cx} ${cy}) rotate(${rot})` });
      // 阳鱼（左白右黑的传统图，这里以朱红/墨两色）
      const half1 = el('path', {
        d: `M0 ${-R} A ${R} ${R} 0 0 1 0 ${R} A ${R / 2} ${R / 2} 0 0 0 0 ${-R / 2} A ${R / 2} ${R / 2} 0 0 1 0 ${-R}`,
        fill: C.verm, opacity: 0.55
      });
      const half2 = el('path', {
        d: `M0 ${-R} A ${R} ${R} 0 0 0 0 ${R} A ${R / 2} ${R / 2} 0 0 1 0 ${-R / 2} A ${R / 2} ${R / 2} 0 0 0 0 ${-R}`,
        fill: C.ink, opacity: 0.75
      });
      gTai.appendChild(half1); gTai.appendChild(half2);
      gTai.appendChild(el('circle', { cx: 0, cy: -R / 2, r: R / 8, fill: C.ink, opacity: .9 }));
      gTai.appendChild(el('circle', { cx: 0, cy: R / 2, r: R / 8, fill: C.verm, opacity: .9 }));
      dyn.appendChild(gTai);
      // 两仪爻：阳爻上浮、阴爻下沉
      const q = Math.max(0, (p - 0.5) / 0.5);
      dyn.appendChild(yaoEl(cx - 130, cy - 40 - q * 20, 90, 10, true, { fill: C.verm, opacity: q }));
      dyn.appendChild(yaoEl(cx + 130, cy + 40 + q * 20, 90, 10, false, { fill: C.ink, opacity: q }));
      if (q > 0.5) {
        const op = (q - 0.5) / 0.5;
        dyn.appendChild(txt(cx - 130, cy - 82, '阳仪', { size: 15, fill: C.verm, opacity: op }));
        dyn.appendChild(txt(cx + 130, cy + 82, '阴仪', { size: 15, fill: C.ink, opacity: op }));
      }
    }

    function drawSixiang(p, t) {
      aura.setAttribute('opacity', 0.25);
      const cx = W / 2, cy = H / 2;
      const pos = [[-150, -60], [-50, -60], [50, -60], [150, -60]];
      // 更好：四象排一行
      pos.length = 0;
      const startX = cx - 240, step = 160;
      SIXIANG.forEach((sx, i) => { pos.push([startX + step * i, cy]); });
      const appear = Math.min(1, p * 1.6);
      SIXIANG.forEach((sx, i) => {
        const show = Math.max(0, Math.min(1, (p * 4 - i) * 1.2));
        if (show <= 0) return;
        const [x, y] = pos[i];
        dyn.appendChild(yaoEl(x, y - 14, 70, 8, sx.bits[1] === 1, { fill: C.ink, opacity: show }));
        dyn.appendChild(yaoEl(x, y + 14, 70, 8, sx.bits[0] === 1, { fill: C.ink, opacity: show }));
        if (show > 0.5) dyn.appendChild(txt(x, y + 58, sx.name, { size: 15, fill: C.verm, opacity: (show - 0.5) * 2 }));
      });
    }

    function drawBagua(p, t) {
      aura.setAttribute('opacity', 0.2);
      const cx = W / 2, cy = H / 2, R = 150;
      // 中心太极符
      dyn.appendChild(txt(cx, cy, '☯', { size: 46, fill: C.verm, opacity: 0.5 }));
      BAGUA_ORDER.forEach((name, i) => {
        const show = Math.max(0, Math.min(1, (p * 4.5 - i) * 1.3));
        if (show <= 0) return;
        const deg = sb.xiandian[name] - 90;           // 转成 svg 坐标（0°在正右，逆时针）
        const rad = deg * Math.PI / 180;
        const x = cx + R * Math.cos(rad), y = cy + R * Math.sin(rad);
        const bits = BAGUA_BITS[name];
        const grp = el('g', { opacity: show, transform: `translate(${x} ${y}) scale(${0.5 + show * 0.5})` });
        grp.appendChild(yaoEl(0, -14, 56, 6, bits[2] === 1));
        grp.appendChild(yaoEl(0, 0, 56, 6, bits[1] === 1));
        grp.appendChild(yaoEl(0, 14, 56, 6, bits[0] === 1));
        grp.appendChild(txt(0, 40, name, { size: 16, fill: C.verm, weight: 700 }));
        grp.appendChild(txt(0, 56, BAGUA_NATURE[name], { size: 11, fill: C.gold }));
        dyn.appendChild(grp);
      });
    }

    function drawLiushisi(p, t) {
      buildStars();
      aura.setAttribute('opacity', 0.12);
      // 先聚焦合成（0-0.5）：中央演示两卦相重；随后铺开星阵（0.4-1）
      starGuas.forEach((g, i) => {
        const show = Math.max(0, Math.min(1, (p - 0.35) * 2 - (i % 8) * 0.04 - Math.floor(i / 8) * 0.05));
        g.setAttribute('opacity', show * 0.9);
        const sc = 0.6 + show * 0.4;
        g.setAttribute('transform', `translate(${g._cx} ${g._cy}) scale(${sc}) translate(${-g._cx} ${-g._cy})`);
      });
      if (p < 0.5) {
        const q = p / 0.5;
        const cx = W / 2, cy = H / 2;
        const up = BAGUA_BITS['乾'], dn = BAGUA_BITS['坤'];
        // 上卦下移、下卦上移合成
        const off = (1 - q) * 70;
        const gg = el('g', { transform: `translate(0 ${-off})` });
        [0, 1, 2].forEach(k => gg.appendChild(yaoEl(cx, cy - 78 + (2 - k) * 18, 64, 7, up[k] === 1, { fill: C.verm })));
        dyn.appendChild(gg);
        const gg2 = el('g', { transform: `translate(0 ${off})` });
        [0, 1, 2].forEach(k => gg2.appendChild(yaoEl(cx, cy + 6 + (2 - k) * 18, 64, 7, dn[k] === 1, { fill: C.ink })));
        dyn.appendChild(gg2);
        if (q > 0.8) dyn.appendChild(txt(cx, cy + 100, '乾上坤下 · 否', { size: 16, fill: C.verm, weight: 700 }));
      } else {
        dyn.appendChild(txt(W / 2, H - 24, '八卦相重 · 六十四卦', { size: 17, fill: C.verm, weight: 700, opacity: Math.min(1, (p - .5) * 4) }));
      }
    }

    function drawCuo(p, t) {
      buildStars();
      aura.setAttribute('opacity', 0.1);
      // 全场 64 卦同时阴阳翻转：翻转进度取 p 的三角波
      const flip = p < 0.5 ? p * 2 : 1;             // 0→1 后保持
      starGuas.forEach((g, i) => {
        g.setAttribute('opacity', 0.9);
        g.setAttribute('transform', '');
        // 逐爻翻转（错卦 = 全爻取反）
        const target = g._arr.map(b => b === 1 ? 0 : 1);
        const mix = g._arr.map((b, k) => {
          const settle = Math.max(0, Math.min(1, flip * 1.4 - k * 0.06));
          return settle > 0.5 ? target[k] : b;
        });
        setGua(g, mix, { th: 3.2, gap: 4.2, len: Math.min(((W - 48) / 8) * .62, 64) });
      });
      // 特写：中央 乾→坤 大字演示
      const cx = W / 2, cy = H / 2;
      const q = Math.min(1, p * 1.5);
      const arr = [1, 1, 1, 1, 1, 1].map((b, k) => (q * 1.3 - k * 0.05 > 0.5 ? 0 : 1));
      const big = el('g', { transform: `translate(0 0)` });
      const bg = el('rect', { x: cx - 70, y: cy - 92, width: 140, height: 184, fill: C.bg, opacity: 0.82, rx: 8 });
      big.appendChild(bg);
      const gb = guaEl(cx, cy, arr, { th: 12, gap: 16, len: 84, fill: C.verm });
      big.appendChild(gb);
      dyn.appendChild(big);
      dyn.appendChild(txt(cx, cy + 118, q > 0.9 ? '乾 ⇌ 坤（错卦）' : '阴阳相交对', { size: 17, fill: C.verm, weight: 700 }));
    }

    function drawZong(p, t) {
      buildStars();
      aura.setAttribute('opacity', 0.1);
      starGuas.forEach((g, i) => {
        g.setAttribute('opacity', 0.85);
        // 整体绕自身水平轴翻转
        const q = g === starGuas[0] ? 0 : 1; // 星阵保持不动，只做中央特写
        g.setAttribute('transform', '');
      });
      // 中央特写：一卦 scaleY(-1) 倒转
      const cx = W / 2, cy = H / 2;
      const q = sb.Ease.inOut(Math.min(1, p * 1.8));
      const scaleY = 1 - 2 * q;
      const big = el('g', { transform: `translate(${cx} ${cy}) scale(1 ${scaleY}) translate(${-cx} ${-cy})` });
      const bg = el('rect', { x: cx - 70, y: cy - 92, width: 140, height: 184, fill: C.bg, opacity: 0.82, rx: 8 });
      big.appendChild(bg);
      // 用「泰」的卦象演示：乾下坤上
      const arrTai = [1, 1, 1, 0, 0, 0];
      big.appendChild(guaEl(cx, cy, arrTai, { th: 12, gap: 16, len: 84, fill: C.ink }));
      dyn.appendChild(big);
      const label = scaleY > 0 ? '泰 ䷊' : '否 ䷋';
      dyn.appendChild(txt(cx, cy + 118, `${label}（综卦·上下颠倒）`, { size: 17, fill: C.verm, weight: 700 }));
    }

    function drawHu(p, t) {
      buildStars();
      aura.setAttribute('opacity', 0.08);
      starGuas.forEach(g => { g.setAttribute('opacity', 0.55); g.setAttribute('transform', ''); });
      const cx = W / 2, cy = H / 2;
      // 中央一卦（咸 g31）与邻域连线
      const center = sb.gua64.find(g => g.name === '咸') || sb.gua64[30];
      const cArr = (center.yao || []).map(y => y.yinYang === '阳' ? 1 : 0);
      // 找错/综/互 三卦的星阵坐标
      function coordOf(id) {
        const idx = sb.gua64.findIndex(g => g.id === id);
        if (idx < 0) return null;
        const cols = 8, pad = 24;
        const cw = (W - pad * 2) / 8, ch = (H - pad * 2) / 8;
        return { x: pad + cw * ((idx % cols) + 0.5), y: pad + ch * (Math.floor(idx / cols) + 0.5) };
      }
      const links = [
        { id: sb.rel.cuo[center.id], color: C.verm, name: '错' },
        { id: sb.rel.zong[center.id], color: C.gold, name: '综' },
        { id: sb.rel.hu[center.id], color: '#1e3a8a', name: '互' }
      ];
      const q = sb.Ease.out(Math.min(1, p * 1.4));
      links.forEach((lk, i) => {
        const c = lk.id ? coordOf(lk.id) : null;
        if (!c) return;
        const op = Math.max(0, Math.min(1, q * 1.6 - i * 0.2));
        const line = el('line', { x1: cx, y1: cy, x2: cx + (c.x - cx) * op, y2: cy + (c.y - cy) * op, stroke: lk.color, 'stroke-width': 1.6, opacity: op * 0.8, 'stroke-dasharray': '5 4' });
        dyn.appendChild(line);
      });
      // 中央咸卦特写
      const bg = el('rect', { x: cx - 60, y: cy - 90, width: 120, height: 180, fill: C.bg, opacity: 0.85, rx: 8 });
      dyn.appendChild(bg);
      dyn.appendChild(guaEl(cx, cy, cArr, { th: 11, gap: 15, len: 74, fill: C.verm }));
      if (p > 0.55) {
        const op = (p - 0.55) / 0.45;
        dyn.appendChild(txt(cx, cy + 112, '咸', { size: 26, fill: C.verm, weight: 900, opacity: op }));
        dyn.appendChild(txt(cx, cy + 140, '错 · 综 · 互', { size: 13, fill: C.gold, opacity: op }));
      }
    }

    const DRAW = {
      wuji: drawWuji, daosheng: drawDaosheng, liangyi: drawTaiji,
      sixiang: drawSixiang, bagua: drawBagua, liushisi: drawLiushisi,
      cuo: drawCuo, zong: drawZong, hu: drawHu
    };

    function render(t) {
      const sc = sb.sceneAt(t);
      const p = sb.prog(t, sc);
      // 场景切换时清空动态层
      if (frameCache.lastScene !== sc.key) {
        clearDyn();
        frameCache.lastScene = sc.key;
      }
      clearDyn();
      // 背景星阵仅在 64 卦及其后显示
      const showStars = ['liushisi', 'cuo', 'zong', 'hu'].includes(sc.key);
      if (starGroup) starGroup.setAttribute('opacity', showStars ? 1 : 0);
      const fn = DRAW[sc.key];
      if (fn) fn(p, t);
      // 字幕
      const subG = el('g');
      subG.appendChild(txt(W / 2, H - 8, sc.sub, { size: 14, fill: C.gold, ls: 2 }));
      dyn.appendChild(subG);
    }

    return { el: svg, render, sceneAt: sb.sceneAt };
  }

  window.ChangeSVG = { create, W, H, BAGUA_BITS, BAGUA_ORDER, BAGUA_NATURE };
})();
