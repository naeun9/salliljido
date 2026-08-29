import styles from "./Skeleton.module.css";

// 로딩 placeholder 바 하나(shimmer 애니메이션). design 여러 화면(결과 카드,
// 프로그램 목록 등)에서 폭/높이/모서리만 다르게 반복되는 shimmer 요소를
// 이 원자 컴포넌트로 조합해서 쓴다.
export default function Skeleton({ width, height, radius = 6, style }) {
  return (
    <div
      className={`${styles.bar} slj-anim-shimmer`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}
