/* =========================================================
   사이트 전역 설정 — 상호/연락처/전역 내비게이션
   여기만 고치면 25개 페이지 전체에 반영됩니다.
   ========================================================= */

const site = {
  brand: 'LUMINA',
  brandKo: '루미나피부과의원',
  tel: '02-000-0000',
  telHref: 'tel:0200000000',
  email: 'hello@example.com',
  addr: '서울특별시 ○○구 ○○로 000, ○○빌딩 2층 000호',
  place: '○○역 4번 출구 · ○○빌딩 2층',
  owner: '홍 길 동',
  bizNo: '000-00-00000',

  // 헤더 좌측 LINE UP (대표 시그니처 프로그램)
  lineup: [
    { name: '딥 리프팅', href: 'sub2_1' },
    { name: '리셋 스카', href: 'sub4_4' },
    { name: '클리어 톤', href: 'sub3_1' },
    { name: '핏 보톡스 · 필러', href: 'sub5_1' },
    { name: '카밍 아크네', href: 'sub4_1' }
  ],

  // 전역 내비게이션 — 사이트맵/모바일 메뉴/푸터가 이 배열에서 자동 생성됩니다
  gnb: [
    {
      title: '클리닉 소개', en: 'Clinic',
      children: [
        { name: '브랜드 에센스', href: 'sub1_1' },
        { name: '의료진 소개', href: 'sub1_2' },
        { name: '시술 장비', href: 'sub1_3' },
        { name: '진료안내 · 오시는길', href: 'sub1_4' }
      ]
    },
    {
      title: '안티에이징', en: 'Anti-aging',
      children: [
        { name: '리프팅', href: 'sub2_1' },
        { name: '스킨부스터', href: 'sub2_2' },
        { name: '윤곽 조형술', href: 'sub2_3' }
      ]
    },
    {
      title: '색소 · 혈관', en: 'Pigment',
      children: [
        { name: '기미 · 흑자 · 검버섯', href: 'sub3_1' },
        { name: '난치성 색소', href: 'sub3_2' },
        { name: '안면 홍조', href: 'sub3_3' },
        { name: '문신 치료', href: 'sub3_4' }
      ]
    },
    {
      title: '여드름 · 흉터', en: 'Acne',
      children: [
        { name: '여드름', href: 'sub4_1' },
        { name: '흉터 · 튼살', href: 'sub4_2' },
        { name: '모공', href: 'sub4_3' },
        { name: '여드름 흉터', href: 'sub4_4' }
      ]
    },
    {
      title: '쁘띠 · 스킨케어', en: 'Petit',
      children: [
        { name: '보톡스 · 필러', href: 'sub5_1' },
        { name: '맞춤 수액', href: 'sub5_2' },
        { name: '비만 · 체형교정', href: 'sub5_3' },
        { name: '제모', href: 'sub5_4' },
        { name: '메디컬 스킨케어', href: 'sub5_5' }
      ]
    },
    {
      title: '피부 질환', en: 'Disease',
      children: [
        { name: '피부 종양', href: 'sub6_1' },
        { name: '탈모', href: 'sub6_2' },
        { name: '손발톱 무좀', href: 'sub6_3' }
      ]
    },
    {
      title: '커뮤니티', en: 'Community',
      children: [
        { name: '이벤트 · 공지사항', href: 'notice' },
        { name: '전후사진', href: 'review' }
      ]
    }
  ],

  hours: [
    ['월 · 목 · 금', 'AM 10:00 – PM 08:00'],
    ['화 · 수', 'AM 10:00 – PM 07:00'],
    ['토요일', 'AM 10:00 – PM 03:00'],
    ['점심시간', 'PM 01:00 – PM 02:00']
  ],
  hoursNote: '일요일 · 공휴일은 휴진입니다. 토요일은 점심시간 없이 진료합니다.',

  // 퀵메뉴 — 이니셜 대신 인라인 SVG 아이콘
  sns: [
    {
      title: '유튜브', href: '#',
      icon: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M23.5 6.9a3 3 0 0 0-2.1-2.1C19.5 4.3 12 4.3 12 4.3s-7.5 0-9.4.5A3 3 0 0 0 .5 6.9C0 8.8 0 12 0 12s0 3.2.5 5.1a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.2 24 12 24 12s0-3.2-.5-5.1ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z"/></svg>'
    },
    {
      title: '인스타그램', href: '#',
      icon: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M7 2.8h10A4.2 4.2 0 0 1 21.2 7v10a4.2 4.2 0 0 1-4.2 4.2H7A4.2 4.2 0 0 1 2.8 17V7A4.2 4.2 0 0 1 7 2.8Z"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg>'
    },
    {
      title: '블로그', href: '#',
      icon: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M5 3.8h9.5L19 8.3V20a1.2 1.2 0 0 1-1.2 1.2H5A1.2 1.2 0 0 1 3.8 20V5A1.2 1.2 0 0 1 5 3.8Z"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M7.6 11h8M7.6 14.6h8M7.6 18h5"/></svg>'
    },
    {
      title: '카카오톡 상담', href: '#', cls: 'kakao',
      icon: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 3.2c-5 0-9 3.2-9 7.1 0 2.5 1.7 4.7 4.2 6l-1 3.7c-.1.3.2.5.5.4l4.4-2.9c.3 0 .6.1.9.1 5 0 9-3.2 9-7.3S17 3.2 12 3.2Z"/></svg>'
    }
  ]
};

module.exports = site;
