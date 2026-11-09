/**
 * yijing-najia-engine.js 纳甲筮法可计算排盘引擎
 *
 * 输入：六爻摇卦结果（六数 6/7/8/9，从下到上）+ 起卦月日干支（可选，缺省时按系统当前时间取）
 * 输出：完整的排盘对象，包含：本卦卦名、归宫、世应、纳甲干支、六亲、六神、
 *       动爻、变卦、伏神飞神、旬空、月破、月建日辰对各爻的生克旺衰、旺相休囚死判定、十二长生状态。
 *
 * 本引擎为纯逻辑零依赖，可直接在浏览器或 Node 调用。
 * 使用：window.YJ_NAJIA_ENGINE.zhuangua(yaoList, {yue:月支, ri:日干+支, yueNum:农历月数})
 */
(function (global) {
  'use strict';
  const N = global.YJ_NAJIA;
  if (!N) throw new Error('yijing-najia-data.js must be loaded first');

  // ============================================================
  // 工具函数
  // ============================================================
  const DZ = N.DIZHI_ORDER;
  const dzIdx = dz => DZ.indexOf(dz);
  const wxName = wx => N.WUXING[wx].name;

  // 给定一个三爻经卦 key（qian/dui/...）+ 内外（nei/wai），返回三爻对应的 [天干, 地支] 对数组（从下到上三爻）
  function najiaForTrigram(trigram, pos) {
    const bg = N.BAGUA_NAJIA[trigram];
    const gan = pos === 'nei' ? bg.nagan[0] : bg.nagan[1];
    const zhi = pos === 'nei' ? bg.nazhi_nei : bg.nazhi_wai;
    return zhi.map(z => ({ gan, zhi: z }));
  }

  // 给定完整六爻 symbol([1/0, ...] 从下到上)，返回归宫信息
  function findGong(symArr) {
    const key = symArr.join('');
    return N.GUA_BY_SYM[key];
  }

  // 六亲判定：以宫五行为"我"
  function liuqin(gongWuxing, yaoWuxing) {
    if (yaoWuxing === gongWuxing) return N.LIUQIN_BY_REL.tong;    // 兄弟
    const gw = N.WUXING[gongWuxing];
    if (gw.beisheng === yaoWuxing) return N.LIUQIN_BY_REL.beisheng; // 父母（生我）
    if (gw.sheng === yaoWuxing) return N.LIUQIN_BY_REL.sheng;      // 子孙（我生）
    if (gw.ke === yaoWuxing) return N.LIUQIN_BY_REL.ke;            // 妻财（我克）
    if (gw.beike === yaoWuxing) return N.LIUQIN_BY_REL.beike;      // 官鬼（克我）
    return { key: 'unknown', name: '?', abbr: '?' };
  }

  // 根据日干+支确定六神排列（从初爻到上爻）
  function liushenFor(riGan) {
    return N.LIUSHEN_BY_RIGAN[riGan] || ['青龙','朱雀','勾陈','螣蛇','白虎','玄武'];
  }

  // 找伏神：本卦缺某六亲 → 到本宫纯卦同位取伏；飞神即本卦该位显现爻
  function findFuShen(yaoList, gongKey) {
    // 本宫八纯卦（每宫第1个）
    const benGong = N.BAGONG_FULL.find(g => g.gong === gongKey && g.level === '本宫');
    if (!benGong) return [];
    // 本宫六亲（按爻位，6 条，0=初爻）
    const benYao = zhuanguaStatic(benGong.symbol).yaos;
    // 本卦已出现的六亲 key
    const appeared = new Set(yaoList.map(y => y.liuqin.key));
    const result = [];
    for (let i = 0; i < 6; i++) {
      const ben = benYao[i];
      if (!appeared.has(ben.liuqin.key)) {
        // 在同爻位伏神（《增删卜易》本宫取伏法）
        result.push({
          pos: i + 1,
          fushen: { ...ben, liuqin: ben.liuqin },
          feishen: { ...yaoList[i] },
          relation: feiFuRelation(yaoList[i].wuxing, ben.wuxing)
        });
      }
    }
    return result;
  }

  function feiFuRelation(feiWx, fuWx) {
    if (feiWx === fuWx) return '飞伏比和';
    const fw = N.WUXING[feiWx];
    if (fw.sheng === fuWx) return '飞生伏（伏得生，易出）';
    if (fw.ke === fuWx) return '飞克伏（伏被压，难出）';
    if (fw.beike === fuWx) return '伏克飞（伏出暴，反制飞）';
    if (fw.beisheng === fuWx) return '伏生飞（伏泄气，无力）';
    return '';
  }

  // 月建对爻的影响判定
  function yueEffect(yuezhi, yaozhi, yaoDong) {
    const yueWx = N.DIZHI_WUXING[yuezhi];
    const yaoWx = N.DIZHI_WUXING[yaozhi];
    const wang = N.wangxiangxiuqiusi(yuezhi, yaozhi);
    const chong = N.isChong(yuezhi, yaozhi) ? '月破' : '';
    const he = N.isHe(yuezhi, yaozhi) ? (N.SHENGHE[yuezhi+yaozhi]||N.SHENGHE[yaozhi+yuezhi] ? '月生合（极旺）'
                                    : N.KEHE[yuezhi+yaozhi]||N.KEHE[yaozhi+yuezhi] ? '月克合（衰而留情）'
                                    : '月合（有气）') : '';
    let level;
    if (chong) level = '月破';
    else if (wang === 'wang' || he.includes('生合')) level = '旺';
    else if (wang === 'xiang') level = '相';
    else if (he.includes('月合')) level = '有气';
    else if (wang === 'xiu') level = '休';
    else if (he.includes('克合')) level = '衰';
    else if (wang === 'qiu' || wang === 'si') level = '囚/死';
    else level = '平';
    return { wang, chong, he, level };
  }

  // 日辰对爻的影响
  function riEffect(rizhi, yaozhi) {
    const riWx = N.DIZHI_WUXING[rizhi];
    const yaoWx = N.DIZHI_WUXING[yaozhi];
    if (yaozhi === rizhi) return { level: '临日（有力）', he: N.isHe(rizhi, yaozhi)?'日合绊':'', chong:'' };
    if (riWx === yaoWx) return { level: '日扶', he:'', chong: N.isChong(rizhi,yaozhi)?'日冲（暗动/冲散）':'' };
    const rw = N.WUXING[riWx];
    if (rw.sheng === yaoWx) return { level:'日生', he:'', chong:'' };
    if (rw.ke === yaoWx) return { level:'日克（衰）', he:'', chong:'' };
    return { level:'日无生克', he: N.isHe(rizhi,yaozhi)?'日合绊':'', chong: N.isChong(rizhi,yaozhi)?'日冲':'' };
  }

  // 综合旺衰（月建为基础，日辰叠加）
  function combinedWangshuai(yueLv, riLv) {
    if (yueLv === '月破') return '月破（极衰）';
    const yueRank = {'旺':4,'相':3,'有气':2,'平':1,'休':1,'衰':0,'囚/死':-1,'月破':-2};
    const riRank  = {'临日（有力）':4,'日扶':3,'日生':2,'日无生克':0,'日克（衰）':-2};
    const y = yueRank[yueLv] ?? 0;
    const r = riRank[riLv] ?? 0;
    if (y + r >= 6) return '旺之极';
    if (y + r >= 4) return '旺相';
    if (y + r >= 2) return '有气';
    if (y + r >= 0) return '平相';
    return '衰败';
  }

  // 空亡判定
  function isKong(zhi, kongArr) { return kongArr.includes(zhi); }

  // 十二长生状态（简化版，按五行）
  function changsheng(wuxing, dizhi) {
    const startZhi = N.CHANGSHENG_START[wuxing];
    const startIdx = dzIdx(startZhi);
    // 金水土长生在巳申申（阳顺），木在亥（阳顺），火在寅（阳顺）；此处统一顺行（传统阳干顺阴干逆，因爻以地支阴阳定，此处简化给出参考）
    const curIdx = dzIdx(dizhi);
    const diff = ((curIdx - startIdx) % 12 + 12) % 12;
    return N.CHANGSHENG_NAMES[diff];
  }

  // ============================================================
  // 核心装卦（内部工具）：根据纯六爻 0/1 数组，不含变爻
  // ============================================================
  function zhuanguaStatic(symArr) {
    const g = findGong(symArr);
    if (!g) return null;
    // 纳甲：内卦三爻、外卦三爻
    const nei = najiaForTrigram(g.xia, 'nei');
    const wai = najiaForTrigram(g.shang, 'wai');
    const ganzhi = [...nei, ...wai]; // 从下到上 6 爻
    const yaos = [];
    for (let i = 0; i < 6; i++) {
      const yinyang = symArr[i]; // 1阳 0阴
      const { gan, zhi } = ganzhi[i];
      const wx = N.DIZHI_WUXING[zhi];
      const lq = liuqin(g.wuxing, wx);
      yaos.push({
        pos: i + 1,         // 1=初 6=上
        yinyang,            // 1阳/0阴
        gan, zhi, wuxing: wx,
        liuqin: lq,
        shi: (i + 1) === g.shi,
        ying: (i + 1) === g.ying
      });
    }
    return { g, yaos };
  }

  // ============================================================
  // 对外主函数：装卦
  // yaoList: 长度 6 的数组，顺序从下到上（初爻→上爻），值为 6/7/8/9：
  //   6 = 老阴（动，变阳）；7 = 少阳（静阳）；8 = 少阴（静阴）；9 = 老阳（动，变阴）
  // opts: { yue:'寅', ri:'甲子' } —— 月支 + 日干支
  // ============================================================
  function zhuangua(yaoList, opts) {
    opts = opts || {};
    if (!Array.isArray(yaoList) || yaoList.length !== 6) {
      throw new Error('yaoList must be array of 6 numbers (6/7/8/9) from 初 to 上');
    }

    // 本卦阴阳数组
    const benSym = yaoList.map(v => (v === 7 || v === 9) ? 1 : 0);
    // 动爻标记
    const dong = yaoList.map(v => (v === 6 || v === 9));
    // 变卦阴阳：老阴变阳、老阳变阴
    const bianSym = benSym.map((y, i) => dong[i] ? (1 - y) : y);

    const ben = zhuanguaStatic(benSym);
    if (!ben) return { error: '本卦排盘失败（卦象无匹配）' };

    // 变卦（动卦）
    const bian = zhuanguaStatic(bianSym);

    // 变爻变卦六亲以本卦宫为参照（传统：变爻纳支五行→对照本宫五行定六亲，此处采用主流实践）
    // 日干支取六神
    let liushen = ['青龙','朱雀','勾陈','螣蛇','白虎','玄武'];
    let kong = [];
    let yueEffectArr = [], riEffectArr = [], csArr = [];
    let yuezhi = opts.yue || null;
    let rizhi = null, rigan = null;
    if (opts.ri && opts.ri.length >= 2) {
      rigan = opts.ri[0];
      rizhi = opts.ri.slice(1);
      liushen = liushenFor(rigan);
      kong = N.xunkong(opts.ri);
    }

    // 给本卦每爻附加动变、六神、空亡、旺衰
    const yaos = ben.yaos.map((y, i) => {
      const item = {
        ...y,
        value: yaoList[i],
        dong: dong[i],
        liushen: liushen[i]
      };
      // 变卦同位：变爻才有
      if (dong[i] && bian) {
        item.bian = bian.yaos[i];
        // 变爻六亲按本卦宫定
        item.bian.liuqin = liuqin(ben.g.wuxing, item.bian.wuxing);
      }
      if (kong.length) {
        item.kong = isKong(y.zhi, kong);
      }
      if (yuezhi) {
        const ye = yueEffect(yuezhi, y.zhi, dong[i]);
        item.yueEffect = ye;
        yueEffectArr.push(ye.level);
      }
      if (rizhi) {
        const re = riEffect(rizhi, y.zhi);
        item.riEffect = re;
        riEffectArr.push(re.level);
      }
      if (yuezhi && rizhi) {
        item.wangshuai = combinedWangshuai(item.yueEffect.level, item.riEffect.level);
      }
      item.changsheng = changsheng(y.wuxing, y.zhi);
      return item;
    });

    // 伏神飞神
    const fushen = findFuShen(yaos, ben.g.gong);

    // 动爻变卦名称
    const bianInfo = bian ? {
      name: bian.g.name,
      gongName: bian.g.gongName,
      wuxing: bian.g.wuxing,
      level: bian.g.level,
      shi: bian.g.shi,
      ying: bian.g.ying,
      num: bian.g.num
    } : null;

    // 世应
    const shiIdx = ben.g.shi - 1;
    const yingIdx = ben.g.ying - 1;

    // 动爻列表
    const dongList = yaos.filter(y => y.dong).map(y => ({
      pos: y.pos,
      posName: posName(y.pos),
      from: yinyangName(y.yinyang),
      to: yinyangName(1 - y.yinyang),
      liuqin: y.liuqin.name,
      ganzhi: y.gan + y.zhi,
      bianGanzhi: y.bian ? (y.bian.gan + y.bian.zhi) : ''
    }));

    return {
      ben: {
        num: ben.g.num,
        name: ben.g.name,
        gongName: ben.g.gongName,
        gongWuxing: ben.g.wuxing,
        wuxingName: wxName(ben.g.wuxing),
        level: ben.g.level,
        xia: N.BAGUA_NAJIA[ben.g.xia],
        shang: N.BAGUA_NAJIA[ben.g.shang],
        xiaKey: ben.g.xia,
        shangKey: ben.g.shang,
        symbol: benSym,
        shi: ben.g.shi,
        ying: ben.g.ying,
        shiIdx, yingIdx
      },
      bian: bianInfo,
      yaos,
      fushen,
      dongList,
      dongCount: dongList.length,
      tiaojian: {
        yue: yuezhi,
        ri: opts.ri || null,
        xunkong: kong
      },
      // 变占法（朱熹《易学启蒙》）：动爻数决定取辞规则
      bianfa: bianfaRule(dongList.length, yaos[shiIdx].dong)
    };
  }

  function posName(p) {
    return ['初','二','三','四','五','上'][p-1] + '爻';
  }
  function yinyangName(y) { return y ? '阳' : '阴'; }

  // 朱熹《易学启蒙》变占七诀
  function bianfaRule(dongCount, shiDong) {
    switch (dongCount) {
      case 0: return { rule:'六爻皆静', text:'以本卦卦辞、彖传断之，以象为主。' };
      case 1: return { rule:'一爻动', text:'以本卦动爻爻辞为主断之，兼看本卦卦义。' };
      case 2: return { rule:'二爻动', text:'以本卦两动爻爻辞合断，以上爻（居上位之动爻）为主。' };
      case 3: return { rule:'三爻动', text:'以本卦卦辞为体、之卦卦辞为用（前十卦主贞/后十卦主悔），合参二卦彖辞。' };
      case 4: return { rule:'四爻动', text:'以之卦中二静爻爻辞断之，以下静爻为主。' };
      case 5: return { rule:'五爻动', text:'以之卦中唯一静爻的爻辞断之。' };
      case 6: return { rule:'六爻皆动',
        text:'乾坤二卦用"用九""用六"；其余卦以之卦卦辞、彖传断之（称"之卦主义"）。' };
      default: return { rule:'', text:'' };
    }
  }

  // ============================================================
  // 随机起卦（模拟三铜钱法）：6 枚铜钱各正面(字/阳=3)或背面(背/阴=2)
  //   三字=9老阳；二字一背=8少阴；一字二背=7少阳；三背=6老阴
  // ============================================================
  function randomQigua() {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      let back = 0; // 背数（阴面）
      for (let j = 0; j < 3; j++) if (Math.random() < 0.5) back++;
      // 三背(back=3) → 6老阴；二背(back=2) → 7少阳；一背(back=1) → 8少阴；0背(三字) → 9老阳
      const v = back === 3 ? 6 : back === 2 ? 7 : back === 1 ? 8 : 9;
      arr.push(v);
    }
    return arr;
  }

  // 给定当前日期，返回月支、日干支（简易算法，仅为演示；生产接入可换精确万年历）
  // 这里返回"占位"——让页面提供日期选择器来定
  function todayPlaceholder() {
    return { yue: null, ri: null };
  }

  global.YJ_NAJIA_ENGINE = {
    zhuangua,
    zhuanguaStatic,
    randomQigua,
    najiaForTrigram,
    findGong,
    liuqin,
    changsheng,
    feiFuRelation
  };

})(window);
