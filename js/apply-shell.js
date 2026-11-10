/**
 * 全站壳注入（apply-shell）
 * 用于尚未重构的旧版页面：加载后统一注入样式、本体数据、导航壳、侧边栏、页脚，
 * 并对正文做本体实体标注（双向关联）。
 *
 * 用法：在页面 <head> 末尾加一行
 *   <script src="js/apply-shell.js" data-page="reader"></script>
 */
(function(){
  'use strict';

  function relativePath(){
    return location.pathname.indexOf('/animation/') >= 0 ? '../' : '';
  }

  function injectCSS(){
    if(document.querySelector('link[href*="yijing.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = relativePath() + 'css/yijing.css';
    document.head.appendChild(link);
  }

  function injectScript(src){
    var file = src.split('/').pop();
    if(document.querySelector('script[src*="' + file + '"]')) return;
    var s = document.createElement('script');
    s.src = relativePath() + src;
    s.async = false;            // 保持加载顺序：ontology → gua-full → enhance → linker
    document.head.appendChild(s);
  }

  function injectOntology(){
    ['data/yijing-ontology.js',
     'data/gua-full-data.js',
     'data/yijing-ontology-enhance.js',
     'data/yijing-yao-link.js',
     'js/ontology-linker.js'].forEach(injectScript);
  }

  function detectPage(){
    var p = (location.pathname.split('/').pop() || 'index.html');
    var map = {
      'index.html':'home','gua.html':'gua','reader.html':'reader','shiyi.html':'shiyi',
      'yitu.html':'yitu','bianhua.html':'bianhua','shifa.html':'shifa','yanjiu.html':'yanjiu',
      'jiaokan.html':'jiaokan','guabian.html':'guabian','najia.html':'najia',
      'guaqi.html':'guaqi','yiyi.html':'yiyi','dandao.html':'dandao','rdf.html':'rdf',
      'yijing-yi.html':'home'
    };
    return map[p] || 'home';
  }

  function decorate(root){
    try{
      if(window.YJ_Link && window.YJ_Link.decorate){
        window.YJ_Link.decorate(root || document.querySelector('.content') || document.body);
      }
    }catch(e){ /* 标注失败不影响页面 */ }
  }

  function apply(){
    injectCSS();
    injectOntology();

    var tries = 0;
    function tryApply(){
      if(!window.YJ_Link){
        if(tries++ < 100) setTimeout(tryApply, 80);
        return;
      }
      var page = (document.currentScript && document.currentScript.dataset.page) || detectPage();

      // 顶部导航
      var nav = document.createElement('div');
      nav.id = 'yj-newnav';
      nav.innerHTML = window.YJ_Link.topbar(page);
      var oldTop = document.querySelector('.topbar,.top-nav,#topbar,nav.main-nav');
      if(oldTop && !oldTop.closest('#yj-newnav')) oldTop.remove();
      document.body.insertBefore(nav, document.body.firstChild);

      // 布局：侧边栏 + 内容区
      var sidebarHTML = window.YJ_Link.sidebar(page);
      var wrap = document.createElement('div');
      wrap.innerHTML = sidebarHTML;
      var sidebarEl = wrap.firstElementChild;

      var layout = document.createElement('div');
      layout.className = 'layout';
      var content = document.createElement('main');
      content.className = 'content';

      Array.prototype.slice.call(document.body.children).forEach(function(el){
        if(el.id === 'yj-newnav' || el.tagName === 'SCRIPT') return;
        if(el === document.getElementById('yj-sb-btn')) return;
        content.appendChild(el);
      });

      layout.appendChild(sidebarEl);
      layout.appendChild(content);
      document.body.appendChild(layout);

      // 页脚
      var ft = document.createElement('div');
      ft.innerHTML = window.YJ_Link.footer();
      document.body.appendChild(ft.firstElementChild);

      window.YJ_Link.initMobile();
      document.body.style.paddingTop = '0';
      document.documentElement.classList.add('yj-shelled');

      // 实体标注（含动态渲染后的复标）
      decorate(content);
      var t1 = setTimeout(function(){ decorate(content); }, 700);
      var t2 = setTimeout(function(){ decorate(content); }, 1800);
      window.addEventListener('hashchange', function(){
        setTimeout(function(){ decorate(content); }, 400);
      });
    }

    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', tryApply);
    }else{
      tryApply();
    }
  }

  apply();
})();
