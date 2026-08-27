import styles from "./MapPlaceholder.module.css";

// 지도 목업 셸. 현재는 100% CSS(대각선 텍스처 배경)이고 실제 Kakao Map SDK
// 연동이 없다(docs/01-analysis.md §5). RegionResult 미니맵(480-488줄),
// 체류계획 사이드맵(971-990줄), 지도 확대 뷰(1446-1696줄) 3곳에서 이 셸을
// 재사용한다. children으로 MapMarker 등 핀을 넣어 쓴다.
export default function MapPlaceholder({ label, children, className, style }) {
  return (
    <div className={`${styles.map} ${className || ""}`} style={style}>
      {children}
      {label && <span className={styles.label}>map · {label}</span>}
    </div>
  );
}
