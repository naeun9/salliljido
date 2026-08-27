import { useEffect } from "react";
import { useMapContext } from "./KakaoMap.jsx";

// 지도 위 반경 원(kakao.maps.Circle). 최종 계획 화면의 "체류 범위"가 쓴다.
// 색·투명도는 목업 원(design 1521줄)의 값을 그대로 받는다.
export default function MapCircle({
  lat,
  lng,
  radius,
  strokeWeight = 1,
  strokeColor,
  strokeOpacity = 1,
  fillColor,
  fillOpacity = 1,
}) {
  const ctx = useMapContext();

  useEffect(() => {
    if (!ctx) return undefined;
    const { maps, map } = ctx;
    const circle = new maps.Circle({
      center: new maps.LatLng(lat, lng),
      radius,
      strokeWeight,
      strokeColor,
      strokeOpacity,
      strokeStyle: "solid",
      fillColor,
      fillOpacity,
    });
    circle.setMap(map);
    return () => circle.setMap(null);
  }, [ctx, lat, lng, radius, strokeWeight, strokeColor, strokeOpacity, fillColor, fillOpacity]);

  return null;
}
