import { won } from "../../../../utils/cost.js";
import styles from "../CostTab.module.css";

// design/salliljido.extracted.html 1327-1345줄(교통비 카드).
// 원본은 제목이 "교통비 (왕복 기준)"에 "체류 기간과 무관한 1회 비용으로
// 합산됩니다" 안내가 붙어 있었다. 안내를 입력칸 아래 근거 문구 자리로
// 옮기고, 왕복 외에 현지 이동비를 적을 "추가 교통비" 칸을 더했다.
// CostTab.jsx가 300줄을 넘어(CLAUDE.md 코드 원칙) 다른 카드들처럼 떼어냈다.
function amount(v) {
  return v === undefined ? "" : v;
}

export default function TransportSection({
  trip,
  tripManualTotal,
  tripExtraTotal,
  onSetTripManual,
  onSetTripExtra,
}) {
  // 빈 값은 빈 문자열로 두고(0을 박아 두면 지우기 번거롭다),
  // 숫자는 음수가 되지 않게만 막는다.
  function toAmount(v) {
    return v === "" ? "" : Math.max(0, parseInt(v, 10) || 0);
  }

  return (
    <>
      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle}>교통비</h3>
        <span className={styles.cardAmount}>{won(trip)}</span>
      </div>

      <div className={styles.amountRow}>
        <div className={styles.amountInputWrap}>
          <input
            type="number"
            value={amount(tripManualTotal)}
            placeholder="왕복 금액"
            onChange={(e) => onSetTripManual(toAmount(e.target.value))}
          />
          <span className={styles.amountUnit}>원</span>
        </div>
      </div>
      <p className={styles.cardBasis}>
        집에서 오가는 왕복 교통비를 입력해주세요
      </p>

      {/* design에 없던 항목. 현지 이동비처럼 왕복 교통비와 성격이 다른
          지출을 따로 적을 자리가 없어서 더했다. 총액에는 교통비로 합산된다. */}
      <div className={styles.subField}>
        <span className={styles.subLabel}>추가 교통비</span>
        <div className={styles.amountInputWrap}>
          <input
            type="number"
            value={amount(tripExtraTotal)}
            placeholder="0"
            onChange={(e) => onSetTripExtra(toAmount(e.target.value))}
          />
          <span className={styles.amountUnit}>원</span>
        </div>
      </div>
      <p className={styles.cardBasis}>
        현지 이동 등 따로 드는 교통비가 있으면 적어주세요
      </p>
    </>
  );
}
