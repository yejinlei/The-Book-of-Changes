/**
 * 《易经》本体双向关联模块
 * 功能：
 *  1. 提供 ent() 方法生成可点击的实体标签（带悬浮提示）
 *  2. 构建反向关系索引（inverse map）
 *  3. 页面加载后扫描正文，为实体关键字自动加标签（可选）
 *  4. 提供实体详情弹窗 / 跳转
 */
(function(){
  'use strict';
  const YJ = window.YJ_ONT || {};
  const GF = window.YJ_GUA_FULL || {};

  // ===== 反向关系索引构建 =====
  const invMap = {}; // invMap[objId] = [{pred:'注释',subj:instance},...]
  function ensureInv(id){ if(!invMap[id]) invMap[id]=[]; return invMap[id]; }

  function buildInverseIndex(){
    // 1) 从 Triples 数组（RDF 风格三元组）批量读取
    const triples = YJ.triples || [];
    triples.forEach(t=>{
      if(!Array.isArray(t)||t.length<3) return;
      const rel = (YJ.relations||{})[t[1]];
      ensureInv(t[2]).push({pred:rel?rel.label:t[1], predId:t[1], subj:{id:t[0],name:t[0]}});
    });
    // 2) 遍历实体集合上的已知语义字段，补全常用反向关系
    function proc(obj){
      if(!obj||!obj.id) return;
      if(obj.shang && YJ.baguaMap && YJ.baguaMap[obj.shang]){
        const bg=YJ.baguaMap[obj.shang];
        ensureInv(bg.id).push({pred:'重卦为',predId:'chongGua',subj:obj});
      }
      if(obj.xia && YJ.baguaMap && YJ.baguaMap[obj.xia]){
        const bg=YJ.baguaMap[obj.xia];
        ensureInv(bg.id).push({pred:'重卦为',predId:'chongGua',subj:obj});
      }
      if(Array.isArray(obj.yao)){
        obj.yao.forEach((y,i)=>{
          // 注意：爻目前没独立实例化，暂不写入反向
        });
      }
      if(obj.masterpiece){
        const zb=(YJ.zhuben||[]).find(z=>z.name===obj.masterpiece);
        if(zb) ensureInv(zb.id).push({pred:'作者',predId:'zuoZhe',subj:obj});
      }
    }
    [YJ.bagua,YJ.liushisigua,YJ.zhujia,YJ.zhuben,YJ.liupai,YJ.yitu,YJ.shiyi]
      .forEach(arr=>Array.isArray(arr)&&arr.forEach(proc));
  }

  // ===== 页面注册表：实体 -> 对应页面URL =====
  const PAGE_MAP = {
    gua:    (id)=>'gua.html#'+id,
    yao:    (id)=>'gua.html#'+id.split('_y')[0],
    zhujia: (id)=>'yanjiu.html#'+id,
    zhuben: (id)=>'reader.html#'+id,
    liupai: (id)=>'yanjiu.html#'+id,
    yitu:   (id)=>'yitu.html#'+id,
    shiyi:  (id)=>'shiyi.html#'+id,
    bagua:  (id)=>'gua.html#'+id,
  };

  // ===== 实体查找 =====
  function findEntity(type, idOrName){
    if(!idOrName) return null;
    const collections = {
      gua: YJ.liushisigua||[],
      bagua: YJ.bagua||[],
      zhujia: YJ.zhujia||[],
      zhuben: YJ.zhuben||[],
      liupai: YJ.liupai||[],
      yitu: YJ.yitu||[],
      shiyi: YJ.shiyi||[],
      yao: [],
    };
    const arr = collections[type]||[];
    return arr.find(x=>x.id===idOrName||x.name===idOrName||x.name===idOrName) || null;
  }

  function entityDesc(type, ent){
    if(!ent) return '';
    const map = {
      gua:   (e)=>`${e.name||''}卦 · ${e.shang||''}上${e.xia||''}下`,
      bagua: (e)=>`${e.name||''} · ${e.ziran||''} · ${e.nature||''}`,
      zhujia:(e)=>`${e.era||''} · ${e.school||'易学家'}${e.masterpiece?' · '+e.masterpiece:''}`,
      zhuben:(e)=>`${e.author||''}著 · ${e.dynasty||''}`,
      liupai:(e)=>e.desc||e.name||'',
      yitu:  (e)=>e.desc||e.name||'',
      shiyi: (e)=>`易传·${e.name||''}`,
      yao:   (e)=>`${e.pos||''} · ${(e.text||'').slice(0,10)}`,
    };
    return (map[type]||(()=>''))(ent);
  }

  /**
   * 生成可点击实体标签 HTML
   * @param {string} text     显示文本
   * @param {string} type     实体类型: gua/bagua/zhujia/zhuben/liupai/yitu/shiyi/yao
   * @param {string} idOrName 实体ID或名称（用于查找/跳转）
   */
  function entTag(text, type, idOrName){
    const ent = findEntity(type, idOrName||text);
    const id = ent? (ent.id||idOrName) : (idOrName||text);
    const desc = entityDesc(type, ent);
    const href = (PAGE_MAP[type]||(()=>'#'))(id);
    return `<a href="${href}" class="ent" data-type="${type}" data-id="${id}">${text}${desc?`<span class="ent-pop">${desc}</span>`:''}</a>`;
  }

  /**
   * 获取某实体的所有反向关系（谁注释了它/谁属于它等）
   */
  function getRelations(entityId){
    buildInverseIndex();
    return invMap[entityId]||[];
  }

  /**
   * 渲染关系列表 HTML
   */
  function renderRelations(entityId){
    const rels = getRelations(entityId);
    if(!rels.length) return '';
    // 按谓词分组
    const groups = {};
    rels.forEach(r=>{
      const k = r.pred;
      if(!groups[k]) groups[k]=[];
      const name = r.subj.name||r.subj.id||'';
      const type = guessTypeOf(r.subj);
      if(name) groups[k].push({name,type,id:r.subj.id});
    });
    let html = '<div class="rel-list">';
    Object.keys(groups).forEach(k=>{
      html += `<div class="rel-line"><span class="rel-pred">${k}</span>`;
      html += groups[k].map(x=>entTag(x.name,x.type,x.id)).join('、');
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  function guessTypeOf(obj){
    if(!obj) return 'gua';
    if(obj.school||obj.dynasty && obj.works) return 'zhujia';
    if(obj.author) return 'zhuben';
    if(obj.yao) return 'gua';
    if(obj.desc && !obj.guaci) return 'liupai';
    return 'gua';
  }

  // ===== 侧边栏本体导航 =====
  function buildSidebar(activePage){
    const pages = [
      {id:'home',   label:'本经大义', href:'index.html', icon:'☯'},
      {id:'gua',    label:'六十四卦', href:'gua.html',   icon:'䷀'},
      {id:'reader', label:'经文阅读', href:'reader.html',icon:'書'},
      {id:'shiyi',  label:'十翼易传', href:'shiyi.html', icon:'傳'},
      {id:'yitu',   label:'易图图说', href:'yitu.html',  icon:'圖'},
      {id:'bianhua',label:'卦变推演', href:'bianhua.html', icon:'變'},
      {id:'shifa',  label:'筮法占筮', href:'shifa.html', icon:'筮'},
      {id:'yanjiu', label:'历代注疏', href:'yanjiu.html',icon:'注'},
      {id:'anim',   label:'卦象动画', href:'animation/gua-index.html',icon:'影'},
    ];
    return `
      <div class="sidebar" id="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-title">本体导航</div>
          ${pages.map(p=>`
            <a href="${p.href}" class="${activePage===p.id?'on':''}">
              <span style="margin-right:8px;color:var(--gold);">${p.icon}</span>${p.name}
            </a>`).join('')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-title">八卦</div>
          ${(YJ.bagua||[]).map(g=>`
            <a href="gua.html#${g.id}">
              <span style="float:right;color:var(--zhu);">${g.symbol}</span>${g.name}（${g.ziran}）
            </a>`).join('')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-title">上经</div>
          ${(YJ.liushisigua||[]).filter(g=>g.jing==='上经').slice(0,15).map(g=>`
            <a href="gua.html#${g.id}"><span style="float:right;">${g.symbol}</span>${g.num}. ${g.name}</a>
          `).join('')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-title">下经</div>
          ${(YJ.liushisigua||[]).filter(g=>g.jing==='下经').slice(0,8).map(g=>`
            <a href="gua.html#${g.id}"><span style="float:right;">${g.symbol}</span>${g.num}. ${g.name}</a>
          `).join('')}
          <a href="gua.html" style="color:var(--gold);font-size:12px;">查看全部 64 卦 →</a>
        </div>
      </div>`;
  }

  function buildTopbar(activePage){
    const pages = [
      {id:'home',   label:'首页',   href:'index.html'},
      {id:'gua',    label:'六十四卦',href:'gua.html'},
      {id:'reader', label:'经文',   href:'reader.html'},
      {id:'shifa',  label:'筮法',   href:'shifa.html'},
      {id:'yanjiu', label:'注疏',   href:'yanjiu.html'},
      {id:'anim',   label:'动画',   href:'animation/gua-index.html'},
    ];
    return `
    <nav class="topbar">
      <a class="logo" href="index.html">
        <span class="taiji">☯</span>
        <span>易经本体论<small class="en">· Yijing Ontology</small></span>
      </a>
      <button class="menu-toggle" id="menuToggle" aria-label="菜单">☰</button>
      <div class="nav-links" id="navLinks">
        ${pages.map(p=>`<a href="${p.href}" class="${activePage===p.id?'active':''}">${p.name}</a>`).join('')}
        <a href="shifa.html" class="nav-cta">起卦</a>
      </div>
    </nav>`;
  }

  function buildFooter(){
    return `<footer class="footer">
      <div style="margin-bottom:6px;">易经本体论 · The Book of Changes Ontology</div>
      <div style="font-size:11px;opacity:.6;letter-spacing:1px;">本体驱动 · 数字人文 · 以易解易</div>
    </footer>`;
  }

  function initMobile(){
    const tog=document.getElementById('menuToggle');
    const nav=document.getElementById('navLinks');
    const sb=document.getElementById('sidebar');
    if(tog&&nav){
      tog.addEventListener('click',()=>nav.classList.toggle('mobile-open'));
    }
    // 侧边栏开关（移动端下，在右下角加一个悬浮按钮）
    if(window.innerWidth<=1024 && sb){
      const btn=document.createElement('button');
      btn.textContent='☰';
      btn.style.cssText='position:fixed;bottom:20px;right:20px;width:44px;height:44px;border-radius:50%;background:var(--zhu);color:#fff;border:none;font-size:20px;box-shadow:var(--shadow-lg);z-index:1100;cursor:pointer;';
      btn.addEventListener('click',()=>sb.classList.toggle('mobile-open'));
      document.body.appendChild(btn);
    }
  }

  // 暴露
  window.YJ_Link = {
    ent: entTag,
    rels: getRelations,
    renderRels: renderRelations,
    find: findEntity,
    sidebar: buildSidebar,
    topbar: buildTopbar,
    footer: buildFooter,
    initMobile,
    buildIndex: buildInverseIndex,
  };

  // DOM 就绪后初始化
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{buildInverseIndex();initMobile();});
  }else{
    buildInverseIndex();setTimeout(initMobile,0);
  }
})();
