/* =========================================================
   main.js — 외부 라이브러리 없이 동작하는 바닐라 JS
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  /* ---------------------------------------------------------
     1. 메인 팝업
        원본 스펙: 1000x538 (이미지 469 + 탭바 35 + 푸터 34)
        루프 슬라이더, 전환 0.8s, 탭바 클릭으로 이동
     --------------------------------------------------------- */
  (function popup() {
    var sect = $('#hd_pops');
    if (!sect) return;

    var KEY = 'lumina_popup_hide_until';
    if (Date.now() < Number(localStorage.getItem(KEY) || 0)) return;

    sect.hidden = false;

    var wrap = $('.popup-wrapper', sect);
    var slides = $$('.popup-slide', sect);
    var bullets = $$('.popup-bullet', sect);
    var idx = 0;
    var timer = null;

    function go(n) {
      idx = (n + slides.length) % slides.length;
      wrap.style.transform = 'translate3d(' + (-idx * 100) + '%,0,0)';
      bullets.forEach(function (b, i) { b.classList.toggle('is-active', i === idx); });
    }

    bullets.forEach(function (b) {
      b.addEventListener('click', function () { go(Number(b.dataset.idx)); restart(); });
    });

    function start() { timer = setInterval(function () { go(idx + 1); }, 4000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    sect.addEventListener('mouseenter', stop);
    sect.addEventListener('mouseleave', start);

    function close() { stop(); sect.hidden = true; }

    $('.main-popup-close', sect).addEventListener('click', close);
    $('.main-popup-bg', sect).addEventListener('click', close);
    $('.hd_pops_reject', sect).addEventListener('click', function () {
      localStorage.setItem(KEY, String(Date.now() + 24 * 60 * 60 * 1000));
      close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sect.hidden) close();
    });

    go(0);
    start();
  })();

  /* ---------------------------------------------------------
     2. 헤더 / 스크롤 진행 바 / TOP
     --------------------------------------------------------- */
  (function header() {
    var top = $('#header');
    var bar = $('#progressBar');
    var toTop = $('#toTop');
    var ticking = false;

    // 헤더는 항상 보이게 고정합니다.
    // 이전에는 스크롤 방향에 따라 숨겼는데, 매 프레임 lastY를 갱신하다 보니
    // 작은 흔들림에도 숨김/표시가 계속 뒤집혀 위아래로 떨렸습니다.
    function onScroll() {
      var y = window.pageYOffset;
      var docH = document.documentElement.scrollHeight - window.innerHeight;

      top.classList.toggle('is-solid', y > 40);
      if (bar) bar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
      if (toTop) toTop.classList.toggle('is-show', y > 600);

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  })();

  /* ---------------------------------------------------------
     3. 전체 메뉴
     --------------------------------------------------------- */
  (function sitemap() {
    var btn = $('#menuBtn'), box = $('#sitemap'), head = $('#header');
    if (!btn || !box) return;

    function toggle(open) {
      box.hidden = !open;
      btn.classList.toggle('is-active', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? '전체 메뉴 닫기' : '전체 메뉴 열기');
      head.classList.toggle('is-open', open);
      head.classList.remove('is-hidden');
      document.body.classList.toggle('is-locked', open);
    }

    btn.addEventListener('click', function () { toggle(box.hidden); });
    $('#sitemapClose').addEventListener('click', function () { toggle(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) toggle(false); });
  })();

  /* ---------------------------------------------------------
     4. 리빌 (원본과 동일하게 .active 부여)
     --------------------------------------------------------- */
  (function reveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('active'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('active'); io.unobserve(e.target); }
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

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = Number(el.dataset.count), dur = 1600, start = performance.now();
        (function step(now) {
          var p = Math.min((now - start) / dur, 1);
          el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString('ko-KR');
          if (p < 1) requestAnimationFrame(step);
        })(start);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------
     6. 캐러셀
     --------------------------------------------------------- */
  function Carousel(root) {
    var track = $('.carousel-track', root);
    var slides = $$('li', track);
    var viewport = $('.carousel-viewport', root);
    var prev = $('.carousel-prev', root), next = $('.carousel-next', root);
    var progress = $('.carousel-progress span', root);
    var autoMs = Number(root.dataset.auto || 0);
    var gap = 25, index = 0, per = 1, maxIndex = 0, timer = null;

    function perView() {
      var w = window.innerWidth, d = root.dataset;
      if (w <= 480 && d.per480) return parseFloat(d.per480);
      if (w <= 768 && d.per768) return parseFloat(d.per768);
      if (w <= 1024 && d.per1024) return parseFloat(d.per1024);
      if (w <= 1280 && d.per1280) return parseFloat(d.per1280);
      return parseFloat(d.per || 3);
    }

    function slideW() {
      return parseFloat(getComputedStyle(track).getPropertyValue('--slide-w')) || 0;
    }

    function layout() {
      per = perView();
      var cs = getComputedStyle(track);
      gap = parseFloat(cs.columnGap || cs.gap) || 25;
      // 뷰포트는 풀블리드이므로 자체 clientWidth를 그대로 씁니다.
      // (예전엔 padding-inline 으로 좌우를 깎아 카드가 찌그러졌습니다)
      var vw = viewport.clientWidth;
      track.style.setProperty('--slide-w', ((vw - gap * (Math.ceil(per) - 1)) / per) + 'px');
      maxIndex = Math.max(0, slides.length - Math.floor(per));
      index = Math.min(index, maxIndex);
      move(false);
    }

    function move(animate) {
      if (animate === false) track.style.transition = 'none';
      track.style.transform = 'translate3d(' + (-index * (slideW() + gap)) + 'px,0,0)';
      if (animate === false) { void track.offsetWidth; track.style.transition = ''; }
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

    var startX = 0, startT = 0, dragging = false;
    function down(e) {
      dragging = true;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      startT = -index * (slideW() + gap);
      track.classList.add('is-dragging');
      stop();
    }
    function movePt(e) {
      if (!dragging) return;
      var x = e.touches ? e.touches[0].clientX : e.clientX;
      track.style.transform = 'translate3d(' + (startT + (x - startX)) + 'px,0,0)';
    }
    function up(e) {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      var x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      var diff = x - startX;
      if (Math.abs(diff) > 60) go(diff < 0 ? 1 : -1); else move(true);
      restart();
    }

    track.addEventListener('mousedown', down);
    window.addEventListener('mousemove', movePt);
    window.addEventListener('mouseup', up);
    track.addEventListener('touchstart', down, { passive: true });
    track.addEventListener('touchmove', movePt, { passive: true });
    track.addEventListener('touchend', up);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });

    function start() { if (autoMs) timer = setInterval(function () { go(1); }, autoMs); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    window.addEventListener('resize', debounce(layout, 150));

    layout();
    start();
  }
  $$('[data-carousel]').forEach(function (el) { new Carousel(el); });

  /* ---------------------------------------------------------
     7. 전후사진 전환
     --------------------------------------------------------- */
  $$('.ba-flip').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('.ba-card').classList.toggle('is-flipped');
    });
  });

  /* ---------------------------------------------------------
     8. FAQ 아코디언
     --------------------------------------------------------- */
  $$('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------------------------------------------------------
     9. 게시판 검색 (클라이언트 필터)
     --------------------------------------------------------- */
  (function boardSearch() {
    var input = $('[data-board-search]');
    var list = $('[data-board-list]');
    if (!input || !list) return;
    var empty = $('.board-empty');

    input.addEventListener('input', debounce(function () {
      var q = input.value.trim().toLowerCase();
      var hit = 0;
      $$('li', list).forEach(function (li) {
        var show = !q || li.innerText.toLowerCase().indexOf(q) > -1;
        li.hidden = !show;
        if (show) hit++;
      });
      if (empty) empty.hidden = hit !== 0;
    }, 200));
  })();

  /* ---------------------------------------------------------
     10. 퀵메뉴
     --------------------------------------------------------- */
  (function quick() {
    var q = $('#quick'), t = $('#quickToggle');
    if (!q || !t) return;
    t.addEventListener('click', function () {
      var closed = q.classList.toggle('is-closed');
      t.textContent = closed ? '+' : '−';
      t.setAttribute('aria-expanded', String(!closed));
      t.setAttribute('aria-label', closed ? '퀵 메뉴 펼치기' : '퀵 메뉴 접기');
    });
  })();

  /* ---------------------------------------------------------
     11. 앵커 이동 시 고정 헤더 보정
     --------------------------------------------------------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.pageYOffset - $('#header').offsetHeight + 1;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();
