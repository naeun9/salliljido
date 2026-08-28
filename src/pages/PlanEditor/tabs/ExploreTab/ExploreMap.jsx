import { useMemo } from "react";
import KakaoMap from "../../../../components/map/KakaoMap.jsx";
import MapOverlay from "../../../../components/map/MapOverlay.jsx";
import MapZoomControl from "../../../../components/map/MapZoomControl.jsx";
import MapMarker from "../../../../components/map/MapMarker.jsx";
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
// 둘이 구분되지 않았다. 담은 곳은 카테고리와 겹치지 않는 진한 초록으로
// 옮기고 체크 배지를 함께 둔다(범례도 같은 색으로 맞춘다).
export const ADDED_MARKER_COLOR = "#1F6F4A";

export default function ExploreMap({
  items,
  addedMarkers = [],
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

  return (
    <KakaoMap className={styles.kakaoMap} center={center} bounds={bounds} fallback={fallback}>
      <MapZoomControl className={styles.zoomCluster} buttonClassName={styles.zoomBtn} />
      {points.map(({ item, at }) => {
        const hot = hoveredId === item.id;
        const inRoutine = addedIds.includes(item.id);
        const color = inRoutine ? ADDED_MARKER_COLOR : hot ? "var(--terracotta)" : categoryColor;
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
              color={color}
              size={hot ? "24px" : inRoutine ? "21px" : "16px"}
              showLabel={hot}
              checked={inRoutine}
              dotBorder="3px solid #FFFDFA"
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
