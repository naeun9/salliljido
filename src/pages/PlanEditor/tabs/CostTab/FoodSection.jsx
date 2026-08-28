import { useState } from "react";
import { FOOD_STYLES, won, resolveFoodPer } from "../../../../utils/cost.js";
import ToggleSwitch from "./ToggleSwitch.jsx";
import styles from "../CostTab.module.css";
import foodStyles from "./FoodSection.module.css";

// design/salliljido.extracted.html 1296-1325줄.
export default function FoodSection({
  nights,
  foodStyle,
  foodManual,
  foodByDay,
  foodDaily,
  onToggleFoodByDay,
  onSetFoodDay,
  foodPer,
  foodTotal,
  cookedCount,
  onSetFoodStyle,
  onToggleFoodManual,
  onSetFoodPer,
}) {
  const resolvedPer = resolveFoodPer({ foodStyle, foodManual, foodPer });
  const noManualAmount = foodManual && !foodTotal;
  // 일수가 많으면 입력칸이 너무 길어져서, 기본은 1주치만 보여 주고
  // 나머지는 접어 둔다(2주·30일에서 화면이 통째로 입력칸이 되는 것을 막는다).
  const [showAllDays, setShowAllDays] = useState(false);
  const shownDays = showAllDays ? nights : Math.min(nights, 7);
  // 일별 입력을 켜면 하루 단가 × 일수는 더 이상 계산 근거가 아니다.
  const filledDays = Array.from(
    { length: nights },
    (_, i) => foodDaily[i + 1],
  ).filter((v) => v !== undefined && v !== "").length;
  const basis = foodByDay
    ? filledDays
      ? `일별 입력 ${filledDays}일 합계 · 나머지 ${nights - filledDays}일은 0원`
      : "일차별로 금액을 입력해주세요"
    : noManualAmount
      ? "금액을 입력해주세요"
      : `1일 ${won(resolvedPer)} × ${nights}일` +
        (cookedCount
          ? ` · 외식 ${nights - cookedCount}끼, 직접 요리 ${cookedCount}끼`
          : "");

  return (
    <>
      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle}>식비</h3>
        <div className={foodStyles.amountGroup}>
          {foodManual && <span className={foodStyles.badge}>직접 입력함</span>}
          <span className={styles.cardAmount}>{won(foodTotal)}</span>
        </div>
      </div>

      <div
        className={`${foodStyles.chips} ${!foodManual ? foodStyles.visible : ""}`}
      >
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

      <div
        className={`${foodStyles.inputRow} ${foodManual ? foodStyles.visible : ""}`}
      >
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

      <p
        className={styles.cardBasis}
        style={{
          color:
            noManualAmount || (foodByDay && !filledDays)
              ? "var(--rust)"
              : "var(--gray)",
        }}
      >
        {basis}
      </p>

      <div className={styles.toggleRow}>
        <ToggleSwitch
          on={foodManual}
          label="직접 입력"
          onClick={() => onToggleFoodManual(resolvedPer)}
        />
        {/* design에 없던 옵션. 하루 단가 × 일수로만 잡히던 식비를 날마다
            다르게 짤 수 있게 더했다. 켜면 아래 일별 입력칸의 합이 식비가 된다. */}
        <ToggleSwitch
          on={foodByDay}
          label="하루마다 예산 짜기"
          onClick={onToggleFoodByDay}
        />
      </div>

      {foodByDay && (
        <div className={foodStyles.dayGrid}>
          {Array.from({ length: shownDays }, (_, i) => {
            const d = i + 1;
            return (
              <label key={d} className={foodStyles.dayField}>
                <span className={foodStyles.dayLabel}>{d}일차</span>
                <span className={foodStyles.dayInputWrap}>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    className={foodStyles.dayInput}
                    value={foodDaily[d] === undefined ? "" : foodDaily[d]}
                    placeholder="0"
                    onChange={(e) => {
                      const v = e.target.value;
                      onSetFoodDay(
                        d,
                        v === "" ? "" : Math.max(0, parseInt(v, 10) || 0),
                      );
                    }}
                  />
                  <span className={foodStyles.dayUnit}>원</span>
                </span>
              </label>
            );
          })}
          {nights > 7 && (
            <button
              type="button"
              className={foodStyles.dayMore}
              onClick={() => setShowAllDays((v) => !v)}
            >
              {showAllDays ? "접기" : `${nights}일 전체 보기`}
            </button>
          )}
        </div>
      )}
    </>
  );
}
