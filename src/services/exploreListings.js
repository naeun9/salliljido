// 둘러보기 탭 목록 데이터. design/salliljido.extracted.html livingVals()
// (2510-2716줄)의 화면 상수(카테고리·색·하위 필터)는 그대로 두고, 목록
// 자체는 한국관광공사 지역기반 관광정보 API(areaBasedList2) 실호출로
// 바꿨다(docs/03-api-check.md §12-14).
//
import { REGION_BY_SHORT } from "../data/regions.js";
import { CATEGORY_LCLS1, SUB_FILTER_CODES, shortTypeName } from "../data/tourCategories.js";
import { badgeLabel } from "../data/badgeLabels.js";

export const CATEGORY_COLORS = {
  숙박: "#2F5D50",
  "체험 프로그램": "#D9784E",
  "주변 관광지": "#4A7C6F",
  "식당·카페": "#8C6A4F",
};

export const CATEGORIES = ["숙박", "식당·카페", "체험 프로그램", "주변 관광지"];

// design의 하위 필터 목록 그대로 + 숙박에 "캠핑·야영장"만 추가했다.
// 추가 근거: 일반 숙박만으로는 소도시 숙박 데이터가 너무 얇은데
// (docs/03-api-check.md §4), 분류체계 AC05(캠핑)를 같이 가져오면 해소된다.
// 기존 5개 칩의 동작·순서·스타일은 하나도 바꾸지 않았다.
export const SUB_FILTERS = {
  숙박: ["호텔", "펜션·민박", "콘도", "한옥스테이", "농어촌민박", "캠핑·야영장"],
  "식당·카페": ["한식", "외국식", "간이음식", "카페", "주점"],
  "체험 프로그램": ["전통체험", "공예체험", "농촌·어촌체험", "템플스테이", "웰니스", "산업관광"],
  "주변 관광지": ["자연", "역사", "문화", "레저스포츠"],
};

// 아직 목록을 못 받았을 때 쓰는 빈 값. 매번 새 객체를 만들면 useEffect
// 의존성이 계속 바뀌므로 상수 하나를 공유한다.
export const EMPTY_LISTINGS = Object.freeze({
  숙박: [],
  "식당·카페": [],
  "체험 프로그램": [],
  "주변 관광지": [],
});

const SWATCHES = [
  "repeating-linear-gradient(135deg, #DCE8E2 0 9px, #CFE0D8 9px 18px)",
  "repeating-linear-gradient(135deg, #F0E3D2 0 9px, #E7D8C4 9px 18px)",
  "repeating-linear-gradient(135deg, #E7EBE0 0 9px, #DBE2D3 9px 18px)",
];

function swatchFor(index) {
  return SWATCHES[index % 3];
}

// 지역 한 곳을 조회할 때 한 번에 받아올 최대 건수. 파일럿 15개 시/군 중
// 가장 많은 곳이 270건이라(속초) 넉넉하게 잡았다 — 이 값을 키워도 호출은
// 여전히 1번이라 일일 호출 한도에는 영향이 없다.
const MAX_ROWS = 500;

// 지도 목업 위 핀 좌표(%) 여백. 0~100%를 그대로 쓰면 핀이 가장자리에
// 붙어 잘려 보여서 안쪽으로 밀어 넣는다.
const PIN_MIN = 8;
const PIN_MAX = 92;

// 세션 메모리 캐시. 같은 지역을 다시 열거나 카테고리를 전환할 때 재호출을
// 막는다(요청사항 5). 파일·DB에 쓰지 않으므로 새로고침하면 사라지고,
// 그때 다시 실시간으로 받아온다 — CLAUDE.md의 "실시간 호출 유지, 로컬 DB
// 저장 금지" 원칙을 지킨다. 값으로 Promise를 담아 두면 같은 지역을 동시에
// 여러 번 요청해도 실제 호출은 1번만 나간다.
const regionCache = new Map();

function findSub(category, lclsSystm3) {
  const table = SUB_FILTER_CODES[category] || {};
  for (const [label, prefixes] of Object.entries(table)) {
    if (prefixes.some((p) => (lclsSystm3 || "").startsWith(p))) return label;
  }
  return null;
}

function categoryOf(lclsSystm1) {
  for (const [category, codes] of Object.entries(CATEGORY_LCLS1)) {
    if (codes.includes(lclsSystm1)) return category;
  }
  return null;
}

// 카드가 쓰는 필드명이 카테고리마다 달라서(StayCard는 location,
// SpotCard/ExperienceCard는 desc, UtilCard는 note) 카드를 안 고쳐도 되도록
// 여기서 각 카테고리에 맞는 이름으로 맞춰 준다.
//
// 주소를 설명 자리에 넣는 이유: areaBasedList2에는 소개 문구(overview)가
// 아예 없다. overview는 detailCommon2에만 있는데 항목 1개당 1회 호출이라
// 목록 화면에서는 쓸 수 없다(docs/03-api-check.md §14).
function shapeForCategory(category, base) {
  if (category === "숙박") return { ...base, location: base.addr };
  if (category === "식당·카페") return { ...base, note: base.addr };
  if (category === "체험 프로그램") {
    // duration/cost는 API에 없는 값이라 빈 문자열로 둔다. ExperienceCard가
    // 둘 다 비면 메타 줄을 통째로 감춘다(docs/03-api-check.md §14).
    return { ...base, desc: base.addr, duration: "", cost: "", price: 0 };
  }
  return { ...base, desc: base.addr };
}

function normalize(raw, index) {
  const category = categoryOf(raw.lclsSystm1);
  if (!category) return null;

  const addr = [raw.addr1, raw.addr2].filter(Boolean).join(" ").trim();
  const base = {
    id: String(raw.contentId),
    name: raw.title,
    // 분류체계 이름을 사용자 언어로 바꾼다(관광식당 → 한식 등).
    // 매핑에 없으면 원문 그대로다(data/badgeLabels.js).
    type: badgeLabel(shortTypeName(raw.lclsSystm3)),
    sub: findSub(category, raw.lclsSystm3),
    // 이미지가 없으면 design 원본과 똑같이 스와치 + "image" 라벨을 쓴다.
    image: raw.image || "",
    swatch: swatchFor(index),
    addr,
    mapX: raw.mapX,
    mapY: raw.mapY,
    contentTypeId: raw.contentTypeId,
  };
  return { category, item: shapeForCategory(category, base) };
}

async function requestRegion(regionShort) {
  const codes = REGION_BY_SHORT[regionShort];
  if (!codes) {
    throw new Error(`'${regionShort}' 지역의 법정동 코드가 없습니다.`);
  }

  const qs = new URLSearchParams({
    lDongRegnCd: codes.regnCd,
    lDongSignguCd: codes.signguCd,
    numOfRows: String(MAX_ROWS),
    pageNo: "1",
    arrange: "A",
  });

  const res = await fetch(`/api/tour/area-based?${qs.toString()}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || "관광 정보를 불러오지 못했습니다.");
  }

  const grouped = { 숙박: [], "식당·카페": [], "체험 프로그램": [], "주변 관광지": [] };
  (data.items || []).forEach((raw, i) => {
    const normalized = normalize(raw, i);
    if (normalized) grouped[normalized.category].push(normalized.item);
  });

  return grouped;
}

// 카테고리 목록에서 id로 항목 하나를 찾는다. PlanContext에는 id만 담고
// (관광공사 응답을 localStorage에 저장하지 않으려고) 실제 이름·주소·좌표는
// 그때그때 이 함수로 찾아 쓴다.
export function findListing(listings, category, id) {
  return (listings?.[category] || []).find((x) => x.id === String(id)) || null;
}

// 카테고리를 모를 때 id로만 찾는다. 체류 계획의 "추천 장소"는 오전 카페·
// 오후 관광지·저녁 식당이 섞여 있어 어느 카테고리에서 왔는지 저장하지
// 않는다(id 하나만 담는다 — CLAUDE.md 보안 규칙).
// 이름만 필요할 때(비용 탭의 숙박 구간 라벨 등). 못 찾으면 빈 문자열.
export function findListingName(listings, category, id) {
  const hit = findListing(listings, category, id);
  return hit ? hit.name : "";
}

export function findListingAnywhere(listings, id) {
  for (const category of CATEGORIES) {
    const hit = findListing(listings, category, id);
    if (hit) return hit;
  }
  return null;
}

// 지역 하나의 둘러보기 목록 전체를 카테고리별로 나눠서 돌려준다.
// 4개 카테고리를 각각 부르지 않고 지역 조회 1번으로 끝낸다 —
// 분류체계(lclsSystm1)로 응답을 나누면 되기 때문(docs/03-api-check.md §12).
export function fetchRegionListings(regionShort) {
  if (!regionCache.has(regionShort)) {
    // 실패한 요청은 캐시에 남기지 않아야 "다시 시도"가 실제로 다시 나간다.
    const promise = requestRegion(regionShort).catch((err) => {
      regionCache.delete(regionShort);
      throw err;
    });
    regionCache.set(regionShort, promise);
  }
  return regionCache.get(regionShort);
}
