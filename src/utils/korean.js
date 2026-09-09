// design/salliljido.extracted.html 2986줄(hasJong)을 그대로 옮김.
// 한글 음절의 마지막 글자에 받침이 있는지로 조사(은/는, 이/가, 을/를, 과/와)를 고른다.
export function hasJong(str) {
  const s = String(str || "");
  const code = s.charCodeAt(s.length - 1) - 0xac00;
  return code >= 0 && code < 11172 && code % 28 !== 0;
}

// 낱말을 "과/와"로 잇는다. 조사는 바로 앞 낱말의 받침을 따르므로
// join("와 ")처럼 하나로 고정하면 받침 있는 낱말에서 "산와"가 된다.
//   ["산", "자연"]   → "산과 자연"
//   ["바다", "자연"] → "바다와 자연"
export function joinWithGwa(words) {
  return (words || [])
    .filter(Boolean)
    .reduce((acc, word, i, all) => (i === 0 ? word : acc + (hasJong(all[i - 1]) ? "과 " : "와 ") + word), "");
}
