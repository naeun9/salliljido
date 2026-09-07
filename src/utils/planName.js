// 계획 이름 중복 처리.
//
// design confirmPlanName()(2438-2457줄)은 이름을 그대로 저장해서 같은 이름의
// 계획이 얼마든지 생겼다. 마이페이지 목록에서 어느 것이 어느 것인지 구분할
// 수 없어서, 이미 있는 이름이면 뒤에 번호를 붙인다.
//
//   "태안 7일 살기" (있음) → "태안 7일 살기 2"
//   "태안 7일 살기 2"까지 있으면 → "태안 7일 살기 3"
//
// selfId는 자기 자신이다 — 이름을 안 바꾸고 다시 저장하거나(변경사항 저장)
// 이름 수정 창에서 원래 이름 그대로 확인을 눌렀을 때 자기 이름 때문에
// 번호가 붙는 것을 막는다.
//
// 사용자가 직접 숫자로 끝나는 이름을 지어 그것이 이미 있으면
// ("봉화 2" → "봉화 2 2") 조금 어색해지지만, 뒤에서 이름을 잘라 내면
// "봉화 2"를 "봉화"로 바꿔 버리는 쪽이 더 나쁘다고 보고 그대로 둔다.
export function uniquePlanName(title, plans, selfId) {
  const name = String(title || "").trim();
  if (!name) return name;

  const taken = new Set(
    (plans || []).filter((p) => p.id !== selfId).map((p) => String(p.title || "").trim())
  );
  if (!taken.has(name)) return name;

  let n = 2;
  while (taken.has(`${name} ${n}`)) n += 1;
  return `${name} ${n}`;
}
