// 지역 대표 사진. 한국관광공사 "관광사진 정보"(PhotoGalleryService1)에서
// 한 번 조회해 고른 결과를 URL 상수로 적어 둔 것이다.
//
// 왜 화면에서 실시간으로 부르지 않는가:
//  - 홈 캐러셀·마이페이지 카드는 방문자마다 지역 수만큼 호출이 생긴다.
//    사진 한 장을 위해 일 1,000건 한도를 태울 이유가 없다(docs/03-api-check.md §17).
//  - 사진 API는 키워드 검색만 되고 지역 필터가 없어서, 부를 때마다 엉뚱한
//    지역 사진이 1등으로 나오는 경우가 있다(의성 검색에 전남 사진이 1등).
//    사람이 한 번 골라 고정하는 편이 결과가 안정적이다.
//  - 여기 있는 건 이미지 URL(정적 참조값)이지 관광 콘텐츠 캐시가 아니다.
//    지역 코드(regnCd/signguCd)·중심 좌표와 같은 성격이다.
//
// 고른 기준: 촬영지(galPhotographyLocation)가 그 지역인 것 중 가로형이고,
// 인물이 크게 나오지 않으며, 딥그린 오버레이 아래에서도 형태가 읽히는 사진.
//
// 저작권: 전부 한국관광공사 관광사진 갤러리 제공 사진이다. 이 API에는
// 사진별 저작권 유형(cpyrhtDivCd) 필드가 없다 — 장소 상세 API(detailImage2)에만
// 있다. 출처는 화면에 "사진 ⓒ한국관광공사"로 표기한다(Footer, 지역 소개 하단).
// 촬영자는 아래 photographer에 남겨 두었다.
//
// 갱신 방법: gallerySearchList1을 지역명으로 부르고
// galPhotographyLocation에 지역명이 들어간 것만 추린 뒤 골라 URL을 바꾸면 된다.
// 원본이 내려가도 화면은 기존 빗금 배경으로 자연스럽게 돌아간다
// (CSS 배경을 사진 + 빗금 2겹으로 깔아서 사진이 404면 빗금이 보인다).
const PHOTOS = {
  양양: {
    url: "https://tong.visitkorea.or.kr/cms2/website/49/1544649.jpg",
    title: "하조대",
    photographer: "한국관광공사 김지호",
  },
  정선: {
    url: "https://tong.visitkorea.or.kr/cms2/website/91/1984991.jpg",
    title: "정선 병방치스카이워크",
    photographer: "한국관광공사 이범수",
  },
  인제: {
    url: "https://tong.visitkorea.or.kr/cms2/website/17/1960317.jpg",
    title: "아름다운 설악",
    photographer: "조칠훈",
  },
  삼척: {
    url: "https://tong.visitkorea.or.kr/cms2/website/61/1059661.jpg",
    title: "삼척 공양왕릉",
    photographer: "한국관광공사 김지호",
  },
  속초: {
    url: "https://tong.visitkorea.or.kr/cms2/website/07/1691207.jpg",
    title: "속초시 전경",
    photographer: "한국관광공사 김지호",
  },
  태안: {
    url: "https://tong.visitkorea.or.kr/cms2/website/79/1073779.jpg",
    title: "몽산포해수욕장",
    photographer: "한국관광공사 김지호",
  },
  서천: {
    url: "https://tong.visitkorea.or.kr/cms2/website/00/1951600.jpg",
    title: "춘장대해수욕장",
    photographer: "한국관광공사 김지호",
  },
  보령: {
    url: "https://tong.visitkorea.or.kr/cms2/website/91/2504291.jpg",
    title: "무논 여행",
    photographer: "정종호",
  },
  홍성: {
    url: "https://tong.visitkorea.or.kr/cms2/website/67/3414767.jpg",
    title: "홍성 스카이타워",
    photographer: "이미경",
  },
  청양: {
    url: "https://tong.visitkorea.or.kr/cms2/website/36/3570736.jpg",
    title: "천장호 출렁다리",
    photographer: "김석태",
  },
  영덕: {
    url: "https://tong.visitkorea.or.kr/cms2/website/37/1908737.jpg",
    title: "영덕 블루로드",
    photographer: "한국관광공사 김지호",
  },
  봉화: {
    url: "https://tong.visitkorea.or.kr/cms2/website/63/1091463.jpg",
    title: "범바위",
    photographer: "한국관광공사 김지호",
  },
  의성: {
    url: "https://tong.visitkorea.or.kr/cms2/website/06/1961606.jpg",
    title: "꽃과 능",
    photographer: "오상래",
  },
  안동: {
    url: "https://tong.visitkorea.or.kr/cms2/website/00/1084800.jpg",
    title: "안동하회마을",
    photographer: "한국관광공사 김지호",
  },
  영주: {
    url: "https://tong.visitkorea.or.kr/cms2/website/61/1090961.jpg",
    title: "소수서원",
    photographer: "한국관광공사 김지호",
  },
};

// 홈 히어로 배경. 특정 시군을 대표하지 않아도 되는 자리라 "며칠 살아보는
// 여행"의 분위기에 맞는 넓은 풍경 한 장을 골랐다.
export const HERO_PHOTO = {
  url: "https://tong.visitkorea.or.kr/cms2/website/52/2537152.jpg",
  title: "천장호 전경",
  photographer: "김순자",
};

// 홈 캐러셀은 시군이 아니라 광역(강원·충남·경북) 단위라 대표 시군의 사진을 쓴다.
// 카드 문구(imageNote)가 가리키는 풍경과 맞는 곳으로 골랐다.
const CAROUSEL_REGION = { 강원: "양양", 충남: "태안", 경북: "안동" };

export function regionPhoto(short) {
  return PHOTOS[short] || null;
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
