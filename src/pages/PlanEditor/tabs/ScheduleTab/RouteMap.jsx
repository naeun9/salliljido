import { useMemo } from "react";
import KakaoMap from "../../../../components/map/KakaoMap.jsx";
import MapOverlay from "../../../../components/map/MapOverlay.jsx";
import MapPolyline from "../../../../components/map/MapPolyline.jsx";
import MapZoomControl from "../../../../components/map/MapZoomControl.jsx";
import RouteMarker from "./RouteMarker.jsx";
import { boundsOf, boundsAround } from "../../../../utils/geo.js";
import styles from "./ScheduleMap.module.css";

// 체류 계획 탭 사이드 지도(실제 카카오맵). design 971-1007줄.
// 번호 핀·정보 카드 모양은 RouteMarker가 그대로 들고 있고, 여기서는 위치와
// 경로선만 실제 좌표로 준다. 목업의 SVG 점선 polyline은
// kakao.maps.Polyline으로 바뀌었다(색·굵기·투명도는 그대로).
export default function RouteMap({ items, stay, center, selectedIndex, onSelect, onHover, fallback }) {
  const points = useMemo(() => items.map((x) => x.at).filter(Boolean), [items]);
  // 숙소는 경로선·이동거리에서 빼고 지도 범위에만 포함한다. 매일 오가는
  // 곳이라 동선에 끼우면 하루 이동 거리가 왜곡된다.
  const stayAt = stay && stay.at ? stay.at : null;
  const bounds = useMemo(
    () => {
      const all = stayAt ? points.concat([stayAt]) : points;
      return all.length ? boundsOf(all) : center ? boundsAround(center, 8000) : null;
    },
    [points, stayAt, center]
  );

  return (
    <KakaoMap className={styles.kakaoMap} center={center} bounds={bounds} fallback={fallback}>
      <MapZoomControl className={styles.zoomCluster} buttonClassName={styles.zoomBtn} />
      <MapPolyline points={points} />

      {/* 그날 묵는 숙소. 번호 핀·경로선과 분리해 집 아이콘으로 둔다. */}
      {stayAt && (
        <MapOverlay lat={stayAt.lat} lng={stayAt.lng} zIndex={2}>
          <span className={styles.stayPin} title={stay.place}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M3 8.2 9 3.2l6 5V15H3z" stroke="#FFFDFA" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </span>
        </MapOverlay>
      )}
      {items.map((item, i) => {
        if (!item.at) return null;
        const hot = item.hot || selectedIndex === i;
        return (
          <MapOverlay key={i} lat={item.at.lat} lng={item.at.lng} zIndex={hot ? 3 : 1}>
            <RouteMarker
              num={i + 1}
              color={item.mine || hot ? "var(--terracotta)" : "var(--forest)"}
              size={hot ? "48px" : "38px"}
              selected={selectedIndex === i}
              onClick={() => onSelect(i)}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(-1)}
            />
          </MapOverlay>
        );
      })}
    </KakaoMap>
  );
}
