/**
 * 全站壳注入：对尚未重构的旧页面，在页面加载后替换顶部导航/注入 css/侧边栏/页脚
 * 使用方式：在旧页面 <head> 末尾加一行
 *   <script src="js/apply-shell.js" data-page="reader"></script>
 */
(function(){
  'use strict';
  // 确保 css 引入
  function injectCSS(){
    if(document.querySelector('link[href*="yijing.css"]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=relativePath()+'css/yijing.css';
    document.head.insertBefore(link,document.head.firstChild);
  }
  function injectOntology(){
    const need=[
      {src:'data/yijing-ontology.js'},
      {src:'data/gua-full-data.js'},
      {src:'js/ontology-linker.js'},
    ];
    need.forEach(n=>{
      if(document.querySelector(`script[src*="${n.src.split('/').pop()}"]`))return;
      const s=document.createElement('script');
      s.src=relativePath()+n.src;
      document.head.appendChild(s);
    });
  }
  function relativePath(){
    // 检测当前是否在 animation/ 子目录
    const p=location.pathname;
    return p.includes('/animation/') ? '../' : '';
  }

  function apply(){
    injectCSS();
    injectOntology();
    // 等待 YJ_Link 就绪
    const tries=0;
    function tryApply(){
      if(!window.YJ_Link){setTimeout(tryApply,80);return;}
      const page=document.currentScript && document.currentScript.dataset.page || detectPage();
      // 注入顶部 nav
      const nav=document.createElement('div');
      nav.id='yj-newnav';
      nav.innerHTML=YJ_Link.topbar(page);
      const oldTop=document.querySelector('.topbar,.top-nav,#topbar');
      if(oldTop){oldTop.remove();}
      document.body.insertBefore(nav,document.body.firstChild);

      // 注入侧边栏 + 内容区包装
      const sb=document.createElement('div');
      sb.id='yj-layout-wrap';
      const layout=document.createElement('div');
      layout.className='layout';
      sb.innerHTML=YJ_Link.sidebar(page);

      // 将 body 原有内容（除新nav）移入 content
      const content=document.createElement('main');
      content.className='content';
      // 收集 body 里所有元素（除nav、脚本）
      Array.from(document.body.children).forEach(el=>{
        if(el.id==='yj-newnav'||el.tagName==='SCRIPT')return;
        content.appendChild(el);
      });
      layout.appendChild(sb.firstChild); // sidebar
      layout.appendChild(content);
      document.body.appendChild(layout);

      // 页脚
      const ft=document.createElement('div');
      ft.innerHTML=YJ_Link.footer();
      document.body.appendChild(ft.firstChild);

      // 移动端初始化
      YJ_Link.initMobile();

      // 调整旧页面的body padding（旧版topbar padding:120px之类）
      document.body.style.paddingTop='0';
    }
    if(document.readyState==='loading'){
      document.addEventListener('DOMContentLoaded',tryApply);
    }else{
      tryApply();
    }
  }

  function detectPage(){
    const p=location.pathname.split('/').pop()||'index.html';
    const map={'index.html':'home','gua.html':'gua','reader.html':'reader','shiyi.html':'shiyi','yitu.html':'yitu','bianhua.html':'bianhua','shifa.html':'shifa','yanjiu.html':'yanjiu'};
    return map[p]||'home';
  }
  apply();
})();
