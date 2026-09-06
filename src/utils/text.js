// 긴 설명을 문장 단위로 줄인다.
//
// 관광공사 detailCommon2의 overview는 270~440자가 예사라(실측) 모달에 그대로
// 넣으면 사진·정보 목록이 스크롤 밖으로 밀린다. 글자 수로 뚝 자르면 문장
// 중간에서 끊겨 읽다 만 것처럼 보여서, 문장 끝(마침표·물음표·느낌표)까지만
// 남긴다.
const SENTENCE_END = /[.!?。]\s*/g;

export function summarize(text, { max = 150, hardMax = 190 } = {}) {
  const full = String(text || "").trim();
  if (!full || full.length <= max) return { short: full, truncated: false };

  // max를 넘지 않는 선에서 마지막 문장 끝을 찾는다.
  let cut = 0;
  SENTENCE_END.lastIndex = 0;
  let m;
  while ((m = SENTENCE_END.exec(full))) {
    const end = m.index + 1; // 마침표까지 포함
    if (end > max) break;
    cut = end;
  }

  // 첫 문장부터 max를 넘으면(한 문장이 아주 긴 경우) 그 문장을 통째로 쓰되
  // hardMax에서는 잘라낸다 — 그때만 말줄임표를 붙인다.
  if (cut === 0) {
    SENTENCE_END.lastIndex = 0;
    const first = SENTENCE_END.exec(full);
    const end = first ? first.index + 1 : full.length;
    if (end <= hardMax) return { short: full.slice(0, end), truncated: end < full.length };
    return { short: full.slice(0, hardMax).trimEnd() + "…", truncated: true };
  }

  return { short: full.slice(0, cut), truncated: cut < full.length };
}

// 목록형 값("A / B / C / D …")을 앞에서 몇 개만 남긴다. 취급메뉴처럼
// 나열이 길어질 수 있는 줄에 쓴다.
export function firstItems(value, { count = 5, separator = " / " } = {}) {
  const parts = String(value || "")
    .split(/\s*\/\s*|\s*,\s*/)
    .filter(Boolean);
  if (parts.length <= count) return value;
  return parts.slice(0, count).join(separator) + " 등";
}
