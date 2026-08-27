import CardThumb from "./CardThumb.jsx";
import styles from "./SpotCard.module.css";

// design/salliljido.extracted.html 1125-1137줄. 액션 버튼 없이 정보만 보여준다(원본 그대로).
export default function SpotCard({ spot, hovered, onMouseEnter, onMouseLeave }) {
  return (
    <div
      className={`${styles.card} ${hovered ? styles.hovered : ""}`}
      data-listing-id={spot.id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardThumb item={spot} imageClass={styles.image} tagClass={styles.imageTag} />
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>{spot.name}</h3>
          <span className={styles.badge}>{spot.type}</span>
        </div>
        <p className={styles.desc}>{spot.desc}</p>
      </div>
    </div>
  );
}
