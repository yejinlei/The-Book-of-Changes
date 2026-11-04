/* 卦爻 SVG 动效组件 v1.0 —— 本体论可视化视图
 * API:
 *   GuaAnim.mount(el, guaOrYao, opts?)      大图，带呼吸/气流/点击动爻
 *   GuaAnim.mountMini(el, guaOrYao, opts?)  小图（卦阵）
 *   GuaAnim.baguaSVG(name, size?)            三爻八卦 SVG 串
 *   GuaAnim.flip(svg, idx)                   某爻变卦翻转动画
 */
(function(){
  const INK = '#2a1f14';
  const VERMILLION = '#8b0000';
  const GOLD = '#b8860b';
  let _rid = 0;
  const nextId = () => 'gua'+(++_rid);

  function orderYao(yao){
    if(!Array.isArray(yao)) return [];
    const orderMap={'初':0,'二':1,'三':2,'四':3,'五':4,'上':5};
    const arr = yao.slice();
    arr.sort((a,b)=>{
      const pa = a.pos? (orderMap[a.pos[0]]??0) : 0;
      const pb = b.pos? (orderMap[b.pos[0]]??0) : 0;
      return pa-pb;
    });
    return arr;
  }

  function guaSVGStr(yao, opts){
    opts = opts || {};
    const size = opts.size || 200;
    const mini = !!opts.mini;
    const lineH = Math.max(size * 0.10, mini?6:10);
    const gap = Math.max(size * 0.06, mini?3:6);
    const pad = mini? 2 : size*0.08;
    const yinGap = mini? size*0.14 : size*0.18;
    const w = size;
    const contentH = 6*lineH + 5*gap;
    const titleH = opts.title ? (mini? 0 : size*0.12) : 0;
    const h = pad*2 + contentH + titleH;
    const ox = pad;
    const oy = pad;
    const lineW = w - pad*2;

    const fid = nextId();
    const arr = orderYao(yao);
    let lines = '';
    for(let i=0;i<6;i++){
      const yi = arr[i];
      const isYang = !!(yi && yi.yinYang === '阳');
      const y = oy + (5-i)*(lineH+gap);
      const delay = i * 120;
      const yaoId = yi && yi.pos ? yi.pos : ('y'+i);
      if(isYang){
        lines += `<rect class="yao yao-yang" data-yao="${yaoId}" data-idx="${i}" data-yy="阳"
          x="${ox}" y="${y}" width="${lineW}" height="${lineH}" rx="${mini?1:2}"
          style="animation-delay:${delay}ms;--lw:${lineW}px"/>`;
        lines += `<rect class="yao-glow" x="${ox}" y="${y}" width="${lineW}" height="${lineH}" rx="${mini?1:2}"
          style="animation-delay:${delay}ms"/>`;
      } else {
        const segW = (lineW - yinGap)/2;
        lines += `<rect class="yao yao-yin" data-yao="${yaoId}" data-idx="${i}" data-yy="阴"
          x="${ox}" y="${y}" width="${segW}" height="${lineH}" rx="${mini?1:2}"
          style="animation-delay:${delay}ms;--lw:${lineW}px"/>`;
        lines += `<rect class="yao yao-yin" data-yao="${yaoId}" data-idx="${i}" data-yy="阴"
          x="${ox+segW+yinGap}" y="${y}" width="${segW}" height="${lineH}" rx="${mini?1:2}"
          style="animation-delay:${delay}ms;--lw:${lineW}px"/>`;
        lines += `<line class="yao-qi" x1="${ox+segW+2}" y1="${y+lineH/2}" x2="${ox+segW+yinGap-2}" y2="${y+lineH/2}"
          style="animation-delay:${delay+500}ms;--qlen:${yinGap}px"/>`;
      }
    }
    const title = opts.title ? `<text class="gua-title" x="${w/2}" y="${h-2}" text-anchor="middle">${opts.title}</text>` : '';

    const css = mini ? MINI_CSS : BIG_CSS;
    return `<svg class="gua-svg ${mini?'gua-mini':''}" viewBox="0 0 ${w} ${h}" width="${size}" height="${h}"
      xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
  <defs>
    <filter id="${fid}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <style>${css.replace(/FID/g, fid).replace(/LW/g, lineW+'px').replace(/YG/g, yinGap+'px')}</style>
  <g class="gua-body">${lines}</g>
  ${title}
</svg>`;
  }

  const BIG_CSS = `
    .gua-svg { display:inline-block; vertical-align:middle; }
    .gua-svg .yao { fill:#2a1f14;
      stroke-dasharray:LW; stroke-dashoffset:LW;
      animation: yao-draw .9s cubic-bezier(.2,.7,.2,1) forwards, yao-settle .4s ease-out .9s forwards;
      cursor:pointer; transform-origin:center;
    }
    .gua-svg .yao-yang { filter:url(#FID); }
    .gua-svg .yao-yin { opacity:.9; }
    .gua-svg .yao-glow { fill:#8b0000; opacity:0; pointer-events:none;
      animation: yao-yang-pulse 3.5s ease-in-out infinite; }
    .gua-svg .yao-qi { stroke:#b8860b; stroke-width:1.2; opacity:0; stroke-linecap:round;
      stroke-dasharray:YG; stroke-dashoffset:YG;
      animation: yao-qi-flow 2.6s ease-in-out infinite; }
    .gua-svg .yao:hover { fill:#8b0000 !important; }
    .gua-svg .yao.moving { animation: yao-move .7s ease-in-out 2, yao-draw .001s forwards !important; fill:#8b0000 !important; }
    .gua-svg .yao.flip { animation: yao-flip .9s cubic-bezier(.6,.2,.2,1) forwards; fill:#2a1f14; }
    .gua-svg .gua-title { font-family:'Songti SC','STSong','SimSun',serif; font-size:15px; fill:#2a1f14; letter-spacing:2px; }
    @keyframes yao-draw {
      from { stroke-dashoffset:LW; opacity:0; transform:scaleX(0); }
      60%  { opacity:1; }
      to   { stroke-dashoffset:0; opacity:1; transform:scaleX(1); }
    }
    @keyframes yao-settle { from{filter:brightness(1.5)} to{filter:brightness(1)} }
    @keyframes yao-yang-pulse {
      0%,100%{opacity:0;} 50%{opacity:.3;}
    }
    @keyframes yao-qi-flow {
      0%  { stroke-dashoffset:YG; opacity:0; }
      25% { opacity:.9; }
      100%{ stroke-dashoffset:-YG; opacity:0; }
    }
    @keyframes yao-move {
      0%,100%{ transform:translateX(0); }
      20%{ transform:translateX(-3px) rotate(-1deg); }
      40%{ transform:translateX(3px) rotate(1deg); }
      60%{ transform:translateX(-2px); }
      80%{ transform:translateX(2px); }
    }
    @keyframes yao-flip {
      0% { transform:scaleY(1); opacity:1; }
      45%{ transform:scaleY(.05); opacity:.3; }
      55%{ transform:scaleY(-.05); opacity:.3; }
      100%{ transform:scaleY(1); opacity:1; }
    }
  `;
  const MINI_CSS = `
    .gua-svg { display:inline-block; vertical-align:middle; }
    .gua-svg .yao { fill:#2a1f14;
      animation: yao-mini .6s cubic-bezier(.2,.7,.2,1) both;
      transform-origin:center;
    }
    .gua-svg .yao:hover { fill:#8b0000; }
    @keyframes yao-mini {
      from { opacity:0; transform:scaleX(0); }
      to   { opacity:.9; transform:scaleX(1); }
    }
  `;

  // 八卦三爻
  function baguaSVGStr(name, size){
    const map = {'乾':[1,1,1],'兑':[1,1,0],'离':[1,0,1],'震':[1,0,0],
                 '巽':[0,1,1],'坎':[0,1,0],'艮':[0,0,1],'坤':[0,0,0]};
    const bits = map[name] || [0,0,0];
    const yao = bits.map((b,i)=>({yinYang: b?'阳':'阴', pos:['初','二','上'][i]}));
    const s = size||60;
    // 直接用三爻绘制
    const lineH = Math.max(s*0.12,5);
    const gap = Math.max(s*0.08,3);
    const pad = 3;
    const yinGap = s*0.2;
    const lineW = s - pad*2;
    const w = s, h = pad*2 + 3*lineH + 2*gap;
    const fid = nextId();
    let lines='';
    for(let i=0;i<3;i++){
      const isYang = bits[i]===1;
      const y = pad + (2-i)*(lineH+gap);
      const delay = i*120;
      if(isYang){
        lines += `<rect class="b-yao" x="${pad}" y="${y}" width="${lineW}" height="${lineH}" rx="1" style="animation-delay:${delay}ms"/>`;
      } else {
        const sw = (lineW - yinGap)/2;
        lines += `<rect class="b-yao" x="${pad}" y="${y}" width="${sw}" height="${lineH}" rx="1" style="animation-delay:${delay}ms"/>`;
        lines += `<rect class="b-yao" x="${pad+sw+yinGap}" y="${y}" width="${sw}" height="${lineH}" rx="1" style="animation-delay:${delay}ms"/>`;
      }
    }
    return `<svg class="gua-svg gua-mini" viewBox="0 0 ${w} ${h}" width="${s}" height="${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
  <defs><filter id="${fid}"><feGaussianBlur stdDeviation="1.2"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <style>.gua-svg .b-yao{fill:#2a1f14;animation:bm .5s cubic-bezier(.2,.7,.2,1) both;transform-origin:center}
    .gua-svg .b-yao:hover{fill:#8b0000}
    @keyframes bm{from{opacity:0;transform:scaleX(0)}to{opacity:.9;transform:scaleX(1)}}</style>
  ${lines}
</svg>`;
  }

  window.GuaAnim = {
    mount(el, guaOrYao, opts){
      if(!el) return null;
      const yao = Array.isArray(guaOrYao)? guaOrYao : (guaOrYao && guaOrYao.yao);
      opts = Object.assign({size: Math.min(el.clientWidth||220, 240), title: guaOrYao && guaOrYao.name ? guaOrYao.name+'卦' : ''}, opts);
      el.innerHTML = guaSVGStr(yao, opts);
      const svg = el.querySelector('svg');
      svg.querySelectorAll('.yao').forEach(bar=>{
        bar.addEventListener('click', ()=>{
          bar.classList.remove('moving');
          void bar.offsetWidth;
          bar.classList.add('moving');
          setTimeout(()=>bar.classList.remove('moving'), 1500);
          svg.dispatchEvent(new CustomEvent('yao-move', {detail:{idx:+bar.dataset.idx, yinYang:bar.dataset.yy, pos:bar.dataset.yao, bar}}));
        });
      });
      return svg;
    },
    mountMini(el, guaOrYao, opts){
      if(!el) return null;
      const yao = Array.isArray(guaOrYao)? guaOrYao : (guaOrYao && guaOrYao.yao);
      opts = Object.assign({size: 48, mini:true}, opts);
      el.innerHTML = guaSVGStr(yao, opts);
      return el.querySelector('svg');
    },
    baguaSVG(el_or_str, name, size){
      if(!name && typeof el_or_str==='string'){ name = el_or_str; el_or_str = null; }
      const s = baguaSVGStr(name, size||60);
      if(el_or_str){ el_or_str.innerHTML = s; return el_or_str.querySelector('svg'); }
      return s;
    },
    flip(svg, idx){
      if(!svg) return;
      const bars = Array.from(svg.querySelectorAll('.yao')).filter(b=>+b.dataset.idx===idx);
      bars.forEach(bar=>{
        const cur = bar.dataset.yy;
        const target = cur==='阳'?'阴':'阳';
        bar.dataset.yy = target;
        // 重建该爻矩形：翻转时把整段/两段替换
        const isYang = target==='阳';
        const x = +bar.getAttribute('x'), y = +bar.getAttribute('y'),
              w = +bar.getAttribute('width'), h = +bar.getAttribute('height'),
              rx = bar.getAttribute('rx');
        // 找同 idx 的兄弟（阴爻是两段）
        const siblings = Array.from(svg.querySelectorAll('.yao')).filter(b=>+b.dataset.idx===idx);
        const parent = bar.parentNode;
        // 简单方案：加 flip 类做缩放翻转，同时改 dataset；视觉完成后再重建
        siblings.forEach(b=>{
          b.classList.add('flip');
          setTimeout(()=>b.classList.remove('flip'), 950);
        });
      });
    }
  };
})();
