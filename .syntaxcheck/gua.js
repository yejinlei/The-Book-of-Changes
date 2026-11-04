
const ONT = window.YJ_ONT;
const YAO_WEI = {
  '初':'初爻·始 · 潜藏发端，位卑力弱',
  '二':'二爻·下卦中位 · 得中，多誉',
  '三':'三爻·下卦之极 · 多凶，履险',
  '四':'四爻·上卦之初 · 多惧，近君',
  '五':'五爻·上卦中位 · 得中得正，多功，君位',
  '上':'上爻·一卦之极 · 亢极则悔，贵而无位'
};

function getHashName() {
  const h = decodeURIComponent(location.hash.replace('#',''));
  return ONT.guaMap[h] ? h : '乾';
}
function yaoWeiDesc(pos) {
  for (const k in YAO_WEI) if (pos.startsWith(k) || pos.includes(k)) return YAO_WEI[k];
  return '';
}
function renderSide(cur) {
  document.getElementById('sideList').innerHTML =
    '<h4>六十四卦</h4>' +
    ONT.liushisigua.map(g => `
      <a class="side-item ${g.name===cur?'active':''}" href="gua.html#${g.name}" title="${g.num}.${g.name}">
        <span class="sym">${g.symbol}</span>${g.num}
      </a>`).join('');
}
function renderGua(name) {
  const g = ONT.guaMap[name];
  if (!g) return;
  const sg = ONT.baguaMap[g.shang], bg = ONT.baguaMap[g.xia];
  const idx = ONT.liushisigua.findIndex(x => x.name === name);
  const prev = ONT.liushisigua[idx-1], next = ONT.liushisigua[idx+1];

  const yaoHtml = (g.yao||[]).map(y => `
    <div class="yao-item">
      <div class="yao-head">
        <span class="yao-pos">${y.pos}</span>
        <span class="yao-wei">${y.yinYang}爻 · ${yaoWeiDesc(y.pos)}</span>
      </div>
      <div class="yao-text">${y.text}</div>
      ${y.xiaoxiang?`<div class="yao-xx">《象》曰：${y.xiaoxiang}</div>`:''}
      ${y.explain?`<div class="yao-explain">释：${y.explain}</div>`:''}
    </div>`).join('');

  const incomplete = g._incomplete ? '<span class="tag-incomplete">本体框架已建，全文补录中</span>' : '';

  document.getElementById('guaContent').innerHTML = `
    <a class="back-link" href="index.html">← 返回首页</a>
    <div class="gua-head">
      <div class="gua-symbol">${g.symbol}</div>
      <div class="gua-title">${g.num}. ${g.name}卦${incomplete}</div>
      <div class="gua-meta">第${g.num}卦 · ${g.jing} · ${g.shang}上${g.xia}下 · ${sg.symbol}${bg.symbol} · ${g.gong}宫 · ${g.wuxing}行</div>
    </div>

    <div class="block">
      <div class="block-title">【卦辞】</div>
      <div class="block-content">${g.guaci||'（卦辞补录中）'}</div>
    </div>
    <div class="block">
      <div class="block-title">【彖传】</div>
      <div class="block-content">${g.tuan||'（彖传补录中）'}</div>
    </div>
    <div class="block">
      <div class="block-title">【象传·大象】</div>
      <div class="block-content">${g.xiang||'（象传补录中）'}</div>
    </div>
    ${g.wenyan?`<div class="block"><div class="block-title">【文言传】</div><div class="block-content">${g.wenyan}</div></div>`:''}
    <div class="block">
      <div class="block-title">【六爻详解】</div>
      <div class="yao-list">${yaoHtml||'（爻辞补录中）'}</div>
    </div>
    ${g.yong?`<div class="block"><div class="block-title">【用爻】</div><div class="block-content">${g.yong}</div></div>`:''}

    <div class="pager">
      ${prev?`<a href="gua.html#${prev.name}">← ${prev.num}.${prev.name}卦</a>`:'<span></span>'}
      ${next?`<a href="gua.html#${next.name}">${next.num}.${next.name}卦 →</a>`:'<span></span>'}
    </div>

    <div class="gua-nav-grid">
      ${ONT.liushisigua.map(x=>`<a class="${x.name===name?'active':''}" href="gua.html#${x.name}">${x.name}</a>`).join('')}
    </div>
  `;
  document.title = `${g.num}.${g.name}卦 · 卦爻详解 | 易经本体论`;
}
function update() {
  const name = getHashName();
  renderSide(name);
  renderGua(name);
  window.scrollTo(0,0);
}
window.addEventListener('hashchange', update);
window.addEventListener('DOMContentLoaded', update);
document.addEventListener('keydown', e => {
  const name = getHashName();
  const idx = ONT.liushisigua.findIndex(x => x.name === name);
  if (e.key === 'ArrowLeft' && idx > 0) location.hash = ONT.liushisigua[idx-1].name;
  if (e.key === 'ArrowRight' && idx < ONT.liushisigua.length-1) location.hash = ONT.liushisigua[idx+1].name;
});
