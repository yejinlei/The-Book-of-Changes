/**
 * 易藏公版易注动态加载器
 * 按需从 data/texts/yijing/ 拉取txt原文，自动分段、相关度标记、本体关键词链接、反向关联chip
 * 使用：在页面底部「📜原典参照」面板声明 <div data-yijing-commentary="书籍名.txt" data-book-title="书名" data-author="作者" data-cat="yiyi" data-core-terms="乾,坤,元亨利贞"></div>
 * 本脚本会自动加载并渲染
 */
(function(){
  'use strict';
  if (window.__YJ_COMMENTARY_LOADED__) return;
  window.__YJ_COMMENTARY_LOADED__ = true;

  // 按页面主题预设的易注列表（key=页面id/cat，value=[{file,title,author,coreTerms}]）
  const PRESET_BOOKS = {
    // 经注总义页（yiyi.html）
    yiyi: [
      {file:'周易注.txt', title:'周易注（王弼）', author:'[魏]王弼 撰', coreTerms:'王弼,扫象,得意忘象,无,乾元,坤元'},
      {file:'周易正义.txt', title:'周易正义（孔颖达）', author:'[唐]孔颖达 等奉敕撰', coreTerms:'孔颖达,正义,疏,注疏,乾卦,坤卦'},
      {file:'伊川易传.txt', title:'伊川易传（程颐）', author:'[宋]程颐 撰', coreTerms:'程颐,伊川,体用,理,吉凶'},
      {file:'周易本义.txt', title:'周易本义（朱熹）', author:'[宋]朱熹 撰', coreTerms:'朱熹,本义,伏羲,文王,周公,孔子,卦爻辞'},
      {file:'周易尚氏学.txt', title:'周易尚氏学（尚秉和）', author:'[近代]尚秉和 撰', coreTerms:'尚秉和,象数,虞氏,荀氏,卦象'},
      {file:'周易集解.txt', title:'周易集解（李鼎祚）', author:'[唐]李鼎祚 辑', coreTerms:'李鼎祚,集解,汉易,虞翻,荀爽,郑玄'},
      {file:'东坡易传.txt', title:'东坡易传（苏轼）', author:'[宋]苏轼 撰', coreTerms:'苏轼,东坡,蜀学,性情'},
      {file:'周易集注.txt', title:'周易集注（来知德）', author:'[明]来知德 撰', coreTerms:'来知德,错综,中爻,太极'},
      {file:'横渠易说.txt', title:'横渠易说（张载）', author:'[宋]张载 撰', coreTerms:'张载,横渠,气,太虚'},
      {file:'杨氏易传.txt', title:'杨氏易传（杨简）', author:'[宋]杨简 撰', coreTerms:'杨简,慈湖,心学'},
      {file:'御纂周易折中.txt', title:'御纂周易折中（李光地）', author:'[清]李光地 等奉敕撰', coreTerms:'李光地,折中,程朱,御纂'},
      {file:'子夏易传.txt', title:'子夏易传', author:'旧题[周]卜商 撰', coreTerms:'子夏,十翼,传'},
      {file:'周易注疏.txt', title:'周易注疏（合刻本）', author:'[魏]王弼注 [唐]孔颖达疏', coreTerms:'注疏,十三经'},
      {file:'周易口义.txt', title:'周易口义（胡瑗）', author:'[宋]胡瑗 述', coreTerms:'胡瑗,安定,宋易'},
      {file:'周易稗疏.txt', title:'周易稗疏（王夫之）', author:'[清]王夫之 撰', coreTerms:'王夫之,船山'},
      {file:'周易述.txt', title:'周易述（惠栋）', author:'[清]惠栋 撰', coreTerms:'惠栋,汉学,虞氏易'},
      {file:'易汉学.txt', title:'易汉学（惠栋）', author:'[清]惠栋 撰', coreTerms:'汉易,孟喜,京房,虞翻,荀爽,郑玄'}
    ],
    // 图数/卦气/河洛页（guaqi.html）
    guaqi: [
      {file:'易学启蒙通释.txt', title:'易学启蒙通释（胡方平）', author:'[宋]胡方平 撰', coreTerms:'启蒙,河图,洛书,伏羲,先天,后天'},
      {file:'易学启蒙小传.txt', title:'易学启蒙小传（税与权）', author:'[宋]税与权 撰', coreTerms:'启蒙,邵雍,先天图'},
      {file:'易图说.txt', title:'易图说（吴仁杰）', author:'[宋]吴仁杰 撰', coreTerms:'图说,八卦,六十四卦'},
      {file:'易图通变.txt', title:'易图通变（雷思齐）', author:'[元]雷思齐 撰', coreTerms:'河图,洛书,先天,后天'},
      {file:'大易象数钩深图.txt', title:'大易象数钩深图（张理）', author:'[元]张理 撰', coreTerms:'象数,河图,洛书,太极图,先天图'},
      {file:'周易图说.txt', title:'周易图说（钱义方）', author:'[元]钱义方 撰', coreTerms:'图说,河洛'},
      {file:'周易图书质疑.txt', title:'周易图书质疑（黄宗炎）', author:'[清]黄宗炎 撰', coreTerms:'图书,河图,洛书,太极图辨伪'},
      {file:'易学象数论.txt', title:'易学象数论（黄宗羲）', author:'[清]黄宗羲 撰', coreTerms:'象数,河洛,先天图'},
      {file:'易图明辨.txt', title:'易图明辨（胡渭）', author:'[清]胡渭 撰', coreTerms:'胡渭,太极图,先天图辨伪'},
      {file:'启蒙意见.txt', title:'启蒙意见（韩邦奇）', author:'[明]韩邦奇 撰', coreTerms:'启蒙,河洛'},
      {file:'周易启蒙翼传.txt', title:'周易启蒙翼传（胡一桂）', author:'[元]胡一桂 撰', coreTerms:'启蒙,朱子'},
      {file:'卦变考略.txt', title:'卦变考略（董守谕）', author:'[明]董守谕 撰', coreTerms:'卦变,虞氏,反对,相生'}
    ],
    // 筮法/占筮页（shifa.html）
    shifa: [
      {file:'周易古占法.txt', title:'周易古占法（程迥）', author:'[宋]程迥 撰', coreTerms:'古占法,揲蓍,大衍,变卦'},
      {file:'周易筮述.txt', title:'周易筮述（王宏撰）', author:'[清]王宏撰 撰', coreTerms:'筮法,揲蓍,九六,变爻'},
      {file:'易筮通变.txt', title:'易筮通变（雷思齐）', author:'[元]雷思齐 撰', coreTerms:'筮法,大衍,变占'},
      {file:'春秋占筮书.txt', title:'春秋占筮书（毛奇龄）', author:'[清]毛奇龄 撰', coreTerms:'春秋,占筮,左传,国语'}
    ],
    // 校勘/异文页（jiaokan.html）
    jiaokan: [
      {file:'周易举正.txt', title:'周易举正（郭京）', author:'[唐]郭京 撰', coreTerms:'举正,校勘,异文,王弼注'},
      {file:'周易音义.txt', title:'周易音义（陆德明）', author:'[唐]陆德明 撰', coreTerms:'经典释文,音义,异文,反切'},
      {file:'周易章句外编.txt', title:'周易章句外编（董楷）', author:'[元]董楷 撰', coreTerms:'章句,校勘'},
      {file:'周易章句证异.txt', title:'周易章句证异（翟均廉）', author:'[清]翟均廉 撰', coreTerms:'章句,异文,校勘,版本'}
    ],
    // 医易会通/三教合一易注页（yiyi.html）
    yiyi_page: [
      {file:'周易禅解.txt', title:'周易禅解（释智旭）', author:'[明]释智旭 撰', coreTerms:'禅解,佛法,禅,心性,真如,般若'},
      {file:'周易阐真.txt', title:'周易阐真（刘一明）', author:'[清]刘一明 撰', coreTerms:'阐真,丹道,道教,先天,后天,性命,金丹'},
      {file:'周易会通.txt', title:'周易会通（董真卿）', author:'[元]董真卿 撰', coreTerms:'会通,程朱,象数,义理'},
      {file:'易经通注.txt', title:'易经通注（傅以渐等）', author:'[清]傅以渐 等奉敕撰', coreTerms:'通注,折中'}
    ]
  };

  // 本体核心关键词（🔴核心段匹配）
  const CORE_KW = [
    '乾卦','坤卦','元亨利贞','初九','九二','九三','九四','九五','上九','用九',
    '初六','六二','六三','六四','六五','上六','用六','彖曰','象曰','文言',
    '系辞','说卦','序卦','杂卦','太极','两仪','四象','八卦','六十四卦',
    '河图','洛书','先天','后天','大衍之数','揲蓍','变卦','卦变','爻变','互卦','错卦','综卦'
  ];

  // 易理旁证关键词（🟡旁证段匹配）
  const SIDE_KW = [
    '易','卦','爻','象','彖','吉凶','悔吝','无咎','阴阳','刚柔','动静','仁义','性命','理','气','道',
    '天道','地道','人道','君子','小人','时','位','中','正','应','比','承','乘',
    '王弼','孔颖达','程颐','朱熹','邵雍','周敦颐','张载','陆九渊','王阳明','惠栋','张惠言','焦循','黄宗羲','胡渭'
  ];

  // 本体节点映射（关键词→本体页锚点）
  const ONTO_MAP = {
    '元亨利贞':'gua.html?gua=1#zhenwen',
    '乾卦':'gua.html?gua=1', '坤卦':'gua.html?gua=2',
    '太极':'yiyi.html#taiji', '两仪':'yiyi.html#liangyi', '四象':'yiyi.html#sixiang', '八卦':'yiyi.html#bagua',
    '河图':'guaqi.html#hetu', '洛书':'guaqi.html#luoshu', '先天':'guaqi.html#xiantian', '后天':'guaqi.html#houtian',
    '大衍之数':'shifa.html#dayan', '揲蓍':'shifa.html#sheshi', '变卦':'guabian.html#biangua',
    '卦变':'guaqi.html#guabian', '王弼':'yanjiu.html#wangbi', '孔颖达':'yanjiu.html#kongyingda',
    '程颐':'yanjiu.html#chengyi', '朱熹':'yanjiu.html#zhuxi', '邵雍':'yanjiu.html#shaoyong',
    '系辞':'shiyi.html#xici', '说卦':'shiyi.html#shuogua', '彖曰':'shiyi.html#tuan', '象曰':'shiyi.html#xiang',
    '吉凶':'shiyi.html#jixiong', '阴阳':'bianhua.html#yinyang', '刚柔':'bianhua.html#gangrou'
  };

  // 段落分类：核心/旁证/普通
  function classifyPara(text, bookCoreTerms){
    const t = text;
    // 命中核心卦爻/术语
    for (const kw of CORE_KW) {
      if (t.includes(kw)) return 'core';
    }
    // 命中本书指定核心术语
    if (bookCoreTerms) {
      for (const kw of bookCoreTerms.split(',')) {
        if (t.includes(kw.trim())) return 'core';
      }
    }
    // 命中易理旁证
    let hitSide = 0;
    for (const kw of SIDE_KW) {
      if (t.includes(kw)) hitSide++;
      if (hitSide >= 2) return 'side';
    }
    return 'none';
  }

  // 关键词链接化（避免重复包裹、避免在HTML标签内匹配）
  function linkify(text){
    let result = text;
    // 收集所有关键词位置
    const matches = [];
    const allKW = [...new Set([...CORE_KW, ...SIDE_KW, ...Object.keys(ONTO_MAP)])];
    for (const kw of allKW) {
      let idx = result.indexOf(kw);
      while (idx !== -1) {
        matches.push({start:idx, end:idx+kw.length, kw});
        idx = result.indexOf(kw, idx+1);
      }
    }
    // 去重、按位置排序，防止重叠
    matches.sort((a,b)=>a.start-b.start);
    const filtered = [];
    let lastEnd = -1;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        filtered.push(m);
        lastEnd = m.end;
      }
    }
    // 反向替换（不影响偏移）
    let out = result;
    for (let i = filtered.length-1; i>=0; i--) {
      const m = filtered[i];
      const href = ONTO_MAP[m.kw];
      if (href) {
        out = out.slice(0,m.start) + `<u class="onto-kw" data-href="${href}">${m.kw}</u>` + out.slice(m.end);
      }
    }
    return out;
  }

  // 渲染单个书籍
  async function renderBook(container, book){
    const url = `data/texts/yijing/${encodeURIComponent(book.file)}?v=20261111p`;
    container.innerHTML = `<div class="classic-loading" style="padding:20px;text-align:center;color:#a68dc8;">⏳ 正在加载 ${book.title}...</div>`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('fetch fail: '+resp.status);
      const txt = await resp.text();
      // 清洗：去掉BOM、空行打头
      const lines = txt.replace(/^\uFEFF/,'').split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>0);
      // 取前80段（避免页面过长，"展开全书"按钮跳全文库）
      const showLines = lines.slice(0, 80);
      const totalParas = lines.length;
      let html = `<div class="classic-book" data-file="${book.file}">`;
      html += `<div class="classic-book-hd"><h4>${book.title}</h4><p class="classic-book-meta">${book.author || ''} · 共${totalParas}段 · 仅展示前80段，<a href="quanwen.html?book=yijing/${encodeURIComponent(book.file)}" target="_blank" style="color:#c9a96e;">📖 点此查看全书</a></p></div>`;
      html += '<div class="classic-paras">';
      let coreCount = 0, sideCount = 0;
      for (const line of showLines) {
        // 跳过纯书名/卷次标题行（太短、含"卷第X"）
        if (line.length < 6 && (/^[卷第上下]/.test(line) || /^周易/.test(line) && line.length < 10)) continue;
        const cls = classifyPara(line, book.coreTerms);
        if (cls==='core') coreCount++;
        if (cls==='side') sideCount++;
        const badge = cls==='core' ? '<span class="para-badge badge-core">🔴 本体核心</span>' :
                      cls==='side' ? '<span class="para-badge badge-pang">🟡 易理旁证</span>' : '';
        const refChip = cls==='core' ? `<a href="#onto-ref" class="para-ref" title="关联本体节点">↩ 关联本体</a>` : '';
        const contentHtml = linkify(line);
        html += `<div class="classic-para para-${cls==='side'?'pang':cls}">${badge}<p class="para-text" style="margin:0;">${contentHtml}</p><div class="para-refs">${refChip}</div></div>`;
      }
      html += '</div>';
      html += `<div class="classic-book-ft"><p style="color:#a68dc8;font-size:12px;">📊 本段命中：🔴核心 ${coreCount} 段，🟡旁证 ${sideCount} 段，共展示 ${showLines.length}/${totalParas} 段</p></div>`;
      html += '</div>';
      container.innerHTML = html;

      // 绑定关键词点击跳转（事件委托）
      container.querySelectorAll('.onto-kw').forEach(el=>{
        el.addEventListener('click', e=>{
          e.preventDefault();
          const href = el.getAttribute('data-href');
          if (href) window.location.href = href;
        });
        el.style.cursor='pointer';
        el.style.color='#c9a96e';
        el.style.borderBottom='1px dotted #c9a96e';
      });
    } catch(err) {
      container.innerHTML = `<div class="classic-err" style="padding:16px;color:#e88;">❌ 加载${book.title}失败：${err.message}（本地打开请用http服务器预览）</div>`;
    }
  }

  // 自动扫描页面容器 & 按页面注入预设
  function init(){
    // 自动识别页面主题：从 body id 或 window 变量取
    let pageCat = null;
    if (document.body && document.body.id) pageCat = document.body.id;
    if (window.__YJ_PAGE_CAT) pageCat = window.__YJ_PAGE_CAT;
    // 根据当前URL推断
    const path = location.pathname;
    if (/yanjiu\.html/.test(path)) pageCat = 'yiyi';      // 历代注家页 → 经注总义
    else if (/yiyi\.html/.test(path)) pageCat = 'yiyi_page'; // 医易会通页 → 三教会通易注
    else if (/guaqi\.html/.test(path)) pageCat = 'guaqi';
    else if (/shifa\.html/.test(path)) pageCat = 'shifa';
    else if (/jiaokan\.html/.test(path)) pageCat = 'jiaokan';

    // 找原典参照容器（若页面没有则自动追加到main末尾）
    let panel = document.getElementById('classic-panel');
    if (!panel && PRESET_BOOKS[pageCat]) {
      const main = document.querySelector('main') || document.querySelector('.main-content') || document.body;
      panel = document.createElement('section');
      panel.id = 'classic-panel';
      panel.className = 'classic-panel';
      panel.innerHTML = `
        <details open>
          <summary class="classic-title"><span>📜 易藏注疏原典参照</span><span class="classic-count" id="classic-count"></span></summary>
          <div class="classic-list" id="classic-list"></div>
        </details>
      `;
      main.appendChild(panel);
    }
    if (!panel) return;
    const listEl = panel.querySelector('#classic-list') || panel.querySelector('.classic-list');
    if (!listEl) return;

    // 加载预设书籍
    const books = PRESET_BOOKS[pageCat] || [];
    const countEl = panel.querySelector('#classic-count');
    if (countEl) countEl.textContent = `共 ${books.length} 部公版易注`;
    books.forEach((book, idx)=>{
      const wrap = document.createElement('div');
      wrap.className = 'classic-book-wrap';
      listEl.appendChild(wrap);
      // 错开加载，避免并发挤爆
      setTimeout(()=>renderBook(wrap, book), idx*200);
    });
  }

  // DOM ready
  if (document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
