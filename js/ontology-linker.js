/**
 * 《易经》本体双向关联模块（ontology-linker）
 * 依赖：yijing-ontology.js → gua-full-data.js → yijing-ontology-enhance.js → 本文件
 *
 * 提供：
 *   1. YJ_Link.ent(text,type,id)      生成可点击实体标签（含悬浮提示）
 *   2. YJ_Link.decorate(root)         扫描正文，自动把本体实体标注为可点击标签
 *   3. YJ_Link.rels(id) / relsHTML(id) 取某实体的正向 + 反向关系
 *   4. YJ_Link.loadYaoAnnotations()   按需拉取某卦逐爻的历代注家注解
 *   5. YJ_Link.topbar / sidebar / footer / initMobile  全站外壳
 */
(function(){
  'use strict';
  var YJ = window.YJ_ONT || {};
  var GF = window.YJ_GUA_FULL || {};

  /* ================= 实体集合 ================= */
  function coll(type){
    switch(type){
      case 'gua':    return YJ.liushisigua || [];
      case 'bagua':  return YJ.bagua || [];
      case 'yao':    return YJ.yao || [];
      case 'zhujia': return YJ.zhujia || [];
      case 'zhuben': return YJ.zhuben || [];
      case 'liupai': return YJ.liupai || [];
      case 'yitu':   return YJ.yitu || [];
      case 'shiyi':  return YJ.shiyi || [];
      case 'event':  return YJ.events || [];
    }
    return [];
  }

  function findEntity(type, idOrName){
    if(!idOrName) return null;
    var arr = coll(type);
    for(var i=0;i<arr.length;i++){
      var x = arr[i];
      if(x.id === idOrName || x.name === idOrName) return x;
    }
    return null;
  }

  /* ================= 页面路由表 ================= */
  var PAGE_MAP = {
    gua:    function(id){ return 'gua.html#' + id; },
    yao:    function(id){ var g=id.split('_y')[0]; return 'gua.html#' + g + '~' + id; },
    bagua:  function(id){ return 'gua.html#' + id; },
    zhujia: function(id){ return 'yanjiu.html#' + id; },
    zhuben: function(id){ return 'reader.html#' + id; },
    liupai: function(id){ return 'yanjiu.html#' + id; },
    yitu:   function(id){ return 'yitu.html#' + id; },
    shiyi:  function(id){ return 'shiyi.html#' + id; },
    event:  function(id){ return 'index.html#chuan'; }
  };

  /* ================= 反向关系索引 ================= */
  var invMap = {};
  var invBuilt = false;
  function buildInverseIndex(){
    invMap = {};
    var relDefs = YJ.relations || {};
    function walk(obj){
      if(!obj || typeof obj !== 'object') return;
      if(Array.isArray(obj)){ obj.forEach(walk); return; }
      Object.keys(obj).forEach(function(key){
        var rel = relDefs[key];
        if(!rel) return;
        var targets = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
        targets.forEach(function(t){
          var tid = (typeof t === 'string') ? t : (t && t.id);
          if(!tid) return;
          (invMap[tid] = invMap[tid] || []).push({ pred: rel.label || key, predId: key, subj: obj });
        });
      });
    }
    ['bagua','liushisigua','yao','zhujia','zhuben','liupai','yitu','shiyi'].forEach(function(k){
      var arr = YJ[k];
      if(Array.isArray(arr)) arr.forEach(walk);
    });
    invBuilt = true;
  }
  function getRelations(id){
    if(!invBuilt) buildInverseIndex();
    return invMap[id] || [];
  }

  /* ================= 关系渲染 ================= */
  function guessTypeOf(obj){
    if(!obj) return 'gua';
    var id = obj.id || '';
    if(/^g\d/.test(id)) return obj.guaId ? 'yao' : 'gua';
    if(/^gua_/.test(id)) return 'bagua';
    if(/^zj_/.test(id)) return 'zhujia';
    if(/^zb_/.test(id)) return 'zhuben';
    if(/^lp_/.test(id)) return 'liupai';
    if(/^tu_/.test(id)) return 'yitu';
    if(/^zy_/.test(id)) return 'shiyi';
    if(obj.pian || obj.juan) return 'shiyi';
    if(obj.school && obj.desc) return 'zhujia';
    if(obj.author) return 'zhuben';
    return 'gua';
  }

  function relsHTML(id, opts){
    opts = opts || {};
    var rels = getRelations(id);
    if(!rels.length) return opts.empty === false ? '' :
      '<div class="rel-list"><div class="rel-line" style="opacity:.6;">暂无已登记的本体关联</div></div>';
    var groups = {};
    rels.forEach(function(r){
      var k = r.pred;
      (groups[k] = groups[k] || []).push(r);
    });
    var html = '<div class="rel-list">';
    Object.keys(groups).forEach(function(k){
      var seen = {};
      var items = [];
      groups[k].forEach(function(r){
        var name = r.subj.name || r.subj.id;
        if(!name || seen[name + r.predId]) return;
        seen[name + r.predId] = 1;
        var t = guessTypeOf(r.subj);
        items.push('<a href="' + (PAGE_MAP[t] || function(){return '#';})(r.subj.id) +
                   '" class="ent" data-type="' + t + '" data-id="' + r.subj.id + '">' + name + '</a>');
      });
      if(!items.length) return;
      html += '<div class="rel-line"><span class="rel-pred">' + k + '</span>' + items.join('、') + '</div>';
    });
    html += '</div>';
    return html;
  }

  function entityDesc(type, ent, id){
    if(type === 'yao'){
      var y = ent || YJ.findYao && YJ.findYao(id);
      if(y) return (y.guaName || '') + '卦 · ' + y.pos + ' · ' + (y.text || '').slice(0, 12);
      return '爻';
    }
    if(!ent) return '';
    switch(type){
      case 'gua':    return (ent.name || '') + '卦 · ' + (ent.shang || '') + '上' + (ent.xia || '') + '下';
      case 'bagua':  return (ent.name || '') + ' · ' + (ent.ziran || '') + ' · ' + (ent.nature || '');
      case 'zhujia': return (ent.era || ent.dynasty || '') + ' · ' + (ent.school || '易学家');
      case 'zhuben': return (ent.author || '') + '著 · ' + (ent.dynasty || '');
      case 'liupai': return ent.desc || ent.name || '';
      case 'yitu':   return ent.desc || ent.name || '';
      case 'shiyi':  return '易传 · ' + (ent.name || '');
      case 'event':  return ent.content || ent.event || '';
    }
    return '';
  }

  function entTag(text, type, idOrName){
    var id = idOrName || text;
    var ent = findEntity(type, id);
    if(ent && ent.id) id = ent.id;
    var desc = entityDesc(type, ent, id);
    var rels = getRelations(id);
    var pop = desc || '';
    if(rels.length) pop += (pop ? ' · ' : '') + '关联 ' + rels.length + ' 条';
    var href = (PAGE_MAP[type] || function(){ return '#'; })(id);
    return '<a href="' + href + '" class="ent" data-type="' + type + '" data-id="' + id + '">' +
           text + (pop ? '<span class="ent-pop">' + pop + '</span>' : '') + '</a>';
  }

  /* ================= 正文自动实体标注 ================= */
  var ESC = function(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };

  function buildNameIndex(){
    var idx = {};
    function put(name, type, id){
      if(!name || name.length < 2) return;
      if(!idx[name]) idx[name] = { type: type, id: id };
    }
    // 六十四卦：二字以上卦名可裸匹配；单字卦名须带“卦”字
    (YJ.liushisigua || []).forEach(function(g){
      if(g.name.length >= 2) put(g.name, 'gua', g.id);
      put(g.name + '卦', 'gua', g.id);
    });
    // 注家
    (YJ.zhujia || []).forEach(function(z){ put(z.name, 'zhujia', z.id); });
    // 流派
    (YJ.liupai || []).forEach(function(s){ put(s.name, 'liupai', s.id); });
    // 易图（取常用简称）
    var SHORT_YITU = { '河图':'tu_hetu','洛书':'tu_luoshu','太极图':'tu_taiji',
                       '先天八卦':'tu_xiantian','后天八卦':'tu_houtian','方圆图':'tu_64guafang' };
    Object.keys(SHORT_YITU).forEach(function(k){ put(k, 'yitu', SHORT_YITU[k]); });
    // 十翼
    var SHORT_SHiyi = { '彖传':'zy_tuan_shang','象传':'zy_xiang_shang','系辞传':'zy_xici_shang',
                        '系辞':'zy_xici_shang','文言传':'zy_wenyan','说卦传':'zy_shuogua',
                        '序卦传':'zy_xugua','杂卦传':'zy_zagua' };
    Object.keys(SHORT_SHiyi).forEach(function(k){ put(k, 'shiyi', SHORT_SHiyi[k]); });
    return idx;
  }

  function decorate(root){
    root = root || document.querySelector('.content') || document.body;
    if(!root) return 0;
    var idx = buildNameIndex();
    var names = Object.keys(idx);
    if(!names.length) return 0;
    names.sort(function(a, b){ return b.length - a.length; });
    var re = new RegExp('(' + names.map(ESC).join('|') + ')', 'g');

    var counts = {}, MAX = 3, total = 0;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        var t = node.nodeValue;
        if(!t || !/\S/.test(t)) return NodeFilter.FILTER_REJECT;
        var p = node.parentNode;
        while(p && p.nodeType === 1 && p !== root.parentNode){
          var tag = p.nodeName.toLowerCase();
          if(tag === 'a' || tag === 'script' || tag === 'style' || tag === 'code' || tag === 'pre' || tag === 'textarea')
            return NodeFilter.FILTER_REJECT;
          if(p.classList && (p.classList.contains('ent') || p.classList.contains('no-ont')))
            return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function(node){
      var text = node.nodeValue;
      re.lastIndex = 0;
      if(!re.test(text)) return;
      re.lastIndex = 0;
      var frag = document.createDocumentFragment();
      var last = 0, m, changed = false;
      while((m = re.exec(text))){
        var name = m[1], ent = idx[name];
        if((counts[ent.id] || 0) >= MAX) continue;
        counts[ent.id] = (counts[ent.id] || 0) + 1;
        if(m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var a = document.createElement('a');
        a.href = (PAGE_MAP[ent.type] || function(){ return '#'; })(ent.id);
        a.className = 'ent';
        a.setAttribute('data-type', ent.type);
        a.setAttribute('data-id', ent.id);
        a.textContent = name;
        var e2 = findEntity(ent.type, ent.id);
        var pop = entityDesc(ent.type, e2, ent.id);
        var rels = getRelations(ent.id);
        if(rels.length) pop += (pop ? ' · ' : '') + '关联 ' + rels.length + ' 条';
        if(pop){
          var sp = document.createElement('span');
          sp.className = 'ent-pop';
          sp.textContent = pop;
          a.appendChild(sp);
        }
        frag.appendChild(a);
        last = m.index + name.length;
        changed = true;
      }
      if(!changed) return;
      if(last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
      total++;
    });
    return total;
  }

  /* ================= 逐爻注家注解（按需加载）================= */
  var annoCache = {};
  function loadYaoAnnotations(guaName, cb){
    if(annoCache[guaName]){ cb(annoCache[guaName]); return; }
    fetch('data/gua/' + encodeURIComponent(guaName) + '.json', { cache: 'force-cache' })
      .then(function(r){ return r.json(); })
      .then(function(j){
        var buckets = [], heads = [], cur = null;
        var lines = (j && j.jijie && j.jijie.lines) || [];
        lines.forEach(function(l){
          if(l.k === 'text'){ cur = { text: l.t || '', notes: [] }; buckets.push(cur); }
          else if(l.k === 'note'){
            var rec = { src: l.s || '', text: l.t || '' };
            if(cur) cur.notes.push(rec); else heads.push(rec);
          }
        });
        var out = { buckets: buckets, heads: heads, raw: j };
        annoCache[guaName] = out;
        cb(out);
      })
      .catch(function(){ cb({ buckets: [], heads: [], raw: null }); });
  }

  // 把某爻与汇评分桶匹配
  function matchYaoBucket(anno, yao){
    if(!anno || !anno.buckets) return null;
    var core = (yao.text || '').replace(/[。．.，,：:；;\s]/g, '');
    if(core){
      var byCore = anno.buckets.filter(function(b){
        return (b.text || '').replace(/[。．.，,：:；;\s]/g, '').indexOf(core) >= 0;
      });
      if(byCore.length) return byCore[0];
    }
    var byPos = anno.buckets.filter(function(b){ return (b.text || '').indexOf(yao.pos) === 0 || (b.text||'').indexOf(yao.pos + '：') === 0; });
    return byPos[0] || null;
  }

  /* ================= 全站外壳 ================= */
  var NAV_PAGES = [
    { id:'home',    label:'本经大义', href:'index.html',   icon:'☯' },
    { id:'gua',     label:'六十四卦', href:'gua.html',     icon:'䷀' },
    { id:'reader',  label:'经文汇评', href:'reader.html',  icon:'書' },
    { id:'shiyi',   label:'十翼易传', href:'shiyi.html',   icon:'傳' },
    { id:'yitu',    label:'易图图说', href:'yitu.html',    icon:'圖' },
    { id:'bianhua', label:'卦变推演', href:'bianhua.html', icon:'變' },
    { id:'shifa',   label:'筮法占筮', href:'shifa.html',   icon:'筮' },
    { id:'yanjiu',  label:'历代注疏', href:'yanjiu.html',  icon:'注' },
    { id:'anim',    label:'卦象动画', href:'animation/gua-index.html', icon:'影' }
  ];
  var TOP_PAGES = [
    { id:'home',   label:'首页',    href:'index.html' },
    { id:'gua',    label:'六十四卦', href:'gua.html' },
    { id:'reader', label:'经文',    href:'reader.html' },
    { id:'shifa',  label:'筮法',    href:'shifa.html' },
    { id:'yanjiu', label:'注疏',    href:'yanjiu.html' },
    { id:'anim',   label:'动画',    href:'animation/gua-index.html' }
  ];

  function buildSidebar(activePage){
    var guas = YJ.liushisigua || [];
    var shang = guas.filter(function(g){ return g.jing === '上经'; }).slice(0, 15);
    var xia   = guas.filter(function(g){ return g.jing === '下经'; }).slice(0, 8);
    var bagua = YJ.bagua || [];
    return '' +
      '<div class="sidebar" id="sidebar">' +
        '<div class="sidebar-section"><div class="sidebar-title">本体导航</div>' +
          NAV_PAGES.map(function(p){
            return '<a href="' + p.href + '" class="' + (activePage === p.id ? 'on' : '') + '">' +
                   '<span style="margin-right:8px;color:var(--gold);">' + p.icon + '</span>' + p.label + '</a>';
          }).join('') +
        '</div>' +
        '<div class="sidebar-section"><div class="sidebar-title">八卦</div>' +
          bagua.map(function(g){
            return '<a href="gua.html#' + g.id + '"><span style="float:right;color:var(--zhu);">' + g.symbol + '</span>' +
                   g.name + '（' + g.ziran + '）</a>';
          }).join('') +
        '</div>' +
        '<div class="sidebar-section"><div class="sidebar-title">上经</div>' +
          shang.map(function(g){
            return '<a href="gua.html#' + g.id + '"><span style="float:right;">' + g.symbol + '</span>' +
                   g.num + '. ' + g.name + '</a>';
          }).join('') +
        '</div>' +
        '<div class="sidebar-section"><div class="sidebar-title">下经</div>' +
          xia.map(function(g){
            return '<a href="gua.html#' + g.id + '"><span style="float:right;">' + g.symbol + '</span>' +
                   g.num + '. ' + g.name + '</a>';
          }).join('') +
          '<a href="gua.html" style="color:var(--gold);font-size:12px;">查看全部 64 卦 →</a>' +
        '</div>' +
      '</div>';
  }

  function buildTopbar(activePage){
    return '' +
      '<nav class="topbar">' +
        '<a class="logo" href="index.html"><span class="taiji">☯</span>' +
          '<span>易经本体论<small class="en">· Yijing Ontology</small></span></a>' +
        '<button class="menu-toggle" id="menuToggle" aria-label="菜单">☰</button>' +
        '<div class="nav-links" id="navLinks">' +
          TOP_PAGES.map(function(p){
            return '<a href="' + p.href + '" class="' + (activePage === p.id ? 'active' : '') + '">' + p.label + '</a>';
          }).join('') +
          '<a href="shifa.html" class="nav-cta">起卦</a>' +
        '</div>' +
      '</nav>';
  }

  function buildFooter(){
    var st = YJ.stats || {};
    return '<footer class="footer">' +
      '<div style="margin-bottom:6px;">易经本体论 · The Book of Changes Ontology</div>' +
      '<div style="font-size:11px;opacity:.6;letter-spacing:1px;">本体驱动 · 数字人文 · 以易解易 · ' +
        (st.gua || 64) + '卦 ' + (st.yao || 384) + '爻 ' + (st.triples || '') + '三元组</div>' +
      '</footer>';
  }

  function initMobile(){
    var tog = document.getElementById('menuToggle');
    var nav = document.getElementById('navLinks');
    if(tog && nav && !tog.__bound){
      tog.__bound = true;
      tog.addEventListener('click', function(){ nav.classList.toggle('mobile-open'); });
    }
    var sb = document.getElementById('sidebar');
    if(window.innerWidth <= 1024 && sb && !document.getElementById('yj-sb-btn')){
      var btn = document.createElement('button');
      btn.id = 'yj-sb-btn';
      btn.textContent = '☰';
      btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:46px;height:46px;border-radius:50%;background:var(--zhu);color:#fff;border:none;font-size:20px;box-shadow:var(--shadow-lg);z-index:1100;cursor:pointer;';
      btn.addEventListener('click', function(){ sb.classList.toggle('mobile-open'); });
      document.body.appendChild(btn);
    }
  }

  /* ================= 导出 ================= */
  window.YJ_Link = {
    ent: entTag,
    rels: getRelations,
    renderRels: relsHTML,
    relsHTML: relsHTML,
    find: findEntity,
    typeOf: guessTypeOf,
    decorate: decorate,
    sidebar: buildSidebar,
    topbar: buildTopbar,
    footer: buildFooter,
    initMobile: initMobile,
    buildIndex: buildInverseIndex,
    loadYaoAnnotations: loadYaoAnnotations,
    matchYaoBucket: matchYaoBucket,
    PAGE_MAP: PAGE_MAP
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ buildInverseIndex(); initMobile(); });
  }else{
    buildInverseIndex();
    setTimeout(initMobile, 0);
  }
})();
