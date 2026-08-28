import CardThumb from "./CardThumb.jsx";
import styles from "./UtilCard.module.css";

// design/salliljido.extracted.html 1148-1163줄. design의 "가보고 싶어요"
// 토글은 문구만 "계획에 추가"로 바꿨다(네 카테고리 담기 문구 통일).
// 원래 주석:
// PlanContext.savedUtilities(design liWish)로 담는다.
export default function UtilCard({
  util,
  saved,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onToggleWish,
  readOnly = false,
}) {
  return (
    <div
      className={`${styles.card} ${hovered ? styles.hovered : ""}`}
      data-listing-id={util.id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardThumb
        item={util}
        imageClass={styles.image}
        tagClass={styles.imageTag}
      />
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>{util.name}</h3>
          <span className={styles.badge}>{util.type}</span>
        </div>
        <p className={styles.note}>{util.note}</p>
        {/* 계획 없이 둘러보는 화면에서는 담기를 감춘다(readOnly). */}
        {!readOnly && (
          <button
            type="button"
            className={`${styles.wishBtn} ${saved ? styles.on : ""}`}
            onClick={onToggleWish}
          >
            {saved && (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2.5 7.5l3 3 6-6.5"
                  stroke="#2F5D50"
                  strokeWidth="1.8"
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
