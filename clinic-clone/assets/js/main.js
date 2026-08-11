/* =========================================================
   루미나 피부과 - main.js
   외부 라이브러리 없이 동작하는 바닐라 JS
   ========================================================= */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------
     1. 메인 팝업 (하루동안 보지 않기 = localStorage)
     --------------------------------------------------------- */
  (function popup() {
    var layer = $('#popupLayer');
    if (!layer) return;

    var KEY = 'lumina_popup_hide_until';
    var until = Number(localStorage.getItem(KEY) || 0);
    if (Date.now() < until) return;

    layer.hidden = false;

    function close() {
      if ($('#popupToday').checked) {
        localStorage.setItem(KEY, String(Date.now() + 24 * 60 * 60 * 1000));
      }
      layer.hidden = true;
    }

    $('#popupClose').addEventListener('click', close);
    layer.addEventListener('click', function (e) { if (e.target === layer) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !layer.hidden) close();
    });
  })();

  /* ---------------------------------------------------------
     2. 헤더 - 스크롤 상태 / 스크롤 진행 바 / TOP 버튼
     --------------------------------------------------------- */
  (function header() {
    var top = $('#header');
    var bar = $('#progressBar');
    var toTop = $('#toTop');
    var lastY = 0;
    var ticking = false;

    function onScroll() {
      var y = window.pageYOffset;
      var docH = document.documentElement.scrollHeight - window.innerHeight;

      top.classList.toggle('is-solid', y > 40);
      // 아래로 빠르게 스크롤하면 헤더 숨김 (전체메뉴 열려 있으면 유지)
      if (!top.classList.contains('is-open')) {
        top.classList.toggle('is-hidden', y > 400 && y > lastY + 6);
      }
      if (bar) bar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
      if (toTop) toTop.classList.toggle('is-show', y > 600);

      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });

    onScroll();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  })();

  /* ---------------------------------------------------------
     3. 전체 메뉴(사이트맵) - GNB 구조를 복제해서 채움
     --------------------------------------------------------- */
  (function sitemap() {
    var btn = $('#menuBtn');
    var box = $('#sitemap');
    var cols = $('#sitemapCols');
    var header = $('#header');
    if (!btn || !box) return;

    // GNB 항목을 사이트맵 컬럼으로 복제
    $$('#gnb .gnb-item').forEach(function (item) {
      var title = $('.gnb-link', item).textContent.trim();
      var sub = $('.gnb-sub ul', item);
      var col = document.createElement('div');
      col.className = 'sm-col';
      col.innerHTML = '<h4>' + title + '</h4>';
      if (sub) col.appendChild(sub.cloneNode(true));
      cols.appendChild(col);
    });

    function toggle(open) {
      box.hidden = !open;
      btn.classList.toggle('is-active', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? '전체 메뉴 닫기' : '전체 메뉴 열기');
      header.classList.toggle('is-open', open);
      header.classList.remove('is-hidden');
      document.body.classList.toggle('is-locked', open);
    }

    btn.addEventListener('click', function () { toggle(box.hidden); });
    $('#sitemapClose').addEventListener('click', function () { toggle(false); });
    box.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') toggle(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !box.hidden) toggle(false);
    });
  })();

  /* ---------------------------------------------------------
     4. 스크롤 리빌
     --------------------------------------------------------- */
  (function reveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------
     5. 숫자 카운트업
     --------------------------------------------------------- */
  (function counter() {
    var els = $$('[data-count]');
    if (!els.length || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = Number(el.getAttribute('data-count'));
        var dur = 1600;
        var start = performance.now();

        (function step(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(target * eased).toLocaleString('ko-KR');
          if (p < 1) requestAnimationFrame(step);
        })(start);

        io.unobserve(el);
      });
    }, { threshold: 0.6 });

    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------
     6. 캐러셀 (드래그 / 반응형 / 루프 / 자동재생)
     --------------------------------------------------------- */
  function Carousel(root) {
    var track = $('.carousel-track', root);
    var slides = $$('li', track);
    var prev = $('.carousel-prev', root);
    var next = $('.carousel-next', root);
    var progress = $('.carousel-progress span', root);
    var gap = 24;
    var index = 0;
    var per = 1;
    var maxIndex = 0;
    var autoMs = Number(root.getAttribute('data-auto') || 0);
    var timer = null;

    function perView() {
      var w = window.innerWidth;
      var pick = function (bp) { return root.getAttribute('data-per-' + bp); };
      if (w <= 480 && pick(480)) return parseFloat(pick(480));
      if (w <= 768 && pick(768)) return parseFloat(pick(768));
      if (w <= 1024 && pick(1024)) return parseFloat(pick(1024));
      return parseFloat(root.getAttribute('data-per') || 3);
    }

    function layout() {
      per = perView();
      gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 24;
      var vw = $('.carousel-viewport', root).clientWidth
             - parseFloat(getComputedStyle($('.carousel-viewport', root)).paddingLeft) * 2;
      var slideW = (vw - gap * (Math.ceil(per) - 1)) / per;
      track.style.setProperty('--slide-w', slideW + 'px');
      maxIndex = Math.max(0, slides.length - Math.floor(per));
      index = Math.min(index, maxIndex);
      move(false);
    }

    function move(animate) {
      if (animate === false) track.style.transition = 'none';
      var slideW = parseFloat(getComputedStyle(track).getPropertyValue('--slide-w'));
      track.style.transform = 'translate3d(' + (-index * (slideW + gap)) + 'px,0,0)';
      if (animate === false) {
        void track.offsetWidth;               // 리플로우로 transition 복원
        track.style.transition = '';
      }
      if (progress) {
        var ratio = maxIndex === 0 ? 1 : (index + 1) / (maxIndex + 1);
        progress.style.width = Math.max(ratio * 100, 8) + '%';
      }
    }

    function go(dir) {
      index += dir;
      if (index > maxIndex) index = 0;
      if (index < 0) index = maxIndex;
      move(true);
    }

    prev && prev.addEventListener('click', function () { go(-1); restart(); });
    next && next.addEventListener('click', function () { go(1); restart(); });

    /* 드래그 / 스와이프 */
    var startX = 0, startT = 0, dragging = false;

    function pointerDown(e) {
      dragging = true;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      startT = -index * (parseFloat(getComputedStyle(track).getPropertyValue('--slide-w')) + gap);
      track.classList.add('is-dragging');
      stop();
    }
    function pointerMove(e) {
      if (!dragging) return;
      var x = (e.touches ? e.touches[0].clientX : e.clientX);
      track.style.transform = 'translate3d(' + (startT + (x - startX)) + 'px,0,0)';
    }
    function pointerUp(e) {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      var x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
      var diff = x - startX;
      if (Math.abs(diff) > 60) go(diff < 0 ? 1 : -1);
      else move(true);
      restart();
    }

    track.addEventListener('mousedown', pointerDown);
    window.addEventListener('mousemove', pointerMove);
    window.addEventListener('mouseup', pointerUp);
    track.addEventListener('touchstart', pointerDown, { passive: true });
    track.addEventListener('touchmove', pointerMove, { passive: true });
    track.addEventListener('touchend', pointerUp);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* 자동 재생 */
    function start() { if (autoMs) timer = setInterval(function () { go(1); }, autoMs); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    window.addEventListener('resize', debounce(layout, 150));
    layout();
    start();
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  $$('[data-carousel]').forEach(function (el) { new Carousel(el); });

  /* ---------------------------------------------------------
     7. 전후사진 카드 전환
     --------------------------------------------------------- */
  $$('.ba-flip').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('.ba-card').classList.toggle('is-flipped');
    });
  });

  /* ---------------------------------------------------------
     8. 퀵메뉴 접기/펴기
     --------------------------------------------------------- */
  (function quick() {
    var q = $('#quick');
    var t = $('#quickToggle');
    if (!q || !t) return;
    t.addEventListener('click', function () {
      var closed = q.classList.toggle('is-closed');
      t.textContent = closed ? '+' : '−';
      t.setAttribute('aria-expanded', String(!closed));
      t.setAttribute('aria-label', closed ? '퀵 메뉴 펼치기' : '퀵 메뉴 접기');
    });
  })();

  /* ---------------------------------------------------------
     9. 앵커 이동 시 고정 헤더 높이 보정
     --------------------------------------------------------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = $('#header').offsetHeight;
      var y = target.getBoundingClientRect().top + window.pageYOffset - offset + 1;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();
