// 둘러보기에서 담은 곳을 하루 타임라인 항목으로 바꾼다.
// dayTimeline.js가 300줄을 넘어(CLAUDE.md 코드 원칙) 떼어냈다.
import { EXPERIENCE_SLOT_DEFAULT, EXPERIENCE_TIME_DEFAULT, SLOT_SWATCHES } from "./routineGenerator.js";
import { findListing } from "./exploreListings.js";
import { SLOT_TIME } from "./slots.js";

// 둘러보기에서 담은 곳 중 오늘 일차인 것.
//
// design은 체험만 담을 수 있었지만 이제 식당·카페와 주변 관광지도 담고
// 일차를 고른다. 시간대는 카테고리로 정한다 — 관광공사 API에 운영
// 시간대가 없어서(docs/03-api-check.md §14) 뭐라도 기준이 필요하고,
// 자동 생성 슬롯이 쓰는 규칙과 같은 규칙을 쓰는 게 자연스럽다:
//   카페  → 오전(routineGenerator의 아침 후보가 카페다)
//   식당  → 저녁
//   관광지 → 오후
// 배정된 시간이 마음에 안 들면 타임라인에서 "시간"으로 고칠 수 있다.
function slotOfAdded(category, item) {
  if (category === "주변 관광지") return "오후";
  if (category === "식당·카페") return item.sub === "카페" ? "오전" : "저녁";
  return EXPERIENCE_SLOT_DEFAULT;
}

function addedOfCategory({ day, category, ids, days, listings, keyPrefix, offset }) {
  return (ids || [])
    .filter((id) => (days[id] || 1) === day)
    .map((id) => findListing(listings, category, id))
    .filter(Boolean)
    .map((x, i) => {
      const slot = slotOfAdded(category, x);
      const time =
        slot === EXPERIENCE_SLOT_DEFAULT && category === "체험 프로그램"
          ? EXPERIENCE_TIME_DEFAULT
          : SLOT_TIME[slot];
      return {
        id: x.id,
        slot,
        time,
        place: x.name,
        tag: x.type,
        desc: x.desc || x.note || "",
        addr: x.addr,
        mapX: x.mapX,
        mapY: x.mapY,
        swatch: SLOT_SWATCHES[(offset + i) % 3],
        mine: true,
        isDinner: slot === "저녁",
        sortKey: time,
        timeKey: `${keyPrefix}:${x.id}`,
      };
    });
}

export function buildAddedItems({
  day,
  addedExperiences,
  experienceDays,
  savedUtilities,
  utilityDays,
  savedSpots,
  spotDays,
  listings,
}) {
  const exp = addedOfCategory({
    day,
    category: "체험 프로그램",
    ids: addedExperiences,
    days: experienceDays || {},
    listings,
    keyPrefix: "exp",
    offset: 0,
  });
  const util = addedOfCategory({
    day,
    category: "식당·카페",
    ids: savedUtilities,
    days: utilityDays || {},
    listings,
    keyPrefix: "util",
    offset: exp.length,
  });
  const spot = addedOfCategory({
    day,
    category: "주변 관광지",
    ids: savedSpots,
    days: spotDays || {},
    listings,
    keyPrefix: "spot",
    offset: exp.length + util.length,
  });
  return exp.concat(util, spot);
}

// 담은 곳(체험·식당카페·관광지)을 한 덩어리로 다룬다. 두 화면(체류 계획
// 탭·최종 계획)이 같은 값을 넘겨야 일정이 어긋나지 않는다.
export function resolveAdded(input) {
  return {
    addedExperiences: input.addedExperiences || [],
    experienceDays: input.experienceDays || {},
    savedUtilities: input.savedUtilities || [],
    utilityDays: input.utilityDays || {},
    savedSpots: input.savedSpots || [],
    spotDays: input.spotDays || {},
  };
}

// 자동 생성에서 빼야 할 id 전부(담은 곳은 아래에서 따로 넣으므로 겹치면 안 된다).
export function allAddedIds(added) {
  return added.addedExperiences.concat(added.savedUtilities, added.savedSpots);
}
