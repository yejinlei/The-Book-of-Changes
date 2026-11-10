/**
 * 主题早初始化（theme-init.js）
 * 必须放在 <head> 最开头、在所有 <link rel=stylesheet> 之前引用。
 * 同步读取 localStorage 里的 yijing_theme，立即给 <html> 设置 data-theme 与
 * theme-xxx class，保证 CSS 第一帧渲染就用对主题，彻底消除跨页面跳转
 * "先闪一下星象主题再跳到选中主题"或"跳页后主题回到星象"的问题。
 */
(function(){
  try{
    var t = localStorage.getItem('yijing_theme');
    // 白名单校验，防止脏值破坏样式
    var ok = {'star':1,'bronze':1,'bamboo':1,'ink':1,'paper':1};
    if(!t || !ok[t]) t = 'star';
    var d = document.documentElement;
    d.setAttribute('data-theme', t);
    d.classList.remove('theme-star','theme-bronze','theme-bamboo','theme-ink','theme-paper');
    d.classList.add('theme-' + t);
  }catch(e){ /* localStorage 不可用（隐私模式等）时静默降级到默认星象 */ }
})();
