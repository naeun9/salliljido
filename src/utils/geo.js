// 좌표 계산. 관광공사 목록의 mapX/mapY는 각각 경도(lng)/위도(lat)다.
//
// 지역의 "중심"을 따로 들고 있지 않아서(data/regions.js의 mx/my는 목업
// 지도 위 % 좌표라 실제 좌표가 아니다) 그 지역 관광 목록에서 뽑아 쓴다.
// 평균이 아니라 중앙값을 쓰는 이유: 태안처럼 섬이 멀리 떨어져 있는
// 지역에서 평균을 내면 중심이 바다 쪽으로 끌려간다.

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// 좌표가 있는 항목들의 중앙값 지점. 하나도 없으면 null.
function medianCenter(items) {
  const lats = [];
  const lngs = [];
  (items || []).forEach((x) => {
    if (typeof x.mapY === "number" && !Number.isNaN(x.mapY)) lats.push(x.mapY);
    if (typeof x.mapX === "number" && !Number.isNaN(x.mapX)) lngs.push(x.mapX);
  });
  const lat = median(lats);
  const lng = median(lngs);
  return lat === null || lng === null ? null : { lat, lng };
}

// 둘러보기 목록(카테고리별 객체) 전체의 중심.

// 중심에서 radius(m)만큼 떨어진 사각 범위. 지도를 이 범위에 맞추면
// 반경 원이 화면에 꽉 차게 들어온다.
export function boundsAround(center, radiusMeters) {
  const latDelta = radiusMeters / 111320;
  const cos = Math.cos((center.lat * Math.PI) / 180) || 1;
  const lngDelta = radiusMeters / (111320 * cos);
  return {
    sw: { lat: center.lat - latDelta, lng: center.lng - lngDelta },
    ne: { lat: center.lat + latDelta, lng: center.lng + lngDelta },
  };
}

// 두 지점 사이 거리(m). 지도 위에서 라벨이 서로 겹치는지 판단하는 데 쓴다.
const EARTH_RADIUS_M = 6371000;

function distanceMeters(a, b) {
  if (!a || !b) return Infinity;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// 여러 지점을 모두 담는 사각 범위. 지도를 이 범위에 맞추면 목업이
// toPercentCoords로 하던 것(그 목록의 경계에 맞춰 핀을 펼치기)과 같은
// 결과가 된다. 한 점뿐이면 pad(m)만큼 여유를 준다.
export function boundsOf(points, pad = 1500) {
  const valid = (points || []).filter((p) => p && typeof p.lat === "number" && typeof p.lng === "number");
  if (!valid.length) return null;
  const lats = valid.map((p) => p.lat);
  const lngs = valid.map((p) => p.lng);
  const sw = { lat: Math.min(...lats), lng: Math.min(...lngs) };
  const ne = { lat: Math.max(...lats), lng: Math.max(...lngs) };
  if (valid.length === 1 || (sw.lat === ne.lat && sw.lng === ne.lng)) {
    return boundsAround(valid[0], pad);
  }
  return { sw, ne };
}

// 순서대로 이은 실제 이동 거리(m). 목업의 가짜 공식을 대체한다.
export function pathLength(points) {
  let total = 0;
  for (let i = 1; i < (points || []).length; i++) total += distanceMeters(points[i - 1], points[i]);
  return total;
}

// 관광공사 목록 항목 → { lat, lng }. 좌표가 없으면 null.
export function toLatLng(item) {
  if (!item || typeof item.mapY !== "number" || typeof item.mapX !== "number") return null;
  if (Number.isNaN(item.mapY) || Number.isNaN(item.mapX)) return null;
  return { lat: item.mapY, lng: item.mapX };
}
