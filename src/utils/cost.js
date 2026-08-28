// design/salliljido.extracted.html costVals()(2266-2508줄)의 계산식을 값
// 그대로 옮겼다. 단가 기준값은 상수로 모아뒀다.
// (design 2500-2506줄의 "비용 산정 기준" 패널은 제거했다 — 그 패널이 쓰던
//  wonInMan 포맷터도 함께 지웠다.)

export const DEFAULT_NIGHTLY = 55000; // design state.nightly 기본값(2102줄)
export const DEFAULT_STAY_SEGMENT_RATE = 55000;

// design 2283줄: 식비 스타일별 1일 기준 금액.
export const FOOD_RATE_BY_STYLE = {
  "외식 중심": 42000,
  "자취 중심": 18000,
  반반: 30000,
};
export const FOOD_STYLES = Object.keys(FOOD_RATE_BY_STYLE);

// design 2288줄: 저녁을 "숙소에서 직접 요리"로 고른 날, 하루 식비의 1/3을
// 저녁으로 보고 그 65%를 아낀 것으로 계산한다.
export const COOK_MEAL_FRACTION = 1 / 3;
export const COOK_SAVINGS_RATIO = 0.65;

export function won(n) {
  return Math.round(n).toLocaleString("ko-KR") + "원";
}

// design 2272줄: 구간을 하나도 안 나눴을 때 보여줄 기본 구간(계산에도 이걸 쓴다).
export function resolveStaySegments(staySegs, nights) {
  if (staySegs && staySegs.length) return staySegs;
  return [
    {
      from: 1,
      to: Math.min(3, nights),
      rate: DEFAULT_STAY_SEGMENT_RATE,
      memo: "",
    },
  ];
}

function segmentNights(seg) {
  return Math.max(0, (seg.to || 0) - (seg.from || 0) + 1);
}

function calcStayTotal({ split, nightly, nights, staySegs }) {
  if (!split)
    return (nightly === "" ? 0 : (nightly ?? DEFAULT_NIGHTLY)) * nights;
  const segs = resolveStaySegments(staySegs, nights);
  return segs.reduce(
    (sum, seg) => sum + segmentNights(seg) * (seg.rate || 0),
    0,
  );
}

// design 2043줄: 저녁을 "직접 요리"로 고른 일수(체류계획 탭 rtPick과 연동).
function countCookedDinners(rtPick) {
  return Object.keys(rtPick || {}).filter(
    (k) => k.endsWith("|저녁") && rtPick[k].id === "cook",
  ).length;
}

// 하루마다 예산을 짠 경우: 입력한 일차의 합. 안 넣은 일차는 0원으로 본다.
function calcFoodDailyTotal(foodDaily, nights) {
  let total = 0;
  for (let d = 1; d <= nights; d++) total += Number((foodDaily || {})[d]) || 0;
  return total;
}

function calcFoodTotal({
  foodStyle,
  foodManual,
  foodPer,
  nights,
  cookedCount,
  foodByDay,
  foodDaily,
}) {
  // 하루마다 예산 짜기가 켜져 있으면 그 합이 곧 식비다(요리 할인은 적용하지
  // 않는다 — 사용자가 이미 그날 쓸 금액을 직접 정한 것이라).
  if (foodByDay) return calcFoodDailyTotal(foodDaily, nights);
  return calcFoodTotalAuto({
    foodStyle,
    foodManual,
    foodPer,
    nights,
    cookedCount,
  });
}

function calcFoodTotalAuto({
  foodStyle,
  foodManual,
  foodPer,
  nights,
  cookedCount,
}) {
  const autoPer = FOOD_RATE_BY_STYLE[foodStyle] ?? FOOD_RATE_BY_STYLE.반반;
  const per = foodManual
    ? foodPer === "" || foodPer === undefined
      ? 0
      : foodPer
    : autoPer;
  const cooked = Math.min(cookedCount, nights);
  return (
    per * nights -
    cooked * Math.round(per * COOK_MEAL_FRACTION * COOK_SAVINGS_RATIO)
  );
}

export function resolveFoodPer({ foodStyle, foodManual, foodPer }) {
  const autoPer = FOOD_RATE_BY_STYLE[foodStyle] ?? FOOD_RATE_BY_STYLE.반반;
  return foodManual ? (foodPer === undefined ? autoPer : foodPer) : autoPer;
}

// design 2312줄: 체류 계획 탭에서 직접 추가한 일정의 비용 합(rtCustom과 연동).
function calcCustomItemsTotal(rtCustom) {
  return (rtCustom || []).reduce(
    (sum, c) => sum + (parseInt(c.cost, 10) || 0),
    0,
  );
}

function calcEtcTotal(etcRows, customItemsTotal) {
  const rowsTotal = (etcRows || []).reduce(
    (sum, row) =>
      sum + (row.amount === "" || row.amount === undefined ? 0 : row.amount),
    0,
  );
  return rowsTotal + customItemsTotal;
}

// 참가비는 사용자가 직접 넣는 값이라 비어 있을 수 있다(관광공사 API에
// 체험 가격이 없다 — docs/03-api-check.md §14). 안 넣은 항목은 0원으로 본다.
function calcExperienceTotal(experienceRows) {
  return (experienceRows || []).reduce(
    (sum, x) => sum + (Number(x.price) || 0),
    0,
  );
}

// design 2319줄: 전체 예상 비용. 다섯 항목의 시그니처(입력값)만 유지하면
// 실제 단가를 API/설정값으로 바꿔도 이 함수와 CostTab.jsx는 안 건드려도 된다.
export function computeCostBreakdown({
  nights,
  nightly,
  staySplit,
  staySegs,
  foodStyle,
  foodManual,
  foodPer,
  tripManualTotal,
  tripExtraTotal,
  foodByDay,
  foodDaily,
  experienceRows,
  etcRows,
  rtCustom,
  rtPick,
}) {
  const stay = calcStayTotal({ split: staySplit, nightly, nights, staySegs });
  const cookedCount = countCookedDinners(rtPick);
  const food = calcFoodTotal({
    foodStyle,
    foodManual,
    foodPer,
    nights,
    cookedCount,
    foodByDay,
    foodDaily,
  });
  // 왕복 + 추가 교통비(현지 이동 등)
  const num = (v) => (v === "" || v === undefined ? 0 : Number(v) || 0);
  const trip = num(tripManualTotal) + num(tripExtraTotal);
  const exp = calcExperienceTotal(experienceRows);
  const customItemsTotal = calcCustomItemsTotal(rtCustom);
  const etc = calcEtcTotal(etcRows, customItemsTotal);
  const total = stay + food + trip + exp + etc;
  return { stay, food, trip, exp, etc, total, cookedCount, customItemsTotal };
}

// design 2319-2325줄: 비용 구성 막대 색.
export const COST_PART_COLORS = {
  숙박비: "#2F5D50",
  식비: "#4A7C6F",
  교통비: "#7BA396",
  체험비: "#B4CCC2",
  기타: "#D3E0D9",
};

// design 2402-2412줄(cbBars). 예상 비용 탭의 "비용 구성" 패널과 최종 계획
// 화면의 "예상 비용" 섹션이 같은 값을 써야 해서 여기로 뺐다 — 두 벌로
// 두면 단가나 문구를 한쪽만 고치는 구조가 된다.
//
// basis(근거 문구)는 원본에서 최종 계획 화면(1624줄)에만 자리가 있고
// 비용 탭 마크업(1416-1426줄)에는 없다. 계산은 공유하고 표시 여부만
// 각 화면이 정한다.
export function buildCostBars({
  breakdown,
  nights,
  nightly,
  staySplit,
  foodStyle,
  foodManual,
  foodPer,
  experienceCount,
}) {
  const { stay, food, trip, exp, etc, total, customItemsTotal } = breakdown;
  const perNight = nightly === "" || nightly === undefined ? 0 : nightly;
  const per = resolveFoodPer({ foodStyle, foodManual, foodPer });

  const parts = [
    {
      label: "숙박비",
      v: stay,
      basis: staySplit ? "구간별 입력 합산" : `${won(perNight)} × ${nights}박`,
    },
    { label: "식비", v: food, basis: `1일 ${won(per)} × ${nights}일` },
    { label: "교통비", v: trip, basis: "왕복 직접 입력" },
    { label: "체험비", v: exp, basis: `담은 프로그램 ${experienceCount}건` },
    {
      label: "기타",
      v: etc,
      basis: customItemsTotal
        ? `직접 입력 + 추가한 일정 ${won(customItemsTotal)}`
        : "직접 입력",
    },
  ];

  return parts.map((p) => ({
    label: p.label,
    basis: p.basis,
    amount: won(p.v),
    color: COST_PART_COLORS[p.label],
    width: total ? `${Math.round((p.v / total) * 100)}%` : "0%",
    pct: total ? `${Math.round((p.v / total) * 100)}%` : "0%",
  }));
}

// 계획 상태(PlanContext) 하나로 비용 합계와 요약 막대를 한 번에 만든다.
// 예상 비용 탭과 최종 계획 화면이 같은 값을 보여 줘야 하는데, 두 화면이
// 각자 인자를 나열하다 보니 한쪽에만 새 항목(추가 교통비·일별 식비)이
// 빠져 금액이 달라지는 일이 실제로 있었다. 인자 나열은 여기 한 곳뿐이다.
export function computePlanCost({ plan, nights }) {
  // 체험비는 "담은 id 전부"로 잡는다. 예전에는 예상 비용 탭만 둘러보기
  // 목록에서 찾은 항목으로 계산해서, 목록이 아직 안 왔거나 그 지역 목록에
  // 없는 id가 섞이면(오래된 저장 계획 등) 최종 계획 화면과 금액이 갈렸다.
  // 사용자가 직접 넣은 금액은 목록 상태와 무관한 계획의 값이므로 id가
  // 기준이다. 이름은 화면에서 목록으로 찾고, 못 찾으면 "정보 없음"으로
  // 보여 준다(services/experienceRows.js).
  const rows = plan.addedExperiences.map((id) => ({
    id,
    price: plan.experiencePrices[id],
  }));

  const breakdown = computeCostBreakdown({
    nights,
    nightly: plan.nightly,
    staySplit: plan.staySplit,
    staySegs: plan.staySegs,
    foodStyle: plan.foodStyle,
    foodManual: plan.foodManual,
    foodPer: plan.foodPer,
    tripManualTotal: plan.tripManualTotal,
    tripExtraTotal: plan.tripExtraTotal,
    foodByDay: plan.foodByDay,
    foodDaily: plan.foodDaily,
    experienceRows: rows,
    etcRows: plan.etcRows,
    rtCustom: plan.rtCustom,
    rtPick: plan.rtPick,
  });

  const bars = buildCostBars({
    breakdown,
    nights,
    nightly: plan.nightly,
    staySplit: plan.staySplit,
    foodStyle: plan.foodStyle,
    foodManual: plan.foodManual,
    foodPer: plan.foodPer,
    foodByDay: plan.foodByDay,
    foodDaily: plan.foodDaily,
    experienceCount: plan.addedExperiences.length,
  });

  return { breakdown, bars };
}
