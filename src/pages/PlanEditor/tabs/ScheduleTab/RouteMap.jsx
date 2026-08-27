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
export default function RouteMap({ items, center, selectedIndex, onSelect, onHover, fallback }) {
  const points = useMemo(() => items.map((x) => x.at).filter(Boolean), [items]);
  const bounds = useMemo(
    () => (points.length ? boundsOf(points) : center ? boundsAround(center, 8000) : null),
    [points, center]
  );

  return (
    <KakaoMap className={styles.kakaoMap} center={center} bounds={bounds} fallback={fallback}>
      <MapZoomControl className={styles.zoomCluster} buttonClassName={styles.zoomBtn} />
      <MapPolyline points={points} />
      {items.map((item, i) => {
        if (!item.at) return null;
        const hot = item.hot || selectedIndex === i;
        return (
          <MapOverlay key={i} lat={item.at.lat} lng={item.at.lng} zIndex={hot ? 3 : 1}>
            <RouteMarker
              overlay
              num={i + 1}
              place={item.place}
              tag={item.tag}
              desc={item.desc}
              addr={item.addr}
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
