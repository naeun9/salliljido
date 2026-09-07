// 한국관광공사 오픈API(KorService2) 공용 호출 유틸. api/tour/*.js가
// 공유한다. 파일명이 _lib인 이유: Vercel은 api/ 아래에서 밑줄로 시작하는
// 폴더를 라우트로 취급하지 않는다(공식 컨벤션) — 그래서 여기엔 진짜
// 엔드포인트가 아니라 공용 코드만 둔다.
//
// 인증키(TOUR_API_KEY)는 공공데이터포털 "Decoding" 키(원문 그대로의 값)다.
// URLSearchParams는 값을 넣을 때 정확히 한 번만 퍼센트 인코딩하므로, 이
// 원문 키를 다른 곳에서 미리 encodeURIComponent()로 인코딩해서 넘기면
// 이중 인코딩(+가 %2B가 아니라 %252B가 되는 식)이 되어 인증 오류가 난다.
// → 이 파일 밖에서는 절대로 serviceKey를 직접 만들거나 인코딩하지 말 것.
const KOR_SERVICE_BASE = "http://apis.data.go.kr/B551011/KorService2";

// 공공데이터포털 공통 에러코드(returnReasonCode/resultCode 공용 표).
const ERROR_MESSAGES = {
  1: "APPLICATION_ERROR — 어플리케이션 에러",
  2: "DB_ERROR — 데이터베이스 에러",
  3: "NODATA_ERROR — 데이터 없음",
  4: "HTTP_ERROR — HTTP 에러",
  5: "SERVICETIMEOUT_ERROR — 서비스 연결 실패(타임아웃)",
  10: "INVALID_REQUEST_PARAMETER_ERROR — 잘못된 요청 파라미터",
  11: "NO_MANDATORY_REQUEST_PARAMETERS_ERROR — 필수 요청 파라미터 누락",
  12: "NO_OPENAPI_SERVICE_ERROR — 해당 오픈API 서비스가 없거나 폐기됨",
  20: "SERVICE_ACCESS_DENIED_ERROR — 서비스 접근 거부",
  21: "TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR — 일시적으로 사용 중지된 서비스키",
  22: "LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR — 서비스 요청 한도 초과",
  30: "SERVICE_KEY_IS_NOT_REGISTERED_ERROR — 등록되지 않은 서비스키",
  31: "DEADLINE_HAS_EXPIRED_ERROR — 기한 만료된 서비스키",
  32: "UNREGISTERED_IP_ERROR — 등록되지 않은 IP",
  33: "UNSIGNED_CALL_ERROR — 서명되지 않은 호출",
  99: "UNKNOWN_ERROR — 알 수 없는 에러",
};

function describeError(code) {
  const key = String(parseInt(code, 10));
  return ERROR_MESSAGES[key] || `알 수 없는 에러코드(${code})`;
}

// 응답 모양이 API/에러 종류마다 다르다(직접 호출해보고 확인한 3+1가지):
//   1) 정상 응답            { response: { header: {resultCode,...}, body: {...} } }
//   2) 게이트웨이 에러(JSON) { OpenAPI_ServiceResponse: { cmmMsgHeader: {returnReasonCode,...} } }
//   3) 게이트웨이 에러(XML) 위와 같은 내용이 XML 태그로 옴(_type=json이어도)
//   4) 상품(오퍼레이션) 레벨 파라미터 에러(고캠핑 API에서 확인했던 형태):
//      { responseTime, resultCode, resultMsg } 처럼 껍데기 없이 최상위에 바로 옴
function parseOpenApiResponse(text) {
  const trimmed = text.trim();

  if (trimmed.startsWith("<")) {
    const codeMatch = trimmed.match(/<returnReasonCode>\s*(\d+)\s*<\/returnReasonCode>/);
    const authMsgMatch = trimmed.match(/<returnAuthMsg>\s*([^<]*)\s*<\/returnAuthMsg>/);
    const code = codeMatch ? codeMatch[1] : null;
    return {
      ok: false,
      errorCode: code,
      message: code
        ? describeError(code)
        : authMsgMatch
          ? authMsgMatch[1]
          : "알 수 없는 XML 에러 응답을 받았습니다.",
    };
  }

  let json;
  try {
    json = JSON.parse(trimmed);
  } catch {
    return { ok: false, errorCode: null, message: "응답을 JSON으로 해석할 수 없습니다." };
  }

  const gatewayHeader = json?.OpenAPI_ServiceResponse?.cmmMsgHeader;
  if (gatewayHeader) {
    const code = gatewayHeader.returnReasonCode;
    return {
      ok: false,
      errorCode: code,
      message: code
        ? describeError(code)
        : gatewayHeader.returnAuthMsg ||
          gatewayHeader.errMsg ||
          "알 수 없는 게이트웨이 에러 응답을 받았습니다.",
    };
  }

  // 파라미터 검증 에러: 껍데기 없이 최상위에 resultCode가 있고
  // response 필드 자체가 없다(정상 응답은 항상 response로 감싸져 있음).
  if (json?.resultCode !== undefined && json?.response === undefined) {
    return {
      ok: false,
      errorCode: json.resultCode,
      message: json.resultMsg || describeError(json.resultCode),
    };
  }

  const header = json?.response?.header;
  if (!header) {
    return { ok: false, errorCode: null, message: "응답에 header가 없습니다." };
  }

  if (header.resultCode === "0000") {
    return { ok: true, body: json.response.body || {} };
  }

  // NODATA는 진짜 실패가 아니라 "결과가 0건"으로 취급한다.
  if (String(parseInt(header.resultCode, 10)) === "3") {
    return { ok: true, body: { items: "", totalCount: 0, numOfRows: 0, pageNo: 1 } };
  }

  return {
    ok: false,
    errorCode: header.resultCode,
    message: describeError(header.resultCode) || header.resultMsg,
  };
}

// 게이트웨이가 응답하지 않을 때(연결은 받아 놓고 답을 주지 않는 상태)
// 화면에서 다른 실패와 다르게 안내하기 위한 표시. 프론트가 문구를 문자열로
// 비교하지 않도록 코드로 준다(공공데이터포털 에러코드는 전부 숫자라 겹치지 않는다).
export const TIMEOUT_ERROR_CODE = "TIMEOUT";
const TIMEOUT_MESSAGE = "관광공사 서버가 응답하지 않습니다. 잠시 후 다시 시도해 주세요.";

// 시도 1회 제한시간과 시도 횟수.
//
// 2026-09-06 apis.data.go.kr 게이트웨이 장애 때 관찰한 것:
//  - 응답이 오지 않는 연결은 30초를 줘도 끝내 오지 않는다. 같은 소켓을 더
//    오래 붙들고 있어 봐야 얻는 게 없다(9초 12회 전부 실패).
//  - 대신 새로 연 연결은 가끔 뚫린다(12번 중 1번, 7.5초).
// 그래서 "한 번 길게 기다리기"보다 "짧게 두 번"이 낫다고 봤다. 정상일 때
// 이 호출의 실측 응답은 114~317ms라(docs/03-api-check.md §13, 500건 조회
// 기준) 4.2초는 13배 넘는 여유다 — 짧게 잡아도 정상 응답을 자르지 않는다.
//
// 총예산 4.2 × 2 = 8.4초. Vercel Hobby 함수 실행 한도 10초 안에 파싱·직렬화
// 여유 1.6초를 남긴다. 이 두 값을 바꿀 때는 곱한 값이 10초를 넘지 않는지
// 반드시 다시 계산할 것.
const ATTEMPT_TIMEOUT_MS = 4200;
const MAX_ATTEMPTS = 2;

// 관광공사에 닿지 못한 실패인지(= 다시 걸어 볼 가치가 있는지) 가른다.
// 응답을 받아 온 실패(에러코드)는 다시 불러도 같은 답이라 재시도하지 않는다.
function isUnreachable(err) {
  if (err.name === "AbortError") return true; // 우리가 건 제한시간
  const code = err.cause?.code || err.code || "";
  return /TIMEOUT|ECONN|ENOTFOUND|EAI_AGAIN|SOCKET/i.test(code);
}

async function fetchOnce(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return { text: await response.text() };
  } catch (err) {
    return { err };
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenApi(baseUrl, operation, params, { timeoutMs = ATTEMPT_TIMEOUT_MS } = {}) {
  const apiKey = process.env.TOUR_API_KEY;
  if (!apiKey) {
    return { ok: false, errorCode: null, message: "TOUR_API_KEY가 서버 환경변수에 설정되어 있지 않습니다." };
  }

  const qs = new URLSearchParams({
    serviceKey: apiKey,
    MobileOS: "WEB",
    MobileApp: "salliljido",
    _type: "json",
  });
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
  }

  const url = `${baseUrl}/${operation}?${qs.toString()}`;

  // 백오프 없이 곧바로 다시 건다. 기다렸다 거는 게 의미가 있으려면 상대가
  // 회복 중이어야 하는데, 여기서 노리는 건 "이 연결만 죽은 경우"라 새 연결을
  // 바로 여는 편이 낫고 예산도 아낀다.
  let failure = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await fetchOnce(url, timeoutMs);
    if (!result.err) return parseOpenApiResponse(result.text);
    failure = result.err;
    if (!isUnreachable(failure)) break;
  }

  if (isUnreachable(failure)) {
    return { ok: false, errorCode: TIMEOUT_ERROR_CODE, message: TIMEOUT_MESSAGE };
  }
  return { ok: false, errorCode: null, message: `요청 실패: ${failure.message}` };
}

// operation 예: "areaBasedList2", "ldongCode2". params는 serviceKey/MobileOS/
// MobileApp/_type을 뺀 나머지(지역코드, 페이지 등)만 넘기면 된다.
// 반환값: 성공 시 { ok:true, body }, 실패 시 { ok:false, errorCode, message }.
export function callTourApi(operation, params = {}, opts) {
  return callOpenApi(KOR_SERVICE_BASE, operation, params, opts);
}

// 관광공사 이미지 URL은 같은 호스트(tong.visitkorea.or.kr)인데도 항목마다
// http와 https가 섞여서 온다(태안 30건 중 http 12 / https 12). https로
// 서비스하는 배포 환경에서는 http 이미지가 Mixed Content로 차단돼 사진이
// 통째로 안 나온다. 같은 URL을 https로 바꿔 부르면 200으로 정상 응답하는
// 것을 확인하고, 여기서 프로토콜을 맞춰 준다.
export function toHttps(url) {
  return url && url.startsWith("http://") ? `https://${url.slice("http://".length)}` : url || "";
}

// items가 "" | {item: {...}} | {item: [...]} 세 가지 형태로 오는 걸
// 항상 배열로 통일한다.
export function normalizeItems(body) {
  const raw = body?.items;
  if (!raw || raw === "") return [];
  const item = raw.item;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}
