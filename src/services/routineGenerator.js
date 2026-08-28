// 하루 일정 자동 생성. 한국관광공사 지역기반 관광정보(areaBasedList2)로
// 받아온 그 지역 목록(useRegionListings → services/exploreListings.js)에서
// 시간대별 후보를 뽑는다.
//
// 예전에는 design/salliljido.extracted.html 2752-2963줄의 목업 배열을 그대로
// 들고 있어서, 어느 지역을 골라도 "태안군 태안읍 중앙로 21"이 나왔다.
// 지금은 지역 목록만 있으면 되고, 이 파일에 장소 이름은 하나도 없다.
//
// 시간대 ↔ 분류체계 대응(docs/03-api-check.md §13):
//   오전 — 카페(FD05)
//   오후 — 주변 관광지(NA 자연 / HS 역사 / VE 문화 / LS 레저스포츠) + 체험(EX)
//   저녁 — 식당(FD01 한식 / FD02 외국식 / FD03 간이음식 / FD04 주점)
//
// 결정성: 모든 선택이 (일차, regenSeed, 테마, 음식분류, 목록 순서)만으로
// 정해지는 순수 계산이다. 난수를 쓰지 않으므로 저장한 계획을 다시 열거나
// 최종 계획 화면에서 다시 그려도 같은 일정이 나온다(utils/planSnapshot.js).

import { findListing } from "./exploreListings.js";

// design 2747-2751줄: 오전/오후/저녁(및 담은 체험) 카드 스와치 색.
export const SLOT_SWATCHES = [
  "repeating-linear-gradient(135deg, #DCE8E2 0 9px, #CFE0D8 9px 18px)",
  "repeating-linear-gradient(135deg, #F0E3D2 0 9px, #E7D8C4 9px 18px)",
  "repeating-linear-gradient(135deg, #E7EBE0 0 9px, #DBE2D3 9px 18px)",
];

export const ALL_THEMES = ["힐링", "레저", "문화탐방", "워케이션"];
export const ALL_CUISINES = ["한식", "외국식", "간이음식", "카페", "주점"];

// 음식 취향을 고르지 않았을 때 저녁에 돌릴 분류. 카페는 뺀다 — 오전
// 슬롯이 이미 카페라 자동으로 저녁까지 카페가 되면 같은 가게가 어제
// 저녁·오늘 아침처럼 붙어 나온다. 사용자가 "카페"를 직접 고르면
// 그때는 원본대로 저녁에도 카페가 나온다.
const DEFAULT_DINNER_CUISINES = ALL_CUISINES.filter((c) => c !== "카페");
export const CUISINE_HINTS = {
  한식: "백반, 향토음식",
  외국식: "중식, 일식, 양식",
  간이음식: "분식, 제과, 치킨",
  카페: "카페, 찻집",
  주점: "전통주, 펍",
};

export const REST_OPTIONS = [
  { id: "rest", name: "숙소에서 쉬기", icon: "M3 8.5 9 3.5l6 5V15H3z" },
  { id: "cook", name: "숙소에서 직접 요리", icon: "M4 7h10v7H4zM6.5 7V4M9 7V4M11.5 7V4" },
  { id: "walk", name: "근처 산책", icon: "M9 3.5v4l2.5 3M9 7.5 6 10l1 4.5" },
  { id: "free", name: "자유 시간", icon: "M9 3.5a5.5 5.5 0 1 0 .1 0M9 6v3.5l2.5 1.5" },
];

// 담은 체험을 하루 일정 어디에 넣을지. 관광공사 API에 운영 시간대가 없어
// 전부 오후로 넣는다(docs/03-api-check.md §14).
export const EXPERIENCE_SLOT_DEFAULT = "오후";
export const EXPERIENCE_TIME_DEFAULT = "14:00 – 16:30";

// 후보가 이 수보다 적으면 다음 순위 분류를 섞어서 채운다.
// 4로 잡은 이유: 파일럿 15개 시군의 카페(FD05) 등록 수를 실측하니 인제·
// 봉화·의성이 1건, 청양·영주가 3건이었다(docs/03-api-check.md §16).
// 1~3건짜리 풀로 30일을 돌리면 같은 카페가 열흘에 한 번꼴로 반복된다.
const MIN_POOL = 4;

// 오후 슬롯의 테마별 분류 가중치. 가중치가 클수록 앞쪽·자주 배치된다.
// 0을 주지 않은 이유: 어떤 테마든 그 지역에 있는 것은 한 번씩 보여주는
// 편이 낫고, 소도시에서는 분류 하나를 빼면 후보가 급격히 줄어든다.
const AFTERNOON_WEIGHTS = {
  힐링: { 자연: 3, 문화: 2, 체험: 2, 역사: 1, 레저스포츠: 1 },
  레저: { 레저스포츠: 3, 체험: 3, 자연: 2, 역사: 1, 문화: 1 },
  문화탐방: { 역사: 3, 문화: 3, 체험: 2, 자연: 1, 레저스포츠: 1 },
  워케이션: { 자연: 3, 문화: 2, 역사: 2, 체험: 1, 레저스포츠: 1 },
};

// 지역 목록은 세션 캐시라 같은 객체가 계속 돌아온다. 30일 계획을 그릴 때
// 하루마다 풀을 다시 만들지 않도록 목록 객체 단위로 기억해 둔다.
const poolCache = new WeakMap();

function cacheFor(listings) {
  let entry = poolCache.get(listings);
  if (!entry) {
    entry = { morning: null, afternoon: {}, dinner: {} };
    poolCache.set(listings, entry);
  }
  return entry;
}

// 하위 유형 하나로 거른다(둘러보기 탭의 filterBySelectedSubs와 달리 단수).
function withSub(list, sub) {
  return (list || []).filter((x) => x.sub === sub);
}

// 가중 라운드로빈 병합. 가중치 w인 그룹의 i번째 항목에 (i+1)/w 키를 주고
// 정렬하면, 가중치 비율대로 번갈아 섞인 하나의 순서가 나온다.
// (예: 3:1이면 A A A B A A A B …) 정렬만 쓰므로 결과가 항상 같다.
function weightedMerge(groups) {
  const keyed = [];
  groups.forEach(({ items, weight }, gi) => {
    if (!weight || !items) return;
    items.forEach((item, i) => keyed.push({ item, key: (i + 1) / weight, gi, i }));
  });
  keyed.sort((a, b) => a.key - b.key || a.gi - b.gi || a.i - b.i);
  return keyed.map((k) => k.item);
}

// 순위가 있는 후보군을 MIN_POOL을 채울 때까지 순서대로 이어 붙인다.
// 1순위는 개수와 무관하게 통째로 넣고(카페가 많은 지역은 카페만 나온다),
// 2순위부터는 MIN_POOL을 채우는 데 필요한 만큼만 빌려 온다 — 많이 빌리면
// 그 시간대의 성격이 흐려지고, 오후 후보에서 빠지는 항목도 늘어난다.
function fillUpTo(sources) {
  const pool = [];
  const seen = new Set();
  sources.forEach((src, rank) => {
    if (rank > 0 && pool.length >= MIN_POOL) return;
    for (const x of src) {
      if (rank > 0 && pool.length >= MIN_POOL) break;
      if (seen.has(x.id)) continue;
      seen.add(x.id);
      pool.push(x);
    }
  });
  return pool;
}

// 오전: 카페(FD05). 카페가 얇은 지역에서는 간이음식(FD03 — 제과·빵집이
// 여기 들어온다), 그래도 모자라면 문화(VE — 박물관·미술관처럼 오전에
// 문 여는 곳)까지 섞는다.
function buildMorningPool(listings) {
  const entry = cacheFor(listings);
  if (!entry.morning) {
    const utils = listings["식당·카페"] || [];
    entry.morning = fillUpTo([withSub(utils, "카페"), withSub(utils, "간이음식"), withSub(listings["주변 관광지"], "문화")]);
  }
  return entry.morning;
}

// 오후: 주변 관광지 4분류 + 체험 프로그램을 테마 가중치로 섞는다.
function buildAfternoonPool(listings, theme) {
  const entry = cacheFor(listings);
  const key = AFTERNOON_WEIGHTS[theme] ? theme : "힐링";
  if (!entry.afternoon[key]) {
    const w = AFTERNOON_WEIGHTS[key];
    // 오전이 빌려 간 문화 항목은 뺀다. 시간대별 후보가 겹치면 같은 곳이
    // 어제 오전·오늘 오후처럼 이틀 연달아 나온다.
    const taken = new Set(buildMorningPool(listings).map((x) => x.id));
    const spots = (listings["주변 관광지"] || []).filter((x) => !taken.has(x.id));
    entry.afternoon[key] = weightedMerge([
      { items: withSub(spots, "자연"), weight: w.자연 },
      { items: withSub(spots, "역사"), weight: w.역사 },
      { items: withSub(spots, "문화"), weight: w.문화 },
      { items: withSub(spots, "레저스포츠"), weight: w.레저스포츠 },
      { items: listings["체험 프로그램"] || [], weight: w.체험 },
    ]);
  }
  return entry.afternoon[key];
}

// 저녁: 고른 음식 분류 우선. 그 분류가 얇으면 그 지역에 실제로 있는 다른
// 분류를 뒤에 붙인다(카페는 저녁 후보에서 뺀다 — 오전과 겹친다).
function buildDinnerPool(listings, cuisine) {
  const entry = cacheFor(listings);
  const key = cuisine || "한식";
  if (!entry.dinner[key]) {
    const utils = listings["식당·카페"] || [];
    // 카페를 직접 고른 경우가 아니면 오전이 쓰는 가게는 저녁 후보에서 뺀다.
    const taken = key === "카페" ? new Set() : new Set(buildMorningPool(listings).map((x) => x.id));
    const pickable = (c) => withSub(utils, c).filter((x) => !taken.has(x.id));
    const rest = ALL_CUISINES.filter((c) => c !== key && c !== "카페").map(pickable);
    entry.dinner[key] = fillUpTo([key === "카페" ? withSub(utils, key) : pickable(key), ...rest]);
  }
  return entry.dinner[key];
}

// 그 지역에 실제 후보가 있는 음식 분류만 추려낸다.
export function availableCuisines(listings) {
  const utils = listings["식당·카페"] || [];
  return ALL_CUISINES.filter((c) => utils.some((x) => x.sub === c));
}

// design 2810-2816줄(pickCuisine)에 "그 지역에 있는 분류만" 조건을 더했다.
// 원본은 목업이라 다섯 분류가 항상 있었지만, 실제로는 파일럿 15개 시군
// 전부 주점(FD04)이 0건이고 간이음식·외국식도 없는 곳이 많다. 후보가
// 없는 분류를 그대로 돌리면 화면에는 "주점"이라 써 놓고 한식집을 넣는
// 상황이 된다.
export function pickCuisine({ mealPrefs, day, mealOverride, listings }) {
  if (mealOverride) return mealOverride;
  const available = listings ? availableCuisines(listings) : ALL_CUISINES;
  const prefs = mealPrefs && mealPrefs.length ? mealPrefs : DEFAULT_DINNER_CUISINES;

  // 고른 취향 중 그 지역에 있는 것만. 하나도 없으면(예: 주점만 골랐는데
  // 그 지역에 주점이 없다) 있는 것 전체로 돌린다.
  let rotation = prefs.filter((c) => available.includes(c));
  if (!rotation.length) rotation = available.length ? available : prefs;

  // design 2812줄: 한 분류만 남았고 후보가 3개 미만이면 다른 분류를 하나 섞는다.
  if (rotation.length === 1 && buildDinnerPool(listings || {}, rotation[0]).length < 3) {
    const extra = available.filter((c) => c !== rotation[0]).slice(0, 1);
    rotation = rotation.concat(extra);
  }
  return rotation[(day - 1) % rotation.length];
}

// design 2818-2827줄: regenSeed만큼 밀어가며 후보를 순환한다. 나눗셈
// 나머지로 도는 라운드로빈이라 같은 장소는 정확히 "풀 크기"만큼의 간격을
// 두고 다시 나온다 — 체류 기간 전체에 고르게 퍼지는 셈이다.
// exclude에 걸리면 다음 후보로 한 칸씩 밀어 같은 날 중복만 피한다.
function pickFrom(pool, day, regenSeed, exclude) {
  if (!pool.length) return null;
  const n = pool.length;
  for (let k = 0; k < n; k++) {
    const item = pool[(day - 1 + regenSeed + k) % n];
    if (!exclude || !exclude.has(item.id)) return item;
  }
  return pool[(day - 1 + regenSeed) % n];
}

// 관광공사 목록 항목 → 타임라인 슬롯. 소개 문구(overview)는 목록 API에
// 없어서 둘러보기 카드와 같이 주소를 설명 자리에 쓴다(§14).
function toSlot(item) {
  return {
    id: item.id,
    place: item.name,
    tag: item.type || item.sub || "",
    desc: item.addr || "",
    addr: item.addr || "",
    // 지도용 실좌표. 예전에는 지도 목업의 % 좌표(x/y)를 들고 다녔다.
    mapX: item.mapX,
    mapY: item.mapY,
  };
}

// 하루치 기본 오전/오후/저녁을 만든다. 후보가 없는 시간대는 null을 돌려
// 그 슬롯을 비운다 — buildDayTimeline이 걸러낸다.
export function generateDaySlots({ day, theme, cuisine, regenSeed = 0, listings, excludeIds }) {
  const src = listings || {};
  const used = new Set(excludeIds || []);

  const morning = pickFrom(buildMorningPool(src), day, regenSeed, used);
  if (morning) used.add(morning.id);
  const afternoon = pickFrom(buildAfternoonPool(src, theme), day, regenSeed, used);
  if (afternoon) used.add(afternoon.id);
  const dinner = pickFrom(buildDinnerPool(src, cuisine), day, regenSeed, used);

  return {
    오전: morning ? toSlot(morning) : null,
    오후: afternoon ? toSlot(afternoon) : null,
    저녁: dinner ? toSlot(dinner) : null,
  };
}

// PickerModal의 "내가 담은 곳" 목록(최대 4개). design 3207-3210줄.
// 저장된 것은 id뿐이라 이름은 그때그때 목록에서 찾는다.
export function getPickerMine(savedUtilities, listings) {
  return (savedUtilities || [])
    .slice(0, 4)
    .map((id) => {
      const u = findListing(listings, "식당·카페", id);
      return u ? { id, name: u.name, meta: "내가 담은 곳" } : null;
    })
    .filter(Boolean);
}

// PickerModal의 "추천 장소" 목록(최대 5개). design 3211줄.
// 고른 뒤 localStorage에 이름을 남기지 않도록 id를 함께 넘긴다.
export function getSlotPoolOptions({ slot, dinner, theme, cuisine, listings }) {
  const src = listings || {};
  const pool = dinner
    ? buildDinnerPool(src, cuisine)
    : slot === "오전"
      ? buildMorningPool(src)
      : buildAfternoonPool(src, theme);
  return pool.slice(0, 5).map(toSlot);
}
