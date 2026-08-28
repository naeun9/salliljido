import { findListing } from "./exploreListings.js";

// 예상 비용 탭의 체험 목록 줄. 담은 id가 기준이고(금액이 계산되는 단위와
// 같다 — utils/cost.js computePlanCost 주석), 이름·유형만 둘러보기 목록에서
// 찾아 채운다.
//
// 목록에 없는 id도 줄을 지우지 않는다. 지역 목록이 아직 안 왔거나, 저장해
// 둔 계획을 다시 열었는데 그 사이 관광공사 데이터에서 빠진 경우인데,
// 줄이 사라지면 사용자가 넣은 금액만 남고 무엇에 대한 금액인지 알 수 없다.
export const UNKNOWN_EXPERIENCE_NAME = "정보 없음";

export function buildExperienceRows(addedExperiences, experiencePrices, listings) {
  return (addedExperiences || []).map((id) => {
    const found = findListing(listings, "체험 프로그램", id);
    return {
      id,
      name: found ? found.name : UNKNOWN_EXPERIENCE_NAME,
      type: found ? found.type : "",
      price: (experiencePrices || {})[id],
    };
  });
}
