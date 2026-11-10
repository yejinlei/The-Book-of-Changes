/* 星象罗盘 SVG 工具（可在页面中通过 YJ_Compass 注入） */
window.YJ_Compass = (function(){
  // 二十八宿名（按方位：东七宿→北→西→南，顺时针一圈）
  var xings = ['角','亢','氐','房','心','尾','箕',
               '斗','牛','女','虚','危','室','壁',
               '奎','娄','胃','昴','毕','觜','参',
               '井','鬼','柳','星','张','翼','轸'];
  // 十天干十二地支（最外圈）
  var dizhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var tiangan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  // 八卦名（从乾起顺时针：乾、兑、离、震、巽、坎、艮、坤 — 后天方位）
  var bagua = [
    {name:'離',sym:'☲',dir:'南'},
    {name:'坤',sym:'☷',dir:'西南'},
    {name:'兌',sym:'☱',dir:'西'},
    {name:'乾',sym:'☰',dir:'西北'},
    {name:'坎',sym:'☵',dir:'北'},
    {name:'艮',sym:'☶',dir:'东北'},
    {name:'震',sym:'☳',dir:'东'},
    {name:'巽',sym:'☴',dir:'东南'}
  ];

  function polar(cx,cy,r,deg){
    var a=(deg-90)*Math.PI/180;
    return {x:cx+r*Math.cos(a), y:cy+r*Math.sin(a)};
  }
  function txt(cx,cy,r,deg,text,opts){
    opts=opts||{};
    var p=polar(cx,cy,r,deg);
    return '<text x="'+p.x+'" y="'+p.y+'" fill="'+(opts.color||'#c8d3e5')+'" font-size="'+(opts.size||12)+'" font-family="STKaiti,KaiTi,serif" text-anchor="middle" dominant-baseline="middle" '+(opts.rotate?'transform="rotate('+(deg)+' '+p.x+' '+p.y+')"':'')+'>'+text+'</text>';
  }
  function ring(cx,cy,r,color,w,opacity){
    return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+(color||'rgba(200,215,240,.22)')+'" stroke-width="'+(w||1)+'" opacity="'+(opacity==null?1:opacity)+'"/>';
  }
  function line(cx,cy,r1,r2,deg,color,w){
    var p1=polar(cx,cy,r1,deg), p2=polar(cx,cy,r2,deg);
    return '<line x1="'+p1.x+'" y1="'+p1.y+'" x2="'+p2.x+'" y2="'+p2.y+'" stroke="'+(color||'rgba(200,215,240,.22)')+'" stroke-width="'+(w||.6)+'"/>';
  }

  function build(size){
    size = size || 560;
    var cx = size/2, cy = size/2;
    var R = size/2 - 20;
    var parts = [];
    // 中心发光圆
    parts.push('<radialGradient id="yj-cg'+size+'"><stop offset="0%" stop-color="rgba(180,210,250,.55)"/><stop offset="40%" stop-color="rgba(90,130,200,.25)"/><stop offset="100%" stop-color="rgba(10,22,40,0)"/></radialGradient>');
    parts.push('<circle cx="'+cx+'" cy="'+cy+'" r="'+(R*0.32)+'" fill="url(#yj-cg'+size+')"/>');
    parts.push('<circle cx="'+cx+'" cy="'+cy+'" r="'+(R*0.08)+'" fill="rgba(239,213,164,.85)"/>');

    // 四层同心环
    [R, R*0.88, R*0.78, R*0.60, R*0.45, R*0.32].forEach(function(r,i){
      parts.push(ring(cx,cy,r,i===0?'rgba(200,215,240,.45)':(i===3?'rgba(217,74,74,.35)':'rgba(200,215,240,.18)'), i===0?1.2:(i===3?1:.7)));
    });

    // 二十八宿外圈：每 360/28 ≈ 12.86 度一格
    var step28 = 360/28;
    for(var i=0;i<28;i++){
      var deg=i*step28;
      parts.push(line(cx,cy,R*0.88,R,deg));
      parts.push(txt(cx,cy,R*0.94,deg+step28/2,xings[i],{size:Math.round(size*12/560)}));
    }

    // 十二地支环
    var step12=30;
    for(var i=0;i<12;i++){
      var d=i*step12;
      parts.push(line(cx,cy,R*0.78,R*0.88,d,'rgba(239,213,164,.35)',.9));
      parts.push(txt(cx,cy,R*0.83,d+15,dizhi[i],{color:'#efd5a4',size:Math.round(size*13/560)}));
    }

    // 十天干（去掉戊己中宫后分八方，简单处理：按 10 分均匀列在 R*0.70 带）
    var step10=36;
    for(var i=0;i<10;i++){
      var d=i*step10;
      parts.push(txt(cx,cy,R*0.72,d+18,tiangan[i],{color:'rgba(239,213,164,.7)',size:Math.round(size*11/560)}));
    }

    // 八卦环（后天方位：离正南/坎正北…）
    var bgDegs=[90,135,180,225,270,315,0,45]; // 南→西南→西→…→东南（顺时针）
    for(var i=0;i<8;i++){
      var d=bgDegs[i];
      parts.push(line(cx,cy,R*0.45,R*0.60,d,'rgba(217,74,74,.35)',.8));
      var pp=polar(cx,cy,R*0.52,d);
      parts.push('<text x="'+pp.x+'" y="'+pp.y+'" fill="rgba(239,213,164,.9)" font-size="'+Math.round(size*20/560)+'" font-family="STKaiti,KaiTi,serif" text-anchor="middle" dominant-baseline="middle" font-weight="700">'+bagua[i].name+'</text>');
      var pp2=polar(cx,cy,R*0.40,d);
      parts.push('<text x="'+pp2.x+'" y="'+pp2.y+'" fill="#e8edf5" font-size="'+Math.round(size*22/560)+'" text-anchor="middle" dominant-baseline="middle">'+bagua[i].sym+'</text>');
    }

    // 星点装饰
    for(var i=0;i<24;i++){
      var ang=Math.random()*360;
      var rr=R*(0.9+Math.random()*0.08);
      var p=polar(cx,cy,rr,ang);
      var sz=Math.random()<0.15?2:1;
      parts.push('<circle cx="'+p.x+'" cy="'+p.y+'" r="'+sz+'" fill="rgba(255,245,210,'+(0.4+Math.random()*0.5)+')"/>');
    }

    // 指针（从中心到离位正南向上）
    // 让罗盘看起来像星盘仪：加8条放射线
    for(var i=0;i<8;i++){
      parts.push(line(cx,cy,R*0.10,R*0.32,i*45,'rgba(239,213,164,.25)',.6));
    }

    return '<svg class="yj-compass" viewBox="0 0 '+size+' '+size+'" width="'+size+'" height="'+size+'" xmlns="http://www.w3.org/2000/svg" style="animation:yjRot 180s linear infinite;">' + parts.join('') + '</svg>';
  }

  function attach(el, size){
    if(!el) return;
    el.innerHTML = build(size||560);
  }

  // 注入旋转动画 keyframes（仅一次）
  (function(){
    if(document.getElementById('yj-compass-kf')) return;
    var s=document.createElement('style');
    s.id='yj-compass-kf';
    s.textContent='@keyframes yjRot{to{transform:rotate(360deg);}} .yj-compass{filter:drop-shadow(0 0 18px rgba(100,150,220,.35));}';
    (document.head||document.documentElement).appendChild(s);
  })();

  return { build:build, attach:attach };
})();
