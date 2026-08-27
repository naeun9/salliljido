import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useMapContext } from "./KakaoMap.jsx";

// 지도 위 한 지점에 임의의 JSX를 얹는다(kakao.maps.CustomOverlay).
//
// 기본 마커(Marker + MarkerImage)를 쓰지 않는 이유: 원본 디자인의 핀은
// 카테고리 색 원, 번호가 든 초록 원, 라벨이 붙은 점처럼 제각각이라
// 이미지로 바꾸면 디자인이 그대로 유지되지 않는다. CustomOverlay에
// 우리 마크업을 그대로 넣으면 기존 CSS 모듈을 그대로 쓸 수 있다.
//
// children을 detached DOM에 포털로 그려서 넘긴다 — React가 계속 관리하므로
// 마커 안에서 상태·이벤트를 쓸 수 있다.
export default function MapOverlay({ lat, lng, xAnchor = 0.5, yAnchor = 0.5, zIndex = 0, children }) {
  const ctx = useMapContext();
  const node = useMemo(() => {
    const el = document.createElement("div");
    // 오버레이 컨테이너 자체는 크기를 갖지 않게 둔다(자식 마크업이 크기를 정한다).
    el.style.position = "relative";
    return el;
  }, []);

  useEffect(() => {
    if (!ctx) return undefined;
    const { maps, map } = ctx;
    const overlay = new maps.CustomOverlay({
      position: new maps.LatLng(lat, lng),
      content: node,
      xAnchor,
      yAnchor,
      zIndex,
    });
    overlay.setMap(map);
    return () => overlay.setMap(null);
  }, [ctx, node, lat, lng, xAnchor, yAnchor, zIndex]);

  if (!ctx) return null;
  return createPortal(children, node);
}
