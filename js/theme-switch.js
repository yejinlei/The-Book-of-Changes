/**
 * 多主题切换系统
 * 五套风格：star(星象罗盘·默认) / bronze(青铜吉金·玄黑金) / bamboo(竹简汉简·青竹墨) / ink(水墨山水·素白淡墨) / paper(宣纸古籍·米黄朱红)
 *
 * 主题持久化策略（三层防线，解决"切页跳回老主题"问题）：
 *  1) theme-init.js：放在每个页面 <head> 首行、所有 CSS 之前同步执行，第一帧就 data-theme 正确
 *  2) 本文件 apply(get())：DOMContentLoaded 前立即同步，DOM 渲染阶段主题就一致
 *  3) MutationObserver + storage 事件：兜底防覆盖 + 跨标签页同步
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
  const VALID = {star:1,bronze:1,bamboo:1,ink:1,paper:1};

  function sanitize(t){ return (t && VALID[t]) ? t : 'star'; }
  function get(){
    try{ return sanitize(localStorage.getItem(KEY)); }catch(e){ return 'star'; }
  }
  function set(t, opts){
    t = sanitize(t);
    try{ localStorage.setItem(KEY, t); }catch(e){}
    apply(t);
    // 同步到同域其他标签页
    if(!opts || !opts.silent){
      try{
        // storage 事件只在其他页面触发，同页手动派发一次用于本页其他组件监听
        window.dispatchEvent(new CustomEvent('yijing:themechange',{detail:{theme:t}}));
      }catch(e){}
    }
  }

  function apply(t){
    t = sanitize(t);
    const d = document.documentElement;
    // 避免重复应用（减少 reflow）
    if(d.getAttribute('data-theme') === t && d.classList.contains('theme-'+t)) return;
    d.setAttribute('data-theme', t);
    d.classList.remove('theme-star','theme-bronze','theme-bamboo','theme-ink','theme-paper');
    d.classList.add('theme-'+t);
    // 如果有罗盘星空容器，根据主题显示/隐藏
    const comp = document.getElementById('compassBg');
    if(comp){
      comp.style.display = (t==='star') ? 'block' : 'none';
    }
    document.querySelectorAll('.star-dot').forEach(d=>{
      d.style.opacity = (t==='star'||t==='bronze')?'':'0';
    });
    // 刷新主题面板按钮高亮
    if(typeof updateBtn === 'function') updateBtn();
  }

  function injectSwitcher(){
    if(document.getElementById('themeSwitcher')) return;
    let topbar = document.querySelector('.yj-theme-host');
    if(!topbar) topbar = document.querySelector('.topbar') || document.querySelector('.top-nav') || document.querySelector('.main-nav') || document.querySelector('nav') || document.querySelector('header');
    if(!topbar) return;
    const wrap = document.createElement('div');
    wrap.id='themeSwitcher';
    wrap.className='theme-switcher';
    wrap.innerHTML = '<button class="theme-toggle" id="themeToggleBtn" title="切换主题风格"><span class="theme-ico">✦</span><span class="theme-name">星象</span></button><div class="theme-panel" id="themePanel"></div>';
    const btnDiv = topbar.querySelector('.topbar-actions, .nav-actions, .right');
    if(btnDiv){ btnDiv.insertBefore(wrap, btnDiv.firstChild); }
    else { topbar.appendChild(wrap); }

    const panel = document.getElementById('themePanel');
    THEMES.forEach(t=>{
      const i=document.createElement('button');
      i.className='theme-item'; i.dataset.theme=t.id;
      i.innerHTML='<span class="ti-ico">'+t.icon+'</span><span class="ti-main"><span class="ti-name">'+t.name+'</span><span class="ti-desc">'+t.desc+'</span></span><span class="ti-swatch"><i style="background:var(--zhu)"></i><i style="background:var(--gold)"></i><i style="background:var(--ink)"></i></span>';
      i.addEventListener('click',()=>{ set(t.id); panel.classList.remove('open'); });
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

  // ========== 初始化：第一时间同步应用（theme-init.js 已在 <head> 做了一次，这里是二次保险）==========
  apply(get());

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', injectSwitcher);
  } else { injectSwitcher(); }

  // ========== 兜底 1：MutationObserver 防止其他脚本误删/改 data-theme ==========
  // （比如某些老脚本可能 reset html 属性，我们在被改后立刻拉回正确主题）
  try{
    const mo = new MutationObserver(()=>{
      const want = get();
      const cur = document.documentElement.getAttribute('data-theme');
      if(cur !== want){
        // 节流：只在确实不一致时恢复，避免死循环
        apply(want);
      }
    });
    mo.observe(document.documentElement, {attributes:true, attributeFilter:['data-theme','class']});
  }catch(e){}

  // ========== 兜底 2：storage 事件：其他标签页切换主题时，本页同步 ==========
  window.addEventListener('storage', (e)=>{
    if(e.key === KEY){
      apply(sanitize(e.newValue));
    }
  });

  // ========== 兜底 3：pageshow（往返缓存 bfcache 恢复时重新应用）==========
  window.addEventListener('pageshow', ()=>{ apply(get()); });

  window.YJ_Theme = { get, set, apply, THEMES, injectSwitcher };
})();
