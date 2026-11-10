
// 通用典籍渲染组件 v20261110
// books: [{id,title,author,intro,juan:[{title,paras:[{level:core/pang/none,text,refs:[{text,href}]}]}]}]
function renderClassicBooks(wrap, books){
  if(!wrap)return;
  var KW=[
    ['阴阳','reader.html#key-yinyang'],
    ['乾坤','gua.html#乾坤'],['坎离','gua.html#坎离'],
    ['乾卦','reader.html#乾'],['坤卦','reader.html#坤'],
    ['乾','reader.html#乾'],['坤','reader.html#坤'],['坎','reader.html#坎'],['离','reader.html#离'],
    ['震','reader.html#震'],['艮','reader.html#艮'],['巽','reader.html#巽'],['兑','reader.html#兑'],
    ['复卦','reader.html#復'],['剥卦','reader.html#剝'],['泰卦','reader.html#泰'],['否卦','reader.html#否'],
    ['既济','reader.html#既濟'],['未济','reader.html#未濟'],
    ['中孚卦','reader.html#中孚'],
    ['五行','yitu.html#wuxing'],['河图','yitu.html#hetu'],['洛书','yitu.html#luoshu'],['河图洛书','yitu.html'],
    ['太极','yitu.html#taiji'],['八卦','yitu.html#bagua'],['六十四卦','gua.html'],
    ['三百八十四爻','reader.html'],['中爻','shiyi.html'],
    ['五运六气','yiyi.html#yunqi'],['六经辨证','yiyi.html#liujing'],
    ['十二消息卦','guaqi.html#xiaoxi'],['消息卦','guaqi.html#xiaoxi'],['卦气','guaqi.html'],
    ['纳甲','najia.html'],['八宫卦','najia.html#bagong'],
    ['十翼','shiyi.html'],['系辞','shiyi.html'],['彖传','shiyi.html'],['象传','shiyi.html'],
    ['卦主说','yanjiu.html#zj-wangbi'],
    ['变易','bianhua.html'],['不易','bianhua.html'],['简易','index.html'],
  ];
  function linkify(text){
    var s=text;
    // 不要重复 linkify 已经是 <a> 的内容：先简单按关键词替换（因为onHTML是我们自己生成的，顺序可控）
    KW.forEach(function(k){
      // 避免替换已在 href 或已在标签里的（简单用不检查，因为我们的段文本都是纯文本，已经带<a>的用u/onto-kw类区分）
      var re=new RegExp('(?![^<]*>)('+k[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','g');
      s=s.replace(re,'<a class="onto-kw" href="'+k[1]+'">$1</a>');
    });
    return s;
  }
  var LV={
    core:{cls:'core',label:'🔴 本体核心',badge:'badge-core'},
    pang:{cls:'pang',label:'🟡 易理旁证',badge:'badge-pang'},
    indirect:{cls:'pang',label:'🟡 易理旁证',badge:'badge-pang'},
    background:{cls:'none',label:'',badge:''},
    none:{cls:'none',label:'',badge:''},
    unrelated:{cls:'none',label:'',badge:''}
  };
  var html='';
  books.forEach(function(book){
    html+='<div class="classic-book">';
    html+='<div class="classic-book-head"><h3>《'+book.title+'》</h3>'+
      '<p>'+book.author+'</p>'+
      '<p>'+linkify(book.intro)+'</p></div>';
    html+='<div class="classic-wrap">';
    (book.juan||[]).forEach(function(ch){
      if(ch.title) html+='<h4 class="chapter-title">'+ch.title+'</h4>';
      (ch.paras||[]).forEach(function(p){
        var lv=LV[p.level]||LV.none;
        var refs='';
        if(lv.cls!=='none' && p.refs && p.refs.length){
          refs='<div class="para-refs"><span class="para-refs-label">↩ 关联本体：</span>';
          p.refs.forEach(function(r){refs+='<a class="para-ref" href="'+r.href+'">'+r.text+'</a>';});
          refs+='</div>';
        }
        html+='<div class="classic-para para-'+lv.cls+'">';
        if(lv.label) html+='<span class="para-badge '+lv.badge+'">'+lv.label+'</span>';
        html+='<div class="para-text">'+linkify(p.text)+'</div>';
        if(p.note) html+='<div class="para-note">'+linkify(p.note)+'</div>';
        html+=refs+'</div>';
      });
    });
    html+='</div></div>';
  });
  wrap.innerHTML=html;
}
