/**
 * 道生万物 · 易经演化动画
 * 独立 Canvas 模块，0 外部依赖
 * 分镜：虚空 → 道生一(太极) → 一生二(两仪) → 二生四象 → 四象生八卦 → 八卦生六十四卦 → 错综卦变 → 万物归一 · 循环
 * 作者：文心
 */
(function () {
  'use strict';

  /* ============== 基础配置 ============== */
  const W = 1100;          // 画布宽（内部坐标）
  const H = 520;           // 画布高（内部坐标）
  const CX = W / 2;
  const CY = H / 2 + 20;  // 主视觉中心（下方给标题留位）
  const COLOR = {
    paper: '#f4ecd8',     // 宣纸底
    ink: '#2c1810',       // 墨
    zhu: '#8b0000',       // 朱（阳）
    liu: '#b8860b',       // 鎏金（阴）
    jade: '#2d5016',      // 玉
    blue: '#1e3a8a',
    faint: '#c9b896'
  };
  const DPR = window.devicePixelRatio || 1;

  /* ============== 八经卦 & 六十四卦定义 ============== */
  const BAGUA = [
    { name: '乾', yao: [1,1,1], xiang: '天' },
    { name: '兑', yao: [1,1,0], xiang: '泽' },
    { name: '离', yao: [1,0,1], xiang: '火' },
    { name: '震', yao: [1,0,0], xiang: '雷' },
    { name: '巽', yao: [0,1,1], xiang: '风' },
    { name: '坎', yao: [0,1,0], xiang: '水' },
    { name: '艮', yao: [0,0,1], xiang: '山' },
    { name: '坤', yao: [0,0,0], xiang: '地' }
  ];
  // 六十四卦：按先天八卦重卦序（乾兑离震巽坎艮坤 交叉）
  function buildLiushisi() {
    const arr = [];
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      const up = BAGUA[i], down = BAGUA[j];
      const yao = [...down.yao, ...up.yao]; // 下卦 + 上卦 = 六爻（初-上）
      arr.push({ yao, up: up, down: down });
    }
    return arr;
  }
  const ALL64 = buildLiushisi();

  /* ============== 场景时长（秒） ============== */
  const SCENES = [
    { name: 'void',    from: 0,  to: 3   },
    { name: 'one',     from: 3,  to: 7   },  // 道生一·太极
    { name: 'two',     from: 7,  to: 11  },  // 一生二·两仪
    { name: 'four',    from: 11, to: 15  },  // 两仪生四象
    { name: 'eight',   from: 15, to: 20  },  // 四象生八卦
    { name: 'sixty4',  from: 20, to: 27  },  // 八卦生六十四卦
    { name: 'bian',    from: 27, to: 32  },  // 错综卦变
    { name: 'wanwu',   from: 32, to: 36  }   // 万物归一·循环
  ];
  const LOOP = SCENES[SCENES.length - 1].to;

  /* ============== 工具：缓动 ============== */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t)  { return t < 0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2; }
  function easeOutBack(t){ const c1=1.70158,c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2); }
  function clamp01(v){ return v<0?0:v>1?1:v; }
  function tween(now, a, b, ease) {
    if (now <= a) return 0;
    if (now >= b) return 1;
    const t = (now - a) / (b - a);
    return (ease || easeInOut)(t);
  }

  /* ============== 主类 ============== */
  class Daosheng {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this._resize();
      window.addEventListener('resize', () => this._resize());
      this.startTime = performance.now();
      // 卦变演示对
      this.cuoPair = this._pickCuoPair();
      this.zongPair = this._pickZongPair();
      this._tick = this._tick.bind(this);
      requestAnimationFrame(this._tick);
    }

    _resize() {
      const parent = this.canvas.parentElement;
      const w = parent ? parent.clientWidth : 1100;
      const h = Math.min(560, Math.max(400, w * 0.5));
      this.canvas.style.width  = w + 'px';
      this.canvas.style.height = h + 'px';
      this.canvas.width  = w * DPR;
      this.canvas.height = h * DPR;
      this.scale = Math.min(w / W, h / H);
      this.offX = (w - W * this.scale) / 2;
      this.offY = (h - H * this.scale) / 2;
    }

    _pickCuoPair() {
      // 错卦：六爻阴阳全反。乾↔坤、坎↔离、中孚↔小过… 取乾↔坤最直观
      return [ALL64[0], ALL64[63]]; // 乾(111/111) ↔ 坤(000/000)
    }
    _pickZongPair() {
      // 综卦：上下倒转。损↔益、泰↔否… 取泰↔否（111/000 ↔ 000/111 = 否）
      // ALL64[7]=坤下乾上=泰；ALL64[56]=乾下坤上=否
      return [ALL64[7], ALL64[56]];
    }

    _tick(ts) {
      const now = ((ts - this.startTime) / 1000) % LOOP;
      this.now = now;
      this._draw(now);
      requestAnimationFrame(this._tick);
    }

    _draw(now) {
      const ctx = this.ctx;
      ctx.save();
      ctx.scale(DPR, DPR);
      // 画布透明（背景由 CSS 控制）
      ctx.clearRect(0, 0, this.canvas.width/DPR, this.canvas.height/DPR);
      ctx.translate(this.offX, this.offY);
      ctx.scale(this.scale, this.scale);

      // 背景：宣纸底（半透明叠，让下面内容隐约可见）
      ctx.fillStyle = 'rgba(244,236,216,0.95)';
      ctx.fillRect(0, 0, W, H);

      // 按场景绘制
      for (const s of SCENES) {
        if (now >= s.from && now < s.to) {
          const localT = (now - s.from) / (s.to - s.from);
          this['_draw_' + s.name](localT, now);
          this._drawTitle(s.name, localT);
          break;
        }
      }

      ctx.restore();
    }

    /* ---------- 通用：画一爻 ---------- */
    _drawYao(ctx, yao, x, y, len, thick, gap, color, alpha) {
      alpha = alpha == null ? 1 : alpha;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      if (yao === 1) {
        ctx.fillRect(x - len/2, y - thick/2, len, thick);
      } else {
        ctx.fillRect(x - len/2, y - thick/2, (len - gap)/2, thick);
        ctx.fillRect(x + gap/2, y - thick/2, (len - gap)/2, thick);
      }
      ctx.restore();
    }
    /* ---------- 通用：画三爻卦（下-中-上） ---------- */
    _drawTrigram(ctx, yao3, cx, cy, len, thick, gap, yGap, yangColor, yinColor, alpha) {
      // 初爻在下，上爻在上
      for (let i = 0; i < 3; i++) {
        const y = cy + (1 - i) * yGap;  // i=0 初(下), i=2 上
        this._drawYao(ctx, yao3[i], cx, y, len, thick, gap,
          yao3[i] ? yangColor : yinColor, alpha);
      }
    }
    /* ---------- 通用：画六爻卦 ---------- */
    _drawHex(ctx, yao6, cx, cy, len, thick, gap, yGap, yangColor, yinColor, alpha, scaleY) {
      scaleY = scaleY == null ? 1 : scaleY;
      for (let i = 0; i < 6; i++) {
        const y = cy + (2.5 - i) * yGap * scaleY;
        this._drawYao(ctx, yao6[i], cx, y, len, thick, gap,
          yao6[i] ? yangColor : yinColor, alpha);
      }
    }

    /* ====================================================== */
    /*                   场 景 1：虚 空                        */
    /* ====================================================== */
    _draw_void(t) {
      const ctx = this.ctx;
      // 远处淡淡的墨点
      const a = easeInOut(t);
      for (let i = 0; i < 30; i++) {
        const ang = (i / 30) * Math.PI * 2 + t * 0.2;
        const r = 180 + i * 3;
        const x = CX + Math.cos(ang) * r;
        const y = CY + Math.sin(ang) * r * 0.4;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI*2);
        ctx.fillStyle = `rgba(44,24,16,${0.08 * a})`;
        ctx.fill();
      }
      // 中央微光
      const glow = 0.4 + 0.6 * a;
      const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, 140);
      g.addColorStop(0, `rgba(255,250,240,${0.8*glow})`);
      g.addColorStop(0.3, `rgba(255,240,210,${0.3*glow})`);
      g.addColorStop(1, 'rgba(244,236,216,0)');
      ctx.fillStyle = g;
      ctx.fillRect(CX-200, CY-200, 400, 400);
      // 一个极小的点
      ctx.beginPath();
      ctx.arc(CX, CY, 3*a, 0, Math.PI*2);
      ctx.fillStyle = `rgba(44,24,16,${a})`;
      ctx.fill();
    }

    /* ====================================================== */
    /*             场 景 2：道 生 一 · 太 极                   */
    /* ====================================================== */
    _draw_one(t) {
      const ctx = this.ctx;
      // 微光底
      const r = 120 * easeOutBack(t);
      const rot = this.now * 0.6; // 缓慢旋转
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(rot);

      // 外圆
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI*2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      // 阳鱼（白）+阴鱼（墨）
      // 阴鱼（左墨）用半圆+两个小圆构成S形
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, r, Math.PI/2, Math.PI*1.5, false);
      ctx.arc(0, -r/2, r/2, Math.PI*0.5, Math.PI*1.5, true);
      ctx.arc(0, r/2, r/2, Math.PI*1.5, Math.PI*0.5, false);
      ctx.closePath();
      ctx.fillStyle = COLOR.ink;
      ctx.fill();
      ctx.restore();

      // 阳鱼眼（上白中的黑点）+阴鱼眼（下黑中的白点）
      ctx.beginPath();
      ctx.arc(0, -r/2, r/10, 0, Math.PI*2);
      ctx.fillStyle = COLOR.ink;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, r/2, r/10, 0, Math.PI*2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // 外描边（朱红）
      ctx.strokeStyle = COLOR.zhu;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }

    /* ====================================================== */
    /*          场 景 3：一 生 二 · 两 仪 (爻线浮现)           */
    /* ====================================================== */
    _draw_two(t) {
      // 先保留太极，渐淡
      this._draw_one(1); // 太极全显
      const ctx = this.ctx;
      ctx.globalAlpha = 1 - t*0.5; // 太极稍淡

      ctx.globalAlpha = 1;
      // 阳爻从太极向左展开
      const yangX = CX - 180;
      const yangA = easeOutCubic(clamp01((t - 0.05)/0.4));
      this._drawYao(ctx, 1, yangX, CY - 40, 120*yangA, 12, 18, COLOR.zhu, yangA);
      if (t > 0.35) {
        ctx.globalAlpha = easeOutCubic((t-0.35)/0.4);
        ctx.fillStyle = COLOR.zhu;
        ctx.font = '16px "Songti SC","SimSun",serif';
        ctx.textAlign = 'center';
        ctx.fillText('阳  ⚊  ——', yangX, CY + 10);
      }
      // 阴爻从太极向右展开
      ctx.globalAlpha = 1;
      const yinX = CX + 180;
      const yinA = easeOutCubic(clamp01((t - 0.25)/0.4));
      this._drawYao(ctx, 0, yinX, CY - 40, 120*yinA, 12, 18, COLOR.liu, yinA);
      if (t > 0.55) {
        ctx.globalAlpha = easeOutCubic((t-0.55)/0.4);
        ctx.fillStyle = COLOR.liu;
        ctx.font = '16px "Songti SC","SimSun",serif';
        ctx.textAlign = 'center';
        ctx.fillText('阴  ⚋  — —', yinX, CY + 10);
      }
      ctx.globalAlpha = 1;
    }

    /* ====================================================== */
    /*         场 景 4：两 仪 生 四 象 (太阳少阴少阳太阴)      */
    /* ====================================================== */
    _draw_four(t) {
      // 四象 = 两爻堆叠：太阳(11) / 少阴(01) / 少阳(10) / 太阴(00)
      const ctx = this.ctx;
      const sixiang = [
        { yao:[1,1], name:'太阳', color:COLOR.zhu, x:CX-270 },
        { yao:[0,1], name:'少阴', color:COLOR.jade, x:CX-90 },
        { yao:[1,0], name:'少阳', color:COLOR.blue, x:CX+90 },
        { yao:[0,0], name:'太阴', color:COLOR.liu, x:CX+270 }
      ];
      const a = easeOutBack(clamp01(t/0.8));
      sixiang.forEach((s, i) => {
        const delay = i * 0.06;
        const ai = easeOutCubic(clamp01((t - delay)/0.5));
        // 初爻、上爻（两爻）
        for (let k = 0; k < 2; k++) {
          const yy = CY + (0.5 - k) * 24;
          this._drawYao(ctx, s.yao[k], s.x, yy, 70*a, 10, 10,
            s.yao[k] ? COLOR.zhu : COLOR.liu, ai);
        }
        if (t > 0.5 + i*0.05) {
          ctx.globalAlpha = easeOutCubic((t - 0.5 - i*0.05)/0.3);
          ctx.fillStyle = s.color;
          ctx.font = '14px "Songti SC","SimSun",serif';
          ctx.textAlign = 'center';
          ctx.fillText(s.name, s.x, CY + 50);
          ctx.globalAlpha = 1;
        }
      });
      // 顶部提示文字
      if (t > 0.6) {
        ctx.globalAlpha = easeOutCubic((t-0.6)/0.3);
        ctx.fillStyle = COLOR.ink;
        ctx.font = '15px "Kaiti SC","STKaiti",serif';
        ctx.textAlign = 'center';
        ctx.fillText('阳上叠加阳、阴 ── 成四象', CX, CY - 90);
        ctx.globalAlpha = 1;
      }
    }

    /* ====================================================== */
    /*       场 景 5：四 象 生 八 卦 (先天八卦环)              */
    /* ====================================================== */
    _draw_eight(t) {
      const ctx = this.ctx;
      const R = 150;
      const inA = easeOutCubic(clamp01(t/0.7));
      const rot0 = -Math.PI/2; // 乾在南（上），先天位
      for (let i = 0; i < 8; i++) {
        const ang = rot0 + (i / 8) * Math.PI * 2;
        const bx = CX + Math.cos(ang) * R;
        const by = CY + Math.sin(ang) * R;
        const delay = i * 0.05;
        const ai = easeOutBack(clamp01((t - delay)/0.5));
        // 画三爻，以卦中心为轴
        ctx.save();
        ctx.translate(bx, by);
        ctx.scale(0.55 * ai, 0.55 * ai);
        for (let k = 0; k < 3; k++) {
          const yy = (1 - k) * 18; // 上爻在上
          this._drawYao(ctx, BAGUA[i].yao[k], 0, yy, 60, 8, 8,
            BAGUA[i].yao[k] ? COLOR.zhu : COLOR.liu, inA);
        }
        ctx.restore();
        // 卦名
        if (t > 0.4 + i*0.04) {
          ctx.globalAlpha = easeOutCubic((t - 0.4 - i*0.04)/0.3);
          ctx.fillStyle = COLOR.ink;
          ctx.font = '16px "Kaiti SC","STKaiti",serif';
          ctx.textAlign = 'center';
          const lx = CX + Math.cos(ang) * (R + 40);
          const ly = CY + Math.sin(ang) * (R + 40);
          ctx.fillText(BAGUA[i].name, lx, ly + 5);
          ctx.globalAlpha = 1;
        }
      }
      // 中央"太极"小字
      if (t > 0.7) {
        ctx.globalAlpha = easeOutCubic((t-0.7)/0.2);
        ctx.fillStyle = COLOR.ink;
        ctx.font = '15px "Kaiti SC","STKaiti",serif';
        ctx.textAlign = 'center';
        ctx.fillText('八卦成列', CX, CY + 5);
        ctx.globalAlpha = 1;
      }
    }

    /* ====================================================== */
    /*       场 景 6：八 卦 生 六 十 四 卦 (8x8 方阵)          */
    /* ====================================================== */
    _draw_sixty4(t) {
      const ctx = this.ctx;
      const cols = 8, rows = 8;
      const cellW = 52, cellH = 36;
      const gridW = cols * cellW;
      const gridH = rows * cellH;
      const gx = CX - gridW/2;
      const gy = CY - gridH/2;
      const maxShow = Math.floor(tween(this.now, 20, 25.5) * 64);

      // 中心提示
      if (t < 0.3) {
        ctx.globalAlpha = 1 - t*3;
        this._draw_eight(1);
        ctx.globalAlpha = 1;
      }

      // 画 64 个小六爻卦格（按重卦序：行=上卦，列=下卦）
      for (let i = 0; i < 64; i++) {
        const r = Math.floor(i/8), c = i%8;
        const x = gx + c*cellW + cellW/2;
        const y = gy + r*cellH + cellH/2;
        if (i > maxShow) break;
        const appear = clamp01((maxShow - i)/2);
        const alpha = 0.6 + 0.4 * appear;
        // 画 6 爻（紧缩）
        const len=26, thick=3, gap=4, ygap=5;
        for (let k=0;k<6;k++){
          const yy = y + (2.5-k)*ygap;
          this._drawYao(ctx, ALL64[i].yao[k], x, yy, len, thick, gap,
            ALL64[i].yao[k] ? COLOR.zhu : COLOR.liu, alpha);
        }
      }
      if (t > 0.85) {
        ctx.globalAlpha = easeOutCubic((t-0.85)/0.15);
        ctx.fillStyle = COLOR.ink;
        ctx.font = '15px "Kaiti SC","STKaiti",serif';
        ctx.textAlign = 'center';
        ctx.fillText('因而重之，六十四卦备矣', CX, gy + gridH + 25);
        ctx.globalAlpha = 1;
      }
    }

    /* ====================================================== */
    /*       场 景 7：错 综 卦 变 演 示                        */
    /* ====================================================== */
    _draw_bian(t) {
      const ctx = this.ctx;
      // 左右两组：错卦（左）/ 综卦（右）
      // 先铺满 8x8 矩阵淡底
      ctx.globalAlpha = 0.18;
      const cols=8, rows=8, cellW=52, cellH=36;
      const gridW=cols*cellW, gridH=rows*cellH;
      const gx=CX-gridW/2, gy=CY-gridH/2;
      for (let i=0;i<64;i++){
        const r=Math.floor(i/8), c=i%8;
        const x=gx+c*cellW+cellW/2, y=gy+r*cellH+cellH/2;
        for (let k=0;k<6;k++){
          this._drawYao(ctx, ALL64[i].yao[k], x, y+(2.5-k)*5, 26, 3, 4,
            ALL64[i].yao[k]?COLOR.zhu:COLOR.liu, 1);
        }
      }
      ctx.globalAlpha = 1;

      // ==== 左：错卦演示（乾 ↔ 坤，六爻阴阳全反）====
      const lx = CX - 230, ly = CY;
      const cuoProgress = easeInOut(clamp01(t/0.5));
      // 左侧卦在 cuoProgress=0 是乾(111111)，=1 是坤(000000)；中间渐变是逐爻翻转
      const cuoFrom = this.cuoPair[0].yao, cuoTo = this.cuoPair[1].yao;
      for (let k=0;k<6;k++){
        const yaoDelay = k * 0.08; // 从初爻开始依次翻转
        const local = clamp01((cuoProgress - yaoDelay)/0.25);
        const flip = local;
        const yao = cuoFrom[k] === cuoTo[k] ? cuoFrom[k] : (flip < 0.5 ? cuoFrom[k] : cuoTo[k]);
        // 翻转动画：用 scaleY 做"翻面"效果
        const scaleY = Math.abs(Math.cos(local * Math.PI));
        const yy = ly + (2.5-k)*12;
        ctx.save();
        ctx.translate(lx, yy);
        ctx.scale(1, scaleY || 0.05);
        this._drawYao(ctx, yao, 0, 0, 70, 7, 10,
          yao ? COLOR.zhu : COLOR.liu, 1);
        ctx.restore();
      }
      if (t > 0.05) {
        ctx.fillStyle = COLOR.zhu;
        ctx.font = 'bold 14px "Songti SC","SimSun",serif';
        ctx.textAlign = 'center';
        ctx.fillText('错卦 · 阴阳对反', lx, ly - 55);
        ctx.font = '13px "Kaiti SC","STKaiti",serif';
        ctx.fillStyle = COLOR.ink;
        ctx.fillText('乾  ↔  坤', lx, ly + 55);
      }

      // ==== 右：综卦演示（泰 ↔ 否，整卦上下颠倒）====
      const rx = CX + 230, ry = CY;
      const zongProgress = easeInOut(clamp01((t-0.15)/0.6));
      const zongAngle = zongProgress * Math.PI; // 整体翻转 180°
      // 实际上泰(111/000)翻180°后变为否(000/111)
      const zongYao = zongProgress < 0.5 ? this.zongPair[0].yao : this.zongPair[1].yao;
      // 但为了动画直观，我们让卦整体以中心为轴旋转
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(zongAngle);
      for (let k=0;k<6;k++){
        const yy = (2.5-k)*12;
        this._drawYao(ctx, zongYao[k], 0, yy, 70, 7, 10,
          zongYao[k] ? COLOR.zhu : COLOR.liu, 1);
      }
      ctx.restore();
      if (t > 0.2) {
        ctx.fillStyle = COLOR.liu;
        ctx.font = 'bold 14px "Songti SC","SimSun",serif';
        ctx.textAlign = 'center';
        ctx.fillText('综卦 · 上下倒置', rx, ry - 55);
        ctx.font = '13px "Kaiti SC","STKaiti",serif';
        ctx.fillStyle = COLOR.ink;
        ctx.fillText('泰  ↔  否', rx, ry + 55);
      }

      // ==== 中央文字 ====
      if (t > 0.4) {
        ctx.globalAlpha = easeOutCubic((t-0.4)/0.3);
        ctx.fillStyle = COLOR.ink;
        ctx.font = '15px "Kaiti SC","STKaiti",serif';
        ctx.textAlign = 'center';
        ctx.fillText('刚柔相推，变在其中', CX, CY + 130);
        ctx.globalAlpha = 1;
      }
    }

    /* ====================================================== */
    /*       场 景 8：万 物 归 一 (光点回归·循环)              */
    /* ====================================================== */
    _draw_wanwu(t) {
      const ctx = this.ctx;
      // 背景 64 卦渐隐，向中心汇聚
      const cols=8, rows=8, cellW=52, cellH=36;
      const gridW=cols*cellW, gridH=rows*cellH;
      const gx=CX-gridW/2, gy=CY-gridH/2;
      const a = 1 - easeInOut(clamp01(t/0.7));
      for (let i=0;i<64;i++){
        const r=Math.floor(i/8), c=i%8;
        let x=gx+c*cellW+cellW/2, y=gy+r*cellH+cellH/2;
        // 向中心汇聚
        x = x + (CX - x) * easeInOut(clamp01(t*1.2));
        y = y + (CY - y) * easeInOut(clamp01(t*1.2));
        for (let k=0;k<6;k++){
          this._drawYao(ctx, ALL64[i].yao[k], x, y+(2.5-k)*5,
            26*(1-t*0.5), 3, 4,
            ALL64[i].yao[k]?COLOR.zhu:COLOR.liu, a*0.7);
        }
      }
      // 中心太极缩小归一点
      if (t > 0.5) {
        const tr = easeInOut((t-0.5)/0.5);
        const rr = 120*(1-tr) + 3*tr;
        ctx.save();
        ctx.translate(CX, CY);
        ctx.rotate(this.now * 0.8);
        ctx.beginPath();
        ctx.arc(0,0,rr,0,Math.PI*2);
        ctx.fillStyle = COLOR.ink;
        ctx.fill();
        ctx.strokeStyle = COLOR.zhu;
        ctx.lineWidth = 2*(1-tr);
        ctx.stroke();
        ctx.restore();
      }
      // 外圈金句
      if (t > 0.75) {
        ctx.globalAlpha = easeOutCubic((t-0.75)/0.25);
        ctx.fillStyle = COLOR.zhu;
        ctx.font = 'bold 20px "Kaiti SC","STKaiti",serif';
        ctx.textAlign = 'center';
        ctx.fillText('万物归一，一归太虚', CX, CY + 160);
        ctx.globalAlpha = 1;
      }
    }

    /* ====================================================== */
    /*                   场 景 标 题                           */
    /* ====================================================== */
    _drawTitle(scene, t) {
      const ctx = this.ctx;
      const TITLES = {
        void:   { main: '', sub: '' },
        one:    { main: '道 生 一', sub: '太 极' },
        two:    { main: '一 生 二', sub: '两 仪 · 阴 阳' },
        four:   { main: '二 生 三', sub: '两 仪 生 四 象' },
        eight:  { main: '三 生 万 物', sub: '四 象 生 八 卦' },
        sixty4: { main: '八 卦 相 重', sub: '而 成 六 十 四 卦' },
        bian:   { main: '刚 柔 相 推', sub: '错 综 变 化' },
        wanwu:  { main: '', sub: '' }
      };
      const ti = TITLES[scene];
      if (!ti.main) return;
      const a = easeOutCubic(clamp01(t/0.3)) * (1 - clamp01((t-0.85)/0.15));
      if (a <= 0) return;
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      ctx.fillStyle = COLOR.zhu;
      ctx.font = 'bold 22px "Songti SC","SimSun","Kaiti SC",serif';
      ctx.fillText(ti.main, CX, 40);
      ctx.fillStyle = COLOR.ink;
      ctx.font = '14px "Kaiti SC","STKaiti",serif';
      ctx.fillText(ti.sub, CX, 65);
      ctx.globalAlpha = 1;
    }
  }

  /* ============== 自启动 ============== */
  function init() {
    const canvas = document.getElementById('daosheng-canvas');
    if (!canvas) return;
    new Daosheng(canvas);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
