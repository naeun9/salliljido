import styles from "./RouteMarker.module.css";

// design/salliljido.extracted.html 981-989줄. 번호 핀 + 클릭하면 열리는
// 정보 카드. ExploreTab의 MapMarker(라벨 필+점)와는 모양이 달라 그
// 컴포넌트를 억지로 재사용하지 않고 이 화면 전용으로 따로 만들었다.
// 위치는 CustomOverlay가 좌표로 잡는다. 여기서는 모양만 그린다.
export default function RouteMarker({
  num,
  place,
  tag,
  desc,
  addr,
  color,
  size,
  selected,
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
      <div className={`${styles.info} ${selected ? styles.open : ""}`}>
        <div className={styles.infoName}>{place}</div>
        <div className={styles.infoTag}>{tag}</div>
        <div className={styles.infoDesc}>{desc}</div>
        <div className={styles.infoAddr}>{addr}</div>
      </div>
      <span className={styles.num} style={{ width: size, height: size, background: color }}>
        {num}
      </span>
    </div>
  );
}
