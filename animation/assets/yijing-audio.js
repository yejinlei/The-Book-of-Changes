/* ============================================================
 * 易之变 · 音轨引擎  (Yijing Audio Engine)
 * 纯 Web Audio API 实时合成，零外部音频依赖。
 * 五声音阶（宫商角徵羽）+ 铜磬/古琴/爻弹/卦钟
 * 与视频 timeupdate 事件对位：根据视频 currentTime 触发。
 * ============================================================ */

(function (global) {
  'use strict';

  // ——— 五声音阶（宫 C4 商 D4 角 E4 徵 G4 羽 A4），用于古琴垫与爻弹 ———
  // 太极 / 道 / 背景用更低的音区；卦变钟声用泛音。
  const PENTA   = [261.63, 293.66, 329.63, 392.00, 440.00];        // 宫商角徵羽 C4-A4
  const PENTA_L = [130.81, 146.83, 164.81, 196.00, 220.00];        // 低八度
  const PENTA_H = [523.25, 587.33, 659.25, 783.99, 880.00];        // 高八度

  // 八卦配律（对应每卦出场时一个根音，先天八卦序）
  const BAGUA_NOTES = {
    qian:  523.25, // 乾·天·宫（黄钟）
    dui:   587.33, // 兑·泽·商
    li:    659.25, // 离·火·角
    zhen:  783.99, // 震·雷·徵
    xun:   880.00, // 巽·风·羽
    kan:   440.00, // 坎·水·羽低
    gen:   392.00, // 艮·山·徵低
    kun:   261.63, // 坤·地·宫低
  };

  // ——— 场景音效 cue 表：在视频时间点触发 ———
  // 每幕约 12.5 秒，共 14 幕 ≈ 174 秒
  // cue.type: qing=铜磬, yao=爻弹, zhong=卦钟, gua=卦出音, xiaoxi=消息卦一声, bian=变卦锣, dazhan=筮法数声
  const CUES = [
    // 幕1 混沌 0-10 秒
    { t: 2.0,  type:'qing',  note: 261.63, dur: 4.0,  gain:0.18, label:'道起一磬' },
    { t: 7.5,  type:'qing',  note: 329.63, dur: 3.5,  gain:0.15, label:'微光' },

    // 幕2 道生一·太极 10-22
    { t: 10.2, type:'zhong', note: 261.63, dur: 6.0,  gain:0.28, label:'太极成' },
    { t: 16.0, type:'zhong', note: 392.00, dur: 4.0,  gain:0.20, label:'太极旋' },

    // 幕3 一生二·两仪 22-32
    { t: 22.2, type:'gua',   note: 329.63, dur: 2.5,  gain:0.25, label:'阳生' },
    { t: 25.5, type:'gua',   note: 220.00, dur: 2.5,  gain:0.25, label:'阴生' },
    { t: 29.0, type:'qing',  note: 440.00, dur: 3.0,  gain:0.18, label:'两仪成' },

    // 幕4 二生三·四象 32-44
    { t: 32.5, type:'yao',   note: 523.25, dur: 1.6,  gain:0.22 }, // 太阳
    { t: 35.5, type:'yao',   note: 587.33, dur: 1.6,  gain:0.22 }, // 少阴
    { t: 38.5, type:'yao',   note: 659.25, dur: 1.6,  gain:0.22 }, // 少阳
    { t: 41.5, type:'yao',   note: 440.00, dur: 1.8,  gain:0.22 }, // 太阴

    // 幕5 三生万物·八卦 44-56  先天八卦依次出：乾兑离震巽坎艮坤
    { t: 45.0, type:'gua', note: BAGUA_NOTES.qian, dur:1.8, gain:0.22, label:'乾' },
    { t: 46.5, type:'gua', note: BAGUA_NOTES.dui,  dur:1.6, gain:0.20, label:'兑' },
    { t: 48.0, type:'gua', note: BAGUA_NOTES.li,   dur:1.6, gain:0.20, label:'离' },
    { t: 49.5, type:'gua', note: BAGUA_NOTES.zhen, dur:1.6, gain:0.20, label:'震' },
    { t: 51.0, type:'gua', note: BAGUA_NOTES.xun,  dur:1.6, gain:0.20, label:'巽' },
    { t: 52.5, type:'gua', note: BAGUA_NOTES.kan,  dur:1.6, gain:0.20, label:'坎' },
    { t: 54.0, type:'gua', note: BAGUA_NOTES.gen,  dur:1.6, gain:0.20, label:'艮' },
    { t: 55.5, type:'zhong', note: BAGUA_NOTES.kun, dur:3.0, gain:0.28, label:'坤成·八卦备' },

    // 幕6 八卦重六十四卦 56-72  64 格展开——爻弹节奏渐密
    ...spreadYaoBurst(57.5, 70, 64, 0.22),

    // 幕7 错卦 72-84 —— 阴阳翻转，成对钟声（乾↔坤）
    { t: 72.5, type:'zhong', note: 523.25, dur:3.0, gain:0.25, label:'错·乾' },
    { t: 75.0, type:'zhong', note: 261.63, dur:3.5, gain:0.28, label:'错·坤' },
    { t: 79.0, type:'bian',  note: 392.00, dur:2.0, gain:0.22, label:'错卦全翻' },

    // 幕8 综卦 84-96 —— 泰↔否，倒置锣音
    { t: 85.0, type:'zhong', note: 392.00, dur:2.5, gain:0.24, label:'综·泰' },
    { t: 88.0, type:'zhong', note: 329.63, dur:2.8, gain:0.26, label:'综·否' },
    { t: 92.0, type:'bian',  note: 440.00, dur:2.0, gain:0.20, label:'综卦全倒' },

    // 幕9 互卦 96-108 —— 三个爻弹为一组（本卦+互二卦）
    ...spreadTriples(97.5, 106, 8, 0.18),

    // 幕10 之卦 108-120 —— 动爻弹+之卦锣
    { t: 109.0, type:'yao', note: 587.33, dur:1.0, gain:0.22 },
    { t: 111.0, type:'yao', note: 659.25, dur:1.0, gain:0.22 },
    { t: 113.0, type:'yao', note: 783.99, dur:1.0, gain:0.22 },
    { t: 115.5, type:'zhong', note: 440.00, dur:3.5, gain:0.28, label:'之卦成' },
    { t: 118.0, type:'bian', note: 523.25, dur:2.0, gain:0.22, label:'爻变' },

    // 幕11 消息卦 120-132 —— 十二月卦，每卦一声磬，从低到高再回低
    ...xiaoxiScale(121, 130, 0.20),

    // 幕12 大衍筮法 132-148 —— 三变成一爻·六爻十八变，拨弦计数
    ...dayanPattern(133, 146, 0.18),

    // 幕13 三易 148-160 —— 变/简/不易三磬
    { t: 149.0, type:'qing', note: 392.00, dur:3.0, gain:0.25, label:'变易' },
    { t: 153.0, type:'qing', note: 523.25, dur:3.0, gain:0.25, label:'简易' },
    { t: 157.0, type:'zhong', note: 261.63, dur:4.5, gain:0.30, label:'不易' },

    // 幕14 万物归一 160-174 —— 收敛，一声远磬
    { t: 161.0, type:'zhong', note: 261.63, dur:5.0, gain:0.26, label:'归一' },
    { t: 168.0, type:'qing',  note: 440.00, dur:5.0, gain:0.20, label:'一归太虚' },
  ];

  // ——— 工具：生成密集爻弹序列（八卦重叠节奏）———
  function spreadYaoBurst(t0, t1, n, gain) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = t0 + (t1 - t0) * (i / (n - 1));
      const note = PENTA[i % 5] * (Math.random() < 0.3 ? 0.5 : 1);
      out.push({ t, type: 'yao', note, dur: 0.5 + Math.random() * 0.3, gain: gain * (0.6 + Math.random() * 0.4) });
    }
    return out;
  }
  // ——— 互卦三组音（每卦 3 声）———
  function spreadTriples(t0, t1, groups, gain) {
    const out = [];
    const step = (t1 - t0) / groups;
    for (let g = 0; g < groups; g++) {
      for (let j = 0; j < 3; j++) {
        out.push({ t: t0 + g * step + j * 0.25, type: 'yao', note: PENTA[(g + j) % 5], dur: 0.8, gain });
      }
    }
    return out;
  }
  // ——— 消息卦音阶：宫商角徵羽上升+回落（对应阳长阴消、阴长阳消）———
  function xiaoxiScale(t0, t1, gain) {
    // 12 个月：从复卦（一阳生）到乾（全阳）再到坤（全阴）
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 523.25, 440.00, 392.00, 329.63, 261.63];
    const step = (t1 - t0) / notes.length;
    return notes.map((n, i) => ({ t: t0 + i * step, type: 'qing', note: n, dur: 2.0, gain }));
  }
  // ——— 大衍筮法：三变为一组（每爻三变 × 六爻 = 18 拨）———
  function dayanPattern(t0, t1, gain) {
    const out = [];
    let t = t0;
    const step = (t1 - t0) / 18;
    for (let i = 0; i < 18; i++) {
      out.push({ t, type: 'yao', note: PENTA[i % 5], dur: 0.5, gain: gain * (i % 3 === 2 ? 1.4 : 1) });
      t += step;
    }
    // 最后成卦一声钟
    out.push({ t: t1 + 0.5, type: 'zhong', note: 392.00, dur: 3.0, gain: 0.25, label:'卦成' });
    return out;
  }

  // ============================================================
  //  Audio Engine 主体
  // ============================================================
  class YijingAudio {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.padGain = null;
      this.sfxGain = null;
      this.enabled = false;
      this.firedCues = new Set();
      this.padNodes = [];
      this.padTimer = null;
      this.currentSec = -1;
    }

    async start() {
      if (this.ctx) { this.enabled = true; this.resumePad(); return; }
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      // 主输出总音量
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(this.ctx.destination);
      // 两路：古琴垫 / 音效
      this.padGain = this.ctx.createGain();
      this.padGain.gain.value = 0.18;       // 垫音低
      this.padGain.connect(this.master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;        // 音效稍突出
      this.sfxGain.connect(this.master);
      this.enabled = true;
      this.startPad();
    }

    stop() {
      this.enabled = false;
      this.fadePad(0.3);
    }

    // ——— 古琴风持续垫音：五声音阶随机泛音叠加 + 慢 LFO ———
    startPad() {
      const ctx = this.ctx;
      const spawn = () => {
        if (!this.enabled || !this.ctx) return;
        // 两三个低频正弦叠加形成"风"
        const now = ctx.currentTime;
        [PENTA_L[Math.floor(Math.random()*5)],
         PENTA  [Math.floor(Math.random()*5)] * 0.5
        ].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = i === 0 ? 'sine' : 'triangle';
          o.frequency.value = f;
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.12, now + 1.2);
          g.gain.linearRampToValueAtTime(0,    now + 4.5);
          // 极慢颤音
          const lfo = ctx.createOscillator();
          const lfoG = ctx.createGain();
          lfo.frequency.value = 0.18 + Math.random() * 0.1;
          lfoG.gain.value = 0.02;
          lfo.connect(lfoG).connect(o.frequency);
          o.connect(g).connect(this.padGain);
          o.start(now); lfo.start(now);
          o.stop(now + 4.7); lfo.stop(now + 4.7);
        });
        this.padTimer = setTimeout(spawn, 2800 + Math.random() * 1500);
      };
      spawn();
    }
    resumePad() {
      if (this.padTimer) return;
      this.startPad();
    }
    fadePad(t) {
      if (!this.ctx) return;
      try { this.padGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + t); } catch(e){}
      setTimeout(() => {
        if (!this.enabled && this.padGain) this.padGain.gain.value = 0.18;
      }, (t + 0.1) * 1000);
      clearTimeout(this.padTimer); this.padTimer = null;
    }

    // ——— 主时间轴推进，video.timeupdate 调用 ———
    seek(timeSec) {
      if (!this.enabled || !this.ctx) return;
      // 每整秒重放防止错过（跳跃时不重复）
      this.currentSec = Math.floor(timeSec);
      const now = this.ctx.currentTime;
      for (const cue of CUES) {
        // 在当前 timeSec 的 ±0.3 秒窗口内触发（timeupdate 约 250ms 一次）
        if (cue.t <= timeSec + 0.3 && cue.t >= timeSec - 0.05) {
          // 用 t+sec 组合做 key，防止同一 cue 因多次 update 重复发声
          const key = cue.t.toFixed(1) + '_' + cue.type;
          if (this.firedCues.has(key)) continue;
          this.firedCues.add(key);
          this.playCue(cue, now);
        }
      }
    }

    resetCues() { this.firedCues.clear(); }

    // ——— 核心：按类型发声 ———
    playCue(cue, when) {
      switch (cue.type) {
        case 'qing': this.qing(cue.note, cue.dur, cue.gain, when); break;
        case 'zhong':this.zhong(cue.note, cue.dur, cue.gain, when); break;
        case 'gua':  this.guaTone(cue.note, cue.dur, cue.gain, when); break;
        case 'yao':  this.yaoPluck(cue.note, cue.dur, cue.gain, when); break;
        case 'bian': this.bianLuo(cue.note, cue.dur, cue.gain, when); break;
      }
    }

    // 铜磬：金属棒敲击 + 长泛音列（3/5/8 倍频），衰减 4-6 秒
    qing(freq, dur, gain, when) {
      const ctx = this.ctx;
      const partials = [1, 2.76, 5.4, 8.93]; // 近似磬的非整数泛音
      const partialGain = [1, 0.55, 0.3, 0.18];
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(gain * 0.9, when + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      // 加一点"击打"瞬态（噪声脉冲）
      const noise = ctx.createBufferSource();
      const nbuf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const nd = nbuf.getChannelData(0);
      for (let i=0;i<nd.length;i++) nd[i] = (Math.random()*2-1) * Math.pow(1 - i/nd.length, 3);
      noise.buffer = nbuf;
      const ng = ctx.createGain(); ng.gain.value = gain * 0.3;
      noise.connect(ng).connect(g);
      noise.start(when); noise.stop(when + 0.1);
      // 泛音列
      partials.forEach((p, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq * p;
        const og = ctx.createGain(); og.gain.value = partialGain[i];
        o.connect(og).connect(g);
        o.start(when); o.stop(when + dur + 0.2);
      });
      g.connect(this.sfxGain);
    }

    // 钟声：比磬更低沉，泛音更多，起振稍慢（0.08s）
    zhong(freq, dur, gain, when) {
      const ctx = this.ctx;
      const partials = [0.5, 1, 1.19, 1.56, 2, 2.51, 2.66, 3.01, 4.1];
      const partialGain = [0.3, 1, 0.5, 0.4, 0.3, 0.2, 0.15, 0.12, 0.08];
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(gain, when + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      // 低频轰鸣声
      const sub = ctx.createOscillator();
      sub.type = 'sine'; sub.frequency.value = freq * 0.5;
      const sg = ctx.createGain(); sg.gain.value = 0.4;
      sub.connect(sg).connect(g);
      sub.start(when); sub.stop(when + dur);
      partials.forEach((p, i) => {
        const o = ctx.createOscillator();
        o.type = i % 2 === 0 ? 'sine' : 'triangle';
        o.frequency.value = freq * p;
        const og = ctx.createGain(); og.gain.value = partialGain[i];
        o.connect(og).connect(g);
        o.start(when); o.stop(when + dur + 0.5);
      });
      g.connect(this.sfxGain);
    }

    // 卦出音：短筝音，triangle 波 + 快速衰减
    guaTone(freq, dur, gain, when) {
      const ctx = this.ctx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(gain, when + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      o.connect(g).connect(this.sfxGain);
      o.start(when); o.stop(when + dur);
      // 加一个高八度泛音
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.type = 'sine'; o2.frequency.value = freq * 2;
      g2.gain.setValueAtTime(0, when);
      g2.gain.linearRampToValueAtTime(gain * 0.3, when + 0.01);
      g2.gain.exponentialRampToValueAtTime(0.0001, when + dur * 0.7);
      o2.connect(g2).connect(this.sfxGain);
      o2.start(when); o2.stop(when + dur);
    }

    // 爻弹拨：类似古琴挑弦，三角波 + 快速 pluck 衰减
    yaoPluck(freq, dur, gain, when) {
      const ctx = this.ctx;
      // Karplus-Strong 近似：噪声 burst + 低通 + 衰减
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const env = Math.pow(1 - i/d.length, 2.2);
        d[i] = (Math.random()*2-1) * env;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 8;
      const g = ctx.createGain(); g.gain.value = gain * 2.2;
      src.connect(bp).connect(g).connect(this.sfxGain);
      src.start(when); src.stop(when + dur);
      // 叠加一个纯音基频让音高可辨
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = freq;
      og.gain.setValueAtTime(gain * 0.4, when);
      og.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      o.connect(og).connect(this.sfxGain);
      o.start(when); o.stop(when + dur);
    }

    // 变卦锣：大钹/锣类 —— 噪声+多泛音+慢起+长衰减
    bianLuo(freq, dur, gain, when) {
      const ctx = this.ctx;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(gain * 0.9, when + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      // 金属噪声
      const nbuf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const nd = nbuf.getChannelData(0);
      for (let i=0;i<nd.length;i++) nd[i] = (Math.random()*2-1) * Math.pow(1 - i/nd.length, 1.2);
      const n = ctx.createBufferSource(); n.buffer = nbuf;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq*2; bp.Q.value = 2;
      n.connect(bp).connect(g);
      n.start(when); n.stop(when + dur);
      // 不和谐泛音（金属感）
      [1, 1.43, 2.1, 2.9, 4.15].forEach((p, i) => {
        const o = ctx.createOscillator();
        o.type = i === 0 ? 'sine' : 'square';
        o.frequency.value = freq * p;
        const og = ctx.createGain(); og.gain.value = [0.6, 0.25, 0.15, 0.1, 0.07][i];
        o.connect(og).connect(g);
        o.start(when); o.stop(when + dur);
      });
      g.connect(this.sfxGain);
    }
  }

  global.YijingAudio = new YijingAudio();
})(window);
