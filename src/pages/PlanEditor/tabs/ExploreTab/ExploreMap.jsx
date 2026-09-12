import { useEffect, useMemo, useState } from "react";
import KakaoMap from "../../../../components/map/KakaoMap.jsx";
import MapOverlay from "../../../../components/map/MapOverlay.jsx";
import MapZoomControl from "../../../../components/map/MapZoomControl.jsx";
import MapMarker from "../../../../components/map/MapMarker.jsx";
import MapPolyline from "../../../../components/map/MapPolyline.jsx";
import { boundsOf, toLatLng } from "../../../../utils/geo.js";
import styles from "./SidebarMap.module.css";

// 둘러보기 탭 사이드 지도(실제 카카오맵). design 1187-1223줄의 핀 스타일·
// 크기·색은 MapMarker가 그대로 들고 있고, 여기서는 위치만 실제 좌표로 준다.
//
// 지도 범위: 목록의 좌표 전체를 담도록 맞춘다. 목업이 toPercentCoords로
// 하던 것(그 카테고리 경계에 맞춰 핀을 펼치기)과 결과가 같아서, 카테고리를
// 바꿔도 원본과 같은 느낌으로 핀이 화면에 꽉 찬다.
//
// 담은 곳 마커 색. design은 "내 계획에 추가됨"을 테라코타(#D9784E)로
// 썼는데(1223줄 범례), 체험 프로그램 카테고리 색과 같은 주황이라 지도에서
// 둘이 구분되지 않았다. 그래서 진한 초록(#1F6F4A)으로 옮겼는데 이번에는
// 숙박(#2F5D50)·주변 관광지(#4A7C6F)와 같은 초록 계열인 데다 지도 바탕도
// 녹색이라 "담았다"는 표시가 묻혔다.
//
// 카테고리 다섯 색이 초록 둘·청록·갈색·주황을 이미 쓰고 있어서, 어느 것과도
// 겹치지 않는 골드로 옮긴다. 지도 바탕(연녹·베이지)에서 가장 먼저 눈에
// 들어오는 색이다. 범례도 이 값을 그대로 쓴다.
export const ADDED_MARKER_COLOR = "#E0A32E";

// 담은 곳만 테두리를 크림 대신 잉크로 준다. 나머지 마커는 전부 크림
// 테두리라, 테두리만 봐도 담은 곳이 구분된다 — 색약이 있어도 형태 차이로
// 읽힌다. 체크 배지의 선도 같은 잉크를 써야 골드 위에서 또렷하다.
export const ADDED_MARKER_BORDER = "#2B2B29";

// 걷기 코스 경로선. 색은 카테고리 색(청록)을 그대로 쓰고, 체류 계획 탭의
// 하루 동선과는 선 모양으로 가른다 — 그쪽은 점선(shortdash)이고 코스는
// 실선이다. 같은 지도에 둘이 같이 나와도 무엇이 길이고 무엇이 이동인지
// 헷갈리지 않는다.
const COURSE_LINE_COLOR = "#3F7D8C";
// 강조하지 않을 때는 옅게 깔아 두고, 카드에 마우스를 올린 코스만 진하게
// 띄운다. 12개를 같은 굵기로 그리면 어느 선이 어느 코스인지 알 수 없다.
const LINE_IDLE = { weight: 3, opacity: 0.45 };
const LINE_HOT = { weight: 5, opacity: 0.95 };
const LINE_MUTED = { weight: 2, opacity: 0.15 };

// 카드에 마우스를 올린 뒤 지도를 옮기기까지 기다리는 시간. 목록을 훑을
// 때마다 지도가 따라 움직이면 어지러워서, 한 카드에 잠깐 머무를 때만
// 그 코스로 맞춘다.
const HOVER_FIT_DELAY_MS = 300;
// 코스 범위에 두는 여백(m). 딱 맞게 잡으면 선이 지도 가장자리에 붙는다.
const COURSE_FIT_PAD = 700;

export default function ExploreMap({
  items,
  // 걷기 코스를 보고 있을 때만 채워진다. 다른 카테고리에서는 빈 배열이라
  // 선이 그려지지 않는다.
  coursePaths = [],
  addedMarkers = [],
  // { [숙소id]: "1~5일차" } — 담긴 숙소만 기간을 라벨에 함께 보여 준다.
  markerSubLabels = {},
  center,
  categoryColor,
  hoveredId,
  onHoverItem,
  onSelectItem,
  addedIds,
  fallback,
}) {
  // 지금 페이지 항목 + 담은 곳(카테고리가 달라도). id가 겹치면 한 번만.
  const points = useMemo(() => {
    const seen = new Set();
    return items
      .concat(addedMarkers)
      .map((item) => ({ item, at: toLatLng(item) }))
      .filter((p) => {
        if (!p.at || seen.has(p.item.id)) return false;
        seen.add(p.item.id);
        return true;
      });
  }, [items, addedMarkers]);
  const bounds = useMemo(() => boundsOf(points.map((p) => p.at)), [points]);

  // 잠깐 머문 코스 하나만 지도에 꽉 채운다. hoveredId를 그대로 쓰지 않고
  // 0.3초 늦춰 받는다 — 카드 위를 스치기만 해도 지도가 튀지 않게.
  const [fitId, setFitId] = useState(null);
  useEffect(() => {
    if (!hoveredId) {
      setFitId(null);
      return undefined;
    }
    const timer = setTimeout(() => setFitId(hoveredId), HOVER_FIT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hoveredId]);

  // 머문 코스의 경로 전체가 보이는 범위. 코스가 아니거나(마커만 있는 항목)
  // 경로를 못 받았으면 null이라 전체 범위를 그대로 쓴다.
  const fitBounds = useMemo(() => {
    if (!fitId) return null;
    const hit = coursePaths.find((c) => c.id === fitId);
    return hit ? boundsOf(hit.path, COURSE_FIT_PAD) : null;
  }, [fitId, coursePaths]);

  return (
    <KakaoMap className={styles.kakaoMap} center={center} bounds={fitBounds || bounds} fallback={fallback}>
      <MapZoomControl className={styles.zoomCluster} buttonClassName={styles.zoomBtn} />

      {/* 코스 경로. 마커보다 먼저 그려야 선 위에 마커가 얹힌다. */}
      {coursePaths.map((c) => {
        const hot = hoveredId === c.id;
        const dimmed = hoveredId && !hot;
        const style = hot ? LINE_HOT : dimmed ? LINE_MUTED : LINE_IDLE;
        return (
          <MapPolyline
            key={c.id}
            points={c.path}
            strokeColor={COURSE_LINE_COLOR}
            strokeWeight={style.weight}
            strokeOpacity={style.opacity}
            strokeStyle="solid"
          />
        );
      })}

      {points.map(({ item, at }) => {
        const hot = hoveredId === item.id;
        const inRoutine = addedIds.includes(item.id);
        const color = inRoutine ? ADDED_MARKER_COLOR : hot ? "var(--terracotta)" : categoryColor;
        // 담은 숙소는 라벨에 기간("1~5일차")이 한 줄 더 붙는다.
        // 라벨을 항상 띄워도 봤는데, 가까운 숙소 둘을 담으면 라벨끼리 겹쳐
        // 읽기 어려웠다(태안 갯벌부흥펜션·골든코스트). design대로 hover에서만
        // 띄우고, 그때 기간이 함께 보이게 한다.
        const stayRange = markerSubLabels[item.id];
        return (
          <MapOverlay
            key={item.id}
            lat={at.lat}
            lng={at.lng}
            yAnchor={1}
            zIndex={hot ? 3 : inRoutine ? 2 : 1}
          >
            <MapMarker
              label={item.name}
              subLabel={stayRange}
              color={color}
              size={hot ? "24px" : inRoutine ? "21px" : "16px"}
              showLabel={hot}
              checked={inRoutine}
              checkColor={inRoutine ? ADDED_MARKER_BORDER : undefined}
              dotBorder={inRoutine ? `3px solid ${ADDED_MARKER_BORDER}` : "3px solid #FFFDFA"}
              dotShadow="0 4px 10px -6px rgba(43,43,41,.55)"
              onClick={() => onSelectItem(item.id)}
              onMouseEnter={() => onHoverItem(item.id)}
              onMouseLeave={() => onHoverItem(null)}
            />
          </MapOverlay>
        );
      })}
    </KakaoMap>
  );
}
