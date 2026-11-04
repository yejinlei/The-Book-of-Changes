
(function(){
  const DATA = window.YJ_COMMENTARY;
  const ORDER = DATA.order;

  // 八卦符号映射
  const BAGUA = {
    '乾':'☰','兑':'☱','离':'☲','震':'☳','巽':'☴','坎':'☵','艮':'☶','坤':'☷'
  };
  // 卦序号（按周易上经下经）
  const GUA_NUM = {};
  ORDER.forEach((n,i)=>GUA_NUM[n]=i+1);

  // 白话译文（乾—恒为主，余卦为基本说明）
  const BAIHUA = {
    '乾':'《乾》卦象征天：元始、亨通、和谐、贞正。卦辞以龙为喻，讲述阳气从潜藏、显现、奋勉、试跃、飞腾到亢极的全过程，揭示自强不息的乾道精神。君子法此，宜进德修业、与时偕行。',
    '坤':'《坤》卦象征地：元始、亨通，利于像雌马一样守持正固。坤道贵柔贵顺，承天而时行，君子以厚德载物。六爻从履霜之渐说到龙战于野，揭示阴长阳消、由微至著的必然。',
    '屯':'《屯》卦：云雷初动，万物始生而艰难。此为万物草创之象，宜居正守常、建立侯王、不可急于有为。',
    '蒙':'《蒙》卦：山下出泉，象征蒙稚。重在发蒙启智，当以果德行师道，养正于蒙。',
    '需':'《需》卦：云上于天，待时而降。象征等待、需待，宜心怀诚信、光亨贞吉，不可躁进。',
    '讼':'《讼》卦：天与水违行，象征争讼。上刚下险，争讼不可成，宜见大人、窒惕，中吉终凶。',
    '师':'《师》卦：地中有水，象征兵众。用兵当以正为本，丈人吉，无咎。',
    '比':'《比》卦：水在地上，象征亲比辅从。先王以建万国、亲诸侯，比之自内，贞吉。',
    '小畜':'《小畜》卦：风行天上，所畜者小。阴柔得位而上下应之，密云不雨，尚往也。',
    '履':'《履》卦：上天下泽，履也。履虎尾不咥人，亨；君子以辨上下、定民志。',
    '泰':'《泰》卦：天地交而万物通，小往大来，吉亨。君子道长，小人道消。',
    '否':'《否》卦：天地不交而万物不通，大往小来，不利君子贞。君子以俭德辟难。',
    '同人':'《同人》卦：天与火，同人。同人于野，亨，利涉大川。',
    '大有':'《大有》卦：火在天上，明照万物。柔得尊位大中，上下应之，元亨。',
    '谦':'《谦》卦：地中有山，谦。君子以裒多益寡，称物平施；谦亨，君子有终。',
    '豫':'《豫》卦：雷出地奋，豫。先王以作乐崇德，殷荐上帝；豫顺以动，利建侯行师。',
    '随':'《随》卦：泽中有雷，随。刚来而下柔，动而说；随元亨利贞，无咎。',
    '蛊':'《蛊》卦：山下有风，蛊。元亨，利涉大川；先甲三日，后甲三日，君子以振民育德。',
    '临':'《临》卦：泽上有地，临。元亨利贞；至于八月有凶。君子以教思无穷、容保民无疆。',
    '观':'《观》卦：风行地上，观。盥而不荐，有孚颙若；先王以省方观民设教。',
    '噬嗑':'《噬嗑》卦：雷电，噬嗑。亨，利用狱；先王以明罚敕法。',
    '贲':'《贲》卦：山下有火，贲。亨，小利有攸往；君子以明庶政、无敢折狱。',
    '剥':'《剥》卦：山附于地，剥。不利有攸往；上以厚下安宅。',
    '复':'《复》卦：雷在地中，复。亨，出入无疾，朋来无咎；反复其道，七日来复，利有攸往。',
    '无妄':'《无妄》卦：天下雷行，物与无妄。元亨利贞；其匪正有眚，不利有攸往。',
    '大畜':'《大畜》卦：天在山中，大畜。利贞，不家食吉，利涉大川。',
    '颐':'《颐》卦：山下有雷，颐。贞吉，观颐自求口实；君子以慎言语、节饮食。',
    '大过':'《大过》卦：泽灭木，大过。栋桡，利有攸往，亨。',
    '坎':'《坎》卦：水洊至，习坎。有孚维心亨，行有尚；君子以常德行、习教事。',
    '离':'《离》卦：明两作，离。利贞，亨；畜牝牛吉。大人以继明照于四方。',
    '咸':'《咸》卦：山上有泽，咸。亨，利贞，取女吉；君子以虚受人。',
    '恒':'《恒》卦：雷风，恒。亨，无咎，利贞，利有攸往；君子以立不易方。'
  };
  // 爻辞白话（32卦基础）
  const LINE_BAIHUA = {
    '乾':['初九：龙尚潜伏于渊，不宜有所作为——比喻人当韬光养晦，时未可动。','九二：龙出现在田野，利于见到大德之人——德施已普，居中得位。','九三：君子整日奋勉自励，夜间也警惕戒惧，虽处危地，终无咎害。','九四：龙或跃起于深渊，审时度势可无咎。','九五：龙飞上天，大展宏图之时，大利大德之人出现。','上九：龙飞过高，必有悔恨——知进而不知退则极而必反。','用九：群龙并出而不以首领自居，吉。'],
    '坤':['初六：踩到霜上，坚冰将至——阴寒之事由微渐著，防微杜渐。','六二：正直、端方、广大，不待修习自然无所不利。','六三：含藏章美，守持正固；或跟从王事，不以成功自居，终有好结果。','六四：束紧囊口，慎言免害，无咎亦无誉。','六五：黄色裙裳，大吉——以中和之德居尊位。','上六：龙在原野上交战，流出玄黄之血——阴盛极而战阳，天地之气混杂。','用六：利于永远守持正固，以厚德大终其事。']
  };

  // 卦象拆分：从jijie title"乾下乾上"解析上下卦
  function splitGua(guaStr, name){
    if(!guaStr) return {up:name, down:name};
    // "乾下乾上"
    const m = guaStr.match(/^([☰☱☲☳☴☵☶☷乾兑离震巽坎艮坤])下([☰☱☲☳☴☵☶☷乾兑离震巽坎艮坤])上$/);
    if(m) return {down:m[1], up:m[2]};
    return {up:name, down:name};
  }

  // 不同注家颜色映射
  const MASTER_CLS = {
    '王弼':'cmt-wangbi','王肃':'cmt-wangbi','韩康伯':'cmt-wangbi',
    '孔颖达':'cmt-kongyingda','崔觐':'cmt-kongyingda','何妥':'cmt-kongyingda',
    '朱熹':'cmt-zhuxi','朱子语类':'cmt-zhuxi','朱子':'cmt-zhuxi',
    '程颐':'cmt-chengyi','程氏':'cmt-chengyi','程传':'cmt-chengyi',
    '案':'cmt-an','案语':'cmt-an',
    '总论':'cmt-zonglun'
  };
  function masterCls(src){
    for(const k in MASTER_CLS){
      if(src && src.indexOf(k)!==-1) return MASTER_CLS[k];
    }
    return 'cmt-jijie';
  }

  // 当前状态
  let currentIdx = 0;
  let currentVer = 'jijie'; // jijie / zhezhong / benyi / chengzhuan

  // 构造下拉
  const sel = document.getElementById('guaSelect');
  ORDER.forEach((n,i)=>{
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = (i+1).toString().padStart(2,'0')+'. '+n+'卦';
    sel.appendChild(opt);
  });

  // 渲染
  function render(){
    const name = ORDER[currentIdx];
    const num = currentIdx+1;
    const jijie = DATA.jijie[name];
    const zhezhong = DATA.zhezhong[name];

    const cont = document.getElementById('content');
    cont.innerHTML = '';

    // 头
    const head = document.createElement('div');
    head.className = 'gua-head';
    const updown = jijie.gua;
    const s = splitGua(updown, name);
    const symUp = BAGUA[s.up] || ' ';
    const symDown = BAGUA[s.down] || ' ';
    head.innerHTML = `
      <div class="gua-meta">第 ${num} 卦 · ${num<=30?'上经':'下经'}</div>
      <h1 class="gua-title">${name}</h1>
      <div class="gua-sub">${updown || ''}　${jijie.title || ''}</div>
      <div class="gua-symbol">${symUp}<br>${symDown}</div>
      <div class="gua-meta">上卦 ${s.up} ${symUp}　·　下卦 ${s.down} ${symDown}</div>
    `;
    cont.appendChild(head);

    // 白话卦解
    if(BAIHUA[name]){
      const bh = document.createElement('div');
      bh.className = 'anno cmt-baihua';
      bh.innerHTML = '<span class="src">白话</span>'+BAIHUA[name];
      cont.appendChild(bh);
    }

    if(currentVer === 'jijie'){
      renderJijie(cont, jijie, name);
    } else if(currentVer === 'zhezhong'){
      renderZhezhong(cont, zhezhong, name);
    } else if(currentVer === 'benyi'){
      renderBenyi(cont, zhezhong, jijie, name);
    } else if(currentVer === 'chengzhuan'){
      renderChengzhuan(cont, zhezhong, jijie, name);
    }

    // 更新下拉与按钮
    sel.value = currentIdx;
    document.getElementById('prevBtn').disabled = currentIdx===0;
    document.getElementById('nextBtn').disabled = currentIdx===ORDER.length-1;

    window.scrollTo({top:0,behavior:'smooth'});
  }

  // 彖/象/文言分段标记
  const SECTION_TAG = {
    '彖':'《彖传》', '象':'《象传》', '文言':'《文言传》',
    '序卦':'《序卦传》', '说卦':'《说卦传》', '杂卦':'《杂卦传》'
  };

  function renderJijie(cont, jijie, name){
    // 卦辞：找到第一条text（初九前）
    const lines = jijie.lines || [];
    let yaoIdx = -1;
    const yaoNames = ['初九','九二','九三','九四','九五','上九','用九'];
    const yaoNamesYin = ['初六','六二','六三','六四','六五','上六','用六'];
    const isYang = name==='乾' || (jijie.title && jijie.title.indexOf('元')!==-1 && name!=='坤' && countYang(jijie.title)>countYin(jijie.title));
    // 判断阴阳：简单用卦是否含阳爻多——这里按上下卦
    const yaoLabels = isYangStart(name) ? yaoNames : yaoNamesYin;

    // 卦辞区
    const gTitle = document.createElement('div');
    gTitle.className = 'section-hd';
    gTitle.textContent = '卦　辞';
    cont.appendChild(gTitle);

    let inPart = 'gua'; // gua / tuan / xiang / wenyan
    let yaoCount = 0;
    let firstYaoPassed = false;

    // 收集卦辞段
    let guaCiDone = false;
    let bufText = [];
    function flushBuf(sectionCls){
      if(!bufText.length) return;
      const p = document.createElement('p');
      p.className = 'gua-text '+(sectionCls||'tuan-ci');
      p.textContent = bufText.join('');
      cont.appendChild(p);
      bufText = [];
    }
    function pushAnno(src, text, extraCls){
      flushBuf();
      const a = document.createElement('div');
      a.className = 'anno '+masterCls(src)+(extraCls?' '+extraCls:'');
      const label = document.createElement('span');
      label.className='src';
      label.textContent = src||'注';
      a.appendChild(label);
      a.appendChild(document.createTextNode('：'+(text||'').replace(/^[：:]/,'')));
      cont.appendChild(a);
    }

    for(const it of lines){
      if(it.k==='head'){
        // 卦头，跳过（已在顶部展示）
        continue;
      }
      if(it.k==='text'){
        const t = it.t || '';
        const s = it.s || '';
        // 是爻辞开头?
        const isYao = /^(初九|九二|九三|九四|九五|上九|用九|初六|六二|六三|六四|六五|上六|用六)/.test(t);
        const isSection = s && SECTION_TAG[s];
        if(isSection){
          flushBuf();
          const shd = document.createElement('div');
          shd.className = 'section-hd';
          shd.textContent = SECTION_TAG[s];
          cont.appendChild(shd);
          if(t && t!=='：'){
            bufText.push(t);
          }
          continue;
        }
        if(isYao){
          flushBuf();
          if(!firstYaoPassed){
            firstYaoPassed = true;
            const shd = document.createElement('div');
            shd.className = 'section-hd';
            shd.textContent = '爻　辞';
            cont.appendChild(shd);
          }
          yaoCount++;
          // 爻标题
          const yh = document.createElement('div');
          yh.className = 'line-hd';
          const yaoMatch = t.match(/^(初九|九二|九三|九四|九五|上九|用九|初六|六二|六三|六四|六五|上六|用六)/);
          const yaoName = yaoMatch?yaoMatch[1]:'';
          const yaoTag = document.createElement('span');
          yaoTag.className='yao-tag';
          yaoTag.textContent = yaoName;
          yh.appendChild(yaoTag);
          // 后面的文字
          const rest = t.replace(yaoName,'');
          yh.appendChild(document.createTextNode(rest));
          cont.appendChild(yh);
          // 白话爻注（如有）
          if(LINE_BAIHUA[name] && LINE_BAIHUA[name][yaoCount-1]){
            const abh = document.createElement('div');
            abh.className='anno cmt-baihua';
            abh.innerHTML='<span class="src">白话</span>'+LINE_BAIHUA[name][yaoCount-1];
            cont.appendChild(abh);
          }
          continue;
        }
        bufText.push(t);
      } else if(it.k==='note'){
        pushAnno(it.s, it.t);
      }
    }
    flushBuf();
  }

  function isYangStart(name){
    // 乾坤单独处理；其余卦根据jijie第一爻"初九/初六"判断
    if(name==='乾') return true;
    if(name==='坤') return false;
    const jijie = DATA.jijie[name];
    const first = (jijie.lines||[]).find(x=>x.k==='text'&&/^初[九六]/.test(x.t));
    if(first) return /^初九/.test(first.t);
    return true;
  }

  function countYang(t){return (t||'').split('九').length-1}
  function countYin(t){return (t||'').split('六').length-1}

  function renderZhezhong(cont, zz, name){
    const jijie = DATA.jijie[name];
    // 折中：按模块分 正文/本义/程传/集说/案/总论
    const sections = [
      {key:'正文',cls:'gua-text tuan-ci',title:'卦　辞'},
      {key:'本义',title:'朱熹《周易本义》',anno:'cmt-zhuxi'},
      {key:'程传',title:'程颐《伊川易传》',anno:'cmt-chengyi'},
      {key:'集说',title:'历代集说',anno:'cmt-jijie'},
      {key:'案',title:'御纂·按语',anno:'cmt-an'},
      {key:'总论',title:'总论',anno:'cmt-zonglun'}
    ];
    if(BAIHUA[name]){
      const bh=document.createElement('div');
      bh.className='anno cmt-baihua';
      bh.innerHTML='<span class="src">白话</span>'+BAIHUA[name];
      cont.appendChild(bh);
    }
    sections.forEach(sec=>{
      const v = zz[sec.key];
      if(!v) return;
      const hd = document.createElement('div');
      hd.className='section-hd';
      hd.textContent=sec.title;
      cont.appendChild(hd);
      if(sec.key==='正文'){
        // 正文按段落拆
        const paras = v.split(/\n+/).filter(p=>p.trim());
        paras.forEach(p=>{
          const pp = document.createElement('p');
          pp.className=sec.cls;
          pp.textContent = p.trim();
          cont.appendChild(pp);
        });
      } else {
        // 注
        const a = document.createElement('div');
        a.className='anno '+(sec.anno||'cmt-zhezhong');
        a.innerHTML = '<span class="src">'+sec.title.replace(/朱熹|程颐|《|》|周易|伊川|易传|御纂·/g,'')+'</span>';
        const txt = document.createElement('div');
        txt.style.whiteSpace='pre-wrap';
        txt.style.marginTop='4px';
        txt.textContent = v;
        a.appendChild(txt);
        cont.appendChild(a);
      }
    });

    // 补一条说明：折中本不分爻逐条列出正文，爻象注疏散见"本义/程传/集说"；完整逐爻注见"集解"本
    const tip=document.createElement('div');
    tip.className='anno cmt-baihua';
    tip.innerHTML='<span class="src">说明</span>《折中》体例如奏议，卦前总论、卦后按语；逐爻汉唐古注请切换至「集解」版本阅读。';
    cont.appendChild(tip);
  }

  function renderBenyi(cont, zz, jijie, name){
    renderJijie(cont, jijie, name); // 先经文
    if(zz && zz['本义']){
      const hd=document.createElement('div');hd.className='section-hd';hd.textContent='朱熹《周易本义》';cont.appendChild(hd);
      const a=document.createElement('div');a.className='anno cmt-zhuxi';
      a.innerHTML='<span class="src">本义</span><div style="white-space:pre-wrap;margin-top:4px">'+zz['本义']+'</div>';
      cont.appendChild(a);
    } else {
      const a=document.createElement('div');a.className='anno cmt-baihua';
      a.innerHTML='<span class="src">说明</span>此卦《本义》全文尚未录入，可先看「折中」本中所引朱子之说。';
      cont.appendChild(a);
    }
  }

  function renderChengzhuan(cont, zz, jijie, name){
    renderJijie(cont, jijie, name);
    if(zz && zz['程传']){
      const hd=document.createElement('div');hd.className='section-hd';hd.textContent='程颐《伊川易传》';cont.appendChild(hd);
      const a=document.createElement('div');a.className='anno cmt-chengyi';
      a.innerHTML='<span class="src">程传</span><div style="white-space:pre-wrap;margin-top:4px">'+zz['程传']+'</div>';
      cont.appendChild(a);
    } else {
      const a=document.createElement('div');a.className='anno cmt-baihua';
      a.innerHTML='<span class="src">说明</span>此卦《程传》全文尚未录入，可先看「折中」本所引程氏之说。';
      cont.appendChild(a);
    }
  }

  // 事件
  sel.addEventListener('change', e=>{
    currentIdx = parseInt(e.target.value,10);
    render();
  });
  document.getElementById('prevBtn').addEventListener('click',()=>{
    if(currentIdx>0){currentIdx--;render();}
  });
  document.getElementById('nextBtn').addEventListener('click',()=>{
    if(currentIdx<ORDER.length-1){currentIdx++;render();}
  });
  document.addEventListener('keydown', e=>{
    if(e.key==='ArrowLeft') document.getElementById('prevBtn').click();
    if(e.key==='ArrowRight') document.getElementById('nextBtn').click();
  });

  document.getElementById('versionBtns').addEventListener('click', e=>{
    const btn = e.target.closest('button[data-ver]');
    if(!btn) return;
    document.querySelectorAll('#versionBtns button').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    currentVer = btn.dataset.ver;
    render();
  });

  const noAnno = document.getElementById('noAnno');
  const onlyAnno = document.getElementById('onlyAnno');
  const baihua = document.getElementById('baihua');

  function syncChecks(){
    document.body.classList.toggle('no-anno', noAnno.checked);
    document.body.classList.toggle('only-anno', onlyAnno.checked);
    document.body.classList.toggle('no-baihua', !baihua.checked);
    if(noAnno.checked && onlyAnno.checked) onlyAnno.checked=false;
  }
  noAnno.addEventListener('change', ()=>{
    if(noAnno.checked) onlyAnno.checked=false;
    syncChecks();
  });
  onlyAnno.addEventListener('change', ()=>{
    if(onlyAnno.checked) noAnno.checked=false;
    syncChecks();
  });
  baihua.addEventListener('change', syncChecks);

  // URL hash 直链
  function loadFromHash(){
    const h = location.hash.replace('#','');
    const i = ORDER.indexOf(h);
    if(i>=0) currentIdx = i;
  }
  window.addEventListener('hashchange', ()=>{
    loadFromHash();render();
  });

  loadFromHash();
  render();
})();
