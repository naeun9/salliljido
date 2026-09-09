// 지역 사진. 한국관광공사 "관광사진 정보"(PhotoGalleryService1)에서 한 번
// 조회해 고른 결과를 URL 상수로 적어 둔 것이다. 지역마다 4장이고, 첫 장이
// 대표 사진(배너·카드)이며 나머지는 지역 소개 본문 슬라이드에 쓴다.
//
// 왜 화면에서 실시간으로 부르지 않는가:
//  - 홈 캐러셀·마이페이지 카드는 방문자마다 지역 수만큼 호출이 생긴다.
//    사진 몇 장을 위해 일 1,000건 한도를 태울 이유가 없다(docs/03-api-check.md §17).
//  - 사진 API는 키워드 검색만 되고 지역 필터가 없어서, 부를 때마다 엉뚱한
//    지역 사진이 1등으로 나오는 경우가 있다(의성 검색에 전남 사진이 1등).
//    사람이 한 번 골라 고정하는 편이 결과가 안정적이다.
//  - 여기 있는 건 이미지 URL(정적 참조값)이지 관광 콘텐츠 캐시가 아니다.
//    지역 코드(regnCd/signguCd)·중심 좌표와 같은 성격이다.
//
// 고른 기준(2026-08-29 재선별):
//  - 촬영지(galPhotographyLocation)가 그 지역인 것만. 키워드 검색은
//    galSearchKeyword까지 훑어서 다른 지역 사진이 섞인다.
//  - 대표 사진은 배너에 딥그린 오버레이(72%→60%→76%)가 덮이므로, 오버레이를
//    씌운 컨택트 시트를 만들어 형태가 남는 것만 골랐다. 평평한 백사장·잔잔한
//    바다는 오버레이 아래에서 단색이 돼 버려서 전부 뺐다(태안 몽산포,
//    서천 춘장대, 안동 하회마을이 그래서 교체됐다).
//  - 가로형, 인물이 크게 나오지 않는 것.
//  - (2026-09-09 추가) 압축 화질도 본다. 같은 1280px라도 파일이 작게 눌린
//    것이 섞여 있어(양자화 테이블 합 1477 = 블록 노이즈) 화면을 꽉 채우면
//    깨져 보인다. bpp와 양자화 합을 재서 여유 있는 것만 남겼다.
//
// 파일럿 지역 교체(2026-09-09): 속초·인제·홍성은 행정안전부 인구감소지역이
// 아니라(속초·인제는 관심지역, 홍성은 미지정) 평창·고성·공주로 바꿨다.
// 세 지역의 12장은 위 기준으로 새로 골랐고 나머지 48장은 그대로다.
//
// 저작권: 전부 한국관광공사 관광사진 갤러리 제공 사진이다. 이 API에는
// 사진별 저작권 유형(cpyrhtDivCd) 필드가 없다 — 장소 상세 API(detailImage2)에만
// 있다. 출처는 화면에 "사진 ⓒ한국관광공사"로 표기한다(Footer, 지역 소개 하단).
//
// 갱신 방법: gallerySearchList1을 지역명·명소명으로 부르고
// galPhotographyLocation에 지역명이 들어간 것만 추린 뒤 골라 URL을 바꾸면 된다.
// 원본이 내려가도 화면은 기존 빗금 배경으로 돌아간다(사진 + 빗금 2겹).
const PHOTOS = {
  양양: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/49/1544649.jpg",
      title: "하조대",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/87/2774787.jpg",
      title: "남애항 스카이워크 전망대",
      photographer: "강원지사 모먼트스튜디오",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/00/1187900.jpg",
      title: "남애항",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/15/1964615.jpg",
      title: "하조대 스카이워크",
      photographer: "한국관광공사 김지호",
    },
  ],
  정선: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/67/2818467.jpg",
      title: "병방치 스카이워크",
      photographer: "두드림",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/91/1984991.jpg",
      title: "정선 병방치스카이워크",
      photographer: "한국관광공사 이범수",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/76/2516876.jpg",
      title: "몰운대",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/87/1058787.jpg",
      title: "풍경열차",
      photographer: "한국관광공사 김지호",
    },
  ],
  고성: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/16/1842516.jpg",
      title: "공현진해수욕장",
      photographer: "한국관광공사 이범수",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/49/2504249.jpg",
      title: "설국으로 가는 길",
      photographer: "황선구",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/21/2456121.jpg",
      title: "왕곡마을",
      photographer: "한국관광공사 이범수",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/20/1842520.jpg",
      title: "송지호해수욕장",
      photographer: "한국관광공사 이범수",
    },
  ],
  삼척: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/67/1960267.jpg",
      title: "삼척 장호항의 여름",
      photographer: "허흥무",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/05/2925705.jpg",
      title: "장호항의 여유",
      photographer: "신승희",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/92/2550692.jpg",
      title: "삼척 해상케이블카",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/51/2474451.jpg",
      title: "죽서루",
      photographer: "한국관광공사 이범수",
    },
  ],
  평창: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/40/2575940.jpg",
      title: "양떼목장",
      photographer: "명준욱",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/55/2504255.jpg",
      title: "오대산 설국 속 상원사",
      photographer: "박상훈",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/72/2564572.jpg",
      title: "효석달빛언덕",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/64/2525864.jpg",
      title: "대관령 전경",
      photographer: "IR 스튜디오",
    },
  ],
  태안: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/13/3567213.jpg",
      title: "안면암의 봄",
      photographer: "박정아",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/96/2563896.jpg",
      title: "신두리 사구",
      photographer: "이순옥",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/70/1073970.jpg",
      title: "청산수목원",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/36/1811836.jpg",
      title: "태안 세계튤립축제",
      photographer: "한국관광공사 김지호",
    },
  ],
  서천: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/37/2936537.jpg",
      title: "장항 스카이워크",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/50/2477950.jpg",
      title: "장항송림산림욕장",
      photographer: "한국관광공사 김지호 ",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/96/1989396.jpg",
      title: "신성리 갈대밭",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/34/1951634.jpg",
      title: "한국최초 성경전래지",
      photographer: "한국관광공사 김지호",
    },
  ],
  보령: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/91/2504291.jpg",
      title: "무논 여행",
      photographer: "정종호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/57/1193557.jpg",
      title: "보령 충청수영성",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/80/2876180.jpg",
      title: "남포관아문",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/90/1074490.jpg",
      title: "대천해수욕장",
      photographer: "한국관광공사 김지호",
    },
  ],
  공주: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/83/1791183.jpg",
      title: "공산성",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/99/2563899.jpg",
      title: "마곡사의 겨울",
      photographer: "이중일",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/28/1790428.jpg",
      title: "공주한옥마을",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/54/1040154.jpg",
      title: "공주 갑사",
      photographer: "한국관광공사 김지호",
    },
  ],
  청양: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/36/3570736.jpg",
      title: "천장호 출렁다리",
      photographer: "김석태",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/52/2537152.jpg",
      title: "천장호 전경",
      photographer: "김순자",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/32/1809432.jpg",
      title: "칠갑산",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/32/1810232.jpg",
      title: "칠갑산장승공원",
      photographer: "한국관광공사 김지호 ",
    },
  ],
  영덕: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/39/1908739.jpg",
      title: "영덕 블루로드",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/26/2643926.jpg",
      title: "강구항",
      photographer: "한국관광공사 이범수",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/37/1908737.jpg",
      title: "영덕 블루로드",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/45/2648845.jpg",
      title: "죽도산",
      photographer: "한국관광공사 김지호",
    },
  ],
  봉화: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/63/1091463.jpg",
      title: "범바위",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/43/1961943.jpg",
      title: "가을빛 따스한 청량사탑",
      photographer: "김혜경",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/77/2642977.jpg",
      title: "닭실마을",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/85/1812385.jpg",
      title: "경북_중부내륙 순환열차 O-Train",
      photographer: "한국관광공사 이범수",
    },
  ],
  의성: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/06/1961606.jpg",
      title: "꽃과 능",
      photographer: "오상래",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/67/1142067.jpg",
      title: "의성 만취당",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/55/1999655.jpg",
      title: "의성 산수유꽃 축제",
      photographer: "한국관광공사 이범수",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/56/1999656.jpg",
      title: "의성 산수유꽃 축제",
      photographer: "한국관광공사 이범수",
    },
  ],
  안동: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/80/1961780.jpg",
      title: "월영교의 봄",
      photographer: "김화분",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/52/1085052.jpg",
      title: "부용대",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/35/1088335.jpg",
      title: "병산서원",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/41/2504241.jpg",
      title: "월영교의 아침 물안개",
      photographer: "김성규",
    },
  ],
  영주: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/61/2620261.jpg",
      title: "외나무다리",
      photographer: "이복현",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/32/1090932.jpg",
      title: "소수서원",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/21/1954821.jpg",
      title: "영주 무섬마을",
      photographer: "한국관광공사 이범수",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/27/1954527.jpg",
      title: "희방폭포",
      photographer: "한국관광공사 이범수",
    },
  ],
};

// 홈 히어로 배경. 특정 시군을 대표하는 자리가 아니라, 파일럿 세 광역
// (충남·강원·경북)이 고루 나오도록 위 60장 중에서 5장을 뽑아 돌린다.
//
// 고른 기준: 히어로 오버레이는 지역 배너보다 진하다(78%→66%→82%). 이
// 오버레이를 씌운 상태로 히어로를 그대로 렌더해 놓고 고른 것들이라,
// 다섯 장 모두 형태가 남고 흰 제목이 묻히지 않는다. 평평한 백사장·잔잔한
// 수면처럼 오버레이 아래에서 단색이 되는 사진은 전부 뺐다.
// 첫 장은 원래 쓰던 천장호 전경 그대로다 — 첫 화면의 인상은 바뀌지 않는다.
export const HERO_PHOTOS = [
  {
    url: "https://tong.visitkorea.or.kr/cms2/website/52/2537152.jpg",
    title: "천장호 전경",
    photographer: "김순자",
    region: "충남 청양",
  },
  {
    // 같은 정선이지만 병방치 스카이워크(2818467) 대신 몰운대를 쓴다. 앞의
    // 사진은 1280x853인데도 150KB(bpp 1.13, 양자화 테이블 합 1477)로 세게
    // 눌려 있어 히어로처럼 화면을 꽉 채우면 블록 노이즈가 그대로 보였다.
    // 몰운대는 같은 크기에 1860KB(bpp 13.96, 합 86)로 60장 중 가장 여유롭다.
    url: "https://tong.visitkorea.or.kr/cms2/website/76/2516876.jpg",
    title: "몰운대",
    photographer: "한국관광공사 김지호",
    region: "강원 정선",
  },
  {
    url: "https://tong.visitkorea.or.kr/cms2/website/61/2620261.jpg",
    title: "외나무다리",
    photographer: "이복현",
    region: "경북 영주",
  },
  {
    url: "https://tong.visitkorea.or.kr/cms2/website/13/3567213.jpg",
    title: "안면암의 봄",
    photographer: "박정아",
    region: "충남 태안",
  },
  {
    url: "https://tong.visitkorea.or.kr/cms2/website/43/1961943.jpg",
    title: "가을빛 따스한 청량사탑",
    photographer: "김혜경",
    region: "경북 봉화",
  },
];

// 홈 캐러셀은 시군이 아니라 광역(강원·충남·경북) 단위라 대표 시군의 사진을 쓴다.
const CAROUSEL_REGION = { 강원: "양양", 충남: "태안", 경북: "안동" };

// 대표 사진 1장(배너·추천 결과 카드·마이페이지·계획 배너).
export function regionPhoto(short) {
  const list = PHOTOS[short];
  return list ? list[0] : null;
}

// 지역 소개 본문 슬라이드용 4장. design 733-738줄의 자리가 목업
// 그라데이션 4장이었는데(inSlides) 그 개수를 그대로 채운다.
export function regionPhotoSlides(short) {
  return PHOTOS[short] || [];
}

export function carouselPhoto(regionName) {
  return regionPhoto(CAROUSEL_REGION[regionName]);
}

// 사진 + 빗금 배경을 두 겹으로 깐다. 사진이 없거나 URL이 죽으면 브라우저가
// 아래 빗금 레이어를 그대로 보여 준다(별도 에러 처리가 필요 없다).
export function photoBackground(photo, swatch) {
  if (!photo || !photo.url) return swatch;
  return `url("${photo.url}") center / cover no-repeat, ${swatch}`;
}
