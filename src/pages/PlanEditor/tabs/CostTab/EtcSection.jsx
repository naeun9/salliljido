import { won } from "../../../../utils/cost.js";
import styles from "../CostTab.module.css";
import etcStyles from "./EtcSection.module.css";

// design/salliljido.extracted.html 1367-1392줄. 최대 4개까지 추가할 수 있다.
export default function EtcSection({ rows, etcTotal, onUpdateRow, onRemoveRow, onAddRow }) {
  return (
    <>
      <div className={styles.cardHead}>
        <div>
          <p className={styles.cardSub}>그 밖에 예상되는 지출을 입력해주세요 (장보기, 생필품, 여가비 등)</p>
          <h3 className={styles.cardTitle}>기타</h3>
        </div>
        <span className={styles.cardAmount}>{won(etcTotal)}</span>
      </div>

      <div className={etcStyles.rows}>
        {rows.map((row, i) => (
          <div key={i} className={etcStyles.row}>
            <div className={etcStyles.memoWrap}>
              <input
                type="text"
                maxLength={20}
                value={row.memo}
                placeholder="메모 (선택)"
                onChange={(e) => onUpdateRow(i, "memo", e.target.value.slice(0, 20))}
              />
            </div>
            <div className={etcStyles.amountWrap}>
              <input
                type="number"
                value={row.amount}
                placeholder="금액"
                onChange={(e) => {
                  const v = e.target.value;
                  onUpdateRow(i, "amount", v === "" ? "" : Math.max(0, parseInt(v, 10) || 0));
                }}
              />
              <span className={etcStyles.amountUnit}>원</span>
            </div>
            <button
              type="button"
              className={`${etcStyles.removeBtn} ${rows.length > 1 ? etcStyles.visible : ""}`}
              aria-label="항목 삭제"
              onClick={() => onRemoveRow(i)}
            >
              <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                <line
                  x1="3"
                  y1="3"
                  x2="12"
                  y2="12"
                  stroke="#6E6E68"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <line
                  x1="12"
                  y1="3"
                  x2="3"
                  y2="12"
                  stroke="#6E6E68"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`${etcStyles.addBtn} ${rows.length < 4 ? etcStyles.visible : ""}`}
        onClick={onAddRow}
      >
        ＋ 항목 추가
      </button>
    </>
  );
}
