// 장소 상세 조회. 한국관광공사 인증키(TOUR_API_KEY)는 여기 서버리스 함수에서만
// 쓰고 프론트엔드로 노출하지 않는다(CLAUDE.md 보안 규칙). 실시간 호출만 쓰고
// 로컬 DB에 저장하지 않는다.
//
// GET /api/tour/detail?contentId=126508&contentTypeId=12
//
// 두 오퍼레이션을 한 번씩 부른다(호출 2건):
//   detailCommon2 — 개요(overview), 홈페이지, 대표이미지, 주소, 전화
//   detailIntro2  — 타입별 상세(영업시간·쉬는날·대표메뉴·입퇴실시간 등)
// 목록에서 미리 부르지 않고 상세 모달을 열 때만 부른다(일 1,000건 한도).
import { callTourApi, normalizeItems, toHttps } from "../_lib/tourApi.js";

// 서버 메모리 캐시. 같은 장소를 다른 사용자가 열어도 관광공사를 다시
// 부르지 않는다(브라우저 캐시는 사용자마다 따로라 여기서 한 번 더 막는다).
//
// 메모리만 쓴다 — 파일·DB에 남기지 않는다(CLAUDE.md: 실시간 호출 유지).
// 서버리스 인스턴스가 식으면 통째로 사라지므로 "저장"이 아니라 그 인스턴스가
// 살아 있는 동안의 중복 제거다.
//
// TTL 12시간: 관광지 소개·영업시간은 하루 안에 바뀌는 값이 아니고, 그렇다고
// 며칠씩 들고 있으면 수정된 정보가 늦게 반영된다. 상한 300건은 인스턴스
// 메모리를 지키기 위한 것으로, 넘치면 가장 오래된 것부터 버린다.
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const CACHE_MAX = 300;
const cache = new Map();

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  // 최근 쓴 것을 뒤로 보내 오래된 것부터 버려지게 한다(Map은 삽입 순서 유지).
  cache.delete(key);
  cache.set(key, hit);
  return hit.body;
}

function cacheSet(key, body) {
  cache.set(key, { at: Date.now(), body });
  while (cache.size > CACHE_MAX) {
    cache.delete(cache.keys().next().value);
  }
}

// overview에는 <br>, <b> 같은 태그와 HTML 엔티티가 섞여 온다. 화면에는
// 그대로 넣지 않고(임의 HTML 삽입 금지) 텍스트로 편다.
function toText(html) {
  if (!html) return "";
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// homepage 필드는 <a href="http://...">http://...</a> 형태로 온다.
function firstUrl(html) {
  if (!html) return "";
  const href = String(html).match(/href=["']([^"']+)["']/i);
  if (href) return href[1];
  const bare = String(html).match(/https?:\/\/[^\s"'<>]+/i);
  return bare ? bare[0] : "";
}

// contentTypeId별로 화면에 쓸 필드만 고른다. 값은 [라벨, 응답 필드명] 순.
// 필드명은 KorService2 detailIntro2 응답 기준이다.
const INTRO_FIELDS = {
  // 관광지
  12: [
    ["이용시간", "usetime"],
    ["쉬는날", "restdate"],
    ["문의처", "infocenter"],
    ["주차", "parking"],
    ["입장료", "usefee"],
  ],
  // 문화시설
  14: [
    ["이용시간", "usetimeculture"],
    ["쉬는날", "restdateculture"],
    ["문의처", "infocenterculture"],
    ["주차", "parkingculture"],
    ["이용요금", "usefee"],
  ],
  // 레포츠·체험 (캠핑장도 여기로 온다 — AC05 분류인데 contentTypeId는 28이다)
  28: [
    ["이용시간", "usetimeleports"],
    ["개장기간", "openperiod"],
    ["쉬는날", "restdateleports"],
    ["예약안내", "reservation"],
    ["입장료", "usefeeleports"],
    ["주차요금", "parkingfeeleports"],
    ["문의처", "infocenterleports"],
    ["주차", "parkingleports"],
  ],
  // 숙박
  32: [
    ["입실", "checkintime"],
    ["퇴실", "checkouttime"],
    ["객실 수", "roomcount"],
    ["객실 유형", "roomtype"],
    ["부대시설", "subfacility"],
    ["취사", "chkcooking"],
    ["예약안내", "reservationlodging"],
    ["문의처", "infocenterlodging"],
    ["주차", "parkinglodging"],
  ],
  // 음식점
  39: [
    ["영업시간", "opentimefood"],
    ["쉬는날", "restdatefood"],
    ["대표메뉴", "firstmenu"],
    ["취급메뉴", "treatmenu"],
    ["예약안내", "reservationfood"],
    ["문의처", "infocenterfood"],
    ["주차", "parkingfood"],
  ],
  // 축제·공연·행사
  15: [
    ["행사기간", "eventstartdate"],
    ["공연시간", "playtime"],
    ["이용요금", "usetimefestival"],
    ["문의처", "sponsor1tel"],
  ],
};

function buildInfo(intro, contentTypeId) {
  const fields = INTRO_FIELDS[String(parseInt(contentTypeId, 10))] || [];
  return fields.map(([label, key]) => ({ label, value: toText(intro?.[key]) })).filter((row) => row.value);
}

export default async function handler(req, res) {
  const { contentId, contentTypeId } = req.query;
  if (!contentId) {
    return res.status(400).json({ error: "contentId가 필요합니다." });
  }

  const cacheKey = `${contentId}|${contentTypeId || ""}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  // 두 호출은 서로 독립이라 같이 보낸다. 하나가 실패해도 나머지는 쓴다
  // (detailIntro2는 타입에 따라 아예 데이터가 없는 경우가 있다).
  const [common, intro] = await Promise.all([
    callTourApi("detailCommon2", { contentId }),
    contentTypeId
      ? callTourApi("detailIntro2", { contentId, contentTypeId })
      : Promise.resolve({ ok: true, body: {} }),
  ]);

  if (!common.ok && !intro.ok) {
    return res.status(502).json({ error: common.message, errorCode: common.errorCode });
  }

  const base = common.ok ? normalizeItems(common.body)[0] || {} : {};
  const introItem = intro.ok ? normalizeItems(intro.body)[0] || {} : {};

  const payload = {
    contentId: String(contentId),
    contentTypeId: contentTypeId ? String(contentTypeId) : base.contenttypeid || "",
    title: base.title || "",
    overview: toText(base.overview),
    homepage: firstUrl(base.homepage),
    image: toHttps(base.firstimage || base.firstimage2 || ""),
    addr: [base.addr1, base.addr2].filter(Boolean).join(" ").trim(),
    tel: toText(base.tel),
    mapX: base.mapx ? Number(base.mapx) : null,
    mapY: base.mapy ? Number(base.mapy) : null,
    info: buildInfo(introItem, contentTypeId),
    // 어느 쪽이 실패했는지 화면에서 알 수 있게 남긴다(모달은 실패해도
    // 목록에 이미 있는 기본 정보로 그린다).
    partial: !common.ok || !intro.ok,
  };

  // 반쪽만 받은 응답은 캐시하지 않는다 — 12시간 동안 빈 값이 굳어 버린다.
  if (!payload.partial) cacheSet(cacheKey, payload);
  res.status(200).json(payload);
}
