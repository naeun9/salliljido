// ⚠️ 목업 데이터/로직. design/salliljido.extracted.html의 pool()(3611-3629줄)과
// recs()(3631-3675줄)를 그대로 옮긴 것이며, 실제 서비스에서는 한국관광공사
// API 기반으로 교체해야 한다.
//   - metrics의 "한적함" → 지역별 관광 수요강도(공공데이터) 기반 점수로 계산
//   - "생활 편의"/"워케이션", 정렬/추천 순위 → 빅데이터 지역별 방문자수 기반으로 계산
//   - (해결됨 2026-08-26) mx/my(지도 목업 위 % 좌표)는 실제 위경도
//     lat/lng로 바뀌었다 — data/regions.js 참고
// 대응하는 서버리스 함수 자리: api/region/recommend.js(추천 점수),
// api/region/stats.js(방문자수·수요강도). 그쪽 로직이 채워지면 이 파일을 걷어내고
// services/regionApi.js가 그 두 엔드포인트를 호출하도록 바꾸면 된다.
// 관련 기록: docs/02-todo.md "추천 결과 → 실제 API 교체".
//
// 지역 목록 자체는 data/regions.js 하나에서 온다(그 파일 주석 참고).
import { REGIONS, REGION_BY_SHORT } from "../data/regions.js";

const SWATCHES = [
  "repeating-linear-gradient(135deg, #DCE8E2 0 10px, #CFE0D8 10px 20px)",
  "repeating-linear-gradient(135deg, #F0E3D2 0 10px, #E7D8C4 10px 20px)",
  "repeating-linear-gradient(135deg, #E7EBE0 0 10px, #DBE2D3 10px 20px)",
];

const QUIET_TEXT = ["", "보통", "한적함", "매우 한적함"];
const CONV_TEXT = ["", "제한적", "기본은 갖춤", "여유 있음"];
const WC_TEXT = ["", "카페 몇 곳", "카페 여럿", "코워킹 있음"];

const MOCK_DELAY_MS = 1100; // design startLoad("find", 1100) 그대로(3773-3779줄)

function mockDelay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

// design 3646줄: 지역 이름 글자 코드 합으로 점수를 흉내낸 목업. 실제 데이터로
// 바뀌면 이 해시 대신 관광공사 API 응답값을 그대로 쓰면 된다.
function hashScore(short) {
  return (short || "태안").split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
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

  return matched.map((r, i) => {
    const hash = hashScore(r.short);
    const quietLv = 3 - (hash % 2);
    const convLv = 1 + (hash % 3);
    const wcLv = 1 + ((hash + 1) % 3);
    return {
      ...r,
      metrics: [
        { label: "한적함", level: quietLv },
        { label: "생활 편의", level: convLv },
        { label: "워케이션", level: wcLv },
      ],
      quietText: QUIET_TEXT[quietLv],
      convText: CONV_TEXT[convLv],
      wcText: WC_TEXT[wcLv],
      swatch: SWATCHES[i],
    };
  });
}

// design 2966-2969줄: RegionIntro가 쓰는 별도의 목업 점수. RegionResult의
// getRecommendations() 점수와 계산식이 다르지만(원본부터 그랬다) 화면마다
// 쓰임이 달라(카드 3점짜리 dot vs 소개 문구) 그대로 분리해서 옮겼다.
// 이것도 실제로는 관광 수요강도/방문자수 API로 교체될 값이다.
export function getRegionInsights(short) {
  const hash = hashScore(short);
  return {
    quietLevel: 1 + (hash % 2), // 1-2
    convLevel: 2 + (hash % 3), // 2-4
    wcLevel: 1 + ((hash + 1) % 3), // 1-3
  };
}

// RegionIntro(지역 소개) 화면에서 short(지역 slug)로 상세 데이터를 다시 찾을 때 쓴다.
// docs/02-todo.md "RegionIntro 데이터 연결" 참고.
export function getRegionByShort(short) {
  return REGION_BY_SHORT[short] || null;
}
