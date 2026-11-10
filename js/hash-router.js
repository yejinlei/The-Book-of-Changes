/**
 * 全站深链接锚点路由（hash-router）
 * 目的：实体跳转（如 yanjiu.html#zj-zj_yufan、yitu.html#tu_hetu）落到目标页后能真正定位并高亮。
 * 由 ontology-linker.js 自动注入，无需逐页引用。
 */
(function(){
  'use strict';

  function cssEscape(s){
    if(window.CSS && CSS.escape) return CSS.escape(s);
    return String(s).replace(/["\\]/g, '\\$&');
  }

  // 候选选择器，依次尝试
  function findTarget(h){
    // 1) 直接 id
    var el = document.getElementById(h);
    if(el) return el;
    // 2) data-hash 精确
    el = document.querySelector('[data-hash="' + cssEscape(h) + '"]');
    if(el) return el;
    // 3) name 锚点
    el = document.querySelector('[name="' + cssEscape(h) + '"]');
    if(el) return el;
    // 4) 去前缀兜底：zj-zj_yufan → 找 data-hash 含 zj_yufan 的
    var m = h.match(/^(zj|lp|zb|tu|zy)-(.+)$/);
    if(m){
      el = document.querySelector('[data-hash="' + cssEscape(m[2]) + '"]') ||
           document.querySelector('[data-zid="' + cssEscape(m[2]) + '"]') ||
           document.getElementById(m[2]);
      if(el) return el;
    }
    return null;
  }

  // 展开折叠容器（十翼篇目 / 抽屉等）
  function tryExpand(el){
    if(el.classList.contains('open')) return;
    var hd = el.querySelector('.shiyi-hd, .acc-hd, [data-toggle], .zhu-hd');
    if(hd){ try{ hd.click(); }catch(e){} }
    try{ el.classList.add('open'); }catch(e){}
    var panel = el.querySelector('.shiyi-bd, .acc-bd, [data-panel]');
    if(panel){ try{ panel.style.display='block'; }catch(e){} }
  }

  function highlight(el){
    tryExpand(el);
    try{ el.classList.add('hash-target'); }catch(e){}
    var doScroll = function(){
      try{ el.scrollIntoView({behavior:'smooth', block:'start'}); }catch(e){ el.scrollIntoView(); }
    };
    doScroll();
    // 平滑滚动后再校正一次（应对懒渲染）
    setTimeout(doScroll, 350);
    setTimeout(function(){ el.classList.remove('hash-target'); }, 3200);
  }

  function route(){
    var h = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if(!h) return;
    // 页面自定义处理器优先（gua.html / yanjiu.html / reader.html 已自带）
    var handlers = window.YJ_ROUTE_HANDLERS || [];
    for(var i = 0; i < handlers.length; i++){
      try{ if(handlers[i](h)) return; }catch(e){}
    }
    var el = findTarget(h);
    if(el){
      setTimeout(function(){ highlight(el); }, 450);
      return;
    }
    // 二次尝试：等懒加载内容就位
    setTimeout(function(){
      var el2 = findTarget(h);
      if(el2) highlight(el2);
    }, 1400);
  }

  window.addEventListener('hashchange', route);
  function boot(){ setTimeout(route, 500); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.YJ_Hash = {
    route: route,
    go: function(h){ if(location.hash === '#' + h){ route(); } else { location.hash = h; } }
  };
})();
