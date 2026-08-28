import CardThumb from "./CardThumb.jsx";
import styles from "./SpotCard.module.css";

// design/salliljido.extracted.html 1125-1137줄. 원본은 액션 버튼 없이 정보만
// 보여줬는데, 네 카테고리 모두 계획에 담을 수 있게 열면서 식당·카페 카드와
// 같은 모양의 담기 버튼을 붙였다.
export default function SpotCard({
  spot,
  hovered,
  onMouseEnter,
  onMouseLeave,
  saved,
  onToggleSave,
  readOnly = false,
}) {
  return (
    <div
      className={`${styles.card} ${hovered ? styles.hovered : ""}`}
      data-listing-id={spot.id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardThumb
        item={spot}
        imageClass={styles.image}
        tagClass={styles.imageTag}
      />
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>{spot.name}</h3>
          <span className={styles.badge}>{spot.type}</span>
        </div>
        <p className={styles.desc}>{spot.desc}</p>
        {/* 계획 없이 둘러보는 화면에서는 담기를 감춘다(readOnly). */}
        {!readOnly && (
          <button
            type="button"
            className={`${styles.saveBtn} ${saved ? styles.on : ""}`}
            onClick={onToggleSave}
          >
            {saved && (
              <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
                <path
                  d="M2 7l3 3 6-6.5"
                  stroke="#2F5D50"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {saved ? "추가됨" : "계획에 추가"}
          </button>
        )}
      </div>
    </div>
  );
}
