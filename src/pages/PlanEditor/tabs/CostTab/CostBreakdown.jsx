import styles from "./CostBreakdown.module.css";

// design/salliljido.extracted.html 1412-1440줄.
export default function CostBreakdown({ bars, total, saveLabel, onSave, onFindSupport }) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.card}>
        <h3 className={styles.title}>비용 구성</h3>
        <div className={styles.bars}>
          {bars.map((b) => (
            <div key={b.label}>
              <div className={styles.barHead}>
                <span className={styles.barLabel}>{b.label}</span>
                <span className={styles.barAmount}>{b.amount}</span>
              </div>
              <div className={styles.track}>
                <div className={styles.fill} style={{ width: b.width, background: b.color }} />
              </div>
              <div className={styles.pct}>{b.pct}</div>
            </div>
          ))}
        </div>

        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>총 예상 비용</span>
          <span className={styles.totalAmount}>{total}</span>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.saveBtn} onClick={onSave}>
            {saveLabel}
          </button>
          <button type="button" className={styles.supportBtn} onClick={onFindSupport}>
            지원 프로그램 찾아보기
          </button>
        </div>
      </div>
    </div>
  );
}
