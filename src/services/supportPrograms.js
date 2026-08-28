// design/salliljido.extracted.html의 allPrograms()/supportVals()
// (4295-4437줄 부근)를 그대로 옮긴 계산 로직. 원본 데이터는
// data/supportPrograms.js를 참고.
import { supportPrograms } from "../data/supportPrograms.js";

// design 4352줄은 기준일을 "2026-07-30"으로 박아뒀다. 목업이라 그대로
// 옮겼었는데, 실제 공고를 넣으면 날짜가 지나도 계속 "모집 중"으로 남는
// 구조라 실제 오늘 날짜로 바꿨다. 상태·D-day·"○○년 ○월 기준" 문구가
// 전부 이 함수 하나에서 나온다.
//
// 시각이 아니라 "날짜"만 본다 — 마감일 당일 오후에 접속해도 마감으로
// 넘어가지 않게 자정 기준으로 맞춘다.
function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// "YYYY-MM-DD"를 로컬 자정으로 읽는다. new Date("2026-07-01")은 UTC로
// 해석돼서 시간대에 따라 하루가 밀린다.
function parseDate(value) {
  if (!value) return null;
  const [y, m, d] = String(value).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

// 화면 상단 "○○년 ○월 기준" 문구. design 4148줄 부근은 "2026년 7월 기준"
// 고정 문자열이었다.
export function asOfLabel() {
  const d = today();
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 기준`;
}

// city("강원 정선군") 앞 두 글자가 지역 필터 값이 된다. 예전에는 region을
// 데이터에 따로 적었는데 city와 어긋날 수 있어서 파생값으로 바꿨다.
function regionOf(city) {
  return (city || "").slice(0, 2);
}

const BADGE_COLOR = {
  "모집 중": ["#DCE8E2", "#2F5D50"],
  "마감 임박": ["#F5E1D5", "#C05F33"],
  예정: ["#EFEBE3", "#6E6E68"],
  마감: ["#EFEBE3", "#9A968E"],
};

export const REGION_FILTER_OPTIONS = ["강원", "충남", "경북"];
export const STATUS_FILTER_OPTIONS = ["모집 중", "예정", "마감"];

// design 4148줄(startLoad("sup", 900)): 지원 프로그램 화면 진입 시 900ms
// 스켈레톤을 보여준다.
export const SUP_LOAD_MS = 900;

function fmt(dateStr) {
  const d = parseDate(dateStr);
  return d ? `${d.getMonth() + 1}.${d.getDate()}` : "";
}

// 각 프로그램에 상태(모집 중/마감 임박/예정/마감), 정렬 순위, 배지 색,
// 신청 페이지 링크 등 화면 표시용 파생값을 붙인다. design 4357-4380줄.
export function getAllPrograms() {
  const now = today();

  return supportPrograms.map((p) => {
    const start = parseDate(p.start);
    // end가 없으면 상시 모집으로 본다(지자체 공고에 흔하다).
    const end = parseDate(p.end);
    const days = end ? Math.ceil((end - now) / 86400000) : null;

    let status = "모집 중";
    let rank = 1;
    if (start && now < start) {
      status = "예정";
      rank = 2;
    } else if (end && now > end) {
      status = "마감";
      rank = 3;
    } else if (days !== null && days <= 7) {
      status = "마감 임박";
      rank = 0;
    }

    const [badgeBg, badgeFg] = BADGE_COLOR[status];
    const dLabel =
      status === "예정"
        ? `${fmt(p.start)} 접수 시작`
        : status === "마감"
          ? "접수 종료"
          : days === null
            ? "상시 모집"
            : `마감 ${days}일 전`;

    return {
      ...p,
      region: regionOf(p.city),
      status,
      rank,
      days,
      badgeBg,
      badgeFg,
      dLabel,
      period: end ? `${fmt(p.start)} – ${fmt(p.end)}` : `${fmt(p.start)} –`,
      summary: (p.benefits || []).join(" · "),
      // 공고마다 다른 실제 신청 페이지 주소. 아직 안 채운 항목은 빈
      // 문자열이고, 그때는 카드의 "신청 페이지로 이동" 버튼을 숨긴다
      // (예전에는 전부 https://www.gov.kr로 고정된 자리표시용이었다).
      url: p.url || "",
      opacity: status === "마감" ? 0.62 : 1,
      filter: status === "마감" ? "saturate(.55)" : "none",
    };
  });
}

// design 4402-4407줄: "모집 중" 상태 필터를 고르면 "마감 임박"도 같이
// 걸러진다(마감 임박은 모집 중의 세부 상태라는 취급). 상태 칩에는
// "마감 임박"이 따로 없는 것도 원본과 동일.
export function filterPrograms(list, { regionFilter = [], statusFilter = [] } = {}) {
  return list.filter(
    (p) =>
      (regionFilter.length === 0 || regionFilter.indexOf(p.region) >= 0) &&
      (statusFilter.length === 0 ||
        statusFilter.indexOf(p.status) >= 0 ||
        (statusFilter.indexOf("모집 중") >= 0 && p.status === "마감 임박"))
  );
}

export function sortPrograms(list, sort) {
  const sorted = list.slice();
  if (sort === "recent") {
    sorted.sort(
      (a, b) => (a.rank === 3 ? 1 : 0) - (b.rank === 3 ? 1 : 0) || parseDate(b.posted) - parseDate(a.posted)
    );
  } else {
    // 마감일이 없는(상시 모집) 항목은 같은 순위 안에서 뒤로 보낸다.
    sorted.sort((a, b) => a.rank - b.rank || (parseDate(a.end) || Infinity) - (parseDate(b.end) || Infinity));
  }
  return sorted;
}

// design 4412-4415줄(cbFindSupport): 지역명 앞 2글자가 필터 지역 목록에
// 있으면 그 지역으로 필터를 미리 걸어준다.
export function regionFilterFor(regionName) {
  const short = (regionName || "").slice(0, 2);
  return REGION_FILTER_OPTIONS.indexOf(short) >= 0 ? [short] : [];
}

// design mpVals()의 progs 매핑(4428565줄 부근): 마이페이지 "관심 등록한
// 지원 프로그램" 카드는 지원 프로그램 화면의 카드와 다른 요약 문구
// (deadlineLabel/deadlineColor)를 쓴다. 마감 상태는 뒤로, 나머지는
// rank 순으로 정렬한다.
export function getSavedProgramCards(savedIds) {
  return getAllPrograms()
    .filter((p) => savedIds.includes(p.id))
    .sort((a, b) => (a.status === "마감" ? 1 : 0) - (b.status === "마감" ? 1 : 0) || a.rank - b.rank)
    .map((p) => ({
      ...p,
      deadlineLabel:
        p.status === "마감"
          ? `접수 종료 · ${p.period}`
          : p.status === "예정"
            ? `${p.period} 접수`
            : p.days === null
              ? `상시 모집 · ${p.period}`
              : `마감 ${p.days}일 전 · ${p.period}`,
      deadlineColor: p.status === "마감 임박" ? "#C05F33" : p.status === "마감" ? "#9A968E" : "#2B2B29",
    }));
}
