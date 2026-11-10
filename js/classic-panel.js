/**
 * 原典参照（Classic Reference）统一渲染组件
 * 使用：
 *   ClassicPanel.render('#container', {
 *     title: '原典参照',
 *     intro: '...',
 *     ids: ['huangdi_neijing', 'leijing_fuyi']
 *   });
 */
(function(){
  function load() {
    var $CLS = window.CLASSICS;
    if (!$CLS) { console.warn('CLASSICS data not loaded'); return; }

    function render(container, opts) {
      var el = typeof container === 'string' ? document.querySelector(container) : container;
      if (!el) return;
      var ids = opts.ids || [];
      var html = '';
      html += '<section class="classics-section">';
      html += '<h2>' + (opts.title || '原典参照') + '</h2>';
      if (opts.intro) html += '<p class="classics-intro">' + opts.intro + '</p>';
      html += '<div class="classics-grid">';
      ids.forEach(function(id){
        var c = $CLS[id];
        if (!c) { console.warn('unknown classic:', id); return; }
        var chaptersHtml = '';
        (c.chapters||[]).forEach(function(ch){
          chaptersHtml += '<div class="classic-chapter">';
          chaptersHtml += '<p class="classic-chapter-name">' + ch.name + '</p>';
          chaptersHtml += '<div class="classic-chapter-text">' + escapeHtml(ch.text) + '</div>';
          chaptersHtml += '</div>';
        });
        var dynastyTag = c.dynasty ? '<span class="classic-tag">' + c.dynasty + '</span>' : '';
        var authorTag = c.author ? '<span>' + c.author + '</span>' : '';
        html += '<div class="classic-card no-ont" data-id="' + id + '" data-nolink="1">';
        html += '<div class="classic-head">';
        html += '<div style="flex:1;min-width:0;">';
        html += '<p class="classic-title">《' + c.title + '》</p>';
        html += '<div class="classic-meta">' + dynastyTag + authorTag + '</div>';
        html += '<p class="classic-summary">' + (c.summary||'') + '</p>';
        html += '</div>';
        html += '<div class="classic-toggle">▾</div>';
        html += '</div>';
        html += '<div class="classic-body">' + chaptersHtml + '</div>';
        html += '</div>';
      });
      html += '</div></section>';
      el.insertAdjacentHTML('beforeend', html);

      // 绑定展开/折叠
      el.querySelectorAll('.classic-card').forEach(function(card){
        var head = card.querySelector('.classic-head');
        head.addEventListener('click', function(){
          card.classList.toggle('open');
        });
      });
    }

    function escapeHtml(s){
      if (!s) return '';
      return String(s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    window.ClassicPanel = { render: render };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
