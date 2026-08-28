// 직접 추가한 일정과 "다른 곳 보기"로 고른 대체 장소 처리.
// dayTimeline.js가 300줄을 넘어(CLAUDE.md 코드 원칙) 떼어냈고 로직은 그대로다.
import { REST_OPTIONS } from "./routineGenerator.js";
import { findListing, findListingAnywhere } from "./exploreListings.js";

// 사용자가 직접 추가한 일정
export function buildCustomItems({ day, rtCustom }) {
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
export function applyPicks(items, { day, rtPick, listings }) {
  return items.map((item) => {
    const ov = rtPick[`${day}|${item.slot}`];
    if (!ov) return item;
    if (ov.id) {
      const rest = REST_OPTIONS.find((r) => r.id === ov.id);
      return {
        ...item,
        place: rest.name,
        tag: "숙소",
        desc: "숙소에서 보내는 시간입니다.",
        isRest: true,
        mine: false,
        isDinner: false,
      };
    }
    // "내가 담은 곳"으로 고른 경우: id만 저장돼 있으므로 이름을 지금 찾는다.
    if (ov.utilId) {
      const u = findListing(listings, "식당·카페", ov.utilId);
      if (!u) return item;
      return {
        ...item,
        place: u.name,
        tag: ov.tag || item.tag,
        desc: u.note || item.desc,
        mine: false,
      };
    }
    // "추천 장소"로 고른 경우도 마찬가지로 id만 담겨 있다. 추천 목록이
    // 관광공사 실데이터가 되면서 이름·설명을 localStorage에 남기지 않도록
    // 저장 형태를 id로 바꿨다(CLAUDE.md 보안 규칙).
    if (ov.listingId) {
      const p = findListingAnywhere(listings, ov.listingId);
      if (!p) return item;
      return {
        ...item,
        id: p.id,
        place: p.name,
        tag: ov.tag || p.type || item.tag,
        desc: p.addr || item.desc,
        addr: p.addr || item.addr,
        mapX: p.mapX,
        mapY: p.mapY,
        mine: false,
      };
    }
    return {
      ...item,
      place: ov.name,
      tag: ov.tag || item.tag,
      desc: ov.desc || item.desc,
      mine: false,
    };
  });
}
