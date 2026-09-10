// 지역 사진. 한국관광공사 "관광사진 정보"(PhotoGalleryService1)에서 한 번
// 조회해 고른 결과를 URL 상수로 적어 둔 것이다. 지역마다 4장이고, 첫 장이
// 대표 사진(배너·카드)이며 나머지는 지역 소개 본문 슬라이드에 쓴다.
//
// 사진 목록은 광역별 파일로 나눠 뒀다(29곳 × 4장 = 116장이라 한 파일에
// 두면 700줄이 넘는다 — CLAUDE.md 300줄 규칙). 여기서는 세 파일을 합쳐
// 조회 함수만 내보낸다.
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
// 고른 기준:
//  - 촬영지(galPhotographyLocation)가 그 지역인 것만. 키워드 검색은
//    galSearchKeyword까지 훑어서 다른 지역 사진이 섞인다. 1페이지만 보면
//    같은 명소 사진이 수십 장씩 중복돼 후보가 실제보다 적어 보이므로,
//    여러 페이지를 훑어 "서로 다른 명소"로 센다(금산이 2개→8개가 됐다).
//  - 대표 사진은 배너 오버레이가 덮이므로, 오버레이를 씌운 컨택트 시트를
//    만들어 형태가 남는 것만 골랐다. 평평한 백사장·잔잔한 수면은 오버레이
//    아래에서 단색이 돼 버려서 전부 뺐다.
//  - 가로형(1000px 이상), 인물이 크게 나오지 않는 것.
//  - 압축 화질도 본다. 같은 1280px라도 파일이 작게 눌린 것이 섞여 있어
//    화면을 꽉 채우면 깨져 보인다. bpp와 JPEG 양자화 테이블 합을 재서
//    기존 60장의 분포 안에 드는 것만 남겼다.
//  - 네 장의 제목은 지역 소개 슬라이드에 캡션으로 그대로 나간다. 그래서
//    "아름다운 우리강산"처럼 장소를 알 수 없는 사진 제목은 쓰지 않는다.
//
// 저작권: 전부 한국관광공사 관광사진 갤러리 제공 사진이다. 이 API에는
// 사진별 저작권 유형(cpyrhtDivCd) 필드가 없다 — 장소 상세 API(detailImage2)에만
// 있다. 출처는 화면에 "사진 ⓒ한국관광공사"로 표기한다(Footer).
//
// 갱신 방법: gallerySearchList1을 지역명·명소명으로 부르고
// galPhotographyLocation에 지역명이 들어간 것만 추린 뒤 골라 URL을 바꾸면 된다.
// 원본이 내려가도 화면은 기존 빗금 배경으로 돌아간다(사진 + 빗금 2겹).
import { GANGWON_PHOTOS } from "./regionPhotos/gangwon.js";
import { CHUNGNAM_PHOTOS } from "./regionPhotos/chungnam.js";
import { GYEONGBUK_PHOTOS } from "./regionPhotos/gyeongbuk.js";

const PHOTOS = { ...GANGWON_PHOTOS, ...CHUNGNAM_PHOTOS, ...GYEONGBUK_PHOTOS };

// 홈 히어로 배경. 특정 시군을 대표하는 자리가 아니라, 파일럿 세 광역
// (충남·강원·경북)이 고루 나오도록 위 목록에서 5장을 뽑아 돌린다.
//
// 고른 기준: 히어로는 전면 오버레이 위에 글자 쪽을 한 겹 더 덮는다
// (Hero.module.css의 .overlay + .textScrim). 그 상태로 히어로를 그대로
// 렌더해 놓고 고른 것들이라 다섯 장 모두 형태가 남고 흰 제목이 묻히지
// 않는다. 평평한 백사장·잔잔한 수면처럼 오버레이 아래에서 단색이 되는
// 사진은 전부 뺐다.
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
