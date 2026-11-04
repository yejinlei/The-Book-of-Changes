/* ============================================================
 * 《易·化》变化剧本 —— 主控制器
 * ------------------------------------------------------------
 * 单一 rAF 时间轴，串联三层：
 *   底层 three.js 氛围（ChangeScene3D）
 *   中层 SVG 卦爻（ChangeSVG）
 *   顶层 字幕/控制条（本文件）
 *
 * 挂载：
 *   ChangeAnim.mount('#change-anim', ONT)
 * ============================================================ */
(function () {
  'use strict';

  function mount(sel, ONT) {
    const root = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!root) { console.warn('[ChangeAnim] 找不到容器', sel); return null; }
    if (!window.YJStoryboard || !window.ChangeSVG) { console.warn('[ChangeAnim] 依赖未加载'); return null; }

    const sb = window.YJStoryboard.build(ONT);

    // 骨架
    root.innerHTML = '';
    root.classList.add('change-anim');
    root.innerHTML = `
      <div class="ca-stage">
        <div class="ca-gl-canvas" aria-hidden="true"></div>
        <div class="ca-svg-holder"></div>
        <div class="ca-caption" aria-live="polite"></div>
      </div>
      <div class="ca-bar">
        <button class="ca-btn ca-play" title="播放/暂停" aria-label="播放暂停">⏸</button>
        <div class="ca-track" role="slider" aria-label="进度" tabindex="0">
          <div class="ca-fill"></div>
          <div class="ca-dots"></div>
        </div>
        <span class="ca-time">0s / ${Math.round(sb.total)}s</span>
        <button class="ca-btn ca-replay" title="重播" aria-label="重播">↺</button>
        <button class="ca-btn ca-full" title="全屏" aria-label="全屏">⛶</button>
      </div>
      <div class="ca-scenes"></div>
    `;

    const stageEl = root.querySelector('.ca-stage');
    const glHolder = root.querySelector('.ca-gl-canvas');
    const svgHolder = root.querySelector('.ca-svg-holder');
    const captionEl = root.querySelector('.ca-caption');
    const bar = root.querySelector('.ca-bar');
    const track = root.querySelector('.ca-track');
    const fill = root.querySelector('.ca-fill');
    const dots = root.querySelector('.ca-dots');
    const timeEl = root.querySelector('.ca-time');
    const btnPlay = root.querySelector('.ca-play');
    const btnReplay = root.querySelector('.ca-replay');
    const btnFull = root.querySelector('.ca-full');
    const scenesEl = root.querySelector('.ca-scenes');

    // 三层
    const svgLayer = window.ChangeSVG.create(svgHolder, sb, ONT);
    const glLayer = (window.ChangeScene3D && window.THREE) ? window.ChangeScene3D.create(glHolder, sb) : { render() { }, resize() { }, dispose() { } };

    // 幕标（跳幕）
    sb.scenes.forEach(sc => {
      const b = document.createElement('button');
      b.className = 'ca-scene-btn';
      b.textContent = sc.title;
      b.dataset.key = sc.key;
      b.addEventListener('click', () => { t = sc.start + 0.01; playing = true; updatePlayBtn(); });
      scenesEl.appendChild(b);
      const dot = document.createElement('i');
      dot.className = 'ca-dot';
      dot.dataset.key = sc.key;
      dot.style.left = (sc.start / sb.total * 100) + '%';
      dot.title = sc.title;
      dots.appendChild(dot);
    });

    // 状态
    let t = 0, playing = true, last = 0, raf = 0, visible = true;

    function loop(ts) {
      raf = requestAnimationFrame(loop);
      if (!last) last = ts;
      const dt = (ts - last) / 1000; last = ts;
      if (!visible) return;
      if (playing) {
        t += dt;
        if (t >= sb.total) { t = sb.total - 0.001; playing = false; updatePlayBtn(); }
      }
      frame();
    }

    function frame() {
      svgLayer.render(t);
      glLayer.render(t);
      fill.style.width = (t / sb.total * 100) + '%';
      timeEl.textContent = Math.round(t) + 's / ' + Math.round(sb.total) + 's';
      const sc = sb.sceneAt(t);
      captionEl.textContent = sc.text || '';
      captionEl.style.opacity = sc.text ? 1 : 0;
      // 高亮当前幕
      scenesEl.querySelectorAll('.ca-scene-btn').forEach(b => b.classList.toggle('active', b.dataset.key === sc.key));
    }

    function updatePlayBtn() { btnPlay.textContent = playing ? '⏸' : '▶'; }

    function seek(frac) {
      t = Math.max(0, Math.min(sb.total - 0.001, frac * sb.total));
      frame();
    }

    // 交互
    btnPlay.addEventListener('click', () => { playing = !playing; last = 0; updatePlayBtn(); });
    btnReplay.addEventListener('click', () => { t = 0; playing = true; updatePlayBtn(); frame(); });
    btnFull.addEventListener('click', () => {
      if (!document.fullscreenElement) { (root.requestFullscreen ? root.requestFullscreen() : null); }
      else { document.exitFullscreen && document.exitFullscreen(); }
    });
    let dragging = false;
    function posToFrac(e) {
      const r = track.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      return Math.max(0, Math.min(1, x / r.width));
    }
    track.addEventListener('pointerdown', e => { dragging = true; playing = false; updatePlayBtn(); seek(posToFrac(e)); });
    window.addEventListener('pointermove', e => { if (dragging) seek(posToFrac(e)); });
    window.addEventListener('pointerup', () => { dragging = false; });

    // 可见性 & 尺寸
    const io = new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible) last = 0; }), { threshold: 0.08 });
    io.observe(root);
    let rt = 0;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => glLayer.resize(), 150); });

    // 启动
    updatePlayBtn();
    frame();
    raf = requestAnimationFrame(loop);

    return {
      storyboard: sb,
      render: frame,
      pause: () => { playing = false; updatePlayBtn(); },
      dispose: () => { cancelAnimationFrame(raf); io.disconnect(); glLayer.dispose(); }
    };
  }

  window.ChangeAnim = { mount };
})();
