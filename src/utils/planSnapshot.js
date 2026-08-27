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
  "etcRows",
];

export function pickPlanSnapshot(plan) {
  const snapshot = {};
  PLAN_STATE_KEYS.forEach((key) => {
    snapshot[key] = plan[key];
  });
  return snapshot;
}
