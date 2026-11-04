
const ONT = window.YJ_ONT;

// 十翼篇章说明（本体 shiyi 提供元信息，此处补充义理导言）
const INTRO = {
  '彖传·上':'“彖”即断，断定一卦之义。《彖传》统释卦名、卦辞，推明天道人事之所以然，为读卦之总纲。上经自乾至离，凡三十卦。',
  '彖传·下':'《彖传》下篇，释下经咸至未济三十四卦卦辞，与上篇体例一致。',
  '象传·上':'《象传》分“大象”与“小象”。大象取卦之上下象推衍君子修德之事，小象则逐爻释其爻辞。上经三十卦。',
  '象传·下':'《象传》下篇，大象、小象并举，释下经三十四卦。',
  '系辞传·上':'《系辞》为《易》之通论，阐述易之起源、原理、筮法与哲学大纲，是易学理论的纲领性文献。',
  '系辞传·下':'《系辞》下篇，续论卦爻之起源、功用与圣人作易之旨。',
  '文言传':'《文言》专释乾、坤两卦，引申卦爻辞之义理，为易学义理之渊薮。',
  '说卦传':'《说卦》说明八卦所象之自然、人伦与万物类象，以及八卦方位，是理解取象的基础。',
  '序卦传':'《序卦》解说六十四卦的排列次第，揭示卦与卦之间“非覆即变、两两相偶”的因果流转。',
  '杂卦传':'《杂卦》不依卦序，以两两对举方式错综概括六十四卦之义。'
};
// 彖传 / 象传：从六十四卦本体汇聚
const TUAN = ONT.liushisigua.map(g => ({name:`${g.num}. ${g.name}`, text:g.tuan||'', sym:g.symbol}));
const XIANG = ONT.liushisigua.map(g => ({name:`${g.num}. ${g.name}`, text:g.xiang||'', sym:g.symbol}));
// 象传·小象：从各卦爻象汇聚
const XIAOXIANG = ONT.liushisigua.map(g => ({
  name:`${g.num}. ${g.name}`, sym:g.symbol,
  yao:(g.yao||[]).filter(y=>y.xiaoxiang).map(y=>({pos:y.pos, text:y.xiaoxiang}))
}));

function renderTuanXiang(list, keepEmpty) {
  return list.map(x => {
    if (!x.text && !keepEmpty) return '';
    return `<div class="gua-pair"><span class="gp-name">${x.sym} ${x.name}</span>
      <div class="gp-text">${x.text||'（本文随卦爻补录中）'}</div></div>`;
  }).join('');
}
function renderXiaoxiang() {
  return XIAOXIANG.map(g => {
    if (!g.yao.length) return '';
    return `<div class="gua-pair"><span class="gp-name">${g.sym} ${g.name}</span>` +
      g.yao.map(y=>`<div class="gp-text"><b>${y.pos}</b>：${y.text}</div>`).join('') + `</div>`;
  }).join('');
}
function renderWenyan() {
  const w = ONT.yizhuanTexts.wenyan_qian || [];
  return w.map(t=>`<div class="pian-text" style="margin-bottom:10px;">${t.text}</div>`).join('');
}
function renderPianList(arr) {
  if (!arr || !arr.length) return '<div class="pian-text">（本篇文本补录中）</div>';
  return arr.map(t=>`<div class="pian"><div class="pian-title">${t.title}</div><div class="pian-text">${t.text}</div></div>`).join('');
}

// 每篇的正文渲染器
const BODY = {
  '彖传·上': () => renderTuanXiang(TUAN.slice(0,30), true),
  '彖传·下': () => renderTuanXiang(TUAN.slice(30), true),
  '象传·上': () => renderTuanXiang(XIANG.slice(0,30), true),
  '象传·下': () => renderTuanXiang(XIANG.slice(30), true),
  '文言传': () => renderWenyan(),
  '系辞传·上': () => renderPianList(ONT.yizhuanTexts.xici_shang),
  '系辞传·下': () => renderPianList(ONT.yizhuanTexts.xici_xia),
  '说卦传': () => renderPianList(ONT.yizhuanTexts.shuogua),
  '序卦传': () => renderPianList(ONT.yizhuanTexts.xugua),
  '杂卦传': () => renderPianList(ONT.yizhuanTexts.zagua),
};
// 小象并入象传篇末
function xiaoxiangAppend(name) {
  if (name !== '象传·上') return '';
  return `<div style="margin-top:22px;"><div class="pian-title">小象传（六十四卦爻象汇编）</div>${renderXiaoxiang()}</div>`;
}

function render() {
  const list = ONT.shiyi;
  document.getElementById('tagline').textContent =
    `共十翼 · 彖传上下、象传上下、系辞上下、文言、说卦、序卦、杂卦，凡十篇`;
  document.getElementById('toc').innerHTML = list.map((p,i)=>
    `<a href="#shiyi-${i}">${p.name.replace('传','')}</a>`).join('');

  document.getElementById('shiyiList').innerHTML = list.map((p,i) => `
    <div class="shiyi-item ${i===0?'open':''}" id="shiyi-${i}">
      <div class="shiyi-hd">
        <div>
          <h3>《${p.name}》</h3>
          <div class="meta">${p.author} · ${p.juan} · ${p.desc}</div>
        </div>
        <span class="arrow">▶</span>
      </div>
      <div class="shiyi-bd">
        <div class="shiyi-intro">${INTRO[p.name]||''}</div>
        ${(BODY[p.name]||(()=>'<div class="pian-text">（本篇补录中）</div>'))()}
        ${xiaoxiangAppend(p.name)}
      </div>
    </div>`).join('');

  document.querySelectorAll('.shiyi-hd').forEach(hd => {
    hd.addEventListener('click', () => hd.parentElement.classList.toggle('open'));
  });
}
document.addEventListener('DOMContentLoaded', render);
