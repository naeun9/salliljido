import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useKakaoMaps } from "../../hooks/useKakaoMaps.js";
import { useNarrowScreen } from "../../hooks/useNarrowScreen.js";

// 공통 지도 기반 컴포넌트.
//
// 화면마다 요구가 달라서(둘러보기=카테고리 마커, 체류 계획=번호 마커+경로선,
// 최종 계획=체류 범위) 이 컴포넌트는 "지도 인스턴스를 만들고 크기를 잡는
// 일"만 한다. 그 위에 무엇을 얹을지는 children으로 받는다 —
// MapOverlay(핀)·MapCircle 같은 조각을 화면별 래퍼가 조합한다.
//
// 컨테이너 크기·모서리·테두리는 className으로 각 화면의 CSS를 그대로
// 받는다. 목업 지도와 같은 자리·같은 비율을 유지하기 위해서다
// (CLAUDE.md 디자인 보존).

const MapContext = createContext(null);

export function useMapContext() {
  return useContext(MapContext);
}

export default function KakaoMap({
  center,
  level = 8,
  // 주어지면 level 대신 이 범위에 맞춘다({ sw:{lat,lng}, ne:{lat,lng} }).
  // 반경 원처럼 "이만큼은 보여야 하는" 경우에 확대 수준을 직접 고르는
  // 것보다 정확하다.
  bounds,
  className,
  draggable = true,
  zoomable = true,
  fallback = null,
  children,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);
  const { maps, status } = useKakaoMaps();

  // 모바일에서는 지도를 끌 수 없게 한다. 지도가 화면 폭을 다 차지해서
  // 한 손가락 드래그를 지도가 먼저 가져가면 페이지를 스크롤할 수 없다.
  // 확대·축소는 원본 디자인의 +/− 버튼(MapZoomControl)으로 그대로 된다.
  //
  // draggable:false만으로는 부족하다 — 카카오맵이 자기 내부 div에
  // touch-action:none을 인라인으로 박아 세로 스와이프까지 삼킨다.
  // data-map-drag="off"를 달아 두면 global.css가 그 인라인 값을 덮어
  // 세로 스와이프를 브라우저 스크롤로 넘긴다.
  const narrow = useNarrowScreen();
  const canDrag = draggable && !narrow;

  // 지도 인스턴스 생성(한 번만).
  useEffect(() => {
    if (status !== "ready" || !containerRef.current || mapRef.current) return;
    const map = new maps.Map(containerRef.current, {
      center: new maps.LatLng(center.lat, center.lng),
      level,
      draggable: canDrag,
      scrollwheel: zoomable,
    });
    if (!zoomable) map.setZoomable(false);
    mapRef.current = map;
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, maps, center.lat, center.lng, level, zoomable]);

  // 화면 폭이 바뀌면(회전 등) 드래그 가능 여부도 따라간다.
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.setDraggable(canDrag);
  }, [ready, canDrag]);

  // 중심·확대 수준이 바뀌면 인스턴스를 다시 만들지 않고 옮긴다.
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.setCenter(new maps.LatLng(center.lat, center.lng));
  }, [ready, maps, center.lat, center.lng]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    if (bounds) {
      const { sw, ne } = bounds;
      mapRef.current.setBounds(new maps.LatLngBounds(new maps.LatLng(sw.lat, sw.lng), new maps.LatLng(ne.lat, ne.lng)));
      return;
    }
    mapRef.current.setLevel(level);
  }, [ready, maps, level, bounds]);

  // 컨테이너가 숨겨진 상태(탭 전환 등)에서 만들어지면 타일이 깨지므로
  // 다시 보일 때 크기를 다시 잡아 준다.
  useEffect(() => {
    if (!ready || !containerRef.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const map = mapRef.current;
      if (!map) return;
      const c = map.getCenter();
      map.relayout();
      map.setCenter(c);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [ready]);

  // SDK를 못 불러오면 화면이 비지 않도록 각 화면이 준 목업을 그대로 쓴다.
  if (status === "error") return fallback;

  return (
    <div ref={containerRef} className={className} data-map-drag={canDrag ? "on" : "off"}>
      {ready && <MapContext.Provider value={{ maps, map: mapRef.current }}>{children}</MapContext.Provider>}
    </div>
  );
}
