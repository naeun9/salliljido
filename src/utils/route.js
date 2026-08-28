// 하루 일정에서 지도 표시용 값(핀·이동거리)을 뽑아낸다.
// design/salliljido.extracted.html detailVals()의 rtPins/rtPath/rtDistance.
import { pathLength, toLatLng } from "./geo.js";

// 타임라인 항목 → 지도 핀. hover/선택 상태는 화면 쪽 관심사라 여기서
// 다루지 않고, 호출하는 쪽에서 hot 플래그를 얹는다.
//
// at은 실제 위경도다. 직접 입력한 일정처럼 좌표가 없는 항목은 null이고
// 지도에 찍지 않는다(장소명을 사용자가 자유롭게 적는 자리라 좌표가 없다).
export function buildRoutePins(items) {
  return items.map((s) => ({
    at: toLatLng(s),
    place: s.place,
    tag: s.tag,
    desc: s.desc,
    addr: s.addr,
    mine: s.mine,
  }));
}

// 일정 목록의 실제 이동 거리(m).
//
// 예전에는 design의 공식(`일정 수 × 3.8 + (일차 % 3) × 1.4`)을 그대로 썼다.
// 좌표가 없던 시절 그럴듯한 숫자를 만들어 내던 가짜 값이라, 실제 좌표가
// 생긴 지금은 지점들을 순서대로 이은 직선 거리 합으로 바꿨다.
// (도로 경로가 아니라 직선 합이므로 실제 이동 거리보다는 짧게 나온다 —
//  화면 문구도 원본 그대로 "이동 약 N"이다.)
//
// 지도 핀(at)과 타임라인 항목(mapX/mapY) 양쪽을 다 받는다.
function routeDistanceMeters(items) {
  const points = (items || []).map((s) => s.at || toLatLng(s)).filter(Boolean);
  return points.length < 2 ? 0 : pathLength(points);
}

function formatDistance(meters) {
  if (!meters) return "0km";
  if (meters < 1000) return "1km 미만";
  return `${Math.round(meters / 1000)}km`;
}

// 하루 동선(체류 계획 탭).
export function routeDistanceLabel(items) {
  return formatDistance(routeDistanceMeters(items));
}

// 체류 전체 이동 거리(최종 계획 화면). 하루씩 따로 재서 더한다 —
// 어제 마지막 장소에서 오늘 첫 장소로 가는 이동은 숙소로 돌아갔다
// 나오는 것이라 하루 동선에 넣지 않는다.
export function totalRouteDistanceLabel(days) {
  const total = (days || []).reduce(
    (sum, d) => sum + routeDistanceMeters(d.cells.flatMap((c) => c.items)),
    0
  );
  return formatDistance(total);
}
