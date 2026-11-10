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

  function applyThemeEarly(){
    // 同步、立即应用，不等脚本加载；apply-shell 接入的页面在 CSS 注入前就调用
    try{
      var t = localStorage.getItem('yijing_theme');
      var ok = {'star':1,'bronze':1,'bamboo':1,'ink':1,'paper':1};
      if(!t || !ok[t]) t = 'star';
      var d = document.documentElement;
      d.setAttribute('data-theme', t);
      d.classList.remove('theme-star','theme-bronze','theme-bamboo','theme-ink','theme-paper');
      d.classList.add('theme-' + t);
    }catch(e){}
  }

  function injectCSS(){
    if(document.querySelector('link[href*="yijing.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = relativePath() + 'css/yijing.css?v=20261110b';
    document.head.appendChild(link);
  }

  function injectScript(src, opts){
    var file = src.split('/').pop();
    if(document.querySelector('script[src*="' + file + '"]')) return;
    var s = document.createElement('script');
    s.src = relativePath() + src;
    if(opts && opts.sync){
      // 同步加载（不设置 async/defer），保证按注入顺序执行
      s.async = false;
      s.defer = false;
    }else{
      s.async = false;
    }
    document.head.appendChild(s);
  }

  function injectOntology(){
    // 先同步加载主题早初始化（对那些没有在 <head> 手动写 <script src=theme-init.js> 的老页面兜底）
    injectScript('js/theme-init.js?v=20261110b', {sync:true});
    ['data/yijing-ontology.js',
     'data/gua-full-data.js',
     'data/yijing-ontology-enhance.js',
     'data/yijing-yao-link.js',
     'data/classics.js',
     'js/ontology-linker.js?v=20261110b',
     'js/theme-switch.js?v=20261110b',
     'js/classic-panel.js'].forEach(function(s){ injectScript(s); });
  }

  // 每页默认要嵌入的典籍（页面可通过 <script>window.__CLASSICS_IDS=[...]</script> 覆盖）
  var PAGE_CLASSICS = {
    shiyi: {
      title: '十翼原典',
      intro: '《易传》七种十篇，又称"十翼"，相传为孔子所作，是解释《易经》的最古文献。点击卡片展开阅读原文。',
      ids: ['tuan_shang','tuan_xia','xiang_shang','xiang_xia','xici_shang','xici_xia','wenyan','shuogua','xugua','zagua']
    },
    yiyi: {
      title: '医易同源·相关医典',
      intro: '中医理论以阴阳五行为骨架，与《易》学同源异流。以下为医易会通相关核心医籍原文。',
      ids: ['huangdi_neijing','leijing_fuyi','shanghan_lun']
    },
    guaqi: {
      title: '卦气说·原典',
      intro: '卦气说以《易》卦配四季、十二月、二十四气、七十二候，是汉易的核心理论。以下为相关纬书与文献原文。',
      ids: ['yiwei_qianzaodu','yiwei_jilantu','huainanzi_tianwen']
    },
    jiaokan: {
      title: '校勘异文·版本原典',
      intro: '《周易》版本流传复杂，从战国楚简、汉帛书到魏王弼本、宋程朱注本，异文众多。以下为重要版本及注本原典。',
      ids: ['boshu_zhouyi','ersanziwen','yizhiyi','wangbi_zhu','chengshi_yizhuan','zhouyi_benyi']
    },
    najia: {
      title: '纳甲筮法·术数原典',
      intro: '纳甲筮法（六爻预测）起源于西汉京房，以八宫、世应、六亲、五行断吉凶。以下为历代筮法核心典籍。',
      ids: ['jingshi_yizhuan','huozhulin','huangjince','bushizhengzong','yixue_qimeng']
    },
    shifa: {
      title: '筮法原典参照',
      intro: '筮法起源于上古，以《系辞》大衍章揲蓍起卦为宗，后世朱熹《易学启蒙》定仪则、《火珠林》兴掷钱纳甲、《黄金策》立赋体断例、《卜筮正宗》集六爻大成。以下选录筮法源流相关原典，配合上方揲蓍、铜钱两种模拟器对照学习。',
      ids: ['xici_shang','yixue_qimeng','huozhulin','huangjince','bushizhengzong']
    },
    yitu: {
      title: '图书派原典参照',
      intro: '易图之学兴于北宋，周敦颐《太极图说》、邵雍《皇极经世》、朱熹《易学启蒙》是图书派核心典籍，以下选录其论图之文，配合上方太极、河图洛书、先天后天、消息卦图对照学习。',
      ids: ['xici_shang','taijitu_shuo','huangji_jingshi','yixue_qimeng']
    },
    guabian: {
      title: '卦变·相关原典',
      intro: '卦变说论一卦如何由他卦变来，是汉易与宋易的重要课题。以下为《系辞》《彖传》《太极图说》相关原文。',
      ids: ['tuan_shang','xici_shang','xici_xia','taijitu_shuo']
    },
    bianhua: {
      title: '变化之道·相关原典',
      intro: '3D 变化沙盘展示太极、两仪、四象、八卦、万物的生成过程。以下为《系辞》《道德经》《太极图说》原典参照。',
      ids: ['xici_shang','xici_xia','daodejing','taijitu_shuo']
    },
    dandao: {
      title: '丹道·原典参照',
      intro: '丹道以《周易参同契》为祖，融《易》理、黄老、丹法于一炉。以下为丹道三大核心典籍原文。',
      ids: ['cantongqi','wuzhenpian','ruyaojing']
    },
    yanjiu: {
      title: '历代注疏·代表注本',
      intro: '历代注《易》著作汗牛充栋，此选取最具代表性的三部：王弼《周易注》（玄学义理）、程颐《伊川易传》（理学义理）、朱熹《周易本义》（卜筮本义）。',
      ids: ['wangbi_zhu','chengshi_yizhuan','zhouyi_benyi']
    },
    rdf: {
      title: '本体论建模·核心典籍',
      intro: '本平台以《周易》及其历代注疏为本体数据源，以下典籍是构建易经本体知识图谱的核心底本。',
      ids: ['xici_shang','xici_xia','shuogua','xugua','zagua','wangbi_zhu','zhouyi_benyi']
    }
  };

  function injectClassicsPanel(content){
    if(window.__CLASSICS_DISABLED) return;
    var ids = window.__CLASSICS_IDS;
    var page = (document.currentScript && document.currentScript.dataset.page) || detectPage();
    var cfg;
    if(ids && ids.length){
      cfg = { title: window.__CLASSICS_TITLE || '原典参照', intro: window.__CLASSICS_INTRO || '', ids: ids };
    }else{
      cfg = PAGE_CLASSICS[page];
    }
    if(!cfg) return;
    if(!window.CLASSICS || !window.ClassicPanel){
      setTimeout(function(){ injectClassicsPanel(content); }, 200);
      return;
    }
    window.ClassicPanel.render(content, cfg);
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
    // ⚠️ 第一行：同步应用已存储的主题，在任何 CSS 注入之前设置 data-theme
    // 这是防止跨页跳回星象默认色的关键：CSS 首次计算时 html 已经有 data-theme 了
    applyThemeEarly();
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
      var oldTop = document.querySelector('.topbar,.top-nav,#topbar,nav.main-nav,nav.nav-links,nav.site-nav');
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

      // 原典参照面板：自动注入到 content 末尾
      injectClassicsPanel(content);

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
