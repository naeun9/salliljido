// 주소에서 읍·면·동 이름을 뽑아낸다.
//
// 관광공사 주소는 "충청남도 태안군 남면 진산1길 195-14"처럼 시도 → 시군구
// → 읍면동 순으로 온다. 세 번째 토큰만 보고 읍/면/동으로 끝날 때만 쓴다.
// 단순 정규식으로 "동"을 찾으면 "안동시"의 "안동"까지 걸려서 지역 이름이
// 동네 이름으로 둔갑한다.
//
// 읍면동이 주소에 없는 항목도 흔하다("강원특별자치도 속초시 해오름로 204"
// 처럼 시 바로 아래 도로명만 있는 경우). 그럴 땐 null을 돌려준다.
export function districtOf(addr) {
  const tokens = String(addr || "").trim().split(/\s+/);
  if (tokens.length < 3) return null;
  const third = tokens[2];
  return /(읍|면|동)$/.test(third) ? third : null;
}

// 항목 목록에서 가장 많이 나오는 읍·면·동 이름 순으로 최대 limit개.
// 동률이면 목록에 먼저 나온 순서를 지켜(결정적) 매번 같은 결과를 준다.
export function topDistricts(items, limit = 2) {
  const order = [];
  const counts = new Map();
  (items || []).forEach((x) => {
    const d = districtOf(x && x.addr);
    if (!d) return;
    if (!counts.has(d)) order.push(d);
    counts.set(d, (counts.get(d) || 0) + 1);
  });
  return order.sort((a, b) => counts.get(b) - counts.get(a) || order.indexOf(a) - order.indexOf(b)).slice(0, limit);
}
