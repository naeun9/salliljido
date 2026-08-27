import TimelineItem from "./TimelineItem.jsx";
import styles from "./Timeline.module.css";

// design/salliljido.extracted.html 879-961줄. rtEmptySlots(빈 슬롯 채우기
// 버튼)는 옮기지 않았다 — 오전/오후/저녁이 항상 자동 생성으로 채워져
// 원본에서도 실제로는 절대 나타날 수 없는 자리였다(완료 보고 참고).
export default function Timeline({
  day,
  dayTitle,
  dayTheme,
  items,
  hoveredIndex,
  selectedIndex,
  cuisine,
  cuisineMenuOpen,
  availableMeals,
  showHint,
  onCloseHint,
  onHoverItem,
  onSelectItem,
  onInsertBefore,
  onSwapItem,
  onDeleteCustom,
  onSetCuisine,
  onToggleCuisineMenu,
}) {
  let lastSlot = null;

  return (
    <div>
      <div className={styles.head}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{dayTitle}</h2>
          <span className={styles.themeBadge}>{dayTheme}</span>
        </div>
        <button type="button" className={styles.addBtn} onClick={() => onInsertBefore("저녁")}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <line x1="8" y1="3" x2="8" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          일정 추가
        </button>
      </div>

      <div className={`${styles.hint} ${showHint ? styles.visible : ""}`}>
        <p className={styles.hintText}>
          오전·오후·저녁 큰 틀만 잡아드렸어요. 사이사이에 원하는 일정을 직접 추가해보세요.
        </p>
        <button type="button" className={styles.hintClose} aria-label="안내 닫기" onClick={onCloseHint}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <line x1="2" y1="2" x2="10" y2="10" stroke="#2F5D50" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="2" x2="2" y2="10" stroke="#2F5D50" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className={styles.list}>
        {items.map((item, i) => {
          const showSlotLabel = item.slot !== lastSlot;
          lastSlot = item.slot;
          const hot = hoveredIndex === i || selectedIndex === i;
          return (
            <TimelineItem
              key={item.custom ? item.cid : `${item.slot}-${i}`}
              item={item}
              showSlotLabel={showSlotLabel}
              hot={hot}
              cuisine={cuisine}
              cuisineMenuOpen={item.isDinner && cuisineMenuOpen}
              availableMeals={availableMeals}
              onSelect={() => onSelectItem(i)}
              onHoverEnter={() => onHoverItem(i)}
              onHoverLeave={() => onHoverItem(-1)}
              onInsertBefore={() => onInsertBefore(item.slot)}
              onSwap={() => onSwapItem(item, i)}
              onDelete={() => onDeleteCustom(item.cid)}
              onSetCuisine={onSetCuisine}
              onToggleCuisineMenu={onToggleCuisineMenu}
            />
          );
        })}
        <div className={styles.gap}>
          <span className={styles.gapLine} />
          <button
            type="button"
            className={styles.gapBtn}
            aria-label="마지막에 일정 추가"
            onClick={() => onInsertBefore("저녁")}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="3" x2="8" y2="13" stroke="#C05F33" strokeWidth="1.7" strokeLinecap="round" />
              <line x1="3" y1="8" x2="13" y2="8" stroke="#C05F33" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
          <span className={styles.gapLine} />
        </div>
      </div>
    </div>
  );
}
