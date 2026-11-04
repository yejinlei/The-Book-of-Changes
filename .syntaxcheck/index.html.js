
const ONT = window.YJ_ONT;
console.log('✅ 易经本体已加载', ONT.stats());

// ===== 渲染统计数字 =====
function renderStats() {
  const s = ONT.stats();
  const html = [
    {num:s.bagua, label:'八卦', sub:'经卦'},
    {num:s.liushisigua, label:'六十四卦', sub:'别卦'},
    {num:s.yao, label:'爻', sub:'三百八十四爻'},
    {num:s.zhujia, label:'历代注家', sub:'先秦至当代'},
    {num:s.zhuben, label:'经典注本', sub:'从汉至清'},
    {num:s.triples, label:'本体关系', sub:'知识三元组'},
  ].map(c => `
    <div class="stat-card">
      <div class="stat-num">${c.num}</div>
      <div class="stat-label">${c.label}</div>
      <div class="stat-sub">${c.sub}</div>
    </div>
  `).join('');
  document.getElementById('statsGrid').innerHTML = html;
}

// ===== 渲染八卦 =====
function renderBagua() {
  const html = ONT.bagua.map(g => `
    <div class="bagua-card">
      <div class="bagua-symbol">${g.symbol}</div>
      <div class="bagua-name">${g.num}. ${g.name}</div>
      <div class="bagua-nature">${g.nature}（${g.yinyang}）</div>
      <div class="bagua-attrs">
        <div class="bagua-attr"><b>五行：</b>${g.wuxing}</div>
        <div class="bagua-attr"><b>方位：</b>${g.fangwei}</div>
        <div class="bagua-attr"><b>自然：</b>${g.ziran}</div>
        <div class="bagua-attr"><b>亲情：</b>${g.qinqing}</div>
      </div>
    </div>
  `).join('');
  document.getElementById('baguaGrid').innerHTML = html;
}

// ===== 渲染64卦 =====
let currentJing = 'all';
function render64Gua() {
  let list = ONT.liushisigua;
  if (currentJing !== 'all') list = list.filter(g => g.jing === currentJing);
  const html = list.map(g => `
    <a class="gua-cell ${g.jing==='上经'?'jing-shang':'jing-xia'}" href="reader.html#${g.name}" title="${g.num}.${g.name}：${g.guaci||''}">
      <span class="sym">${g.symbol}</span>
      <span class="name">${g.name}</span>
      <span class="num">${g.num}</span>
    </a>
  `).join('');
  document.getElementById('gua64Grid').innerHTML = html;
}
document.querySelectorAll('.jing-toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.jing-toggle button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentJing = btn.dataset.jing;
    render64Gua();
  });
});

// 显示卦详情：跳转到独立页面 gua.html
// （原来为首页浮层弹窗，现改为独立页面渲染，符合"网页仅为本体渲染视图"原则）

// ===== 渲染流派 =====
function renderSchools() {
  const sanyi = ONT.liupai.filter(s => s.sanyi);
  const others = ONT.liupai.filter(s => !s.sanyi);
  const html = [
    ...sanyi.map(s => `<div class="school-card sanyi"><h4>· ${s.name} ·</h4><p>${s.desc}</p></div>`),
    ...others.map(s => `<div class="school-card"><h4>${s.name}</h4><p>${s.desc}</p></div>`),
  ].join('');
  document.getElementById('schoolsGrid').innerHTML = html;
}

// ===== 渲染大师（按时代分组）=====
function renderMasters() {
  const eraOrder = ['上古','西周','春秋','春秋末','西汉初','西汉','东汉','三国吴','曹魏','东晋','唐','五代宋初','北宋','南宋','元','明','明末','明末清初','清','近现代','现代','当代'];
  const eraGroupMap = {};
  ONT.zhujia.forEach(z => {
    if (!eraGroupMap[z.era]) eraGroupMap[z.era] = [];
    eraGroupMap[z.era].push(z);
  });
  const sortedEras = Object.keys(eraGroupMap).sort((a,b) => eraOrder.indexOf(a) - eraOrder.indexOf(b));
  const html = sortedEras.map(era => `
    <div class="era-group">
      <div class="era-title">${era} <span class="count">(${eraGroupMap[era].length}位)</span></div>
      <div class="masters-grid">
        ${eraGroupMap[era].map(z => `
          <div class="master-card">
            <div class="name">${z.name}</div>
            <div class="years">${z.years}</div>
            ${z.school?`<span class="school-tag">${z.school}</span>`:''}
            <div class="masterpiece">代表作：${z.masterpiece}</div>
            <div class="desc">${z.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
  document.getElementById('mastersByEra').innerHTML = html;
  document.getElementById('masterCount').textContent = ONT.zhujia.length;
}

// ===== 渲染注本 =====
function renderBooks() {
  const html = ONT.zhuben.map(b => `
    <div class="book-card">
      <div class="book-name">《${b.name}》</div>
      <div class="book-meta">
        <span>📝 ${b.author}</span>
        <span>🏛 ${b.dynasty}</span>
        ${b.school?`<span>🏷 ${b.school}</span>`:''}
        <span>📚 ${b.juan}卷</span>
      </div>
      <div class="book-desc">${b.desc}</div>
    </div>
  `).join('');
  document.getElementById('booksGrid').innerHTML = html;
  document.getElementById('bookCount').textContent = ONT.zhuben.length;
}

// ===== 渲染时间轴 =====
function renderTimeline() {
  const html = ONT.events.map(e => `
    <div class="timeline-item">
      <div class="t-era">${e.era} · ${e.year}</div>
      <div class="t-title">${e.event}</div>
      <div class="t-person">核心人物：${e.people}</div>
      <div class="t-content">${e.content||e.desc||''}</div>
    </div>
  `).join('');
  document.getElementById('timeline').innerHTML = html;
}

// ===== 渲染知识图谱 =====
function renderChart() {
  document.getElementById('tripleCount').textContent = ONT.triples.length;
  const chart = echarts.init(document.getElementById('ontoChart'));
  // 取核心节点：八卦+16完整卦+主要注家
  const nodes = [];
  const nodeSet = new Set();
  function addNode(id, name, cat, size) {
    if (nodeSet.has(id)) return;
    nodeSet.add(id);
    const catColor = {bagua:'#8b0000', gua:'#b8860b', zhujia:'#1e3a8a', jing:'#14532d', yuan:'#4c1d95'};
    nodes.push({ id, name, category:cat, symbolSize:size, itemStyle:{color:catColor[cat]||'#888'}, label:{show:size>25, fontSize:12} });
  }
  addNode('Taiji','太极','yuan',40);
  addNode('Bagua','八卦','yuan',30);
  addNode('Jing','易经本经','jing',30);
  ONT.bagua.forEach(g => addNode(g.id, g.name+g.symbol, 'bagua', 28));
  ONT.liushisigua.filter(g=>!g._incomplete).forEach(g => addNode(g.id, g.name+g.symbol, 'gua', 20));
  ['zj_kongzi','zj_wangbi','zj_kongyingda','zj_lidingzuo','zj_chengyi','zj_zhuxi','zj_liguangdi','zj_shangbinghe','zj_gaoheng'].forEach(id => {
    const z = ONT.zhujiaMap[Object.values(ONT.zhujiaMap).find(z=>z.id===id)?.name];
    if (z) addNode(z.id, z.name, 'zhujia', 22);
  });
  // 边
  const links = [];
  ONT.triples.forEach(t => {
    if (nodeSet.has(t.subject) && nodeSet.has(t.object)) {
      links.push({ source:t.subject, target:t.object, label:{show:false,formatter:t.predicate} });
    }
  });
  chart.setOption({
    tooltip:{ formatter: p => p.dataType==='node'?p.name:'' },
    legend:[{ data:['本体核心','八卦','卦','注家','经文'], textStyle:{fontFamily:'Noto Serif SC'} }],
    series:[{
      type:'graph', layout:'force', roam:true, draggable:true,
      data:nodes, links:links,
      categories:[{name:'本体核心'},{name:'八卦'},{name:'卦'},{name:'注家'},{name:'经文'}],
      force:{ repulsion:300, edgeLength:[60,120], gravity:0.1 },
      label:{fontFamily:'Noto Serif SC'},
      lineStyle:{opacity:0.4, width:1, color:'#b8860b', curveness:0.1},
      emphasis:{ focus:'adjacency', lineStyle:{width:3,opacity:1} },
    }]
  });
  window.addEventListener('resize', () => chart.resize());
}

// ===== 十翼 / 易图：均为独立页面，见 shiyi.html、yitu.html =====

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderBagua();
  render64Gua();
  renderSchools();
  renderMasters();
  renderBooks();
  renderTimeline();
  renderChart();
});
