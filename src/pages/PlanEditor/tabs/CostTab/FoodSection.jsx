import { FOOD_STYLES, won, resolveFoodPer } from "../../../../utils/cost.js";
import styles from "../CostTab.module.css";
import foodStyles from "./FoodSection.module.css";
import ToggleSwitch from "./ToggleSwitch.jsx";

// design/salliljido.extracted.html 1296-1325줄.
export default function FoodSection({
  nights,
  foodStyle,
  foodManual,
  foodPer,
  foodTotal,
  cookedCount,
  onSetFoodStyle,
  onToggleFoodManual,
  onSetFoodPer,
}) {
  const resolvedPer = resolveFoodPer({ foodStyle, foodManual, foodPer });
  const noManualAmount = foodManual && !foodTotal;
  const basis = noManualAmount
    ? "금액을 입력해주세요"
    : `1일 ${won(resolvedPer)} × ${nights}일` +
      (cookedCount ? ` · 외식 ${nights - cookedCount}끼, 직접 요리 ${cookedCount}끼` : "");

  return (
    <>
      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle}>식비</h3>
        <div className={foodStyles.amountGroup}>
          {foodManual && <span className={foodStyles.badge}>직접 입력함</span>}
          <span className={styles.cardAmount}>{won(foodTotal)}</span>
        </div>
      </div>

      <div className={`${foodStyles.chips} ${!foodManual ? foodStyles.visible : ""}`}>
        {FOOD_STYLES.map((style) => (
          <button
            key={style}
            type="button"
            className={`${foodStyles.chip} ${foodStyle === style ? foodStyles.active : ""}`}
            onClick={() => onSetFoodStyle(style)}
          >
            {style}
          </button>
        ))}
      </div>

      <div className={`${foodStyles.inputRow} ${foodManual ? foodStyles.visible : ""}`}>
        <div className={styles.amountInputWrap}>
          <input
            type="number"
            value={foodPer === undefined ? resolvedPer : foodPer}
            placeholder="1일 식비"
            onChange={(e) => {
              const v = e.target.value;
              onSetFoodPer(v === "" ? "" : Math.max(0, parseInt(v, 10) || 0));
            }}
          />
          <span className={styles.amountUnit}>원 / 일</span>
        </div>
        <span className={styles.amountMultiplier}>× {nights}</span>
      </div>

      <p className={styles.cardBasis} style={{ color: noManualAmount ? "var(--rust)" : "var(--gray)" }}>
        {basis}
      </p>

      <div className={styles.toggleRow}>
        <ToggleSwitch on={foodManual} label="직접 입력" onClick={() => onToggleFoodManual(resolvedPer)} />
      </div>
    </>
  );
}
