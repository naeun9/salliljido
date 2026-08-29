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
  인제: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/31/1127231.jpg",
      title: "백담사계곡",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/41/1960241.jpg",
      title: "방태산의 가을",
      photographer: "홍순국",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/29/1127129.jpg",
      title: "인제 백담사",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/59/1840359.jpg",
      title: "원대리 자작나무 숲(속삭이는 자작나무 숲)",
      photographer: "한국관광공사 박은경",
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
  속초: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/07/1691207.jpg",
      title: "속초시 전경",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/26/1691326.jpg",
      title: "속초항",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/56/2029056.jpg",
      title: "속초 엑스포타워",
      photographer: "한국관광공사 이범수",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/17/1879317.jpg",
      title: "영금정 일출",
      photographer: "한국관광공사 김지호",
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
  홍성: [
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/67/3414767.jpg",
      title: "화려한 하늘 멋진 타워",
      photographer: "이미경",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/66/1194266.jpg",
      title: "김좌진장군생가지",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/83/2048383.jpg",
      title: "홍주읍성",
      photographer: "한국관광공사 김지호",
    },
    {
      url: "https://tong.visitkorea.or.kr/cms2/website/66/2048166.jpg",
      title: "광천토굴새우젓 전통시장",
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

// 홈 히어로 배경. 특정 시군을 대표하지 않아도 되는 자리라 "며칠 살아보는
// 여행"의 분위기에 맞는 넓은 풍경 한 장을 골랐다.
export const HERO_PHOTO = {
  url: "https://tong.visitkorea.or.kr/cms2/website/52/2537152.jpg",
  title: "천장호 전경",
  photographer: "김순자",
};

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
