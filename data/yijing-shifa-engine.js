/**
 * 易经筮法可计算演算器 (yijing-shifa-engine.js)
 * ---------------------------------------------
 * 纯 JavaScript，零外部依赖。
 * 提供三种筮法的完整演算函数：
 *   - dayan()    大衍揲蓍法：严格模拟分二、挂一、揲四、归奇三变，概率自然符合易理
 *   - tongqian() 铜钱摇卦法：三铜钱掷六次，概率符合火珠林
 *   - meihua()   梅花易数：按年月日时/数字/方位起卦，非随机
 *
 * 返回统一结构：
 * {
 *   method:'dayan'|'tongqian'|'meihua',
 *   yaos:[{shu:6-9, xiang:'laoyin'|'shaoyang'|..., dong:boolean, detail:{...}},...], // 6爻，自初至上
 *   ben:{idx,name,symbol,...},      // 本卦
 *   zhi:null | {...},               // 之卦（有动爻时）
 *   dongYaoIdx:[0-5,...],           // 动爻位置（0=初爻）
 *   trace:[...]                     // 演算全过程，供动画回放
 * }
 */
(function(){
  'use strict';

  const ONT = window.YJ_ONT || {};
  const SHUFA = (ONT.shifa && ONT.shifa.lexicon) || {};
  const SHUFA_METHODS = (ONT.shifa && ONT.shifa.methods) || {};

  // ---------- 工具函数 ----------
  function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function shuToXiang(shu){ return {6:'laoyin',7:'shaoyang',8:'shaoyin',9:'laoyang'}[shu]; }
  function shuToYao(shu){ return shu%2===1 ? 1 : 0; } // 1阳0阴（七九奇、六八偶）
  function shuToDong(shu){ return shu===6||shu===9; }

  // 八卦阴阳 → 卦名（按 下/上 卦取3爻，0阴1阳，初到上）
  const TRI_YINYANG_TO_NAME = {
    '111':'乾','011':'兑','101':'离','001':'震','110':'巽','010':'坎','100':'艮','000':'坤'
  };

  // 按阴阳数组（[初,二,三,四,五,上]，1阳0阴）查 64 卦
  function findGuaByYinYang(yinYangArr){
    const FULL = window.YJ_GUA_FULL || {};
    // 取上下卦（初-二-三 = 下卦；四-五-上 = 上卦）
    const xia = [yinYangArr[0],yinYangArr[1],yinYangArr[2]].join('');
    const shang= [yinYangArr[3],yinYangArr[4],yinYangArr[5]].join('');
    const xiaName = TRI_YINYANG_TO_NAME[xia];
    const shangName= TRI_YINYANG_TO_NAME[shang];
    // 在 FULL 对象中找 shang+xialower? 不对：卦名以"上下卦"命名组合，如"泰"=坤上乾下 → key 是"泰"
    // 所以要通过 gua 对象的 shang/xia 字段匹配
    for(const key in FULL){
      const g = FULL[key];
      if(g.shang===shangName && g.xia===xiaName){
        return Object.assign({idx:g.num-1, key}, g);
      }
    }
    return { name:'未知卦', symbol:'?', shang:shangName, xia:xiaName };
  }

  // 变卦：老阳变阴、老阴变阳
  function makeZhiGua(yinYangArr, dongIdx){
    const z = yinYangArr.slice();
    dongIdx.forEach(i=>{ z[i] = z[i]?0:1; });
    return findGuaByYinYang(z);
  }

  // ================================================================
  // 一、大衍揲蓍法（严格物理模拟，概率自然产生）
  // ================================================================
  /**
   * 模拟"一变"：输入当前策数 N，执行分二、挂一、揲四、归奇，返回
   * { left, right, gua, leftRem, rightRem, totalRem, remain }
   *   totalRem = 挂一 + 左余 + 右余（应是 5 或 9 第一变，4 或 8 第二、三变）
   *   remain   = 下一变使用的正策数 = N - totalRem
   */
  function oneBian(N, bianIdx, traceArr){
    // 分二：任意分左右，不得为0
    let left = randInt(1, N-1);
    let right = N - left;

    // 挂一（第一变必须挂一；二、三变按古法亦挂一，但亦有不挂者；这里取《本义》法，皆挂一）
    const gua = 1;
    right -= 1; // 从右手取一策挂扐

    // 揲四：四根一组数之，取余数（1-4；整除得4）
    let leftRem = left % 4; if(leftRem===0) leftRem=4;
    let rightRem = right % 4; if(rightRem===0) rightRem=4;

    const totalRem = gua + leftRem + rightRem;
    const remain = N - totalRem;

    traceArr.push({
      bian: bianIdx,
      before:N, left, right:right+gua,   // right+gua 还原分二时右手原数
      gua, leftRem, rightRem,
      totalRem, remain,
      // 余策判定：5/9 为多（大余），4/8 为少（小余）— 仅用于"三变定爻"口诀
      duo: (totalRem===9||totalRem===8) ? '多' : '少',
    });

    return remain;
  }

  /** 三变定一爻：返回 { shu, xiang, bianTrace } */
  function oneYao_dayan(yaoIdx){
    let N = 49;
    const bianTrace = [];
    N = oneBian(N, 1, bianTrace);
    N = oneBian(N, 2, bianTrace);
    N = oneBian(N, 3, bianTrace);
    const shu = N/4;  // 6/7/8/9
    return { shu, xiang:shuToXiang(shu), bianTrace };
  }

  /** 完整大衍筮法：十八变，六爻自初至上 */
  function dayan(){
    const trace = { method:'dayan', yaoBian:[] };
    const yaos=[]; const yinYang=[];
    for(let i=0;i<6;i++){
      const y = oneYao_dayan(i);
      trace.yaoBian.push(y.bianTrace);
      yaos.push({ shu:y.shu, xiang:y.xiang, dong:shuToDong(y.shu), yinYang:shuToYao(y.shu) });
      yinYang.push(shuToYao(y.shu));
    }
    const ben = findGuaByYinYang(yinYang);
    const dongIdx = yaos.map((y,i)=>y.dong?i:-1).filter(i=>i>=0);
    const zhi = dongIdx.length ? makeZhiGua(yinYang, dongIdx) : null;
    return _finalize('dayan', yaos, yinYang, ben, zhi, dongIdx, trace);
  }

  // ================================================================
  // 二、铜钱摇卦法
  // ================================================================
  /**
   * 一掷：3 枚铜钱，每枚 0=字(正面)、1=背(反面)，概率各 1/2 独立
   * 三字 (0,0,0) → 老阳9；三背 (1,1,1) → 老阴6
   * 两字一背 → 少阳7；两背一字 → 少阴8
   */
  function oneYao_tongqian(){
    const c1=randInt(0,1), c2=randInt(0,1), c3=randInt(0,1);
    const back = c1+c2+c3;
    let shu, xiang;
    if(back===0){ shu=9; xiang='laoyang'; }
    else if(back===1){ shu=7; xiang='shaoyang'; }
    else if(back===2){ shu=8; xiang='shaoyin'; }
    else { shu=6; xiang='laoyin'; }
    return { shu, xiang, coins:[c1,c2,c3], backSum:back, dong:shuToDong(shu), yinYang:shuToYao(shu) };
  }

  function tongqian(){
    const trace = { method:'tongqian', yaoZhi:[] };
    const yaos=[]; const yinYang=[];
    for(let i=0;i<6;i++){
      const y = oneYao_tongqian();
      trace.yaoZhi.push(y);
      yaos.push(y);
      yinYang.push(y.yinYang);
    }
    const ben = findGuaByYinYang(yinYang);
    const dongIdx = yaos.map((y,i)=>y.dong?i:-1).filter(i=>i>=0);
    const zhi = dongIdx.length ? makeZhiGua(yinYang, dongIdx) : null;
    return _finalize('tongqian', yaos, yinYang, ben, zhi, dongIdx, trace);
  }

  // ================================================================
  // 三、梅花易数（以年月日时起卦为例）
  // ================================================================
  /**
   * 时间起卦：
   *  上卦 = (年+月+日) mod 8（0→坤8）
   *  下卦 = (年+月+日+时) mod 8
   *  动爻 = (年+月+日+时) mod 6（0→上爻6）
   * 年支数：子1丑2寅3卯4辰5巳6午7未8申9酉10戌11亥12
   * 月：农历1-12；日：农历1-30；时：子1…亥12
   * 如用户不传时间，用当前公历时间近似（仅用于演示）
   */
  function meihua(opts){
    opts = opts||{};
    let {year,month,day,hour} = opts;
    const d = new Date();
    // 公历年支近似（仅演示用；专业应用应传农历）：年支 = (year-4) mod 12
    if(year===undefined){
      year = ((d.getFullYear()-4)%12); if(year<=0) year+=12;
    }
    month = month!==undefined ? month : d.getMonth()+1;
    day   = day!==undefined ? day   : d.getDate();
    hour  = hour!==undefined ? hour  : (Math.floor((d.getHours()+1)/2)||12); // 粗转时辰

    const s = year+month+day, st = s+hour;
    let up = s%8, down = st%8, dong = st%6;
    if(up===0) up=8; if(down===0) down=8;
    if(dong===0) dong=6; // 动爻 1-6
    const upName = SHUFA.xiantianShu[String(up)];
    const downName = SHUFA.xiantianShu[String(down)];

    // 构建 6 爻（先找上下卦对应的 3 爻）
    const triMap = {
      '乾':[1,1,1], '兑':[1,1,0], '离':[1,0,1], '震':[1,0,0],
      '巽':[0,1,1], '坎':[0,1,0], '艮':[0,0,1], '坤':[0,0,0],
    };
    const downYao = triMap[downName] || [0,0,0]; // 下卦=初二三
    const upYao   = triMap[upName]   || [0,0,0]; // 上卦=四五上
    // 爻数组 [初,二,三,四,五,上] 全为静（七/八），仅动爻位动（九/六）
    const yinYang = downYao.concat(upYao);
    const yaos = yinYang.map((yy,i)=>{
      const isDong = (i+1)===dong; // i 0-based → 1-based
      let shu;
      if(yy===1) shu = isDong?9:7; // 阳爻：动则9老阳，静则7少阳
      else       shu = isDong?6:8; // 阴爻：动则6老阴，静则8少阴
      return { shu, xiang:shuToXiang(shu), dong:isDong, yinYang:yy };
    });
    const dongIdx = [dong-1];
    const ben = findGuaByYinYang(yinYang);
    const zhi = makeZhiGua(yinYang, dongIdx);
    const trace = { method:'meihua', year,month,day,hour, upShu:up, downShu:down, dongShu:dong, upName, downName };
    return _finalize('meihua', yaos, yinYang, ben, zhi, dongIdx, trace);
  }

  // ================================================================
  // 结果整理（卦辞/爻辞/彖象/动爻解读均从本体数据读取）
  // ================================================================
  function _finalize(method, yaos, yinYang, ben, zhi, dongIdx, trace){
    const FULL = window.YJ_GUA_FULL || [];
    function attachGuaData(g){
      if(!g || g.idx===undefined) return g;
      const src = FULL[g.idx];
      if(!src) return g;
      return Object.assign({}, src, g);
    }
    const benFull = attachGuaData(ben);
    const zhiFull = zhi ? attachGuaData(zhi) : null;

    // 为每个动爻挂上爻辞、象传
    const yaoList = (benFull && benFull.yao) || (benFull && benFull.yaos) || [];
    const dongYaoData = dongIdx.map(i=>{
      const yIdx = i;  // 0=初,5=上
      const yaoPosName = ['初','二','三','四','五','上'][yIdx];
      // 从本卦 yao 数组找对应爻（乾坤有"用九/用六"，要按前6主爻取）
      let yaoCi = yaoList[yIdx];
      // 若 yaoList 第 7 位是"用九/用六"，yIdx=5 是上爻，正好对应
      if(!yaoCi){
        yaoCi = yaoList.find(y=>y.pos && y.pos.startsWith(yaoPosName));
      }
      return { pos:yIdx, posName:yaoPosName, yao:yaos[i], yaoCi };
    });

    return {
      method,
      yaos, yinYang,
      ben: benFull,
      zhi: zhiFull,
      dongYaoIdx: dongIdx,
      dongYao: dongYaoData,
      trace,
      // 断卦要点：朱熹"变占法"
      zhanfa: zhanfaHint(dongIdx.length),
    };
  }

  // 朱熹《易学启蒙》变占法七诀
  function zhanfaHint(dongN){
    const HINTS = [
      { n:0, text:'六爻皆静：以本卦卦辞、彖传断之。' },
      { n:1, text:'一爻动：以本卦动爻爻辞为主断之。' },
      { n:2, text:'二爻动：以本卦二动爻爻辞合断，以上爻为主。' },
      { n:3, text:'三爻动：以本卦卦辞与之卦卦辞合断，以本卦为贞、之卦为悔。' },
      { n:4, text:'四爻动：以之卦二静爻爻辞断之，以下爻为主。' },
      { n:5, text:'五爻动：以之卦一静爻爻辞断之。' },
      { n:6, text:'六爻皆动：乾坤以"用九""用六"断；余卦以之卦卦辞断之。' },
    ];
    return HINTS[dongN] || HINTS[0];
  }

  // ================================================================
  // 对外 API
  // ================================================================
  window.YJ_SHIFA = {
    dayan,
    tongqian,
    meihua,
    // 工具方法暴露（给页面动画用）
    oneBian,
    shuToXiang,
    shuToYao,
    shuToDong,
    findGuaByYinYang,
    zhanfaHint,
    version:'1.0.0',
  };
})();
