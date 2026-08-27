import styles from "./CostSummary.module.css";

// design/salliljido.extracted.html 1615-1653줄.
// 막대 값은 예상 비용 탭과 같은 utils/cost.js buildCostBars()에서 온다.
export default function CostSummary({ bars, total }) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>예상 비용</h2>
        <div className={styles.row}>
          <div className={styles.left}>
            {bars.map((b) => (
              <div key={b.label} className={styles.barRow}>
                <div className={styles.barText}>
                  <div className={styles.barLabel}>{b.label}</div>
                  <div className={styles.barBasis}>{b.basis}</div>
                </div>
                <span className={styles.barAmount}>{b.amount}</span>
              </div>
            ))}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>총 예상 비용</span>
              <span className={styles.totalAmount}>{total}</span>
            </div>
            <p className={styles.disclaimer}>공개 자료를 바탕으로 한 추정치이며 실제와 다를 수 있습니다.</p>
          </div>

          <div className={styles.right}>
            <div className={styles.ratioTitle}>비율</div>
            <div className={styles.ratioList}>
              {bars.map((b) => (
                <div key={b.label}>
                  <div className={styles.ratioHead}>
                    <span className={styles.ratioLabel}>{b.label}</span>
                    <span className={styles.ratioPct}>{b.pct}</span>
                  </div>
                  <div className={styles.track}>
                    <div className={styles.fill} style={{ width: b.width, background: b.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
