
const ONT = window.YJ_ONT;

// —— 各图的 SVG 矢量绘制（本体 yitu 提供元数据与图说，此处按 id 配矢量图） ——
const SVG = {
  tu_taiji: () => `<svg width="230" height="230" viewBox="0 0 230 230">
    <circle cx="115" cy="115" r="104" fill="#fdfaf3" stroke="#1a1a2e" stroke-width="2"/>
    <path d="M115,11 A104,104 0 0,1 115,219 A52,52 0 0,0 115,115 A52,52 0 0,1 115,11 Z" fill="#1a1a2e"/>
    <circle cx="115" cy="63" r="16" fill="#1a1a2e"/>
    <circle cx="115" cy="167" r="16" fill="#fdfaf3"/>
  </svg>`,

  tu_xiantian: () => baguaRing([
    ['☰','乾','南',115,32],['☱','兑','东南',182,68],['☲','离','东',203,122],['☳','震','东北',182,176],
    ['☷','坤','北',115,212],['☶','艮','西北',48,176],['☵','坎','西',27,122],['☴','巽','西南',48,68]
  ], '太极'),

  tu_houtian: () => baguaRing([
    ['☲','离','南',115,32],['☴','巽','东南',182,68],['☳','震','东',203,122],['☷','坤','西南',182,176],
    ['☵','坎','北',115,212],['☰','乾','西北',48,176],['☱','兑','西',27,122],['☶','艮','东北',48,68]
  ], '中宫'),

  tu_hetu: () => `<svg width="230" height="230" viewBox="0 0 230 230">
    <circle cx="115" cy="115" r="104" fill="none" stroke="#8b0000" stroke-width="1"/>
    ${dots(115,42,2,'#1a1a2e')}${dots(94,60,7,'#8b0000')}
    ${dots(115,188,1,'#1a1a2e')}${dots(115,206,6,'#8b0000')}
    ${dots(42,115,3,'#1a1a2e')}${dots(30,115,8,'#8b0000')}
    ${dots(188,115,4,'#1a1a2e')}${dots(202,115,9,'#8b0000')}
    ${dots(115,115,5,'#1a1a2e')}${dots(115,131,10,'#8b0000')}
    <text x="115" y="126" text-anchor="middle" font-size="11" fill="#8b0000" font-weight="700">河图五行生成数</text>
  </svg>`,

  tu_luoshu: () => `<svg width="230" height="230" viewBox="0 0 230 230">
    <rect x="20" y="20" width="190" height="190" rx="8" fill="#fdfaf3" stroke="#8b0000"/>
    <line x1="83" y1="20" x2="83" y2="210" stroke="#d4c5a3"/><line x1="147" y1="20" x2="147" y2="210" stroke="#d4c5a3"/>
    <line x1="20" y1="83" x2="210" y2="83" stroke="#d4c5a3"/><line x1="20" y1="147" x2="210" y2="147" stroke="#d4c5a3"/>
    <text x="51" y="58" text-anchor="middle" font-size="22" fill="#1a1a2e" font-weight="700">4</text>
    <text x="115" y="58" text-anchor="middle" font-size="22" fill="#1a1a2e" font-weight="700">9</text>
    <text x="178" y="58" text-anchor="middle" font-size="22" fill="#1a1a2e" font-weight="700">2</text>
    <text x="51" y="120" text-anchor="middle" font-size="22" fill="#1a1a2e" font-weight="700">3</text>
    <text x="115" y="120" text-anchor="middle" font-size="22" fill="#8b0000" font-weight="700">5</text>
    <text x="178" y="120" text-anchor="middle" font-size="22" fill="#1a1a2e" font-weight="700">7</text>
    <text x="51" y="182" text-anchor="middle" font-size="22" fill="#1a1a2e" font-weight="700">8</text>
    <text x="115" y="182" text-anchor="middle" font-size="22" fill="#1a1a2e" font-weight="700">1</text>
    <text x="178" y="182" text-anchor="middle" font-size="22" fill="#1a1a2e" font-weight="700">6</text>
  </svg>`,

  tu_64guafang: () => `<svg width="560" height="290" viewBox="0 0 560 290">
    <g transform="translate(145,145)">
      <circle r="105" fill="none" stroke="#8b0000" stroke-width="1.2"/>
      ${circleHexagrams()}
      <text y="6" text-anchor="middle" font-size="13" fill="#8b0000" font-weight="700">圆图·天</text>
    </g>
    <g transform="translate(320,35)">
      <rect width="210" height="210" fill="none" stroke="#8b0000" stroke-width="1.2"/>
      ${squareHexagrams()}
      <text x="105" y="228" text-anchor="middle" font-size="13" fill="#8b0000" font-weight="700">方图·地</text>
    </g>
  </svg>`,

  tu_bagua_64gua: () => `<svg width="300" height="230" viewBox="0 0 300 230">
    ${ONT.bagua.map((b,i)=>{
      const x=40+(i%4)*70, y=60+Math.floor(i/4)*90;
      return `<text x="${x}" y="${y}" text-anchor="middle" font-size="30" fill="#1a1a2e">${b.symbol}</text>
        <text x="${x}" y="${y+22}" text-anchor="middle" font-size="13" fill="#8b0000">${b.name}</text>`;
    }).join('')}
    <text x="150" y="208" text-anchor="middle" font-size="13" fill="#b8860b">八卦相重 · 八八六十四卦</text>
  </svg>`,

  tu_yaobian: () => `<svg width="560" height="120" viewBox="0 0 560 120">
    ${['复','临','泰','大壮','夬','乾','姤','遁','否','观','剥','坤'].map((n,i)=>
      `<text x="${30+i*46}" y="60" text-anchor="middle" font-size="15" fill="#1a1a2e">${n}</text>`).join('')}
    <line x1="20" y1="88" x2="540" y2="88" stroke="#8b0000" stroke-dasharray="4 3"/>
    <text x="30" y="106" text-anchor="start" font-size="11" fill="#b8860b">十一月·冬至</text>
    <text x="280" y="106" text-anchor="middle" font-size="11" fill="#b8860b">阳息阴消</text>
    <text x="530" y="106" text-anchor="end" font-size="11" fill="#b8860b">五月·夏至</text>
  </svg>`
};

// 八卦环：position 数组 [符号,名,方位,x,y]
function baguaRing(ring, centerLabel) {
  return `<svg width="230" height="230" viewBox="0 0 230 230">
    <circle cx="115" cy="115" r="104" fill="#fdfaf3" stroke="#8b0000" stroke-width="1.2"/>
    ${ring.map(r=>`
      <text x="${r[3]}" y="${r[4]}" text-anchor="middle" font-size="26" fill="#1a1a2e">${r[0]}</text>
      <text x="${r[3]}" y="${r[4]+16}" text-anchor="middle" font-size="11" fill="#8b0000">${r[1]}</text>
    `).join('')}
    <text x="115" y="120" text-anchor="middle" font-size="13" fill="#8b0000" font-weight="700">${centerLabel}</text>
  </svg>`;
}
// 画点：n 个点围绕中心，简易排布（奇数直列，偶数分列）
function dots(cx, cy, n, color) {
  let out='';
  if (n<=5) { out+=`<circle cx="${cx}" cy="${cy}" r="5" fill="${color}"/>`; }
  const half=Math.floor(n/2), gap=7;
  for (let i=0;i<half;i++){
    const off=(i-(half-1)/2)*gap;
    if(n>5){ out+=`<circle cx="${cx-6}" cy="${cy+off}" r="4.5" fill="${color}"/>`; out+=`<circle cx="${cx+6}" cy="${cy+off}" r="4.5" fill="${color}"/>`; }
    else if(n>1){ out+=`<circle cx="${cx}" cy="${cy+off}" r="4.5" fill="${color}"/>`; }
  }
  return out;
}
// 圆图：先天64卦按序分布于圆周
function circleHexagrams() {
  const arr = ONT.liushisigua;
  let s='';
  for (let i=0;i<64;i++){
    const ang = (i/64)*Math.PI*2 - Math.PI/2;
    const r = 92, x = Math.cos(ang)*r, y = Math.sin(ang)*r;
    s += `<text x="${x.toFixed(1)}" y="${(y+3).toFixed(1)}" text-anchor="middle" font-size="9" fill="#2b1810">${arr[i].symbol}</text>`;
  }
  return s;
}
// 方图：8×8 卦符网格（先天方图排布）
function squareHexagrams() {
  let s='';
  for (let j=0;j<8;j++) for (let i=0;i<8;i++){
    const g = ONT.liushisigua[(j*8+i)%64];
    s += `<text x="${13+i*26}" y="${20+j*26}" text-anchor="middle" font-size="15" fill="#2b1810">${g.symbol}</text>`;
  }
  return s;
}

function render() {
  document.getElementById('tuxiGrid').innerHTML = ONT.yitu.map(t => {
    const wide = ['tu_64guafang','tu_yaobian'].includes(t.id) ? ' wide' : '';
    const svg = SVG[t.id] ? SVG[t.id]() : '';
    return `<div class="card${wide}">
      <h3>${t.name}</h3>
      <div class="meta"><span>📜 ${t.dynasty||'—'}</span><span>✍ ${t.author||'—'}</span><span>🏷 ${t.xuepai||'—'}</span></div>
      ${svg?`<div class="svgbox">${svg}</div>`:''}
      <p class="desc">${t.desc}</p>
    </div>`;
  }).join('');
}
document.addEventListener('DOMContentLoaded', render);
