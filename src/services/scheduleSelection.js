import { findListingAnywhere } from "./exploreListings.js";

// 타임라인/지도에서 고른 항목을 상세 모달이 쓰는 모양으로 만든다.
// ScheduleTab.jsx가 300줄을 넘어(CLAUDE.md 코드 원칙) 떼어냈다.
//
// contentTypeId를 같이 돌려주는 이유: 관광공사 상세 API(detailIntro2)는
// 타입마다 응답 필드가 완전히 달라서(음식점 opentimefood / 관광지 usetime)
// 타입 없이는 아무 정보도 못 뽑는다. 타임라인 항목에는 id만 있으므로
// 둘러보기 목록에서 같은 id를 찾아 타입을 얻는다.
export function buildSelection({ selectedIndex, items, pins, day, listings }) {
  const pin = selectedIndex >= 0 ? pins[selectedIndex] : null;
  if (!pin) return { selection: null, contentTypeId: "" };

  const item = items[selectedIndex] || null;
  const selection = {
    day,
    slot: item ? item.slot : "",
    time: item ? item.time : "",
    place: pin.place,
    tag: pin.tag,
    desc: pin.desc,
    addr: pin.addr,
    id: item ? item.id : null,
    mapX: item ? item.mapX : null,
    mapY: item ? item.mapY : null,
  };

  const listing = selection.id ? findListingAnywhere(listings, selection.id) : null;
  return { selection, contentTypeId: listing ? listing.contentTypeId : "" };
}
