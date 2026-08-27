import { won } from "../../../../utils/cost.js";
import styles from "../CostTab.module.css";
import segStyles from "./StaySection.module.css";
import ToggleSwitch from "./ToggleSwitch.jsx";

// design/salliljido.extracted.html 1246-1294줄.
export default function StaySection({
  nightly,
  nights,
  stayTotal,
  split,
  segs,
  segNights,
  onSetNightly,
  onToggleSplit,
  onUpdateSeg,
  onRemoveSeg,
  onAddSeg,
}) {
  const segWarn =
    segNights === nights
      ? `총 ${nights}박이 모두 채워졌습니다`
      : segNights < nights
        ? `${nights - segNights}일이 비어 있습니다`
        : `${segNights - nights}일이 초과되었습니다`;
  const segWarnColor = segNights === nights ? "var(--gray)" : "var(--rust)";

  return (
    <>
      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle}>숙박비</h3>
        <span className={styles.cardAmount}>{won(stayTotal)}</span>
      </div>
      <div className={styles.amountRow}>
        <div className={styles.amountInputWrap}>
          <input
            type="number"
            value={nightly}
            placeholder="1박 금액"
            onChange={(e) => {
              const v = e.target.value;
              onSetNightly(v === "" ? "" : Math.max(0, parseInt(v, 10) || 0));
            }}
          />
          <span className={styles.amountUnit}>원 / 1박</span>
        </div>
        <span className={styles.amountMultiplier}>× {nights}</span>
      </div>

      <div className={styles.toggleRow}>
        <ToggleSwitch on={split} label="숙소를 나눠서 입력하기" onClick={onToggleSplit} />

        <div className={`${segStyles.segList} ${split ? segStyles.open : ""}`}>
          {segs.map((g, i) => (
            <div key={i} className={segStyles.seg}>
              <div className={segStyles.rangeGroup}>
                <input
                  type="number"
                  value={g.from}
                  onChange={(e) => onUpdateSeg(i, { from: numOr0(e.target.value) })}
                />
                <span>~</span>
                <input
                  type="number"
                  value={g.to}
                  onChange={(e) => onUpdateSeg(i, { to: numOr0(e.target.value) })}
                />
                <span>일차</span>
              </div>
              <div className={segStyles.rateGroup}>
                <input
                  type="number"
                  value={g.rate}
                  onChange={(e) => onUpdateSeg(i, { rate: numOr0(e.target.value) })}
                />
                <span>원/박</span>
              </div>
              <input
                type="text"
                className={segStyles.memoInput}
                value={g.memo}
                placeholder="숙소 메모 (선택)"
                onChange={(e) => onUpdateSeg(i, { memo: e.target.value })}
              />
              <span className={segStyles.subtotal}>
                {won(Math.max(0, (g.to || 0) - (g.from || 0) + 1) * (g.rate || 0))}
              </span>
              <button
                type="button"
                className={segStyles.removeBtn}
                aria-label="구간 삭제"
                onClick={() => onRemoveSeg(i)}
              >
                <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
                  <line x1="3" y1="3" x2="12" y2="12" stroke="#6E6E68" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="12" y1="3" x2="3" y2="12" stroke="#6E6E68" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
          <div className={segStyles.segFooter}>
            <button type="button" className={segStyles.addSegBtn} onClick={onAddSeg}>
              구간 추가
            </button>
            <span className={segStyles.segWarn} style={{ color: segWarnColor }}>
              {segWarn}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function numOr0(v) {
  const n = parseInt(String(v).replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}
