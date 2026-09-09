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

// 문장 단위로 자른다. 끝맺음 부호를 문장에 붙여 둔 채로 돌려준다.
function splitSentences(text) {
  const parts = String(text).match(/[^.!?。]+[.!?。]+|[^.!?。]+$/g);
  return parts ? parts.map((s) => s.trim()).filter(Boolean) : [];
}

// 펼친 개요를 문단으로 나눈다. 300자가 넘는 글을 한 덩어리로 두면 줄만
// 빽빽하게 쌓여 읽던 자리를 놓친다. 2~3문장(기본 3)마다 끊는다.
//
// 원문에 이미 줄바꿈이 있으면(detailCommon2의 <br>을 api/tour/detail.js가
// "\n"으로 바꿔 준다) 그 경계를 먼저 지킨다 — 글쓴이가 나눈 자리다.
export function toParagraphs(text, { per = 3 } = {}) {
  const full = String(text || "").trim();
  if (!full) return [];
  const out = [];
  for (const block of full.split(/\n+/)) {
    const sentences = splitSentences(block.trim());
    for (let i = 0; i < sentences.length; i += per) {
      out.push(sentences.slice(i, i + per).join(" "));
    }
  }
  return out;
}

// 구분자로 이어진 목록형 값("A / B / C 등")을 항목 배열로 편다.
// 취급메뉴(treatmenu)가 이 형태로 온다 — 구분자는 자료마다 슬래시·쉼표·
// 가운뎃점이 섞여 있어 셋 다 받는다.
export function splitList(value) {
  const parts = String(value || "")
    .split(/\s*[/,·]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  // 원문 끝의 "등"은 목록으로 세워 놓으면 군더더기라 마지막 항목에서만 뗀다
  // ("양양표고버섯라떼 등" → "양양표고버섯라떼").
  if (parts.length) {
    const last = parts[parts.length - 1].replace(/\s*등$/, "").trim();
    if (last) parts[parts.length - 1] = last;
    else parts.pop();
  }
  return parts;
}
