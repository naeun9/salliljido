import { useEffect } from "react";
import { useMapContext } from "./KakaoMap.jsx";

// 지도 위 경로선(kakao.maps.Polyline). 체류 계획 탭의 하루 동선이 쓴다.
// 목업은 SVG polyline에 점선(strokeDasharray "2 2", opacity .55)이었고,
// 카카오 Polyline도 같은 색·굵기·점선으로 맞춘다.
export default function MapPolyline({
  points,
  strokeWeight = 2,
  strokeColor = "#4A7C6F",
  strokeOpacity = 0.55,
  strokeStyle = "shortdash",
}) {
  const ctx = useMapContext();

  useEffect(() => {
    if (!ctx || !points || points.length < 2) return undefined;
    const { maps, map } = ctx;
    const line = new maps.Polyline({
      path: points.map((p) => new maps.LatLng(p.lat, p.lng)),
      strokeWeight,
      strokeColor,
      strokeOpacity,
      strokeStyle,
    });
    line.setMap(map);
    return () => line.setMap(null);
  }, [ctx, points, strokeWeight, strokeColor, strokeOpacity, strokeStyle]);

  return null;
}
