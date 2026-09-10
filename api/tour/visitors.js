// 빅데이터 지역별 방문자수 조회(한국관광 데이터랩 locgoRegnVisitrDDList).
// 이동통신 데이터로 집계한 기초지자체별 "하루 방문자 수"다.
//
// GET /api/tour/visitors?signguCd=51830&startYmd=20260801&endYmd=20260810
//
// signguCd는 5자리 행정구역 코드다. 이 서비스가 쓰는 코드 체계가
// 관광공사 법정동 코드와 같아서, data/regions.js의 regnCd + signguCd를
// 그대로 이어 붙이면 된다(51 + 830 = 51830 양양군). 29곳 전부 조회된다.
//
// 상류 API의 두 가지 제약 때문에 이 핸들러가 필요하다:
//  1. 시군구로 좁혀지지 않는다. signguCd를 넘겨도 무시되고 전국이 온다
//     (실측: 하루치 807건 = 269개 시군구 × 3구분). 그래서 여기서 거른다.
//  2. 일별만 있다. 월별·연별 오퍼레이션은 없다(NO_OPENAPI_SERVICE_ERROR).
//     여러 날을 보려면 날짜 수만큼 불러야 한다.
//
// touDivCd 1=현지인 2=외지인 3=외국인. "얼마나 붐비는가"는 외지인+외국인이다
// — 현지인은 그 지역에 사는 사람이라 방문객이 아니다.
//
// 호출 최소화: 하루치 응답이 전국을 통째로 담고 있어 지역이 몇 곳이든
// 날짜 수만큼만 부르면 된다. 그 하루치를 날짜별로 캐시해 두면 여러 지역을
// 이어서 조회해도 상류 호출이 늘지 않는다.
import { callDataLabApi, normalizeItems } from "../_lib/tourApi.js";

const DAY_TTL_MS = 12 * 60 * 60 * 1000;
// 전국 하루치가 807건(269 시군구 × 3구분)이라 한 번에 다 받는다.
const ROWS_PER_DAY = 1200;
// 한 요청에서 볼 수 있는 날짜 수. 날짜 하나가 상류 호출 하나라서, 실수로
// 긴 범위를 넘겨 일일 한도를 태우는 일이 없게 막아 둔다.
const MAX_DAYS = 31;

// baseYmd → Map(signguCode → {local, visitor, foreign, name, weekday})
const dayCache = new Map();

function ymdToDate(ymd) {
  const s = String(ymd);
  return new Date(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)));
}
function toYmd(d) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
function eachDay(startYmd, endYmd) {
  const out = [];
  const end = ymdToDate(endYmd);
  for (let d = ymdToDate(startYmd); d <= end && out.length < MAX_DAYS; d.setDate(d.getDate() + 1)) {
    out.push(toYmd(d));
  }
  return out;
}

async function loadDay(ymd) {
  const cached = dayCache.get(ymd);
  if (cached && Date.now() - cached.at < DAY_TTL_MS) return cached.byCode;

  const result = await callDataLabApi("locgoRegnVisitrDDList", {
    startYmd: ymd,
    endYmd: ymd,
    numOfRows: String(ROWS_PER_DAY),
    pageNo: "1",
  });
  if (!result.ok) return { error: result };

  const byCode = new Map();
  for (const raw of normalizeItems(result.body)) {
    const code = String(raw.signguCode || "");
    if (!code) continue;
    const row = byCode.get(code) || {
      name: raw.signguNm || "",
      weekday: raw.daywkDivNm || "",
      local: 0,
      visitor: 0,
      foreign: 0,
    };
    // touNum은 "56053.0"처럼 소수점이 붙어 온다.
    const n = Number(raw.touNum) || 0;
    if (raw.touDivCd === "1") row.local = n;
    else if (raw.touDivCd === "2") row.visitor = n;
    else if (raw.touDivCd === "3") row.foreign = n;
    byCode.set(code, row);
  }
  dayCache.set(ymd, { at: Date.now(), byCode });
  return byCode;
}

export default async function handler(req, res) {
  const { signguCd, startYmd, endYmd } = req.query;
  if (!signguCd || !startYmd || !endYmd) {
    return res.status(400).json({
      error:
        "signguCd, startYmd, endYmd가 모두 필요합니다. 예: signguCd=51830&startYmd=20260801&endYmd=20260810",
    });
  }

  const days = eachDay(startYmd, endYmd);
  if (!days.length) {
    return res.status(400).json({ error: "startYmd가 endYmd보다 뒤입니다." });
  }

  const rows = [];
  let failure = null;
  for (const ymd of days) {
    const byCode = await loadDay(ymd);
    if (byCode && byCode.error) {
      // 하루가 실패해도 나머지 날짜는 그대로 쓴다. 전부 실패했을 때만 502.
      failure = byCode.error;
      continue;
    }
    const hit = byCode.get(String(signguCd));
    // 그 날짜에 그 지역이 없으면(집계 누락) 0으로 채우지 않고 건너뛴다 —
    // 0으로 채우면 평균이 실제보다 낮아진다.
    if (!hit) continue;
    rows.push({
      date: ymd,
      weekday: hit.weekday,
      name: hit.name,
      local: Math.round(hit.local),
      visitor: Math.round(hit.visitor),
      foreign: Math.round(hit.foreign),
    });
  }

  if (!rows.length) {
    if (failure) return res.status(502).json({ error: failure.message, errorCode: failure.errorCode });
    return res.status(200).json({ signguCd, days: days.length, rows: [], average: null });
  }

  const sum = rows.reduce((a, r) => a + r.visitor + r.foreign, 0);
  res.status(200).json({
    signguCd,
    name: rows[0].name,
    // 요청한 날짜 수와 실제로 값이 있던 날짜 수를 같이 준다 — 평균이 며칠을
    // 바탕으로 나온 값인지 화면에서 알 수 있어야 한다.
    days: days.length,
    counted: rows.length,
    // 외지인 + 외국인의 하루 평균. "얼마나 붐비는가"에 쓰는 값이다.
    average: Math.round(sum / rows.length),
    rows,
  });
}
