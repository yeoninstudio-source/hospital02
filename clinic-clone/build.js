/* =========================================================
   빌드 스크립트 —  node build.js
   src/site.js + src/pages.js 를 읽어 정적 HTML 26개를 생성합니다.
   ========================================================= */

const fs = require('fs');
const path = require('path');
const { shell, blocks, titleBox, bottomBlocks, subTop, url, site } = require('./src/templates');
const pages = require('./src/pages');

const ROOT = __dirname;
const write = (rel, html) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html, 'utf8');
  console.log('  ✔ ' + rel.replace(/\\/g, '/'));
};

/* =========================================================
   1. 서브페이지 23개
   ========================================================= */
function buildSub(p) {
  // 클리닉 소개(sub1_*)에는 시술 공통 하단 블록을 붙이지 않습니다.
  const isTreatment = !p.id.startsWith('sub1_');

  const body = p.blocks
    .map((b, i) => (blocks[b.type] || (() => ''))(b, i + 1))
    .join('\n\n');

  const content = subTop(p) + '\n\n' + body + (isTreatment ? '\n' + bottomBlocks(1) : '');

  return shell({
    title: `${p.name} | ${site.brandKo}`,
    desc: `${site.brandKo} ${p.name} — ${p.lead}`,
    bodyClass: 'is-sub',
    depth: 1,
    active: p.id,
    content
  });
}

/* =========================================================
   2. 게시판 — 공지/이벤트(리스트형), 전후사진(갤러리형)
   ========================================================= */
function boardTop(en, name, lead, c1, c2) {
  return subTop({ en, name, lead, c1, c2, cat: '커뮤니티' });
}

function buildNotice() {
  const items = [
    ['공지', '여름 휴진 일정 안내', '20XX.07.01', 1],
    ['이벤트', '여드름 흉터 케어 패키지 오픈', '20XX.06.20', 1],
    ['이벤트', '시즌 스킨부스터 프로그램 안내', '20XX.06.02', 0],
    ['공지', '주차 이용 방법 변경 안내', '20XX.05.18', 0],
    ['이벤트', '봄맞이 스킨케어 프로그램', '20XX.04.11', 0],
    ['공지', '진료 시간 변경 안내', '20XX.03.02', 0],
    ['이벤트', '리프팅 패키지 안내', '20XX.02.14', 0],
    ['공지', '설 연휴 진료 안내', '20XX.01.20', 0]
  ];

  const content = boardTop('Notice & Event', '이벤트 · 공지사항',
    '루미나의 새로운 소식과 진행 중인 이벤트를 안내해 드립니다.', '#414b52', '#96a5ae') + `

  <article class="sub_cont_wrap block-board">
    <div class="sub_cont_box">
      <div class="board-util">
        <p class="board-count fz_15">전체 <strong>${items.length}</strong>건</p>
        <div class="board-search">
          <label class="sr-only" for="bsearch">게시물 검색</label>
          <input type="search" id="bsearch" placeholder="검색어를 입력하세요" data-board-search>
          <button type="button" aria-label="검색">🔍</button>
        </div>
      </div>

      <ul class="board-list" data-board-list>
        ${items.map(([tag, subject, date, isNew]) => `<li>
          <a href="#">
            <span class="bl-tag${tag === '이벤트' ? ' event' : ''}">${tag}</span>
            <span class="bl-subject fz_17">${subject}${isNew ? '<em class="bl-new sortsmill">NEW</em>' : ''}</span>
            <span class="bl-date sortsmill">${date}</span>
          </a>
        </li>`).join('\n        ')}
      </ul>
      <p class="board-empty" hidden>검색 결과가 없습니다.</p>

      <nav class="pager" aria-label="페이지">
        <a href="#" class="pager-btn" aria-label="이전 페이지">←</a>
        <a href="#" class="pager-num is-on" aria-current="page">1</a>
        <a href="#" class="pager-num">2</a>
        <a href="#" class="pager-num">3</a>
        <a href="#" class="pager-btn" aria-label="다음 페이지">→</a>
      </nav>
    </div>
  </article>`;

  return shell({
    title: `이벤트 · 공지사항 | ${site.brandKo}`,
    desc: `${site.brandKo}의 새로운 소식과 이벤트를 안내합니다.`,
    bodyClass: 'is-sub', depth: 1, active: 'notice', content
  });
}

function buildReview() {
  const items = [
    ['여드름 흉터 치료', '결이 정돈되는 시간', '#e7ded4', '#c0ac96'],
    ['필러 시술', '과하지 않은 균형', '#dfe5e9', '#a5b4bd'],
    ['보톡스 시술', '표정을 남기는 방법', '#e6e3dd', '#b8ad9c'],
    ['리프팅 시술', '다시 세우는 윤곽', '#e4e7e3', '#adb6ac'],
    ['색소 치료', '맑아지는 톤', '#e8e2e9', '#b6aabf'],
    ['스킨부스터', '속부터 차오르는 수분', '#e6e9ec', '#a8b4bd'],
    ['모공 치료', '가까이서 봐도 고른 결', '#e6e6e2', '#b5b5a8'],
    ['홍조 치료', '가라앉은 자리', '#e9e3e3', '#c3aaa8'],
    ['흉터 치료', '지나간 자국을 정리하며', '#dde3e6', '#a9b9c3']
  ];

  const content = boardTop('Before & After', '전후사진',
    '전문가의 손끝에서 완성된 변화를 확인해 보세요.', '#454e55', '#9daab3') + `

  <article class="sub_cont_wrap block-board">
    <div class="sub_cont_box">
      ${titleBox({ desc: '카드를 클릭하면 After 이미지로 전환됩니다. 시술 결과는 개인에 따라 다를 수 있습니다.' })}

      <ul class="ba-grid">
        ${items.map(([cat, cap, c1, c2], n) => `<li class="ba-card reveal fade-up delay_${(n % 3) * 100 + 100}">
          <button type="button" class="ba-flip">
            <span class="ba-img" style="--c1:${c1};--c2:${c2}"><b class="sortsmill">BEFORE</b></span>
            <span class="ba-img ba-after" style="--c1:${c1};--c2:${c2};filter:brightness(1.08) saturate(.85)"><b class="sortsmill">AFTER</b></span>
            <span class="ba-cap fz_16"><i>${cat}</i>${cap}</span>
          </button>
        </li>`).join('\n        ')}
      </ul>

      <nav class="pager" aria-label="페이지">
        <a href="#" class="pager-btn" aria-label="이전 페이지">←</a>
        <a href="#" class="pager-num is-on" aria-current="page">1</a>
        <a href="#" class="pager-num">2</a>
        <a href="#" class="pager-btn" aria-label="다음 페이지">→</a>
      </nav>
    </div>
  </article>`;

  return shell({
    title: `전후사진 | ${site.brandKo}`,
    desc: `${site.brandKo}의 시술 전후 사진을 확인해 보세요.`,
    bodyClass: 'is-sub', depth: 1, active: 'review', content
  });
}

/* =========================================================
   3. 메인 페이지
   ========================================================= */
function buildIndex() {
  const sig = [
    ['Deep', 'Lifting', '손끝으로 걷어 올리는 시간<br>가장 좋은 컨디션의 나', '리프팅', 'sub2_1', '#e8dfd4', '#c9b8a5'],
    ['Reset', 'Scar', '오래된 흔적을 비운 자리에<br>새롭게 채워지는 자신감', '흉터 · 튼살', 'sub4_2', '#dde3e6', '#a9b9c3'],
    ['Clear', 'Tone', '피부 본연의 색을 찾는 시간<br>더 자연스럽게, 더 맑게', '색소 질환', 'sub3_1', '#efe6dd', '#d3bda6'],
    ['Fit', 'Botox', '맞춤 수트처럼 내 얼굴에<br>꼭 맞춘 1:1 설계', '보톡스 · 필러', 'sub5_1', '#e4e6e3', '#b3bbb2'],
    ['Calm', 'Acne', '가라앉히고 다시 세우는<br>피부의 기본 컨디션', '여드름', 'sub4_1', '#e9e4ec', '#b9aec4'],
    ['Glow', 'Booster', '속부터 차오르는 수분<br>매일이 좋은 피부 결', '스킨부스터', 'sub2_2', '#e6e9ec', '#a8b4bd']
  ];

  const spec = [
    ['Brand Essence', '당신을 더 모던하게', '아침 빛처럼 환하고 따뜻하게. 번지기 시작한 따스함이 얼굴에 내려앉을 때,<br>그 자연스러움이 더욱 특별해지도록 설계합니다.', 'sub1_1', '#efe8e0', '#cdbdab'],
    ['1:1 Customizing', '처음부터 끝까지<br>전문가의 손끝으로', '상담부터 시술, 사후 관리까지 한 명의 전문의가 책임집니다.<br>피부 상태와 생활 패턴을 함께 고려한 커스터마이징 케어를 제공합니다.', 'sub1_2', '#e3e9ed', '#a9b9c3'],
    ['Private Room', '머무름이 휴식이 되는<br>1인 관리실', '모든 관리실은 1인 프라이빗 공간으로 운영됩니다.<br>시술 전후의 시간까지 온전히 편안할 수 있도록 준비했습니다.', 'sub1_1', '#eae6e1', '#c2b5a6'],
    ['Equipment', '수많은 말보다<br>한 번의 결과로', '정품 · 정량 원칙을 지키며, 검증된 장비만을 도입합니다.<br>결과로 증명하는 진료를 지향합니다.', 'sub1_3', '#e6e8e4', '#b0b8ae']
  ];

  const content = `  <main class="content" id="top">

    <!-- 메인 비주얼 -->
    <section class="main_visual">
      <div class="mv-bg" aria-hidden="true"><span class="mv-orb"></span><span class="mv-glow"></span></div>
      <div class="cont-box mv-inner">
        <p class="mv-eyebrow reveal fade-up sortsmill fz_19 ls_2">High End Beauty</p>
        <h2 class="mv-title reveal fade-up delay_200 notoserif">Bright skin,<br>brighter <em>you</em></h2>
        <p class="mv-desc reveal fade-up delay_400 fz_16 lh_16">
          루미나는 ‘빛’을 뜻하는 이름입니다.<br>
          피부 본연의 결이 가장 자연스럽게 드러나도록,<br>
          피부과 전문의가 1:1로 진단하고 시술합니다.
        </p>
        <div class="mv-badge reveal fade-up delay_600"><span class="mv-badge-line"></span><span class="fz_13 ls_p5">20XX 디자인 어워드 수상</span></div>
        <a href="${url('sub1_4', 0)}" class="mv-reserve reveal fade-up delay_600">
          <span class="mv-reserve-en sortsmill">reserve</span>
          <span class="mv-reserve-ko fz_13">예약 및 상담문의</span>
          <span class="mv-reserve-arrow" aria-hidden="true">→</span>
        </a>
      </div>
      <div class="bu" aria-hidden="true"><span></span></div>
    </section>

    <!-- 시그니처 프로그램 -->
    <section class="main_wrap1">
      <div class="cont-box">
        ${titleBox({ en: 'Signature Program', title: '루미나는 본연의 모습에 집중합니다.', desc: '자연스러운 모습에서 조금 더 특별해질 수 있도록<br>개인의 피부 고민에 맞는 1:1 맞춤 시술을 진행합니다.' })}
      </div>
      <div class="carousel reveal fade-up" data-carousel data-per="4" data-per-1280="3.4" data-per-1024="2.6" data-per-768="1.7" data-per-480="1.15">
        <div class="carousel-viewport">
          <ul class="carousel-track">
            ${sig.map(([a, b, copy, ko, href, c1, c2]) => `<li class="prog-card" style="--c1:${c1};--c2:${c2}">
              <a href="${url(href, 0)}">
                <span class="prog-en sortsmill"><b>${a}</b><i>${b}</i></span>
                <span class="prog-copy fz_13 lh_16">${copy}</span>
                <span class="prog-ko fz_16">${ko}</span>
              </a>
            </li>`).join('\n            ')}
          </ul>
        </div>
        <div class="carousel-nav">
          <button type="button" class="carousel-prev" aria-label="이전 슬라이드">←</button>
          <button type="button" class="carousel-next" aria-label="다음 슬라이드">→</button>
        </div>
      </div>
    </section>

    <!-- 스페셜리티 -->
    <section class="main_wrap2 bg-warm">
      <div class="cont-box">
        ${titleBox({ en: 'Lumina Speciality', title: '빛이 밝아오듯,<br>루미나만의 특별함' })}
        ${spec.map(([en, t, d, href, c1, c2], n) => `<div class="p-row${n % 2 ? ' reverse' : ''} reveal fade-up">
          <div class="p-visual" style="--c1:${c1};--c2:${c2}"><span class="p-no sortsmill">0${n + 1}</span></div>
          <div class="p-text">
            <p class="p-en sortsmill fz_15 ls_p5">${en}</p>
            <p class="p-t fz_27 lh_14 notoserif semibold">${t}</p>
            <p class="p-d fz_16 lh_16">${d}</p>
            <a href="${url(href, 0)}" class="btn-line">자세히 보기 <span aria-hidden="true">→</span></a>
          </div>
        </div>`).join('\n        ')}
      </div>
    </section>

    <!-- 의료진 -->
    <section class="main_wrap3">
      <div class="doc-fix">
        <div class="cont-box doc-inner">
          <p class="doc-en reveal fade-up sortsmill fz_19 ls_2">Only Dermatologist</p>
          <p class="doc-title reveal fade-up delay_200 notoserif">
            <strong class="sortsmill" data-count="35040">0</strong><span>시간</span><br>피부만을 고민한 시간
          </p>
          <p class="doc-desc reveal fade-up delay_400 fz_16 lh_16">
            피부과 전문의가 피부를 온전히 이해하기 위해 쌓아온 시간입니다.<br>
            수많은 진료 경험과 연구를 거친 전문의가 직접 진단하고 시술합니다.
          </p>
          <a href="${url('sub1_2', 0)}" class="btn-line reveal fade-up delay_600">의료진 소개 <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>

    <!-- 유튜브 -->
    <section class="main-youtube">
      <div class="cont-box yt-inner">
        <div class="yt-text">
          <p class="yt-spaced reveal fade-up sortsmill fz_16 ls_2">D r .&nbsp; L u m i n a</p>
          <p class="yt-title reveal fade-up delay_200 notoserif">루미나 YOUTUBE</p>
          <p class="yt-desc reveal fade-up delay_400 fz_16 lh_16">대표원장이 직접 전하는 실질적인 피부 정보.<br>피부 고민을 덜어줄 이야기를 준비했습니다.</p>
          <a href="#" class="btn-solid reveal fade-up delay_600">바로가기 <span aria-hidden="true">→</span></a>
        </div>
        <div class="yt-visual reveal fade-up delay_400">
          <div class="yt-thumb"><span class="yt-play" aria-hidden="true"></span></div>
        </div>
      </div>
    </section>

${bottomBlocks(0)}

    <!-- 공지 -->
    <section class="main_wrap5">
      <div class="cont-box">
        ${titleBox({ en: 'Notice & Event', title: '이벤트 · 공지사항' })}
        <ul class="notice-list reveal fade-up">
          ${[['공지', '여름 휴진 일정 안내', '20XX.07.01'], ['이벤트', '여드름 흉터 케어 패키지 오픈', '20XX.06.20'], ['이벤트', '시즌 스킨부스터 프로그램 안내', '20XX.06.02'], ['공지', '주차 이용 방법 변경 안내', '20XX.05.18']]
            .map(([tag, s, d]) => `<li><a href="${url('notice', 0)}"><span class="bl-tag${tag === '이벤트' ? ' event' : ''}">${tag}</span><span class="bl-subject fz_17">${s}</span><span class="bl-date sortsmill">${d}</span></a></li>`).join('\n          ')}
        </ul>
        <div class="ta_c"><a href="${url('notice', 0)}" class="btn-line">전체 보기 <span aria-hidden="true">→</span></a></div>
      </div>
    </section>

    <!-- 오시는 길 -->
    <section class="main_wrap6 bg-warm">
      <div class="cont-box">
        ${blocks.location({}, 6).replace(/^<article[^>]*>|<\/article>$/g, '').replace(/<div class="sub_cont_box">|<\/div>\s*$/g, '')}
      </div>
    </section>
  </main>`;

  return shell({
    title: site.brandKo,
    desc: `피부과 전문의가 1:1로 진단하고 시술하는 ${site.brandKo}`,
    bodyClass: 'is-main', depth: 0, active: '', content, withPopup: true
  });
}

/* =========================================================
   실행
   ========================================================= */
console.log('\n빌드 시작\n');

write('index.html', buildIndex());
pages.forEach(p => write(`sub/${p.id}.html`, buildSub(p)));
write('board/notice.html', buildNotice());
write('board/review.html', buildReview());

console.log(`\n완료 — 총 ${pages.length + 3}개 페이지\n`);
