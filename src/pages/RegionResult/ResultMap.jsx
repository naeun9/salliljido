import { useMemo } from "react";
import KakaoMap from "../../components/map/KakaoMap.jsx";
import MapOverlay from "../../components/map/MapOverlay.jsx";
import MapMarker from "../../components/map/MapMarker.jsx";
import { boundsOf } from "../../utils/geo.js";
import styles from "../RegionResult.module.css";

// 추천 결과 미니맵(실제 카카오맵). design 480-488줄.
// 추천된 지역 세 곳을 한 화면에 담고, 카드에 마우스를 올리면 해당 마커가
// 강조된다(반대 방향도 동작). 마커 모양·색·크기는 원본 그대로다.
export default function ResultMap({ recs, hoverIdx, onHover, fallback }) {
  const points = useMemo(() => recs.map((r) => ({ lat: r.lat, lng: r.lng })), [recs]);
  const bounds = useMemo(() => boundsOf(points, 20000), [points]);
  const center = points[0];

  if (!center) return fallback;

  return (
    <KakaoMap className={styles.kakaoMap} center={center} bounds={bounds} fallback={fallback}>
      {recs.map((r, i) => (
        <MapOverlay key={r.short} lat={r.lat} lng={r.lng} yAnchor={1} zIndex={hoverIdx === i ? 3 : 1}>
          <MapMarker
            label={r.short}
            color={hoverIdx === i ? "var(--terracotta)" : "var(--forest)"}
            size={hoverIdx === i ? "16px" : "11px"}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(-1)}
          />
        </MapOverlay>
      ))}
    </KakaoMap>
  );
}
