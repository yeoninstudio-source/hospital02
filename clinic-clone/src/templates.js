/* =========================================================
   렌더 함수 모음
   - shell()  : 공통 레이아웃(헤더/푸터/퀵) 래핑
   - block()  : 서브페이지 콘텐츠 블록 렌더러
   원본 사이트의 유틸리티 클래스 체계(fz_/ls_/lh_/c-/ta_c/reveal)를
   그대로 따르도록 마크업을 구성했습니다.
   ========================================================= */

const site = require('./site');

/* ---------- 경로 도우미 : depth 0 = 루트, 1 = /sub/ ---------- */
function url(href, depth) {
  const up = depth ? '../' : '';
  if (href === 'index') return up + 'index.html';
  if (href === 'notice' || href === 'review') return up + 'board/' + href + '.html';
  if (href.startsWith('#') || href.startsWith('http') || href.startsWith('tel:')) return href;
  return up + 'sub/' + href + '.html';
}
const asset = (p, depth) => (depth ? '../' : '') + 'assets/' + p;

/* ---------- 공통 조각 ---------- */

function header(depth, active) {
  const lineup = site.lineup
    .map(i => `<li><a href="${url(i.href, depth)}">${i.name}</a></li>`).join('');

  const gnb = site.gnb.map(g => {
    const on = g.children.some(c => c.href === active) ? ' is-active' : '';
    const sub = g.children
      .map(c => `<li><a href="${url(c.href, depth)}"${c.href === active ? ' class="on"' : ''}>${c.name}</a></li>`)
      .join('');
    return `<li class="gnb-item${on}">
            <button type="button" class="gnb-link">${g.title}</button>
            <div class="gnb-sub"><p class="gnb-sub-en">${g.en}</p><ul>${sub}</ul></div>
          </li>`;
  }).join('\n          ');

  return `<header class="main-header" id="header">
    <div class="ht-inner">
      <div class="ht-inner__left">
        <span class="lineup-label">LINE UP</span>
        <ul class="lineup-list">${lineup}</ul>
      </div>

      <div class="ht-inner__center">
        <a href="${url('index', depth)}" class="logo">
          <span class="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 34 34" width="34" height="34"><circle cx="17" cy="17" r="16" fill="none" stroke="currentColor" stroke-width="1"/><path d="M6 22c4-9 18-9 22 0" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="17" cy="13" r="3" fill="currentColor"/></svg>
          </span>
          <span class="logo-text">${site.brand}<em>${site.brandKo}</em></span>
        </a>
      </div>

      <div class="ht-inner__right">
        <span class="ht-place">${site.place}</span>
        <a href="${site.telHref}" class="ht-tel">${site.tel}</a>
        <button type="button" class="util-menu" id="menuBtn" aria-label="전체 메뉴 열기" aria-expanded="false" aria-controls="sitemap">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <nav class="gnb" id="gnb" aria-label="주요 메뉴">
      <ul class="gnb-list">
          ${gnb}
      </ul>
      <div class="gnb-bg" aria-hidden="true"></div>
    </nav>
  </header>

  <div class="sitemap" id="sitemap" hidden>
    <div class="sitemap-inner">
      <div class="sitemap-head">
        <p class="sitemap-title sortsmill">SITEMAP</p>
        <button type="button" class="sitemap-close" id="sitemapClose" aria-label="메뉴 닫기">&times;</button>
      </div>
      <div class="sitemap-cols">
        ${site.gnb.map(g => `<div class="sm-col">
          <p class="sm-en sortsmill">${g.en}</p>
          <h4>${g.title}</h4>
          <ul>${g.children.map(c => `<li><a href="${url(c.href, depth)}">${c.name}</a></li>`).join('')}</ul>
        </div>`).join('\n        ')}
      </div>
      <div class="sitemap-foot">
        <a href="${site.telHref}" class="sortsmill">${site.tel}</a>
        <span>${site.hours[0][0]} ${site.hours[0][1]}</span>
      </div>
    </div>
  </div>`;
}

function footer(depth) {
  return `<footer class="bottom">
    <div class="cont-box ft-inner">
      <div class="ft-brand">
        <span class="logo-text">${site.brand}<em>${site.brandKo}</em></span>
        <ul class="ft-policy">
          <li><a href="#">이용약관</a></li>
          <li><a href="#"><strong>개인정보처리방침</strong></a></li>
          <li><a href="#">비급여수가표</a></li>
        </ul>
      </div>
      <div class="ft-info">
        <ul class="ft-meta">
          <li><span>상호</span> ${site.brandKo}</li>
          <li><span>대표</span> ${site.owner}</li>
          <li><span>사업자등록번호</span> ${site.bizNo}</li>
          <li><span>대표번호</span> ${site.tel}</li>
          <li><span>E-mail</span> ${site.email}</li>
          <li class="full"><span>주소</span> ${site.addr}</li>
        </ul>
        <p class="ft-copy sortsmill">COPYRIGHT &copy; ${site.brand} CLINIC. ALL RIGHTS RESERVED.</p>
      </div>
    </div>
  </footer>

  <aside class="quick" id="quick" aria-label="바로가기">
    <button type="button" class="quick-toggle" id="quickToggle" aria-expanded="true" aria-label="퀵 메뉴 접기">&minus;</button>
    <ul class="quick-list">
      ${site.sns.map(s => `<li><a href="${s.href}"${s.cls ? ` class="${s.cls}"` : ''} aria-label="${s.title}"><span class="quick-ico">${s.icon}</span><span class="quick-tip">${s.title}</span></a></li>`).join('\n      ')}
    </ul>
    <button type="button" class="quick-top" id="toTop">TOP</button>
  </aside>

  <nav class="mobile-bar" aria-label="모바일 바로가기">
    <a href="${site.telHref}">전화 상담</a>
    <a href="${url('sub1_4', depth)}">오시는 길</a>
    <a href="#" class="primary">카카오톡 예약</a>
  </nav>`;
}

/* ---------- 메인 팝업 ----------
   원본 실측 스펙에 맞춤:
   오버레이 rgba(0,0,0,.4) z-8900 / 본체 1000x538 z-9900 고정 중앙
   구성 = 이미지 469 + 탭바 35 + 검정 푸터 34
   탭바는 점이 아니라 333px 탭 3개(슬라이드 제목), 전환 0.8s 루프
------------------------------------ */
function popup(depth) {
  const slides = [
    { t: '여름 스킨케어 프로그램', href: url('notice', depth), c1: '#e8dfd4', c2: '#b9a68f' },
    { t: '휴진 일정 안내', href: url('notice', depth), c1: '#dde4e8', c2: '#94a7b3' },
    { t: '흉터 케어 패키지', href: url('sub4_4', depth), c1: '#e7e1e9', c2: '#ab9dbb' }
  ];

  return `  <div class="main-popup-sect" id="hd_pops" hidden>
    <div class="main-popup-content">
      <div class="main-popup-slide" data-popup-slider>
        <div class="popup-wrapper">
          ${slides.map(s => `<div class="popup-slide">
            <a href="${s.href}" style="--c1:${s.c1};--c2:${s.c2}">
              <span class="popup-slide__t sortsmill">${s.t}</span>
            </a>
          </div>`).join('\n          ')}
        </div>
      </div>
      <div class="main-popup-pagination">
        ${slides.map((s, i) => `<button type="button" class="popup-bullet${i === 0 ? ' is-active' : ''}" data-idx="${i}"><span>${s.t}</span></button>`).join('\n        ')}
      </div>
      <div class="modal-footer">
        <button type="button" class="hd_pops_reject">하루동안 보지 않기</button>
        <button type="button" class="main-popup-close" aria-label="팝업 닫기"></button>
      </div>
    </div>
    <div class="main-popup-bg"></div>
  </div>

`;
}

/* ---------- 문서 껍데기 ---------- */
function shell({ title, desc, bodyClass = '', depth = 0, active = '', content, withPopup = false }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@300;400;500;600&family=Sorts+Mill+Goudy:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${asset('css/style.css', depth)}">
<script>document.documentElement.className+=' js';</script>
</head>
<body class="${bodyClass}">
<div class="progress-area"><span id="progressBar"></span></div>

${withPopup ? popup(depth) : ''}<div class="wrap">
  ${header(depth, active)}

${content}

  ${footer(depth)}
</div>

<script src="${asset('js/main.js', depth)}"></script>
</body>
</html>
`;
}

/* =========================================================
   서브페이지 콘텐츠 블록
   ========================================================= */

/* 공통 타이틀 박스 */
function titleBox(t = {}) {
  return `<div class="title_box ta_c">
        ${t.en ? `<p class="txt01 reveal fade-up fz_17 ls_p5 lh_16 sortsmill">${t.en}</p>` : ''}
        ${t.title ? `<p class="txt02 reveal fade-up delay_200 fz_32 ls_p5 lh_14 notoserif semibold">${t.title}</p>` : ''}
        ${t.desc ? `<p class="txt03 reveal fade-up delay_400 fz_17 ls_p1 lh_16">${t.desc}</p>` : ''}
      </div>`;
}

const blocks = {

  /* 리드 문단 + 큰 비주얼 */
  lead: (b, i) => `<article class="sub_cont_wrap sub_cont0${i}_wrap block-lead">
    <div class="sub_cont_box">
      ${titleBox(b)}
      <div class="lead-visual reveal fade-up" style="--c1:${b.c1 || '#e9e2da'};--c2:${b.c2 || '#c4b3a0'}">
        <span class="lead-visual__label sortsmill">${b.label || ''}</span>
      </div>
      ${b.body ? `<p class="lead-body reveal fade-up fz_16 lh_16 ta_c">${b.body}</p>` : ''}
    </div>
  </article>`,

  /* 카드 그리드 (이런 분께 추천 / 특징 등) */
  cards: (b, i) => `<article class="sub_cont_wrap sub_cont0${i}_wrap block-cards${b.tone === 'warm' ? ' bg-warm' : ''}">
    <div class="sub_cont_box">
      ${titleBox(b)}
      <div class="sub_box flex_row jc_center card-grid" data-col="${b.items.length}">
        ${b.items.map((it, n) => `<div class="c-card reveal fade-up delay_${(n % 4) * 100 + 100}">
          <span class="c-card__no sortsmill">${String(n + 1).padStart(2, '0')}</span>
          <p class="c-card__t fz_19 notoserif">${it.t}</p>
          <p class="c-card__d fz_15 lh_16">${it.d}</p>
        </div>`).join('\n        ')}
      </div>
    </div>
  </article>`,

  /* 2단 교차 포인트 */
  points: (b, i) => `<article class="sub_cont_wrap sub_cont0${i}_wrap block-points">
    <div class="sub_cont_box">
      ${titleBox(b)}
      ${b.items.map((it, n) => `<div class="p-row${n % 2 ? ' reverse' : ''} reveal fade-up">
        <div class="p-visual" style="--c1:${it.c1 || '#e3e9ed'};--c2:${it.c2 || '#a9b9c3'}"><span class="p-no sortsmill">${String(n + 1).padStart(2, '0')}</span></div>
        <div class="p-text">
          <p class="p-en sortsmill fz_15 ls_p5">${it.en || ''}</p>
          <p class="p-t fz_27 lh_14 notoserif semibold">${it.t}</p>
          <p class="p-d fz_16 lh_16">${it.d}</p>
        </div>
      </div>`).join('\n      ')}
    </div>
  </article>`,

  /* 시술 정보 표 */
  info: (b, i) => `<article class="sub_cont_wrap sub_cont0${i}_wrap block-info bg-warm">
    <div class="sub_cont_box">
      ${titleBox(b)}
      <div class="info-table reveal fade-up">
        <dl>
          ${b.rows.map(r => `<div><dt class="fz_16">${r[0]}</dt><dd class="fz_16">${r[1]}</dd></div>`).join('\n          ')}
        </dl>
      </div>
      <p class="info-note fz_14 lh_16 reveal fade-up">※ 시술 정보는 예시이며, 개인의 피부 상태에 따라 시술 방법과 횟수는 달라질 수 있습니다. 정확한 내용은 의료진 상담 후 안내됩니다.</p>
    </div>
  </article>`,

  /* 진행 과정 */
  steps: (b, i) => `<article class="sub_cont_wrap sub_cont0${i}_wrap block-steps">
    <div class="sub_cont_box">
      ${titleBox(b)}
      <ol class="step-list">
        ${b.items.map((it, n) => `<li class="step reveal fade-up delay_${(n % 4) * 100 + 100}">
          <span class="step__no sortsmill">STEP ${String(n + 1).padStart(2, '0')}</span>
          <p class="step__t fz_18 notoserif">${it.t}</p>
          <p class="step__d fz_15 lh_16">${it.d}</p>
        </li>`).join('\n        ')}
      </ol>
    </div>
  </article>`,

  /* FAQ 아코디언 */
  faq: (b, i) => `<article class="sub_cont_wrap sub_cont0${i}_wrap block-faq">
    <div class="sub_cont_box">
      ${titleBox(b)}
      <ul class="faq-list reveal fade-up">
        ${b.items.map(it => `<li class="faq-item">
          <button type="button" class="faq-q" aria-expanded="false">
            <span class="faq-q__mark sortsmill">Q</span>
            <span class="faq-q__t fz_17">${it.q}</span>
            <span class="faq-q__ico" aria-hidden="true"></span>
          </button>
          <div class="faq-a"><div class="faq-a__in"><span class="faq-a__mark sortsmill">A</span><p class="fz_15 lh_16">${it.a}</p></div></div>
        </li>`).join('\n        ')}
      </ul>
    </div>
  </article>`,

  /* 진료안내 · 오시는길 전용 */
  location: (b, i) => `<article class="sub_cont_wrap sub_cont0${i}_wrap block-location">
    <div class="sub_cont_box">
      <div class="loc-grid">
        <div class="loc-map reveal fade-up" aria-label="약도">
          <div class="loc-map-grid" aria-hidden="true"></div>
          <span class="loc-pin" aria-hidden="true"></span>
          <span class="loc-map-label sortsmill">${site.brand} CLINIC</span>
        </div>
        <div class="loc-text">
          <p class="p-en sortsmill fz_15 ls_p5">Location</p>
          <p class="loc-addr fz_27 lh_14 notoserif semibold reveal fade-up">${site.addr}</p>
          <p class="loc-sub fz_16 lh_16 reveal fade-up">${site.place}</p>
          <p class="loc-tel sortsmill reveal fade-up"><a href="${site.telHref}">${site.tel}</a></p>
        </div>
      </div>

      <div class="loc-bottom">
        <div class="loc-time reveal fade-up">
          <p class="p-en sortsmill fz_15 ls_p5">Time</p>
          <dl>
            ${site.hours.map(h => `<div><dt class="fz_16">${h[0]}</dt><dd class="fz_16 sortsmill">${h[1]}</dd></div>`).join('\n            ')}
          </dl>
          <p class="loc-note fz_14 lh_16">${site.hoursNote}</p>
        </div>
        <div class="loc-way reveal fade-up">
          <p class="p-en sortsmill fz_15 ls_p5">Direction</p>
          <ul class="way-list">
            <li><span class="way-list__t fz_16 notoserif">지하철</span><span class="fz_15 lh_16">○○역 4번 출구와 바로 연결되어 있습니다.</span></li>
            <li><span class="way-list__t fz_16 notoserif">버스</span><span class="fz_15 lh_16">○○빌딩 정류장 하차 후 도보 1분 거리입니다.</span></li>
            <li><span class="way-list__t fz_16 notoserif">주차</span><span class="fz_15 lh_16">건물 지하 주차장 이용이 가능하며, 데스크에서 주차 등록을 도와드립니다.</span></li>
          </ul>
        </div>
      </div>
    </div>
  </article>`,

  /* 이미지 카드 갤러리 (장비/공간 등) */
  gallery: (b, i) => `<article class="sub_cont_wrap sub_cont0${i}_wrap block-gallery bg-warm">
    <div class="sub_cont_box">
      ${titleBox(b)}
      <ul class="gal-grid">
        ${b.items.map((it, n) => `<li class="gal reveal fade-up delay_${(n % 3) * 100 + 100}">
          <div class="gal__img" style="--c1:${it.c1 || '#e7e2dc'};--c2:${it.c2 || '#bfb2a1'}"></div>
          <p class="gal__t fz_18 notoserif">${it.t}</p>
          <p class="gal__d fz_15 lh_16">${it.d}</p>
        </li>`).join('\n        ')}
      </ul>
    </div>
  </article>`
};

/* ---------- 모든 시술 페이지 공통 하단 3블록 ---------- */
function bottomBlocks(depth) {
  const reviews = [
    ['급하게 검색해서 방문했는데 과하게 권하지 않으셔서 더 신뢰가 갔어요. 관리 받는 곳을 옮기려고 합니다.', '김○○ 고객님'],
    ['상담이 꼼꼼해서 시술 후에도 걱정이 없었습니다. 역과 가까워 접근성도 좋아요.', '이○○ 고객님'],
    ['원장님이 섬세하시고 결과도 자연스러워서 만족합니다. 올 때마다 기분이 좋아져요.', '박○○ 고객님'],
    ['필요한 것만 제안해 주셔서 좋았어요. 관리실이 1인실이라 편안했습니다.', '정○○ 고객님']
  ];
  const ba = [
    ['#e7ded4', '#c0ac96', '결이 정돈되는 시간'],
    ['#dfe5e9', '#a5b4bd', '과하지 않은 균형'],
    ['#e6e3dd', '#b8ad9c', '표정을 남기는 방법'],
    ['#e4e7e3', '#adb6ac', '다시 세우는 윤곽'],
    ['#e8e2e9', '#b6aabf', '맑아지는 톤']
  ];
  const points = [
    ['1:1 커스터마이징 케어', '진단 장비와 전문가 상담을 통한 맞춤 진료로 피부 고민을 해결합니다.'],
    ['피부과 전문의 직접 진료', '상담부터 시술, 사후 관리까지 전문의가 직접 진단하고 시술합니다.'],
    ['1인 프라이빗 관리실', '최상의 휴식을 위해 모든 관리실을 1인실로 운영합니다.']
  ];

  // 리뷰: 화살표 슬라이더가 아니라 끊김 없이 흐르는 마퀴 티커 (가로형 카드)
  const rvSet = r => `<li class="rv-card"><blockquote>
        <p class="fz_15 lh_16">${r[0]}</p>
        <footer><span class="rv-star" aria-label="별점 5점">★★★★★</span><cite>${r[1]}</cite></footer>
      </blockquote></li>`;

  return `
  <article class="sub_cont_wrap s_btm_c01_wrap">
    <div class="sub_cont_box">
      ${titleBox({ en: 'Real Review', title: '고객의 진짜 이야기를 전합니다', desc: '' })}
    </div>
    <div class="marquee reveal fade-up" data-marquee>
      <ul class="marquee-track" aria-label="고객 후기">
        ${reviews.map(rvSet).join('\n        ')}
      </ul>
      <ul class="marquee-track" aria-hidden="true">
        ${reviews.map(rvSet).join('\n        ')}
      </ul>
    </div>
  </article>

  <article class="sub_cont_wrap s_btm_c02_wrap bg-warm">
    <div class="sub_cont_box">
      ${titleBox({ en: 'Before & After', title: '시술에 담은 진심은 작품이 됩니다', desc: '카드를 클릭하면 After 이미지로 전환됩니다.' })}
    </div>
    <div class="carousel is-center reveal fade-up" data-carousel data-center="true" data-per="3.84" data-per-1280="3.2" data-per-1024="2.4" data-per-768="1.6" data-per-480="1.15">
      <div class="carousel-viewport">
        <ul class="carousel-track">
          ${ba.map(b => `<li class="ba-card"><button type="button" class="ba-flip">
            <span class="ba-img" style="--c1:${b[0]};--c2:${b[1]}"><b class="sortsmill">BEFORE</b></span>
            <span class="ba-img ba-after" style="--c1:${b[0]};--c2:${b[1]};filter:brightness(1.08) saturate(.85)"><b class="sortsmill">AFTER</b></span>
            <span class="ba-cap fz_16">${b[2]}</span>
          </button></li>`).join('\n          ')}
        </ul>
      </div>
      <div class="carousel-nav">
        <button type="button" class="carousel-prev" aria-label="이전 사진">←</button>
        <button type="button" class="carousel-next" aria-label="다음 사진">→</button>
      </div>
    </div>
  </article>

  <article class="sub_cont_wrap s_btm_c03_wrap">
    <div class="sub_cont_box">
      ${titleBox({ en: 'Our Way', title: '우리가 아름다움을 밝히는 방법', desc: '' })}
      <ul class="way-grid">
        ${points.map((p, n) => `<li class="way reveal fade-up delay_${n * 100 + 100}">
          <span class="way__no sortsmill">0${n + 1}</span>
          <p class="way__t fz_20 notoserif">${p[0]}</p>
          <p class="way__d fz_15 lh_16">${p[1]}</p>
        </li>`).join('\n        ')}
      </ul>
      <div class="way-cta reveal fade-up">
        <a href="${url('sub1_4', depth)}" class="btn-solid">예약 및 상담문의 <span aria-hidden="true">→</span></a>
        <a href="${site.telHref}" class="btn-line">${site.tel}</a>
      </div>
    </div>
  </article>`;
}

/* ---------- 서브페이지 히어로 ---------- */
function subTop(p) {
  return `  <article class="sub_top">
    <div class="sub_top_cont_wrap">
      <div class="sub_top_view_bg" style="--c1:${p.c1 || '#3b464e'};--c2:${p.c2 || '#9c8d7b'}"></div>
      <div class="sub_top_text sub_titlebox ta_c">
        <p class="txt01 reveal fade-up delay_200 c-w fz_25 ls_p5 lh_16 sortsmill">${p.en}</p>
        <p class="txt02 reveal fade-up delay_400 c-w fz_47 ls_p5 lh_14 notoserif">${p.name}</p>
        <p class="txt03 reveal fade-up delay_600 c-w fz_16 ls_p1 lh_16">${p.lead}</p>
      </div>
    </div>
    <div class="bu" aria-hidden="true"><span></span></div>
  </article>

  <nav class="crumb" aria-label="현재 위치">
    <div class="cont-box crumb-in">
      <a href="../index.html">HOME</a><span>·</span><em>${p.cat}</em><span>·</span><strong>${p.name}</strong>
    </div>
  </nav>`;
}

module.exports = { shell, blocks, titleBox, bottomBlocks, subTop, url, site };
