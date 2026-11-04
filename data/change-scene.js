/* ============================================================
 * 《易·化》three.js 氛围层 —— 「气」与「虚空」
 * ------------------------------------------------------------
 * 职责：只画氛围（背景粒子星云），不画卦爻（卦爻由 SVG 负责）。
 * 粒子与 64 卦位绑定，随剧本幕次发生：爆散 / 铺开 / 集体翻转 / 上下镜像。
 * 降级：WebGL 不可用或 prefers-reduced-motion 时自动隐藏本层。
 * ============================================================ */
(function () {
  'use strict';

  function create(container, sb) {
    const state = { ok: false, render: function () { }, resize: function () { }, dispose: function () { } };

    // 环境检测与降级
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let THREE;
    try { THREE = window.THREE; } catch (e) { THREE = null; }
    if (!THREE || reduce) return state;

    let renderer, scene, camera, points, geom, mat;
    const N = 64;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const home = new Float32Array(N * 3);   // 铺开后的位置
    const base = new Float32Array(N * 3);   // 混沌起始（中心）

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
      container.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.z = 60;

      // 生成 64 粒子的家位（8×8 平面）
      let k = 0;
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const x = (c - 3.5) * 6.5, y = -(r - 3.5) * 6.5;
        home[k * 3] = x; home[k * 3 + 1] = y; home[k * 3 + 2] = 0;
        base[k * 3] = 0; base[k * 3 + 1] = 0; base[k * 3 + 2] = 0;
        k++;
      }
      pos.set(base);
      // 颜色：朱红 → 鎏金渐变（阴阳）
      for (let i = 0; i < N; i++) {
        const t = i / N;
        col[i * 3] = 0.545 + t * 0.18;      // r
        col[i * 3 + 1] = 0.0 + t * 0.54;    // g
        col[i * 3 + 2] = 0.0 + t * 0.04;    // b
      }
      geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(col, 3));
      mat = new THREE.PointsMaterial({ size: 0.9, vertexColors: true, transparent: true, opacity: 0.0, depthWrite: false });
      points = new THREE.Points(geom, mat);
      scene.add(points);

      state.ok = true;
    } catch (e) {
      return state;
    }

    // 按幕渲染：t 秒
    // 用 storyboard 的幕进度驱动粒子群
    function render(t) {
      if (!state.ok) return;
      const sc = sb.sceneAt(t);
      const p = sb.prog(t, sc);
      const a = geom.attributes.position.array;
      let opacity = 0.0;

      if (sc.key === 'wuji' || sc.key === 'daosheng') {
        // 混沌：全部聚于中心，微光呼吸
        const spread = sc.key === 'daosheng' ? Math.max(0, (p - 0.5)) * 2 : 0;
        for (let i = 0; i < N; i++) {
          const r = spread * 8 * (1 + (i % 5) * 0.15);
          const ang = i * 0.618 * Math.PI * 2;
          a[i * 3] = Math.cos(ang) * r;
          a[i * 3 + 1] = Math.sin(ang) * r;
          a[i * 3 + 2] = Math.sin(i + t) * (1 - spread) * 0.6;
        }
        opacity = 0.35;
      } else if (['liangyi', 'sixiang', 'bagua'].includes(sc.key)) {
        // 铺开成环
        for (let i = 0; i < N; i++) {
          const ang = (i / N) * Math.PI * 2 + p * 0.6;
          const r = 14 + Math.sin(i * 0.7 + p * 4) * 2;
          a[i * 3] = Math.cos(ang) * r;
          a[i * 3 + 1] = Math.sin(ang) * r * 0.62;
          a[i * 3 + 2] = Math.sin(i + t * 0.8) * 1.2;
        }
        opacity = 0.4;
      } else {
        // liushisi 起：铺成 8×8 星图
        const q = sc.key === 'liushisi' ? Math.min(1, p * 1.5) : 1;
        for (let i = 0; i < N; i++) {
          a[i * 3] = a[i * 3] * (1 - q) + home[i * 3] * q;
          a[i * 3 + 1] = a[i * 3 + 1] * (1 - q) + home[i * 3 + 1] * q;
          a[i * 3 + 2] = Math.sin(i * 0.5 + t * 0.7) * 1.0;
        }
        opacity = 0.45;
        // 错卦：集体翻转（z 轴翻转 + 颜色冷化）
        if (sc.key === 'cuo') {
          const f = p < 0.5 ? p * 2 : 1;
          for (let i = 0; i < N; i++) a[i * 3 + 2] = (1 - f) * Math.sin(i + t) * 2 + f * (i % 2 ? 3 : -3);
          mat.opacity = 0.45;
        }
        // 综卦：整体上下镜像
        if (sc.key === 'zong') {
          const f = sb.Ease.inOut(Math.min(1, p * 1.8));
          points.scale.y = 1 - 2 * f;
        } else {
          points.scale.y = 1;
        }
      }
      geom.attributes.position.needsUpdate = true;
      mat.opacity = opacity * (0.7 + 0.3 * Math.sin(t * 1.2));
      // 整体缓慢自转
      points.rotation.z = Math.sin(t * 0.05) * 0.12;
      renderer.render(scene, camera);
    }

    function resize() {
      if (!state.ok) return;
      const w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    function dispose() {
      try { renderer.dispose(); if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement); } catch (e) { }
    }

    state.render = render; state.resize = resize; state.dispose = dispose;
    return state;
  }

  window.ChangeScene3D = { create };
})();
