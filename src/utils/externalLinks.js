// 외부 서비스로 나가는 링크를 만드는 곳. 형식이 바뀌면 여기만 고친다.

// 카카오맵 장소 링크. 좌표만 있으면 되는 형식이라 SDK·키 없이 열린다.
// 이름은 지도 위 라벨로 쓰인다.
export function kakaoMapUrl({ name, mapY, mapX }) {
  if (!mapX || !mapY) {
    return `https://map.kakao.com/?q=${encodeURIComponent(name || "")}`;
  }
  return `https://map.kakao.com/link/map/${encodeURIComponent(name || "장소")},${mapY},${mapX}`;
}

// 대한민국구석구석(관광공사 공식 소개 사이트)에서 그 장소를 찾아 준다.
//
// 상세 페이지(`/detail/ms_detail.do?cotid=...`)로 바로 보내고 싶었지만
// cotid는 우리가 가진 contentId(숫자)와 다른 내부 식별자라 만들 수 없다 —
// contentId를 cotid/contentid 어느 이름으로 넣어도 안내(오류) 페이지가
// 떴다(2026-08-28 확인). 검색 URL은 장소명으로 정확히 걸린다.
export function visitKoreaSearchUrl(name) {
  return `https://korean.visitkorea.or.kr/search/search_list.do?keyword=${encodeURIComponent(name || "")}`;
}
