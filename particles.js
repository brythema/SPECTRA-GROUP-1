/* ═══════════════════════════════════════════════════════════════
   SPECTRA GROUP — PARTICLE SCENE ENGINE
   Auto-initializes on every <canvas data-particles> element.
   Three scene "modes", chosen per-section via data-mode so the
   background changes character as you scroll:

     network  (default) — connected dot network, mouse-reactive.
               Used for the hero and secondary photo/photoless heroes.
     rain     — particles fall and reset, like the section is
               "raining in" as it scrolls into view.
     flow     — particles drift like a river, data-direction
               ("right" | "left") sets which way it flows.

   All non-hero canvases fade in/out with scroll position
   (IntersectionObserver) so sections in between can stay
   deliberately blank/quiet — the "breathing room" between scenes.
   Fully skipped for prefers-reduced-motion.
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var COLORS = ['#EF4444', '#F97316', '#F5B400', '#14B8A6', '#3B82F6', '#8B5CF6'];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = matchMedia('(hover: none)').matches;

  function hexToRgb(hex) {
    var v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function rgbToStr(rgb, a) {
    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (a === undefined ? 1 : a) + ')';
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function initNetwork(canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var mode = canvas.dataset.mode || 'network';
    var direction = canvas.dataset.direction === 'left' ? -1 : 1;
    var density = parseFloat(canvas.dataset.density || '1');
    var interactive = mode === 'network' && canvas.dataset.interactive !== 'false' && !isTouch;
    var syncTarget = canvas.dataset.sync ? document.getElementById(canvas.dataset.sync) : null;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    var particles = [];
    var rect = { width: 0, height: 0 };
    var mouse = { x: null, y: null, radius: 110 };
    var running = false;
    var rafId = null;
    var activeColorIdx = 0;
    var t = 0;

    function resize() {
      rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      var divisor = mode === 'network' ? 15000 : mode === 'rain' ? 9000 : 11000;
      var cap = mode === 'network' ? 110 : 80;
      var count = Math.min(cap, Math.max(14, Math.floor((rect.width * rect.height) / divisor * density)));
      particles = [];
      for (var i = 0; i < count; i++) {
        var base = hexToRgb(COLORS[i % COLORS.length]);
        if (mode === 'rain') {
          particles.push({
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            vy: 0.7 + Math.random() * 1.1,
            drift: (Math.random() - 0.5) * 0.3,
            len: 10 + Math.random() * 18,
            rgb: base
          });
        } else if (mode === 'flow') {
          var fy = Math.random() * rect.height;
          particles.push({
            x: Math.random() * rect.width,
            baseY: fy,
            speed: (0.25 + Math.random() * 0.55) * direction,
            amp: 6 + Math.random() * 14,
            freq: 0.4 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
            r: Math.random() * 1.6 + 0.7,
            rgb: base
          });
        } else {
          particles.push({
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r: Math.random() * 1.5 + 0.6,
            rgb: base,
            baseIdx: i % COLORS.length
          });
        }
      }
    }

    if (syncTarget) {
      syncTarget.addEventListener('spectra:colorslide', function (e) {
        activeColorIdx = e.detail.index;
      });
    }

    function stepNetwork() {
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (interactive && mouse.x !== null) {
          var dx = mouse.x - p.x, dy = mouse.y - p.y;
          var dist = Math.hypot(dx, dy);
          if (dist < mouse.radius && dist > 0.01) {
            var f = (mouse.radius - dist) / mouse.radius;
            p.x -= (dx / dist) * f * 1.4;
            p.y -= (dy / dist) * f * 1.4;
          }
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > rect.width) p.vx *= -1;
        if (p.y < 0 || p.y > rect.height) p.vy *= -1;

        var fill;
        if (syncTarget) {
          var target = hexToRgb(COLORS[(p.baseIdx % 3 === 0) ? activeColorIdx : p.baseIdx]);
          p.rgb[0] = lerp(p.rgb[0], target[0], 0.02);
          p.rgb[1] = lerp(p.rgb[1], target[1], 0.02);
          p.rgb[2] = lerp(p.rgb[2], target[2], 0.02);
          fill = rgbToStr(p.rgb.map(Math.round));
        } else {
          fill = rgbToStr(p.rgb, 0.95);
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
      }
      var maxDist = Math.max(60, rect.width / 9);
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var pa = particles[a], pb = particles[b];
          var d = Math.hypot(pa.x - pb.x, pa.y - pb.y);
          if (d < maxDist) {
            ctx.strokeStyle = 'rgba(255,255,255,' + ((1 - d / maxDist) * 0.16) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
          }
        }
      }
    }

    function stepRain() {
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y += p.vy;
        p.x += p.drift;
        if (p.y - p.len > rect.height) {
          p.y = -10;
          p.x = Math.random() * rect.width;
        }
        ctx.strokeStyle = rgbToStr(p.rgb, 0.55);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y - p.len);
        ctx.stroke();
      }
    }

    function stepFlow() {
      t += 0.016;
      var ys = [];
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.speed;
        if (direction > 0 && p.x > rect.width + 10) p.x = -10;
        if (direction < 0 && p.x < -10) p.x = rect.width + 10;
        var y = p.baseY + Math.sin(t * p.freq + p.phase) * p.amp;
        ys.push(y);
        ctx.beginPath();
        ctx.arc(p.x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = rgbToStr(p.rgb, 0.85);
        ctx.fill();
      }
      // faint connecting threads between nearby flow particles for a "current" feel
      var maxDist = 70;
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var pa = particles[a], pb = particles[b];
          var d = Math.hypot(pa.x - pb.x, ys[a] - ys[b]);
          if (d < maxDist) {
            ctx.strokeStyle = 'rgba(255,255,255,' + ((1 - d / maxDist) * 0.12) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pa.x, ys[a]);
            ctx.lineTo(pb.x, ys[b]);
            ctx.stroke();
          }
        }
      }
    }

    function step() {
      if (!running) return;
      ctx.clearRect(0, 0, rect.width, rect.height);
      if (mode === 'rain') stepRain();
      else if (mode === 'flow') stepFlow();
      else stepNetwork();
      rafId = requestAnimationFrame(step);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      step();
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    if (interactive) {
      window.addEventListener('mousemove', function (e) {
        var r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      }, { passive: true });
      window.addEventListener('mouseout', function () {
        mouse.x = null; mouse.y = null;
      }, { passive: true });
    }

    var fadeScroll = canvas.dataset.fade !== 'false' && mode !== 'network';
    if (fadeScroll) canvas.classList.add('scroll-fade');

    if (!reduceMotion && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            start();
            if (fadeScroll) canvas.classList.add('in-view');
          } else {
            stop();
            if (fadeScroll) canvas.classList.remove('in-view');
          }
        });
      }, { threshold: 0.05 });
      io.observe(canvas);
    } else if (!reduceMotion) {
      start();
    }
  }

  function init() {
    var canvases = document.querySelectorAll('canvas[data-particles]');
    canvases.forEach(initNetwork);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
