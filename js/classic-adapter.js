/* classic-adapter.js：直接把 data/classics.js 里的新典籍渲染成 DOM 追加到三个深度面板页
 * 不依赖页面内部的 DATA 数组，直接生成与页面已有卡片结构相同的 HTML 追加到容器末尾
 */
(function(){
  // 本体词 → 跳转 URL
  var KW_MAP = {
    '乾卦':'gua.html?g=1-乾','坤卦':'gua.html?g=2-坤','坎卦':'gua.html?g=29-坎','离卦':'gua.html?g=30-离',
    '泰卦':'gua.html?g=11-泰','否卦':'gua.html?g=12-否','复卦':'gua.html?g=24-复','既济卦':'gua.html?g=63-既济','未济卦':'gua.html?g=64-未济',
    '乾坤':'gua.html#乾坤','乾坤六子':'gua.html#八卦','八卦':'gua.html#八卦','十二消息卦':'guaqi.html#xiaoxi','卦气':'guaqi.html','纳甲':'najia.html','月体纳甲':'najia.html#yueti',
    '五行':'reader.html#key-wuxing','阴阳':'reader.html#key-yinyang','太极':'yitu.html','太极图说':'yitu.html#taijitu','河图洛书':'yitu.html#hetu','河图':'yitu.html#hetu','洛书':'yitu.html#luoshu',
    '系辞传':'shiyi.html','系辞':'shiyi.html','说卦传':'shiyi.html','说卦':'shiyi.html','十翼':'shiyi.html','彖传':'shiyi.html','象传':'shiyi.html','序卦':'shiyi.html','杂卦':'shiyi.html','文言':'shiyi.html',
    '象数派':'yanjiu.html#school-xiangshu','义理派':'yanjiu.html#school-yili','图书派':'yanjiu.html#school-tushu','考据派':'yanjiu.html#school-kaoju',
    '周易参同契':'dandao.html','医易':'yiyi.html','卦变':'guabian.html','互体':'guabian.html#huti','旁通':'guabian.html#pangtong','飞伏':'najia.html#feifu','世应':'najia.html#shiying',
    '爻位':'reader.html#key-yaowei','当位':'reader.html#key-dangwei','十二地支':'najia.html#dizhi','清华简':'jiaokan.html#tsinghua','上博简':'jiaokan.html#shangbo','秦简归藏':'jiaokan.html#guizang','数字卦':'jiaokan.html#shuzigua','筮法':'shifa.html',
    '京房':'yanjiu.html','郑玄':'yanjiu.html','荀爽':'yanjiu.html','虞翻':'yanjiu.html','王弼':'yanjiu.html','孔颖达':'yanjiu.html','李鼎祚':'yanjiu.html','程颐':'yanjiu.html','张载':'yanjiu.html','朱熹':'yanjiu.html','邵雍':'yanjiu.html','周敦颐':'yanjiu.html','王夫之':'yanjiu.html','高亨':'yanjiu.html','李镜池':'yanjiu.html','于省吾':'yanjiu.html','闻一多':'yanjiu.html','屈万里':'yanjiu.html','朱伯崑':'yanjiu.html','惠栋':'yanjiu.html','张惠言':'yanjiu.html','焦循':'yanjiu.html','杨简':'yanjiu.html','蔡清':'yanjiu.html','顾颉刚':'yanjiu.html','张三丰':'dandao.html',
    '易学哲学史':'yanjiu.html','易汉学':'yanjiu.html','周易虞氏义':'yanjiu.html','易学三书':'yanjiu.html','杨氏易传':'yanjiu.html','易经蒙引':'yanjiu.html','周易卦爻辞中的故事':'yanjiu.html','玄机直讲':'dandao.html','大丹直指':'dandao.html','医理真传':'yiyi.html',
    '易纬乾凿度':'guaqi.html','左传':'jiaokan.html','八宫卦':'najia.html','六亲':'najia.html#liuqin','游魂归魂':'najia.html','爻辰':'guabian.html','旁通':'guabian.html#pangtong','飞伏':'najia.html#feifu','世应':'najia.html#shiying','心学':'yanjiu.html#school-yili','古史辨':'yanjiu.html#school-kaoju','升降':'guabian.html','时行':'guabian.html','相错':'guabian.html',
    '中医':'yiyi.html','黄帝内经':'yiyi.html','医易义':'yiyi.html','大医习业':'yiyi.html','四圣心源':'yiyi.html','伤寒论':'yiyi.html',
    '坎离':'gua.html#坎离','龙虎':'dandao.html','周天火候':'dandao.html','三花聚顶':'dandao.html','五气朝元':'dandao.html','取坎填离':'dandao.html','乾坤交姤':'dandao.html','活子时':'dandao.html','金丹':'dandao.html',
    '阳气':'yiyi.html','命门':'yiyi.html','六经辨证':'yiyi.html',
    '王亥':'reader.html','帝乙归妹':'reader.html','高宗伐鬼方':'reader.html','箕子明夷':'reader.html','康侯':'reader.html'
  };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function linkify(text){
    if(!text) return '';
    var kws = Object.keys(KW_MAP).sort(function(a,b){return b.length-a.length;});
    kws.forEach(function(k){
      var re = new RegExp(k.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&'),'g');
      text = text.replace(re, '<a class="onto-kw" href="'+KW_MAP[k]+'">'+k+'</a>');
    });
    return text;
  }

  function mapRef(refText){
    if(KW_MAP[refText]) return '<a class="para-ref" href="'+KW_MAP[refText]+'">'+esc(refText)+'</a>';
    return '<span class="para-ref">'+esc(refText)+'</span>';
  }

  // 统一 para 级别映射：core/pang/background/none → yanjiu 样式类
  var LV_MAP = {
    core:       {cls:'para-core',       label:'🔴 本体核心'},
    pang:       {cls:'para-pang',       label:'🟡 易理旁证'},
    background: {cls:'para-background', label:''},
    none:       {cls:'para-none',       label:''}
  };
  var LV_MAP_DAN = { // dandao 页用 core/wuxing/indirect/background/unrelated
    core:       {cls:'para-core',       label:'🔴 本体核心'},
    pang:       {cls:'para-wuxing',     label:'🟡 易理旁证'},
    background: {cls:'para-background', label:''},
    none:       {cls:'para-unrelated',  label:''}
  };
  var LV_MAP_YI = { // yiyi 页用 core/indirect/background/unrelated
    core:       {cls:'para-core',       label:'🔴 本体核心'},
    pang:       {cls:'para-indirect',   label:'🟡 易理旁证'},
    background: {cls:'para-background', label:''},
    none:       {cls:'para-unrelated',  label:''}
  };

  function renderBookHTML(book, lvMap, showAuthor){
    if(!book || !book.paras) return '';
    var html = '<div class="classic-book">';
    html += '<div class="classic-book-head"><h3>《'+esc(book.title)+'》</h3>';
    if(showAuthor!==false && book.author){
      html += '<p style="color:var(--zhu);font-family:var(--kai);">'+esc(book.author);
      if(book.era) html += '（'+esc(book.era)+'）';
      html += '</p>';
    }
    if(book.intro){
      html += '<p>'+linkify(book.intro)+'</p>';
    }
    html += '</div>';
    html += '<div class="classic-wrap">';
    html += '<h4 class="chapter-title">原典选段</h4>';
    book.paras.forEach(function(p){
      var lv = lvMap[p.level] || lvMap.background;
      html += '<div class="classic-para '+lv.cls+'">';
      if(lv.label) html += '<span class="para-badge badge-'+lv.cls.replace('para-','')+'">'+lv.label+'</span>';
      var head = '';
      if(p.name) head = '<div class="para-name">'+esc(p.name)+'</div>';
      html += head;
      html += '<div class="para-text">'+linkify(p.body)+'</div>';
      if(p.refs && p.refs.length && (p.level==='core' || p.level==='pang')){
        html += '<div class="para-refs"><span class="para-refs-label">↩ 关联本体：</span>';
        p.refs.forEach(function(r){ html += mapRef(r); });
        html += '</div>';
      }
      html += '</div>';
    });
    html += '</div></div>';
    return html;
  }

  function loadClassics(cb){
    if(window.CLASSICS){cb();return;}
    var s = document.createElement('script');
    s.src = 'data/classics.js?v=20261110h';
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }

  function appendBooks(containerId, ids, lvMap){
    var wrap = document.getElementById(containerId);
    if(!wrap) return;
    loadClassics(function(){
      if(!window.CLASSICS) return;
      // 已追加过不重复追加
      if(wrap.getAttribute('data-adapter-appended')) return;
      var html = '';
      ids.forEach(function(id){
        var book = window.CLASSICS[id];
        if(book) html += renderBookHTML(book, lvMap, true);
      });
      if(html){
        wrap.insertAdjacentHTML('beforeend', html);
        wrap.setAttribute('data-adapter-appended','1');
      }
    });
  }

  window.__classicAdapter = {
    appendToYanjiu: function(ids){ appendBooks('wujiaYuandian', ids, LV_MAP); },
    appendToDandao: function(ids){ appendBooks('yuandianWrap', ids, LV_MAP_DAN); },
    appendToYiYi:  function(ids){ appendBooks('yiBooksWrap',  ids, LV_MAP_YI); }
  };
})();
