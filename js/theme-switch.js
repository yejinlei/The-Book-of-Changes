/**
 * 多主题切换系统
 * 五套风格：star(星象罗盘·默认) / bronze(青铜吉金·玄黑金) / bamboo(竹简汉简·青竹墨) / ink(水墨山水·素白淡墨) / paper(宣纸古籍·米黄朱红)
 */
(function(){
  const THEMES = [
    {id:'star',    name:'星象罗盘', icon:'✦', desc:'深空蓝·星空罗盘'},
    {id:'bronze',  name:'青铜吉金', icon:'鼎', desc:'玄黑金·商周铜器'},
    {id:'bamboo',  name:'竹简汉简', icon:'⺮', desc:'青竹墨·汉简书风'},
    {id:'ink',     name:'水墨山水', icon:'☁', desc:'素白淡墨·文人写意'},
    {id:'paper',   name:'宣纸古籍', icon:'卷', desc:'米黄朱红·传统注疏'}
  ];

  const KEY = 'yijing_theme';
  function get(){ return localStorage.getItem(KEY) || 'star'; }
  function set(t){ localStorage.setItem(KEY,t); apply(t); }
  function apply(t){
    document.documentElement.setAttribute('data-theme',t);
    document.documentElement.classList.remove('theme-star','theme-bronze','theme-bamboo','theme-ink','theme-paper');
    document.documentElement.classList.add('theme-'+t);
    // 如果有罗盘星空容器，根据主题显示/隐藏
    const comp = document.getElementById('compassBg');
    if(comp){
      comp.style.display = (t==='star') ? 'block' : 'none';
    }
    const dots = document.querySelectorAll('.star-dot');
    dots.forEach(d=>{d.style.opacity = (t==='star'||t==='bronze')?'':'0';});
  }

  function injectSwitcher(){
    // 已经有了就不重复
    if(document.getElementById('themeSwitcher')) return;
    const topbar = document.querySelector('.topbar') || document.querySelector('.nav') || document.querySelector('header');
    if(!topbar) return;
    const wrap = document.createElement('div');
    wrap.id='themeSwitcher';
    wrap.className='theme-switcher';
    wrap.innerHTML = '<button class="theme-toggle" id="themeToggleBtn" title="切换主题风格"><span class="theme-ico">✦</span><span class="theme-name">星象</span></button><div class="theme-panel" id="themePanel"></div>';
    // 插入到起卦按钮之前
    const btnDiv = topbar.querySelector('.topbar-actions, .nav-actions, .right');
    if(btnDiv){ btnDiv.insertBefore(wrap, btnDiv.firstChild); }
    else { topbar.appendChild(wrap); }

    const panel = document.getElementById('themePanel');
    THEMES.forEach(t=>{
      const i=document.createElement('button');
      i.className='theme-item'; i.dataset.theme=t.id;
      i.innerHTML='<span class="ti-ico">'+t.icon+'</span><span class="ti-main"><span class="ti-name">'+t.name+'</span><span class="ti-desc">'+t.desc+'</span></span><span class="ti-swatch"><i style="background:var(--zhu)"></i><i style="background:var(--gold)"></i><i style="background:var(--ink)"></i></span>';
      i.addEventListener('click',()=>{ set(t.id); updateBtn(); panel.classList.remove('open'); });
      panel.appendChild(i);
    });
    const btn = document.getElementById('themeToggleBtn');
    btn.addEventListener('click',(e)=>{ e.stopPropagation(); panel.classList.toggle('open'); });
    document.addEventListener('click',(e)=>{
      if(!wrap.contains(e.target)) panel.classList.remove('open');
    });
    updateBtn();
  }
  function updateBtn(){
    const cur = get();
    const meta = THEMES.find(t=>t.id===cur) || THEMES[0];
    const btn = document.getElementById('themeToggleBtn');
    if(btn){
      btn.querySelector('.theme-ico').textContent = meta.icon;
      btn.querySelector('.theme-name').textContent = meta.name;
    }
    document.querySelectorAll('.theme-item').forEach(it=>{
      it.classList.toggle('active', it.dataset.theme===cur);
    });
  }

  // 初始化：DOMContentLoaded 前先 apply（避免闪烁），再注入按钮
  apply(get());
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', injectSwitcher);
  } else { injectSwitcher(); }

  window.YJ_Theme = { get, set, apply, THEMES, injectSwitcher };
})();
