// PlanContext(store/PlanContext.jsx)의 상태 중 저장/복원에 필요한 값만
// 골라내는 유틸. design의 confirmPlanName()/mpVals()의 open()은 계획 카드
// 표시용 요약 필드(title/region/days/themes 등) 몇 개만 저장하고 재개 시도
// 그 얕은 값만 복원한다 — rtCustom/rtPick/staySegs 같은 세부 상태는
// 원본부터 저장하지 않는다. 이번 작업 지시(마이페이지 3번 항목: "저장된
// 계획을 다시 열었을 때 작업 내용이 복원되어야 함")에 따라 PlanContext
// 전체를 스냅샷으로 남기도록 범위를 넓혔다 — 원본의 얕은 재개보다 더
// 정확하게 복원되는 의도적인 확장이다.
const PLAN_STATE_KEYS = [
  "planTitle",
  "planSaved",
  "addedExperiences",
  "experienceDays",
  "experiencePrices",
  "savedUtilities",
  "utilityDays",
  "spotDays",
  "savedSpots",
  "itemTimes",
  "themes",
  "meals",
  "routineOn",
  "mealOverride",
  "rtCustom",
  "rtPick",
  "regenSeed",
  "nightly",
  "staySplit",
  "staySegs",
  "foodStyle",
  "foodManual",
  "foodPer",
  "tripManualTotal",
  "tripExtraTotal",
  "foodDaily",
  "foodByDay",
  "etcRows",
];

function pickPlanSnapshot(plan) {
  const snapshot = {};
  PLAN_STATE_KEYS.forEach((key) => {
    snapshot[key] = plan[key];
  });
  return snapshot;
}

// 마이페이지 목록에 넣을 계획 레코드. design confirmPlanName()(2438-2457줄)은
// 카드 요약용 필드 몇 개만 저장하지만(title/region/chips/days/cost/status),
// 저장한 계획을 다시 열었을 때 작업 내용이 그대로 복원되도록 PlanContext
// 전체 스냅샷(data)도 함께 담는다.
//
// title/planSaved를 인자로 받아 스냅샷에 덮어쓰는 이유: 방금 dispatch한
// setPlanTitle/setPlanSaved는 이 렌더에 아직 반영되기 전이라(React state는
// 비동기) plan에서 읽으면 옛 값이 들어간다.
export function buildPlanRecord({ id, title, plan, region, nights, cost, condition, savedAt }) {
  const data = pickPlanSnapshot(plan);
  data.planTitle = title;
  data.planSaved = true;
  return {
    id,
    regionShort: region.short,
    regionName: region.name,
    title,
    themes: plan.themes,
    meals: plan.meals,
    days: nights,
    routineOn: plan.routineOn,
    cost,
    condition,
    data,
    savedAt,
  };
}
