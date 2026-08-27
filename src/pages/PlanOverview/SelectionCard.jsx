import styles from "./SelectionCard.module.css";

// design/salliljido.extracted.html 1684-1694줄. 전체 일정에서 항목을
// 누르면 우하단에 떠오르는 상세 카드(ovSel).
export default function SelectionCard({ selection, onEdit, onClose }) {
  if (!selection) return null;

  const { day, slot, time, place, tag, desc, addr } = selection;

  return (
    <div className={styles.card} data-print-hide>
      <div className={styles.meta}>
        {day}일차 · {slot} {time || ""}
      </div>
      <div className={styles.place}>{place}</div>
      <span className={styles.tag}>{tag}</span>
      <p className={styles.desc}>{desc}</p>
      <div className={styles.addr}>{addr}</div>
      <div className={styles.actions}>
        <button type="button" className={styles.editBtn} onClick={onEdit}>
          루틴 편집으로
        </button>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
