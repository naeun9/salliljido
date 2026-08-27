const DUR_DAYS = { "1주": 7, "2주": 14, "1달": 30 };

// 조건을 안 고르고 들어왔을 때 쓰는 기본값.
//
// design은 이 기본값이 두 군데로 갈라져 있었다 — 계산은 `|| 7`(1주),
// 화면 표시는 `|| "2주"`(dtChipLine). 원본에서는 조건 없이 상세 화면에
// 닿기 어려워 잘 드러나지 않았지만, 라우팅이 생기면서 새로고침이나 URL
// 직접 진입 때마다 "배너는 2주인데 비용은 7일" 상태가 재현됐다.
// 그래서 기본값을 하나로 모으고, 표시·계산 모두 이 값에서 파생시킨다.
// 7일(1주)로 통일한 이유: stayDays의 원래 폴백이 7이라 지금까지 계산된
// 금액이 그대로 유지된다(14로 바꾸면 기존 추정치가 전부 두 배가 된다).
export const DEFAULT_DUR = "1주";
export const DEFAULT_PLACE = "바다";

// design/salliljido.extracted.html 3584-3588줄(stayDays)을 그대로 옮김.
// dur/customDays(SearchContext)로 실제 체류 일수를 계산한다.
export function stayDays({ dur, customDays }) {
  if (dur === "직접 입력") return Math.max(1, Math.min(30, customDays || 5));
  return DUR_DAYS[dur] || DUR_DAYS[DEFAULT_DUR];
}

// 화면에 쓸 체류 조건을 한 번에 정리해서 돌려준다. 표시용 라벨(durLabel)과
// 계산용 일수(nights)가 반드시 같은 dur에서 나오게 하는 것이 목적이다 —
// 어느 화면이든 이 함수만 쓰면 둘이 어긋날 수 없다.
export function resolveStayCondition({ dur, place, customDays }) {
  const resolvedDur = dur || DEFAULT_DUR;
  const nights = stayDays({ dur: resolvedDur, customDays });
  return {
    dur: resolvedDur,
    place: place || DEFAULT_PLACE,
    nights,
    // "직접 입력"은 주 단위로 표현할 수 없어 원본처럼 "N일"로 쓴다.
    durLabel: resolvedDur === "직접 입력" ? `${nights}일` : resolvedDur,
  };
}

// design은 마이페이지 저장 날짜를 "2026.07.28"/"2026.08.18"처럼 고정
// 문자열로 하드코딩해뒀지만(데모용 NOW 기준), 실제로 localStorage에
// 영속화하는 저장 기능에서는 진짜 저장 시각을 써야 의미가 있다. 표기
// 형식(YYYY.MM.DD)만 그대로 옮겼다.
export function formatSavedDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}
