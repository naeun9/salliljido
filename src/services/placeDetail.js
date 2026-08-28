// 장소 상세(개요·영업시간·대표메뉴 등) 조회. api/tour/detail.js를 부른다.
//
// 호출 최소화(CLAUDE.md · 일 1,000건 한도):
//  - 목록에서는 절대 부르지 않는다. 상세 모달을 열 때만 부른다.
//  - 같은 장소를 다시 열면 이 세션 메모리에 있는 값을 그대로 쓴다.
//  - 같은 장소를 동시에 두 번 열어도 요청은 하나만 나간다(inflight 공유).
//
// 캐시는 메모리(Map)뿐이다. localStorage에 넣지 않는다 — 관광공사 응답은
// 저장하지 않고 실시간 호출만 쓴다는 규칙 때문이다. 새로고침하면 사라진다.
const cache = new Map();
const inflight = new Map();

function keyOf(contentId, contentTypeId) {
  return `${contentId}|${contentTypeId || ""}`;
}

export function getCachedDetail(contentId, contentTypeId) {
  return cache.get(keyOf(contentId, contentTypeId)) || null;
}

export async function fetchPlaceDetail(contentId, contentTypeId) {
  const key = keyOf(contentId, contentTypeId);
  if (cache.has(key)) return cache.get(key);
  if (inflight.has(key)) return inflight.get(key);

  const qs = new URLSearchParams({ contentId: String(contentId) });
  if (contentTypeId) qs.set("contentTypeId", String(contentTypeId));

  const promise = fetch(`/api/tour/detail?${qs.toString()}`)
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `상세 정보를 불러오지 못했습니다 (${res.status})`);
      }
      return res.json();
    })
    .then((data) => {
      cache.set(key, data);
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}
