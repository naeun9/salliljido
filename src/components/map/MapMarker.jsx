import styles from "./MapMarker.module.css";

// 지도 목업 위 핀 하나 (라벨 필 + 원형 점, 선택적 체크 배지).
// design 482-485줄(RegionResult, 라벨 항상 표시·보더 2px)과
// 1194-1201줄(ExploreTab, 라벨은 hover할 때만 표시·보더 3px+그림자·체크
// 배지)의 점 스타일이 살짝 달라 dotBorder/dotShadow로 값만 바꿔 쓴다.
// 위치는 CustomOverlay(components/map/MapOverlay.jsx)가 좌표로 잡는다.
// 이 컴포넌트는 모양만 그린다.
export default function MapMarker({
  label,
  // 라벨 아래 한 줄 더(숙박은 담긴 기간 "1~5일차"). 없으면 안 그린다.
  subLabel,
  color,
  size = "11px",
  showLabel = true,
  checked = false,
  dotBorder = "2px solid #FFFDFA",
  dotShadow = "none",
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  return (
    <div
      className={styles.markerBase}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {showLabel && (
        <span className={styles.pill} style={{ background: color }}>
          {label}
          {subLabel && <span className={styles.pillSub}>{subLabel}</span>}
        </span>
      )}
      <span className={styles.dotWrap} style={{ width: size, height: size }}>
        <span className={styles.dot} style={{ background: color, border: dotBorder, boxShadow: dotShadow }} />
        {/* 체크 배지 테두리·아이콘 색을 마커 색과 맞춘다. design은
            테라코타 고정이었는데, 담은 곳 마커가 초록으로 바뀌면서
            배지만 주황으로 남으면 어긋나 보인다. */}
        {checked && (
          <span className={styles.check} style={{ borderColor: color }}>
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
              <path
                d="M2 7l3 3 6-6.5"
                stroke={color}
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </span>
    </div>
  );
}
