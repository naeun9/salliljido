import { useMemo } from "react";
import KakaoMap from "../../components/map/KakaoMap.jsx";
import MapOverlay from "../../components/map/MapOverlay.jsx";
import MapCircle from "../../components/map/MapCircle.jsx";
import { boundsAround } from "../../utils/geo.js";
import styles from "./RegionGlance.module.css";

// design 1520-1532줄 "체류 범위" 지도. 목업(빗금 배경 + CSS 원 + 고정 위치
// 라벨)을 실제 카카오맵으로 바꾼 것으로, 컨테이너 크기·모서리·테두리와
// 원·핀의 색과 크기는 목업 CSS 값을 그대로 쓴다.
//
// 원본에 있던 클러스터 라벨 2개("{대표장소} 일대", "{지역}읍 일대")는
// 실제 지도에서는 그리지 않는다. 카카오 기본 지도가 이미 "태안군",
// "태안해안국립공원" 같은 실제 지명을 표시해 중복이고, 원본은 고정 %
// 좌표라 실제 위치가 없어서 데이터로 뽑으면 지역마다 0~2개로 들쭉날쭉했다.
// 중심 핀 + 반경 원 + 아래 문구만으로 "체류 범위"는 충분히 전달된다.
// 폴백(목업)에는 원본 그대로 남는다(RegionGlance.jsx).
//
// "map · 체류 범위" 태그도 같은 이유로 실제 지도에서는 빠진다 — 목업임을
// 알리는 표시이고, 좌하단 카카오 로고·축척 자리를 덮어 약관에 어긋난다.
const RANGE_RADIUS_M = 12000; // design 3349줄 "반경 약 12km"

export default function RegionGlanceMap({ region, fallback }) {
  const center = useMemo(() => ({ lat: region.lat, lng: region.lng }), [region.lat, region.lng]);
  const bounds = useMemo(() => boundsAround(center, RANGE_RADIUS_M), [center]);

  return (
    <KakaoMap className={styles.map} center={center} bounds={bounds} fallback={fallback}>
      <MapCircle
        lat={center.lat}
        lng={center.lng}
        radius={RANGE_RADIUS_M}
        strokeWeight={1}
        strokeColor="#2F5D50"
        strokeOpacity={0.35}
        fillColor="#4A7C6F"
        fillOpacity={0.16}
      />

      <MapOverlay lat={center.lat} lng={center.lng} zIndex={3}>
        <span className={styles.centerPinInner}>
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M3 8.2 9 3.2l6 5V15H3z" stroke="#FFFDFA" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </span>
      </MapOverlay>
    </KakaoMap>
  );
}
