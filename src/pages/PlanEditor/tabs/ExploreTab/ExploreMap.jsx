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
export default function ExploreMap({
  items,
  center,
  categoryColor,
  hoveredId,
  onHoverItem,
  onSelectItem,
  addedIds,
  fallback,
}) {
  const points = useMemo(
    () => items.map((item) => ({ item, at: toLatLng(item) })).filter((p) => p.at),
    [items]
  );
  const bounds = useMemo(() => boundsOf(points.map((p) => p.at)), [points]);

  return (
    <KakaoMap className={styles.kakaoMap} center={center} bounds={bounds} fallback={fallback}>
      <MapZoomControl className={styles.zoomCluster} buttonClassName={styles.zoomBtn} />
      {points.map(({ item, at }) => {
        const hot = hoveredId === item.id;
        const inRoutine = addedIds.includes(item.id);
        return (
          <MapOverlay
            key={item.id}
            lat={at.lat}
            lng={at.lng}
            yAnchor={1}
            zIndex={hot ? 3 : inRoutine ? 2 : 1}
          >
            <MapMarker
              overlay
              label={item.name}
              color={hot || inRoutine ? "var(--terracotta)" : categoryColor}
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
