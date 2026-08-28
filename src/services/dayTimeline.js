// 하루 일정 타임라인 조립. design/salliljido.extracted.html 2860-2963줄.
//
// 자동 생성된 오전/오후/저녁 슬롯 + 둘러보기에서 담은 체험 + 직접 추가한
// 일정을 하나의 시간순 목록으로 합치고, PickerModal에서 고른 대체 장소를
// 덮어씌운다. 자동 생성 슬롯 자체는 services/routineGenerator.js가
// 그 지역의 관광공사 목록에서 뽑아낸다.
import {
  REST_OPTIONS,
  SLOT_SWATCHES,
  EXPERIENCE_SLOT_DEFAULT,
  EXPERIENCE_TIME_DEFAULT,
  generateDaySlots,
  ALL_THEMES,
  pickCuisine,
} from "./routineGenerator.js";
import { findListing, findListingAnywhere } from "./exploreListings.js";
import { buildAddedItems, resolveAdded, allAddedIds } from "./addedItems.js";
import { buildCustomItems, applyPicks } from "./dayItems.js";
import { SLOT_TIME } from "./slots.js";

const SLOTS = ["오전", "오후", "저녁"];

// design 2007-2009줄(submitCustom): 시작 시각의 시(hour)로 슬롯을 정한다.
// 직접 추가한 일정에만 쓰던 규칙인데, 시간을 고칠 수 있게 되면서 자동
// 생성 슬롯·담은 체험에도 같은 규칙을 적용한다 — 저녁 시간으로 바꾸면
// 저녁 칸으로 옮겨 가야 순서가 자연스럽다.
function slotOfStart(start, fallback) {
  const hour = start ? parseInt(String(start).split(":")[0], 10) : NaN;
  if (Number.isNaN(hour)) return fallback;
  return hour < 12 ? "오전" : hour < 18 ? "오후" : "저녁";
}

// 사용자가 고친 시간이 있으면 항목의 시간·슬롯·정렬키를 바꿔 준다.
// timeKey는 항목마다 고정이라 슬롯이 바뀌어도 설정이 따라다닌다.
function applyTimeOverride(item, itemTimes) {
  const override = (itemTimes || {})[item.timeKey];
  if (!override || !override.start) return item;
  const label = override.start + (override.end ? ` – ${override.end}` : "");
  return {
    ...item,
    time: label,
    slot: slotOfStart(override.start, item.slot),
    sortKey: override.start,
  };
}
const SLOT_ORDER = { 오전: 0, 오후: 1, 저녁: 2 };
// 값은 services/slots.js로 옮겼다(addedItems.js와 함께 쓰면서 순환 참조가
// 생기지 않게). 이미 이 이름으로 가져다 쓰는 곳이 있어 여기서 다시 내보낸다.
export { SLOT_TIME };

// 자동 생성 슬롯을 1일차부터 차례로 만든다.
//
// 왜 앞 일차부터 순서대로인가: 테마와 음식 분류가 날마다 바뀌면서 뽑는
// 후보 목록 자체가 달라지기 때문에, 나머지 연산만으로는 "어제 오후에
// 나온 곳이 오늘 오후에 또" 나오는 경우를 못 막는다. 그래서 전날 나온
// 곳을 다음 날 후보에서 뺀다 — 앞 일차 결과가 필요하니 순서대로 만든다.
// 난수는 쓰지 않으므로 몇 번을 다시 계산해도 결과는 같다.
function baseSlotChain({ upToDay, themes, meals, mealOverride, regenSeed, addedIds, listings }) {
  const chain = [];
  let prevIds = [];
  for (let d = 1; d <= upToDay; d++) {
    const { theme, cuisine } = resolveDayContext({
      day: d,
      themes,
      meals,
      mealOverride,
      listings,
    });
    const slots = generateDaySlots({
      day: d,
      theme,
      cuisine,
      regenSeed,
      listings,
      // 이미 담은 체험은 아래 buildAddedItems가 따로 넣으므로 자동 생성에서
      // 빼고(같은 날 두 번 나오는 것을 막는다), 전날 나온 곳도 함께 뺀다.
      excludeIds: (addedIds || []).concat(prevIds),
    });
    chain.push({ day: d, theme, cuisine, slots });
    prevIds = SLOTS.map((sl) => slots[sl] && slots[sl].id).filter(Boolean);
  }
  return chain;
}

// 그 지역에 후보가 없는 시간대는 generateDaySlots가 null을 주고, 여기서
// 빼서 슬롯을 비운다 — 최종 계획 화면은 그 자리를 "비어 있는 시간"으로
// 그린다(design 1573줄).
function toBaseItems(slots, day) {
  return SLOTS.map((slot, i) =>
    slots[slot]
      ? {
          ...slots[slot],
          slot,
          time: SLOT_TIME[slot],
          swatch: SLOT_SWATCHES[i],
          isDinner: slot === "저녁",
          sortKey: SLOT_TIME[slot],
          timeKey: `${day}|${slot}`,
        }
      : null
  ).filter(Boolean);
}

// 여러 갈래(자동 생성·담은 체험·직접 추가)를 시간순으로 합치고 대체
// 장소를 덮어쓴다. 하루치와 전체 일정이 같은 조립 규칙을 쓰도록 뺐다.
function assembleDay({ baseItems, day, added, rtCustom, rtPick, listings, itemTimes }) {
  const addedItems = buildAddedItems({ day, listings, ...added });

  // 담은 곳이 있는 시간대는 자동 생성 항목을 비운다. 사용자가 직접 고른
  // 것이 먼저다 — 그러지 않으면 "오전 09:00"에 자동 카페와 담은 카페가
  // 나란히 서서 하루가 실제보다 빽빽해 보였다. 담은 것을 빼면 이 계산이
  // 다시 돌면서 자동 생성이 그대로 돌아온다(상태로만 판단한다).
  //
  // 시간을 고친 항목은 옮겨 간 시간대 기준으로 판단해야 해서 시간 반영을
  // 먼저 한다(applyTimeOverride가 slot을 바꾼다).
  const withTimes = (list) => list.map((item) => applyTimeOverride(item, itemTimes));
  const timedAdded = withTimes(addedItems);
  const takenSlots = new Set(timedAdded.map((x) => x.slot));

  const merged = [
    ...withTimes(baseItems).filter((x) => !takenSlots.has(x.slot)),
    ...timedAdded,
    ...withTimes(buildCustomItems({ day, rtCustom })),
  ]
    // 시간은 위에서 이미 반영했다(바뀐 시간대로 자리를 옮기려면 정렬 전에
    // 반영해야 한다).
    .sort(
      (a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot] || String(a.sortKey).localeCompare(String(b.sortKey))
    );

  return applyPicks(merged, { day, rtPick, listings });
}

// 하루치(체류 계획 탭). 전날 제외 규칙 때문에 1일차부터 계산하지만
// 일차 수가 최대 30이고 후보 목록은 지역 단위로 캐싱돼 있어 가볍다.
export function buildDayTimeline({
  day,
  themes,
  meals,
  mealOverride,
  regenSeed,
  rtCustom,
  rtPick,
  listings,
  itemTimes,
  ...rest
}) {
  const added = resolveAdded(rest);
  const chain = baseSlotChain({
    upToDay: day,
    themes,
    meals,
    mealOverride,
    regenSeed,
    addedIds: allAddedIds(added),
    listings,
  });
  const today = chain[chain.length - 1];
  return assembleDay({
    baseItems: today ? toBaseItems(today.slots, today.day) : [],
    day,
    added,
    rtCustom,
    rtPick,
    listings,
    itemTimes,
  });
}

// 일차별 테마·메뉴 결정. design 2853-2858줄(detailVals의 dayTheme/cuisine).
// 체류 계획 탭은 하루치만, 최종 계획 화면은 전 일차를 그리는데 둘이 같은
// 규칙을 써야 해서(한쪽만 고치면 두 화면의 일정이 어긋난다) 여기로 뺐다.
export function resolveThemePrefs(themes) {
  return themes && themes.length ? themes : ALL_THEMES;
}

export function resolveDayContext({ day, themes, meals, mealOverride, listings }) {
  const prefs = resolveThemePrefs(themes);
  return {
    theme: prefs[(day - 1) % prefs.length],
    // 음식 분류는 그 지역에 실제 후보가 있는 것만 돌린다(routineGenerator).
    cuisine: pickCuisine({
      mealPrefs: meals,
      day,
      mealOverride: (mealOverride || {})[day],
      listings,
    }),
  };
}

// 체류 전체 일정. design overviewVals()의 days 배열(3268-3292줄)을 그대로
// 옮긴 것으로, 하루치 타임라인을 슬롯(오전/오후/저녁)별로 다시 묶는다.
// 원본과 마찬가지로 routineOn 여부를 보지 않는다 — 계획을 만들지 않은
// 상태로 저장해도 자동 생성 슬롯이 그대로 보인다.
export function buildFullSchedule({
  nights,
  themes,
  meals,
  mealOverride,
  regenSeed,
  rtCustom,
  rtPick,
  listings,
  itemTimes,
  ...rest
}) {
  const added = resolveAdded(rest);
  // 자동 생성 슬롯은 앞 일차부터 이어져 있으므로 한 번에 만들어 나눠 쓴다.
  const chain = baseSlotChain({
    upToDay: nights,
    themes,
    meals,
    mealOverride,
    regenSeed,
    addedIds: allAddedIds(added),
    listings,
  });

  return chain.map(({ day, theme, slots }) => {
    const items = assembleDay({
      baseItems: toBaseItems(slots, day),
      day,
      added,
      rtCustom,
      rtPick,
      listings,
      itemTimes,
    });
    return {
      day,
      label: `${day}일차`,
      theme,
      weekday: `체류 ${Math.ceil(day / 7)}주차`,
      cells: SLOTS.map((slot) => {
        const own = items.filter((x) => x.slot === slot);
        return { slot, time: own.length ? own[0].time : "", items: own };
      }),
    };
  });
}
