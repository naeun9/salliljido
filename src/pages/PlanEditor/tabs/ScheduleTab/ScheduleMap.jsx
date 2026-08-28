import MapPlaceholder from "../../../../components/map/MapPlaceholder.jsx";
import RouteMap from "./RouteMap.jsx";
import styles from "./ScheduleMap.module.css";

// design/salliljido.extracted.html 971-1007줄, 2954-2963줄(pins/path/dist).
// 계획 생성 전에는 핀·경로·이동거리를 아예 안 그린다(items가 빈 배열).
// 지도는 별도 상태 없이 items(타임라인에서 파생)만 받아 그린다.
export default function ScheduleMap({ routineOn, items, stay, distance, center, mapLabel, selectedIndex, onSelect, onHover }) {
  const hasItems = items.length > 0;

  const emptyOverlay = !hasItems && (
    <div className={styles.emptyOverlay}>
      <div className={styles.emptyCard}>
        <p className={styles.emptyText}>
          {routineOn ? "이 날은 아직 일정이 없어요" : "계획을 만들면 하루 동선이 여기에 표시됩니다"}
        </p>
      </div>
    </div>
  );

  // 카카오맵 SDK를 못 불러올 때 쓰는 목업. "map · {라벨}" 태그와 동작하지
  // 않는 확대/축소 버튼은 목업에만 남는다(실제 지도에서는 태그가 카카오
  // 로고를 가리고, 버튼은 MapZoomControl로 진짜 동작한다).
  //
  // 핀과 경로선은 목업에 그리지 않는다 — 예전 x/y(%)는 실제 위치가 아니라
  // 지도 영역에 억지로 펼쳐 놓은 값이었고, 지도를 못 불러온 상황에서
  // 틀린 동선을 보여줄 이유가 없다.
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
      <div className={styles.mapBox}>
        <RouteMap
          items={items}
          stay={stay}
          center={center}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
          onHover={onHover}
          fallback={mockMap}
        />
        {emptyOverlay}
      </div>

      <div className={`${styles.meta} ${hasItems ? styles.visible : ""}`}>
        <span className={styles.distance}>오늘 이동 약 {distance}</span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} />
          내가 추가한 항목
        </span>
      </div>
    </div>
  );
}
