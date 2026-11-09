/* ============================================================
   《易经》本体论 · 本体增强模块（ontology-enhance）
   加载顺序：yijing-ontology.js → gua-full-data.js → 本文件 → ontology-linker.js

   职责：
     1. 兼容别名：把历史页面使用的驼峰键（LiuShiSiGua / BaGuaMap / ShiYi …）
        指回本体真实键，避免消费方读到 undefined。
     2. 经文补全：以 gua-full-data 补全 64 卦（卦辞白话 / 彖 / 象 / 文言 / 序卦），
        摘除早期骨架留下的 _incomplete 标记，实现"单一数据来源"。
     3. 爻实例化：将 384 爻（另含乾坤「用九 / 用六」）提升为独立本体实例
        YJ_ONT.yao，带 id / 所属卦 / 爻位 / 阴阳 / 爻辞 / 小象 / 白话，
        支持逐爻下钻。
     4. 双向关系：建立 卦↔爻、十翼↔卦、十翼↔爻 的双向谓词，注册关系定义，
        追加三元组并统计。
   ============================================================ */
(function(){
  'use strict';
  var O = window.YJ_ONT;
  if(!O){ console.warn('[ontology-enhance] YJ_ONT 未加载，跳过增强'); return; }
  if(O.__enhanced) return;
  O.__enhanced = true;

  var GF = window.YJ_GUA_FULL || {};

  /* ---------- 1. 兼容别名 ---------- */
  var ALIAS = {
    LiuShiSiGua:'liushisigua', BaGuaMap:'baguaMap', GuaMap:'guaMap',
    ShiYi:'shiyi', ZhuJia:'zhujia', ZhuJiaMap:'zhujiaMap', ZhuBen:'zhuben',
    LiuPai:'liupai', YiTu:'yitu', Events:'events', Relations:'relations',
    YaoWeiAttr:'yaoWeiAttr', Meta:'meta', Bagua:'bagua', Core:'core',
    YiZhuanTexts:'yizhuanTexts', Tiples:'triples', Triples:'triples'
  };
  Object.keys(ALIAS).forEach(function(k){
    if(O[ALIAS[k]]!==undefined && O[k]===undefined) O[k] = O[ALIAS[k]];
  });

  var guas = O.liushisigua || [];

  /* ---------- 2. 经文补全（单一数据来源：gua-full-data 覆盖注入） ---------- */
  var byName = {};
  guas.forEach(function(g){ byName[g.name] = g; });

  Object.keys(GF).forEach(function(name){
    var g = byName[name], f = GF[name];
    if(!g || !f) return;
    g.guaci    = g.guaci    || f.guaci;
    g.guaciBai = g.guaciBai || f.guaciBai;
    g.tuan     = g.tuan     || f.tuan;
    g.xiang    = g.xiang    || f.xiang;
    if(f.wenyan && !g.wenyan) g.wenyan = f.wenyan;
    if(f.xugua  && !g.xugua ) g.xugua  = f.xugua;
    delete g._incomplete;
    // 爻白话补全
    (g.yao || []).forEach(function(y, i){
      var fy = (f.yao || [])[i];
      if(!fy) return;
      if(!y.bai  && fy.bai ) y.bai  = fy.bai;
      if(!y.text && fy.text) y.text = fy.text;
    });
  });

  /* ---------- 3. 爻实例化 ---------- */
  var yaoArr  = [];
  var yaoMap  = {};
  var yaoByGua = {};

  function mkYao(g, obj, idx, isYong){
    var id = isYong ? (g.id + '_yong') : (g.id + '_y' + idx);
    var w = (O.yaoWeiAttr || {})[['chu','er','san','si','wu','shang'][idx-1]] || {};
    var yao = {
      id: id,
      guaId: g.id,
      guaName: g.name,
      num: idx,
      pos: obj.pos,
      yinYang: obj.yinYang || (obj.pos && obj.pos.indexOf('九') >= 0 ? '阳' : '阴'),
      text: obj.text || '',
      xiaoxiang: obj.xiaoxiang || '',
      bai: obj.bai || obj.explain || '',
      wei: w.name || '',
      weiDesc: w.comment || w.desc || '',
      isYong: !!isYong,
      type: 'yao'
    };
    yaoArr.push(yao);
    yaoMap[id] = yao;
    (yaoByGua[g.id] = yaoByGua[g.id] || []).push(id);
    // 回写原文对象，便于既有渲染直接取用
    obj.id = id;
    return yao;
  }

  guas.forEach(function(g){
    (g.yao || []).forEach(function(y, i){ mkYao(g, y, i+1, false); });
    if(g.yong){
      var m = /^(用[九六])[：:]\s*(.*)$/.exec(g.yong);
      mkYao(g, { pos: m ? m[1] : '用九', yinYang: (g.name === '坤' ? '阴' : '阳'),
                 text: m ? m[2] : g.yong, xiaoxiang: '', bai: '' }, 7, true);
    }
    // 卦 → 爻 正向关系
    g.hanYou = (yaoByGua[g.id] || []).slice();
  });

  O.yao      = yaoArr;
  O.yaoMap   = yaoMap;
  O.yaoByGua = yaoByGua;

  /* ---------- 4. 十翼 ↔ 卦 / 爻 双向关系 ---------- */
  // 关系谓词定义（含反向）
  O.relations = O.relations || {};
  function rel(id, label, inverse){
    O.relations[id] = O.relations[id] || { id: id, label: label, inverse: inverse };
    if(!O.relations[id].inverse) O.relations[id].inverse = inverse;
  }
  rel('hanYou',   '含爻',   'shuYuGua');
  rel('shuYuGua', '属于卦', 'hanYou');
  rel('jieShi',   '诠释',   'jieShiYu');
  rel('jieShiYu', '诠释于', 'jieShi');

  var shiyi = O.shiyi || [];
  var shiyiMap = {};
  shiyi.forEach(function(s){ shiyiMap[s.id] = s; });

  function makeYaoFor(g){ return yaoByGua[g.id] || []; }

  // 彖传 / 象传 分上下经；文言传 专释乾坤
  var TUAN_SHANG = 'zy_tuan_shang', TUAN_XIA = 'zy_tuan_xia';
  var XIANG_SHANG = 'zy_xiang_shang', XIANG_XIA = 'zy_xiang_xia';
  var WENYAN = 'zy_wenyan';

  function pushUnique(arr, v){ if(arr.indexOf(v) < 0) arr.push(v); }

  guas.forEach(function(g){
    var isShang = (g.jing === '上经');
    var tuanId  = isShang ? TUAN_SHANG : TUAN_XIA;
    var xiangId = isShang ? XIANG_SHANG : XIANG_XIA;

    [tuanId, xiangId].forEach(function(sid){
      var s = shiyiMap[sid];
      if(!s) return;
      s.jieShi = s.jieShi || [];
      pushUnique(s.jieShi, g.id);
    });

    // 象传下的小象，逐爻诠释
    var xiangObj = shiyiMap[xiangId];
    if(xiangObj){
      xiangObj.jieShi = xiangObj.jieShi || [];
      makeYaoFor(g).forEach(function(yid){ pushUnique(xiangObj.jieShi, yid); });
    }

    // 文言传专释乾坤
    if(g.name === '乾' || g.name === '坤'){
      var w = shiyiMap[WENYAN];
      if(w){
        w.jieShi = w.jieShi || [];
        pushUnique(w.jieShi, g.id);
        makeYaoFor(g).forEach(function(yid){ pushUnique(w.jieShi, yid); });
      }
    }
  });

  /* ---------- 5. 追加三元组 + 统计 ---------- */
  var triples = O.triples || (O.triples = []);
  var haveTriple = {};
  triples.forEach(function(t){ haveTriple[t.subject + '|' + t.predicate + '|' + t.object] = 1; });
  function addTriple(s, p, o){
    var k = s + '|' + p + '|' + o;
    if(haveTriple[k]) return;
    haveTriple[k] = 1;
    triples.push({ subject: s, predicate: p, object: o });
  }

  guas.forEach(function(g){
    makeYaoFor(g).forEach(function(yid){
      addTriple(g.id, 'hanYou', yid);
      addTriple(yid, 'shuYuGua', g.id);
    });
  });
  shiyi.forEach(function(s){
    (s.jieShi || []).forEach(function(tid){ addTriple(s.id, 'jieShi', tid); });
  });

  O.stats = {
    bagua: (O.bagua || []).length,
    gua: guas.length,
    yao: yaoArr.length,
    shiyi: shiyi.length,
    yitu: (O.yitu || []).length,
    zhujia: (O.zhujia || []).length,
    zhuben: (O.zhuben || []).length,
    liupai: (O.liupai || []).length,
    events: (O.events || []).length,
    triples: triples.length,
    predicates: Object.keys(O.relations || {}).length
  };

  // 供页面读取：获取某卦的爻实例
  O.getYaoOfGua = function(guaId){ return (yaoByGua[guaId] || []).map(function(id){ return yaoMap[id]; }); };
  O.findYao = function(id){ return yaoMap[id] || null; };
})();
