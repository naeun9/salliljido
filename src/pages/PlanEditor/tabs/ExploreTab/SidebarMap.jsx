import MapPlaceholder from "../../../../components/map/MapPlaceholder.jsx";
import ExploreMap from "./ExploreMap.jsx";
import styles from "./SidebarMap.module.css";

// design/salliljido.extracted.html 1187-1223줄, 2641-2651줄(핀 색상/크기 계산).
// 지도는 실제 카카오맵(ExploreMap)이고, SDK를 못 불러오면 아래 목업으로
// 폴백한다. "map · {지역}" 태그와 죽은 확대/축소 버튼은 목업에만 남는다 —
// 실제 지도에서는 태그가 카카오 로고를 가리고, 버튼은 map.setLevel()에
// 연결된 진짜 버튼으로 바뀐다(components/map/MapZoomControl.jsx).
//
// 폴백 목업에는 핀을 찍지 않는다. 예전에는 좌표를 지도 영역 0~100%로
// 정규화해(toPercentCoords) 찍었는데, 그 값은 카테고리마다 따로 계산돼
// 서로 비교할 수 없는 가짜 상대 위치였다. 지도를 못 불러온 상황에서
// 틀린 위치를 보여주느니 셸만 남기는 편이 낫다고 판단했다.
//
// 에러 오버레이는 마크업만 옮긴 것이다 — 원본에서 mapError는 절대 true가
// 되지 않는 죽은 상태였다(3160-3161줄).
export default function SidebarMap({
  items,
  addedMarkers,
  center,
  categoryColor,
  hoveredId,
  onHoverItem,
  onSelectItem,
  addedIds,
  mapLabel,
  collapsed,
  onToggleCollapse,
  legend,
}) {
  const mockMap = (
    <MapPlaceholder label={mapLabel} style={{ height: "100%" }}>
      <div className={styles.zoomCluster}>
        <button type="button" aria-label="확대" className={styles.zoomBtn}>
          +
        </button>
        <button type="button" aria-label="축소" className={styles.zoomBtn}>
          −
        </button>
      </div>
    </MapPlaceholder>
  );

  return (
    <div className={styles.sidebar}>
      <div className={`${styles.mapBox} ${collapsed ? styles.collapsed : ""}`}>
        <ExploreMap
          items={items}
          addedMarkers={addedMarkers}
          center={center}
          categoryColor={categoryColor}
          hoveredId={hoveredId}
          onHoverItem={onHoverItem}
          onSelectItem={onSelectItem}
          addedIds={addedIds}
          fallback={mockMap}
        />
        <div className={styles.errorOverlay}>
          <span className={styles.errorIcon}>
            <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="9.5" stroke="#C05F33" strokeWidth="1.5" />
              <line
                x1="13"
                y1="8"
                x2="13"
                y2="14.5"
                stroke="#C05F33"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <line
                x1="13"
                y1="17.4"
                x2="13"
                y2="17.7"
                stroke="#C05F33"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div className={styles.errorTitle}>지도를 불러오지 못했어요</div>
          <p className={styles.errorBody}>잠시 후 다시 시도해 주세요</p>
          <button type="button" className={styles.retryBtn}>
            다시 시도
          </button>
        </div>
      </div>

      <div className={styles.handleRow}>
        <button type="button" className={styles.handleBtn} onClick={onToggleCollapse}>
          {collapsed ? "지도 펼치기" : "지도 접기"}
        </button>
      </div>

      <div className={styles.legend}>
        {legend.map((l) => (
          <span key={l.label} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
