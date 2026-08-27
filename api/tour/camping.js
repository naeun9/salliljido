// 고캠핑(GoCamping) 조회. 일반 숙박(contentTypeId=32)만으로는 소도시에서
// 숙박 데이터가 너무 얇아서(docs/03-api-check.md §4) 캠핑장을 숙박
// 카테고리에 합치기 위해 추가했다.
//
// GET /api/tour/camping?doNm=충청남도&sigunguNm=태안군
//
// 주의(직접 호출해보고 확인한 제약, docs/03-api-check.md §9 참고):
// GoCamping의 basedList/searchList 오퍼레이션은 areaBasedList2와 달리
// doNm/sigunguNm/areaCode 어떤 것도 "입력" 파라미터로 받아주지 않는다
// (INVALID_REQUEST_PARAMETER_ERROR). keyword 검색(searchList)도 시설명
// 텍스트 매칭이라 "태안"이 이름에 없는 태안군 캠핑장을 놓친다. 그래서
// doNm/sigunguNm이 주어지면 전국 목록을 한 번에 받아 응답에 실제로 들어
// 있는 doNm/sigunguNm 필드로 여기서 직접 걸러낸다. numOfRows를 몇으로
// 넘기든 호출 자체는 1번이라 공공데이터포털 일일 호출 한도(건수 기준)에는
// 영향이 없다 — 다만 응답 크기가 커서(전국 약 3천 건, 5MB대) 지연은
// 좀 있다.
import { callGoCampingApi, normalizeItems } from "../_lib/tourApi.js";

// GoCamping 응답 필드는 KorService2와 이름 규칙이 달라서(예: 위경도가
// mapX/mapY로 이미 카멜케이스) 필요한 것만 추린다. sitedStnc/glampSiteCo
// 등 사이트 구성 정보는 "야영장 유형" 하위 필터(1번 항목 검토)에 쓸 수
// 있어 남겨뒀다.
function normalizeItem(raw) {
  return {
    contentId: raw.contentId,
    title: raw.facltNm,
    intro: raw.lineIntro,
    induty: raw.induty, // 일반야영장/자동차야영장/캐러밴 등 시설 유형
    facltDivNm: raw.facltDivNm, // 공립/민간
    doNm: raw.doNm,
    sigunguNm: raw.sigunguNm,
    addr1: raw.addr1,
    addr2: raw.addr2,
    image: raw.firstImageUrl || "",
    mapX: raw.mapX ? Number(raw.mapX) : null,
    mapY: raw.mapY ? Number(raw.mapY) : null,
    tel: raw.tel,
    homepage: raw.homepage,
    generalSiteCount: raw.gnrlSiteCo ? Number(raw.gnrlSiteCo) : 0,
    autoSiteCount: raw.autoSiteCo ? Number(raw.autoSiteCo) : 0,
    glampSiteCount: raw.glampSiteCo ? Number(raw.glampSiteCo) : 0,
    caravanSiteCount: raw.caravSiteCo ? Number(raw.caravSiteCo) : 0,
  };
}

// GoCamping 데이터가 2023년 개편 전 도명을 아직도 섞어 쓴다 — 직접
// 전수 조사해보니 "강원특별자치도"여야 할 항목 중 다수가 여전히
// "강원도"로 등록돼 있다(속초시 3건 전부 포함, docs/03-api-check.md §9).
// alias 없이 신규 도명만 비교하면 이 항목들을 통째로 놓친다.
const DO_NM_ALIASES = {
  강원특별자치도: ["강원특별자치도", "강원도"],
  전북특별자치도: ["전북특별자치도", "전라북도"],
};

// GoCamping 데이터에 " 충청남도 "처럼 앞뒤 공백이 섞인 항목도 있어서
// (docs/03-api-check.md §9) 단순 === 비교 대신 trim 후 비교한다.
function matches(value, target) {
  if (!target) return true;
  const trimmed = (value || "").trim();
  const candidates = DO_NM_ALIASES[target] || [target];
  return candidates.includes(trimmed);
}

export default async function handler(req, res) {
  const { doNm, sigunguNm, numOfRows = "20", pageNo = "1" } = req.query;

  const needsFilter = !!(doNm || sigunguNm);
  const params = needsFilter
    ? { numOfRows: "9999", pageNo: "1" } // 지역 입력 파라미터가 없어 전국을 받아 직접 거른다
    : { numOfRows, pageNo };

  const result = await callGoCampingApi("basedList", params, { timeoutMs: 15000 });
  if (!result.ok) {
    return res.status(502).json({ error: result.message, errorCode: result.errorCode });
  }

  let items = normalizeItems(result.body).map(normalizeItem);
  if (needsFilter) {
    items = items.filter((it) => matches(it.doNm, doNm) && matches(it.sigunguNm, sigunguNm));
  }

  res.status(200).json({ items, totalCount: items.length });
}
