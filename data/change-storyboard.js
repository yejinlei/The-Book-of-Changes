/* ============================================================
 * 《易·化》变化剧本 —— 时间轴定义（网页版与 Remotion 版共用）
 * ------------------------------------------------------------
 * 单一事实来源：幕定义、时长、缓动、字幕。
 * 数据来源：window.YJ_ONT（本体层），不在此文件硬编码卦爻内容。
 *
 * 用法：
 *   const sb = window.YJStoryboard.build(ONT);
 *   sb.total            // 总时长（秒）
 *   sb.scenes           // 幕数组，每幕 {key,title,start,end,sub,text}
 *   sb.sceneAt(t)       // t 秒所处的幕
 * ============================================================ */
(function () {
  'use strict';

  // 幕定义：key / 标题 / 时长(秒) / 字幕
  // 注意：顺序即叙事顺序，总时长 = 各幕时长之和
  const SCENES = [
    { key: 'wuji',   title: '无极',       dur: 5,  sub: '无形无象，寂然不动',       text: '' },
    { key: 'daosheng', title: '道生一二三', dur: 11, sub: '道生一 · 一生二 · 二生三', text: '道生一，一生二，二生三，三生万物。' },
    { key: 'liangyi', title: '太极生两仪', dur: 10, sub: '太极动而生阳，静而生阴',   text: '易有太极，是生两仪。' },
    { key: 'sixiang', title: '两仪生四象', dur: 10, sub: '太阳 · 少阴 · 少阳 · 太阴', text: '两仪生四象。' },
    { key: 'bagua',  title: '四象生八卦', dur: 11, sub: '乾兑离震巽坎艮坤',         text: '四象生八卦，八卦定吉凶。' },
    { key: 'liushisi', title: '八卦重六十四', dur: 12, sub: '八卦相重，成六十四别卦', text: '八卦相错，因而重之，爻在其中矣。' },
    { key: 'cuo',    title: '错卦 · 阴阳相易', dur: 10, sub: '六爻尽变，阴阳交对',   text: '错者，阴阳相交对也。' },
    { key: 'zong',   title: '综卦 · 上下颠倒', dur: 10, sub: '整体倒转，上下易位',   text: '综者，上下相颠倒也。' },
    { key: 'hu',     title: '互卦 · 万物互化', dur: 11, sub: '错 · 综 · 互，生生不息', text: '生生之谓易。' }
  ];

  // 缓动函数
  const Ease = {
    linear: t => t,
    inOut: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    out: t => 1 - Math.pow(1 - t, 3),
    in: t => t * t * t,
    outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };

  // 八字口诀：先天八卦方位（乾南坤北，离东坎西）——角度制，0° 在正上方，顺时针
  const XIANTIAN = { 乾: 0, 兑: 45, 离: 90, 震: 135, 巽: 225, 坎: 270, 艮: 315, 坤: 180 };
  // 注：先天八卦实际排布（上南下北）：乾南、坤北、离东、坎西、兑东南、艮西北、震东北、巽西南
  //   → 以「正北=0°，顺时针为正」记：坤0 震45 离90 兑135 乾180 巽225 坎270 艮315
  const XIANTIAN_DEG = { 坤: 0, 震: 45, 离: 90, 兑: 135, 乾: 180, 巽: 225, 坎: 270, 艮: 315 };

  function build(ONT) {
    // 计算每幕起止
    let acc = 0;
    const scenes = SCENES.map(s => {
      const o = Object.assign({}, s);
      o.start = acc; acc += s.dur; o.end = acc; o.dur = s.dur;
      return o;
    });
    const total = acc;

    // 从本体取八卦（按先天序：乾兑离震巽坎艮坤 --- 这里用本体 bagua 原序，方位另查）
    const bagua = (ONT && ONT.bagua) ? ONT.bagua.slice() : [];
    // 64 卦
    const gua64 = (ONT && ONT.liushisigua) ? ONT.liushisigua.slice().sort((a, b) => a.num - b.num) : [];

    // 建立错/综/互 关系索引（从本体三元组读，不硬编码）
    const rel = { cuo: {}, zong: {}, hu: {} };
    if (ONT && ONT.triples) {
      ONT.triples.forEach(t => {
        if (t.predicate === 'cuoGua') rel.cuo[t.subject] = t.object;
        else if (t.predicate === 'zongGua') rel.zong[t.subject] = t.object;
        else if (t.predicate === 'huGua') rel.hu[t.subject] = t.object;
      });
    }

    function sceneAt(t) {
      t = Math.max(0, Math.min(total - 0.001, t));
      for (const s of scenes) { if (t >= s.start && t < s.end) return s; }
      return scenes[scenes.length - 1];
    }
    // 幕内归一化进度 0~1
    function prog(t, scene) {
      return Math.max(0, Math.min(1, (t - scene.start) / scene.dur));
    }

    return {
      version: '1.0.0',
      builtOn: '2026-11-04',
      principle: '剧本仅描述变化的时间结构；卦爻内容全部来自本体层 YJ_ONT',
      scenes, total, bagua, gua64, rel,
      xiandian: XIANTIAN_DEG, Ease,
      sceneAt, prog
    };
  }

  window.YJStoryboard = { build, Ease, SCENES, XIANTIAN: XIANTIAN_DEG };
})();
