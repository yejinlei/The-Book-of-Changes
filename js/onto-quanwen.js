/**
 * 本体 → 全文库 · 反向关联组件
 * 在卦 / 注家 / 易图等本体节点页，列出「全文库中论及此条目的公版典籍」。
 * 数据：data/texts-ontology.js（倒排索引 inv：实体id → [书名,次数]）
 * 用法：YJ_QW.render(container, 'gua'|'zhujia'|..., entityId)
 */
(function(){
  'use strict';
  var loading = false, cbs = [];

  function ensure(cb){
    if(window.YJ_TEXTO){ cb(window.YJ_TEXTO); return; }
    cbs.push(cb);
    if(loading) return;
    loading = true;
    var s = document.createElement('script');
    s.src = 'data/texts-ontology.js?v=20261111p';
    s.onload = s.onerror = function(){
      var c = cbs; cbs = [];
      c.forEach(function(f){ f(window.YJ_TEXTO); });
    };
    document.head.appendChild(s);
  }

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function bookChip(x){
    return '<a class="yj-qw-book" href="quanwen.html?book=' + encodeURIComponent(x[0]) + '">' +
      '《' + esc(x[0]) + '》<i>' + x[1] + '</i></a>';
  }

  function render(container, type, id){
    if(!container || !id) return;
    var anchorClass = 'yj-qw-link yj-qw-single yj-qw-' + type + '-' + id;
    ensure(function(O){
      if(!O || !O.inv || !O.inv[id] || !O.inv[id].length) return;
      var all = O.inv[id].slice().sort(function(a, b){ return b[1] - a[1]; });
      var list = all.slice(0, 30);
      var old = container.querySelector('.' + anchorClass.replace(/ /g,'.'));
      if(old) old.remove();
      var html = '<div class="' + anchorClass + '">' +
        '<h3>📚 古籍全文库 · 相关典籍（' + all.length + ' 部）</h3>' +
        '<p class="yj-qw-sub">下列公版古籍全文中论及本条目（数字为出现次数），点击直达原文，网页端可切换简繁、标出本体概念：</p>' +
        '<div class="yj-qw-grid">' +
        list.map(bookChip).join('') +
        '</div>' +
        (all.length > list.length ? '<p class="yj-qw-sub">仅列出前 ' + list.length + ' 部，其余请到全文库检索。</p>' : '') +
        '</div>';
      container.insertAdjacentHTML('beforeend', html);
    });
  }

  // 无节点切换的页面（易图 / 十翼 / 注本 / 流派）：按类型列出各条目的相关典籍
  function renderAll(container, type, opts){
    if(!container) return;
    opts = opts || {};
    var anchorClass = 'yj-qw-link yj-qw-type-' + type;
    ensure(function(O){
      if(!O || !O.names || !O.types || !O.inv) return;
      var names = O.names, types = O.types, inv = O.inv;
      var per = opts.per || 10;
      var ids = Object.keys(names).filter(function(k){ return types[k] === type && inv[k] && inv[k].length; });
      ids.sort(function(a, b){ return inv[b].length - inv[a].length; });
      // 同一类型的旧区块先移除；不同类型的区块互不干扰
      var old = container.querySelector('.' + anchorClass.replace(/ /g,'.'));
      if(old) old.remove();
      if(!ids.length) return;
      var html = '<div class="' + anchorClass + '">' +
        '<h3>' + (opts.title || '📚 古籍全文库 · 相关典籍') + '</h3>' +
        '<p class="yj-qw-sub">下列公版古籍全文中论及本站各' + (opts.unit || '条目') + '（数字为出现次数）。点击直达原文，网页端可切换简繁、并标识与本体相关的段落。</p>';
      ids.forEach(function(id){
        var arr = inv[id].slice().sort(function(a, b){ return b[1] - a[1]; });
        var top = arr.slice(0, per);
        html += '<div class="yj-qw-group"><h4>' + esc(names[id]) + '<i>' + arr.length + ' 部</i></h4>' +
          '<div class="yj-qw-grid">' + top.map(bookChip).join('') + '</div>' +
          (arr.length > top.length ? '<p class="yj-qw-sub">… 另有 ' + (arr.length - top.length) + ' 部，详见全文库检索</p>' : '') +
          '</div>';
      });
      html += '</div>';
      container.insertAdjacentHTML('beforeend', html);
    });
  }

  window.YJ_QW = { render: render, renderAll: renderAll };
})();
