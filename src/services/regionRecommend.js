// design/salliljido.extracted.html의 pool()(3611-3629줄)과 recs()(3631-3675줄).
//
// 남은 목업은 추천 "순위"뿐이다. 어느 지역을 위에 놓을지는 방문자수·수요강도
// 데이터가 있어야 하는데 그 API가 없어서, 지금은 고른 라이프스타일이
// 주분류인 지역을 앞에 두는 정렬로 대신한다.
//   - (해결됨 2026-08-26) mx/my(지도 목업 위 % 좌표) → 실제 위경도 lat/lng
//   - (해결됨) metrics 3점 게이지 → 지역명 해시 대신 관광공사 목록 실측값
//     기준으로 계산한다(services/regionProfile.js). 지역 소개 화면도 같은
//     함수를 쓰므로 두 화면이 어긋나지 않는다.
// 대응하는 서버리스 함수 자리: api/region/recommend.js(추천 점수),
// api/region/stats.js(방문자수·수요강도).
// 관련 기록: docs/02-todo.md §2 B1(추천 정렬을 실제 지표로).
//
// 지역 목록 자체는 data/regions.js 하나에서 온다(그 파일 주석 참고).
import { REGIONS, REGION_BY_SHORT } from "../data/regions.js";
import { regionMetrics } from "./regionProfile.js";

const SWATCHES = [
  "repeating-linear-gradient(135deg, #DCE8E2 0 10px, #CFE0D8 10px 20px)",
  "repeating-linear-gradient(135deg, #F0E3D2 0 10px, #E7D8C4 10px 20px)",
  "repeating-linear-gradient(135deg, #E7EBE0 0 10px, #DBE2D3 10px 20px)",
];

const MOCK_DELAY_MS = 1100; // design startLoad("find", 1100) 그대로(3773-3779줄)

function mockDelay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

// 지역 찾기 조건(region/place)에 맞는 지역을 최대 3곳 추천한다.
// 실제 API로 교체 시 이 함수의 시그니처(입력: region/place, 출력: 아래 shape의
// 배열)만 유지하면 RegionResult.jsx는 손댈 필요가 없다.
export async function getRecommendations({ region, place }) {
  await mockDelay();

  const matched = REGIONS.filter(
    (r) =>
      (region === "" || region === "상관없음" || r.region === region) &&
      (place === "" || r.places.indexOf(place) >= 0)
  )
    .sort((a, b) => a.places.indexOf(place) - b.places.indexOf(place))
    .slice(0, 3);

  // 게이지 세 개는 지역 소개와 같은 함수에서 나온다(regionProfile.js).
  return matched.map((r, i) => ({ ...r, ...regionMetrics(r), swatch: SWATCHES[i] }));
}

// RegionIntro(지역 소개) 화면에서 short(지역 slug)로 상세 데이터를 다시 찾을 때 쓴다.
export function getRegionByShort(short) {
  return REGION_BY_SHORT[short] || null;
}
