import styles from "./ProgramFilter.module.css";

// 지역/상태 필터 칩 + 정렬 버튼. design/salliljido.extracted.html 1706-1732줄.
function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${active ? styles.chipActive : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function ProgramFilter({
  regionOptions,
  statusOptions,
  regionFilter,
  statusFilter,
  onToggleRegion,
  onToggleStatus,
  onClearRegion,
  onClearStatus,
  count,
  sort,
  onSort,
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <span className={styles.rowLabel}>지역</span>
        <div className={styles.chipList}>
          <Chip label="전체" active={regionFilter.length === 0} onClick={onClearRegion} />
          {regionOptions.map((r) => (
            <Chip key={r} label={r} active={regionFilter.includes(r)} onClick={() => onToggleRegion(r)} />
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.row}>
        <span className={styles.rowLabel}>상태</span>
        <div className={styles.chipList}>
          <Chip label="전체" active={statusFilter.length === 0} onClick={onClearStatus} />
          {statusOptions.map((s) => (
            <Chip key={s} label={s} active={statusFilter.includes(s)} onClick={() => onToggleStatus(s)} />
          ))}
        </div>
        <div className={styles.sortGroup}>
          <span className={styles.count}>{count}개 프로그램</span>
          <div className={styles.sortBtns}>
            <button
              type="button"
              className={`${styles.sortBtn} ${sort === "deadline" ? styles.sortBtnActive : ""}`}
              onClick={() => onSort("deadline")}
            >
              마감 임박 순
            </button>
            <button
              type="button"
              className={`${styles.sortBtn} ${sort === "recent" ? styles.sortBtnActive : ""}`}
              onClick={() => onSort("recent")}
            >
              최신 등록 순
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
