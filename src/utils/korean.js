// design/salliljido.extracted.html 2986줄(hasJong)을 그대로 옮김.
// 한글 음절의 마지막 글자에 받침이 있는지로 조사(은/는, 이/가, 을/를, 과/와)를 고른다.
export function hasJong(str) {
  const s = String(str || "");
  const code = s.charCodeAt(s.length - 1) - 0xac00;
  return code >= 0 && code < 11172 && code % 28 !== 0;
}
