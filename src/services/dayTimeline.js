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
export const SLOT_TIME = { 오전: "09:00 – 11:30", 오후: "13:00 – 17:00", 저녁: "18:30 – 20:30" };

// 자동 생성 슬롯을 1일차부터 차례로 만든다.
//
// 왜 앞 일차부터 순서대로인가: 테마와 음식 분류가 날마다 바뀌면서 뽑는
// 후보 목록 자체가 달라지기 때문에, 나머지 연산만으로는 "어제 오후에
// 나온 곳이 오늘 오후에 또" 나오는 경우를 못 막는다. 그래서 전날 나온
// 곳을 다음 날 후보에서 뺀다 — 앞 일차 결과가 필요하니 순서대로 만든다.
// 난수는 쓰지 않으므로 몇 번을 다시 계산해도 결과는 같다.
function baseSlotChain({ upToDay, themes, meals, mealOverride, regenSeed, addedExperiences, listings }) {
  const chain = [];
  let prevIds = [];
  for (let d = 1; d <= upToDay; d++) {
    const { theme, cuisine } = resolveDayContext({ day: d, themes, meals, mealOverride, listings });
    const slots = generateDaySlots({
      day: d,
      theme,
      cuisine,
      regenSeed,
      listings,
      // 이미 담은 체험은 아래 buildAddedItems가 따로 넣으므로 자동 생성에서
      // 빼고(같은 날 두 번 나오는 것을 막는다), 전날 나온 곳도 함께 뺀다.
      excludeIds: (addedExperiences || []).concat(prevIds),
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

// 둘러보기에서 담은 체험 중 오늘 일차인 것. design은 목업 체험 4개에만
// 슬롯/시간을 박아뒀지만 이제 실제 contentId를 쓰므로 모든 체험이 일정에
// 들어온다(routineGenerator의 EXPERIENCE_SLOT_DEFAULT 주석 참고).
function buildAddedItems({ day, addedExperiences, experienceDays, listings }) {
  return addedExperiences
    .filter((id) => (experienceDays[id] || 1) === day)
    .map((id) => findListing(listings, "체험 프로그램", id))
    .filter(Boolean)
    .map((x, i) => ({
      id: x.id,
      slot: EXPERIENCE_SLOT_DEFAULT,
      time: EXPERIENCE_TIME_DEFAULT,
      place: x.name,
      tag: x.type,
      desc: x.desc,
      addr: x.addr,
      mapX: x.mapX,
      mapY: x.mapY,
      swatch: SLOT_SWATCHES[i % 3],
      mine: true,
      sortKey: EXPERIENCE_TIME_DEFAULT,
      timeKey: `exp:${x.id}`,
    }));
}

// 사용자가 직접 추가한 일정
function buildCustomItems({ day, rtCustom }) {
  return rtCustom
    .filter((c) => c.day === day)
    .map((c) => ({
      slot: c.slot,
      time: c.start ? c.start + (c.end ? ` – ${c.end}` : "") : "",
      place: c.name,
      tag: "직접 입력",
      desc: c.memo || c.place || "직접 추가한 일정입니다.",
      addr: c.place || "",
      // 직접 입력한 일정은 장소를 자유롭게 적는 자리라 좌표가 없다.
      // 지도에는 찍지 않고 타임라인에만 나온다.
      swatch: "#F5E1D5",
      custom: true,
      cid: c.id,
      sortKey: c.start || "99:99",
    }));
}

// design 2890-2898줄: PickerModal에서 명시적으로 고른 대체 장소를 같은
// 슬롯의 항목에 덮어씌운다(원본 그대로 — 같은 슬롯에 담은 체험이 함께
// 있으면 그것도 덮어써진다, 완료 보고에 기록한 한계).
function applyPicks(items, { day, rtPick, listings }) {
  return items.map((item) => {
    const ov = rtPick[`${day}|${item.slot}`];
    if (!ov) return item;
    if (ov.id) {
      const rest = REST_OPTIONS.find((r) => r.id === ov.id);
      return { ...item, place: rest.name, tag: "숙소", desc: "숙소에서 보내는 시간입니다.", isRest: true, mine: false, isDinner: false };
    }
    // "내가 담은 곳"으로 고른 경우: id만 저장돼 있으므로 이름을 지금 찾는다.
    if (ov.utilId) {
      const u = findListing(listings, "식당·카페", ov.utilId);
      if (!u) return item;
      return { ...item, place: u.name, tag: ov.tag || item.tag, desc: u.note || item.desc, mine: false };
    }
    // "추천 장소"로 고른 경우도 마찬가지로 id만 담겨 있다. 추천 목록이
    // 관광공사 실데이터가 되면서 이름·설명을 localStorage에 남기지 않도록
    // 저장 형태를 id로 바꿨다(CLAUDE.md 보안 규칙).
    if (ov.listingId) {
      const p = findListingAnywhere(listings, ov.listingId);
      if (!p) return item;
      return { ...item, id: p.id, place: p.name, tag: ov.tag || p.type || item.tag, desc: p.addr || item.desc, addr: p.addr || item.addr, mapX: p.mapX, mapY: p.mapY, mine: false };
    }
    return { ...item, place: ov.name, tag: ov.tag || item.tag, desc: ov.desc || item.desc, mine: false };
  });
}

// 여러 갈래(자동 생성·담은 체험·직접 추가)를 시간순으로 합치고 대체
// 장소를 덮어쓴다. 하루치와 전체 일정이 같은 조립 규칙을 쓰도록 뺐다.
function assembleDay({ baseItems, day, addedExperiences, experienceDays, rtCustom, rtPick, listings, itemTimes }) {
  const merged = [
    ...baseItems,
    ...buildAddedItems({ day, addedExperiences, experienceDays, listings }),
    ...buildCustomItems({ day, rtCustom }),
  ]
    // 고친 시간을 반영한 뒤 정렬해야 바뀐 시간대로 자리를 옮긴다.
    .map((item) => applyTimeOverride(item, itemTimes))
    .sort((a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot] || String(a.sortKey).localeCompare(String(b.sortKey)));

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
  addedExperiences,
  experienceDays,
  rtCustom,
  rtPick,
  listings,
  itemTimes,
}) {
  const chain = baseSlotChain({
    upToDay: day,
    themes,
    meals,
    mealOverride,
    regenSeed,
    addedExperiences,
    listings,
  });
  const today = chain[chain.length - 1];
  return assembleDay({
    baseItems: today ? toBaseItems(today.slots, today.day) : [],
    day,
    addedExperiences,
    experienceDays,
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
    cuisine: pickCuisine({ mealPrefs: meals, day, mealOverride: (mealOverride || {})[day], listings }),
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
  addedExperiences,
  experienceDays,
  rtCustom,
  rtPick,
  listings,
  itemTimes,
}) {
  // 자동 생성 슬롯은 앞 일차부터 이어져 있으므로 한 번에 만들어 나눠 쓴다.
  const chain = baseSlotChain({
    upToDay: nights,
    themes,
    meals,
    mealOverride,
    regenSeed,
    addedExperiences,
    listings,
  });

  return chain.map(({ day, theme, slots }) => {
    const items = assembleDay({
      baseItems: toBaseItems(slots, day),
      day,
      addedExperiences,
      experienceDays,
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
