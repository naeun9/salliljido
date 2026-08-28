import { ALL_CUISINES } from "../../../../services/routineGenerator.js";
import styles from "./TimelineItem.module.css";

// design/salliljido.extracted.html 899-943줄, 2900-2953줄(카드 장식 계산).
export default function TimelineItem({
  item,
  showSlotLabel,
  hot,
  cuisine,
  onSelect,
  onHoverEnter,
  onHoverLeave,
  onInsertBefore,
  onSwap,
  onDelete,
  onEditTime,
  onSetCuisine,
  cuisineMenuOpen,
  availableMeals,
  onToggleCuisineMenu,
}) {
  const border = hot ? "#4A7C6F" : "#E7E2D8";
  const accent = item.custom ? "4px solid #D9784E" : item.mine ? "4px solid #EBB98F" : `1px solid ${border}`;
  const cardBg = item.isRest ? "#F7F5F0" : item.mine ? "#FFFFFF" : "#FFFDFA";
  const swapLabel = item.custom ? "수정" : item.isDinner ? "다른 식당 보기" : "다른 곳 보기";

  return (
    <>
      <div className={styles.gap}>
        <span className={styles.gapLine} />
        <button
          type="button"
          className={styles.gapBtn}
          aria-label="여기에 일정 추가"
          onClick={onInsertBefore}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <line x1="8" y1="3" x2="8" y2="13" stroke="#C05F33" strokeWidth="1.7" strokeLinecap="round" />
            <line x1="3" y1="8" x2="13" y2="8" stroke="#C05F33" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
        <span className={styles.gapLine} />
      </div>

      <div className={styles.row} onMouseEnter={onHoverEnter} onMouseLeave={onHoverLeave} onClick={onSelect}>
        <div className={styles.slotCol}>
          {showSlotLabel && (
            <div className={styles.slotLabel} style={{ color: item.mine ? "#D9784E" : "#2F5D50" }}>
              {item.slot}
            </div>
          )}
          <div className={styles.slotTime}>{item.time}</div>
        </div>

        <div
          className={styles.card}
          style={{ border: `1px solid ${border}`, borderLeft: accent, background: cardBg }}
        >
          <div className={styles.body}>
            <div className={styles.head}>
              <h3 className={styles.place}>{item.place}</h3>
              <span
                className={styles.tag}
                style={{
                  background: item.mine ? "#F5E1D5" : "#DCE8E2",
                  color: item.mine ? "#C05F33" : "#2F5D50",
                }}
              >
                {item.tag}
              </span>
            </div>
            <p className={styles.desc}>{item.desc}</p>

            <div className={styles.actions}>
              {item.isDinner && !item.custom && (
                <div className={styles.cuisineWrap}>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${hot ? styles.hot : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCuisineMenu();
                    }}
                  >
                    음식 종류 바꾸기
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 4.2 6 7.8l3.5-3.6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className={`${styles.cuisineMenu} ${cuisineMenuOpen ? styles.open : ""}`}>
                    {/* 조건 패널의 음식 칩과 같은 규칙: 그 지역에 후보가
                        없는 분류는 흐리게(opacity .45) 두고 못 고르게 한다. */}
                    {ALL_CUISINES.map((c) => {
                      const usable = !availableMeals || availableMeals.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          className={`${styles.cuisineOption} ${c === cuisine ? styles.active : ""}`}
                          style={usable ? undefined : { opacity: 0.45, cursor: "not-allowed" }}
                          disabled={!usable}
                          title={usable ? undefined : `이 지역에는 ${c} 정보가 없어요`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetCuisine(c);
                          }}
                        >
                          {c}
                        </button>
                      );
                    })}
                    <span className={styles.cuisineNote}>이 날만 바뀝니다</span>
                  </div>
                </div>
              )}

              {/* 시간 수정. design에는 "직접 입력" 일정에만 시간 입력이
                  있었는데, 자동 배정된 시간(특히 담은 체험의 14:00)을 고칠
                  방법이 없어 모든 항목에 붙였다. 직접 입력 일정은 기존
                  "수정"이 시간까지 다루므로 여기서는 뺀다. */}
              {!item.custom && (
                <button
                  type="button"
                  className={`${styles.actionBtn} ${hot ? styles.hot : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTime();
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
                    <path
                      d="M8 4.6V8l2.4 1.6"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  시간
                </button>
              )}

              <button
                type="button"
                className={`${styles.actionBtn} ${hot ? styles.hot : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSwap();
                }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 6a5 5 0 0 1 8.6-2.6M14 10a5 5 0 0 1-8.6 2.6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10.6 1.4v2.6h-2.6M5.4 14.6V12h2.6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {swapLabel}
              </button>

              {item.custom && (
                <button
                  type="button"
                  className={styles.deleteBtn + " " + styles.visible}
                  aria-label="일정 삭제"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 15 16" fill="none">
                    <path
                      d="M2.5 4.5h10M6 2.2h3M3.8 4.5l.6 9h6.2l.6-9"
                      stroke="#6E6E68"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          {(item.custom || item.mine) && (
            <span className={styles.mineBadge + " " + styles.visible}>
              {item.custom ? "직접 입력" : "직접 추가"}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
