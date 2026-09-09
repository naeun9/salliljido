// 두루누비 걷기여행길 코스 조회. 인증키는 여기서만 쓰고 프론트엔드로
// 노출하지 않는다(CLAUDE.md 보안 규칙).
//
// GET /api/tour/duru?sigun=강원 고성군
//
// 호출 최소화(CLAUDE.md · 일 1,000건 한도):
//   두루누비 courseList는 전국을 합쳐도 142건뿐이라(2026-09-09 실측) 지역별로
//   따로 부르지 않고 한 번에 다 받아 서버 메모리에 담아 두고 sigun으로 걸러
//   준다. 즉 인스턴스가 살아 있는 12시간 동안 이 서비스가 쓰는 호출은
//   페이지 수만큼(현재 2건)이 전부다 — 사용자가 몇 개 지역을 돌아봐도
//   늘지 않는다. areaBasedList2처럼 지역마다 부르면 15지역 × 방문자마다
//   호출이 생겨서 한도를 금방 태운다.
//
// 좌표: courseList 응답에는 위경도가 없고 gpxpath(GPX 파일 주소)만 있다.
// 지도에 시작점을 찍으려면 그 파일의 첫 좌표를 읽어야 해서, 화면에 나갈
// 코스에 한해 GPX를 받아 첫 trkpt만 뽑고 캐시한다. GPX는 durunubi.kr에
// 있는 정적 파일이라 공공데이터포털 호출 한도와 무관하다.
import { callDuruApi, normalizeItems } from "../_lib/tourApi.js";

const LIST_TTL_MS = 12 * 60 * 60 * 1000;
const PAGE_SIZE = 100;
// GPX 한 개가 130KB쯤 된다. 한 지역 코스가 12개를 넘는 경우가 없어(최다
// 강원 고성 12건) 통째로 받아도 부담이 크지 않지만, 혹시 모를 폭주를 막아
// 한 요청에서 새로 받는 개수를 제한한다. 못 받은 코스는 좌표만 없이 나간다.
const GPX_PER_REQUEST = 14;

let listCache = null; // { at, courses }
const startCache = new Map(); // crsIdx → { lat, lng } | null

// <br>과 태그가 섞여 오는 소개 문구를 텍스트로 편다(detail.js와 같은 이유).
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

// crsLevel은 1·2·3으로 온다. 화면에 쓸 말로 바꾼다.
const LEVEL_NAMES = { 1: "쉬움", 2: "보통", 3: "어려움" };

function shapeCourse(raw) {
  const minutes = Number(raw.crsTotlRqrmHour) || 0;
  const km = Number(raw.crsDstnc) || 0;
  return {
    id: raw.crsIdx,
    routeId: raw.routeIdx,
    name: (raw.crsKorNm || "").trim(),
    sigun: (raw.sigun || "").trim(),
    distanceKm: km,
    minutes,
    level: Number(raw.crsLevel) || 0,
    levelName: LEVEL_NAMES[Number(raw.crsLevel)] || "",
    cycle: raw.crsCycle || "",
    summary: toText(raw.crsSummary),
    contents: toText(raw.crsContents),
    tourInfo: toText(raw.crsTourInfo),
    travelerInfo: toText(raw.travelerinfo),
    gpxPath: raw.gpxpath || "",
    // brdDiv는 전 건이 DNWW(걷기)다 — 자전거 코스는 이 서비스에 없다.
    // 나중에 값이 늘어날 수 있으니 그대로 넘겨 둔다.
    kind: raw.brdDiv || "",
  };
}

async function loadAllCourses() {
  if (listCache && Date.now() - listCache.at < LIST_TTL_MS) return listCache.courses;

  const first = await callDuruApi("courseList", { numOfRows: String(PAGE_SIZE), pageNo: "1" });
  if (!first.ok) return { error: first };

  const total = Number(first.body?.totalCount || 0);
  let items = normalizeItems(first.body);
  const pages = Math.ceil(total / PAGE_SIZE);
  for (let p = 2; p <= pages; p++) {
    const next = await callDuruApi("courseList", { numOfRows: String(PAGE_SIZE), pageNo: String(p) });
    if (!next.ok) break; // 일부만 받아도 그때까지 것으로 쓴다
    items = items.concat(normalizeItems(next.body));
  }

  const courses = items.map(shapeCourse).filter((c) => c.id && c.name);
  listCache = { at: Date.now(), courses };
  return courses;
}

// GPX의 첫 좌표 = 코스 시작점. 파일이 커서(130KB쯤) 실패해도 조용히 넘어간다 —
// 좌표가 없으면 지도에 안 찍힐 뿐 목록은 그대로 나온다.
async function startPointOf(course) {
  if (startCache.has(course.id)) return startCache.get(course.id);
  if (!course.gpxPath) {
    startCache.set(course.id, null);
    return null;
  }
  try {
    const res = await fetch(course.gpxPath);
    if (!res.ok) throw new Error(String(res.status));
    const text = await res.text();
    const m = text.match(/lat="([\d.-]+)"\s+lon="([\d.-]+)"/);
    const point = m ? { lat: Number(m[1]), lng: Number(m[2]) } : null;
    startCache.set(course.id, point);
    return point;
  } catch {
    // 실패는 캐시하지 않는다 — 다음 요청에서 다시 시도할 수 있게.
    return null;
  }
}

export default async function handler(req, res) {
  const { sigun } = req.query;
  if (!sigun) {
    return res.status(400).json({ error: "sigun이 필요합니다. 예: sigun=강원 고성군" });
  }

  const loaded = await loadAllCourses();
  if (loaded && loaded.error) {
    return res.status(502).json({ error: loaded.error.message, errorCode: loaded.error.errorCode });
  }

  // sigun은 "강원 고성군"처럼 시도+시군이 한 문자열로 온다. 시군 이름만으로
  // 거르면 경남 고성군과 강원 고성군이 섞이므로 둘 다 확인한다.
  const [prov, gun] = String(sigun).trim().split(/\s+/);
  const courses = loaded.filter((c) => c.sigun.includes(gun || "") && (!prov || c.sigun.includes(prov)));

  // 지도용 시작 좌표. 한 요청에서 새로 받는 개수만 제한한다.
  let fetched = 0;
  for (const c of courses) {
    if (startCache.has(c.id)) {
      c.start = startCache.get(c.id);
    } else if (fetched < GPX_PER_REQUEST) {
      fetched += 1;
      c.start = await startPointOf(c);
    } else {
      c.start = null;
    }
  }

  res.status(200).json({ sigun, total: courses.length, items: courses });
}
