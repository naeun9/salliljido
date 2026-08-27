import CardThumb from "./CardThumb.jsx";
import styles from "./StayCard.module.css";

// design/salliljido.extracted.html 1052-1067줄. 예약은 외부 사이트로 연결되며
// design 원본부터 링크가 관광공사 대표 URL로 고정되어 있다(실제 개별 숙소
// 예약 링크는 API 연동 시 채워야 함).
export default function StayCard({ stay, hovered, onMouseEnter, onMouseLeave }) {
  return (
    <div
      className={`${styles.card} ${hovered ? styles.hovered : ""}`}
      data-listing-id={stay.id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardThumb item={stay} imageClass={styles.image} tagClass={styles.imageTag} />
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>{stay.name}</h3>
          <span className={styles.badge}>{stay.type}</span>
        </div>
        <div className={styles.location}>{stay.location}</div>
        <a
          href="https://www.visitkorea.or.kr"
          target="_blank"
          rel="noopener"
          className={styles.link}
        >
          예약 사이트에서 보기
          <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
            <path d="M4.6 2h6.4v6.4" stroke="#2F5D50" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="11" y1="2" x2="3.4" y2="9.6" stroke="#2F5D50" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M8.2 11H2V4.8" stroke="#2F5D50" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}
