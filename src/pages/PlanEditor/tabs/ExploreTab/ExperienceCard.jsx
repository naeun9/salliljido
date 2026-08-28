import { useState } from "react";
import CardThumb from "./CardThumb.jsx";
import DayPicker, { dayConfirmLabel, pickerDayCount } from "./DayPicker.jsx";
import styles from "./ExperienceCard.module.css";

// design/salliljido.extracted.html 1086-1114줄, 2577-2616줄(계산식).
// 담기 여부/일차는 PlanContext(design liAdded/expDay)가 들고, "몇 일차에
// 넣을지 고르는 중" 초안(design expDraft)은 카드 하나가 열려 있을 때만
// 의미가 있어 이 카드 로컬 state로 뒀다(동시에 두 개가 열리지 않으므로
// 상위에서 어떤 카드가 열렸는지만 관리하면 충분하다).
export default function ExperienceCard({
  experience,
  hovered,
  onMouseEnter,
  onMouseLeave,
  added,
  currentDay,
  currentPrice,
  durDays,
  pickerOpen,
  onTogglePicker,
  onConfirm,
  readOnly = false,
}) {
  const [draft, setDraft] = useState(null);
  const [priceDraft, setPriceDraft] = useState(null);
  const resolvedDraft = Math.min(draft ?? currentDay ?? 1, durDays);
  const resolvedPrice = priceDraft ?? (currentPrice === undefined ? "" : String(currentPrice));

  const btnLabel = added ? `추가됨 · ${currentDay}일차` : "내 계획에 추가";
  const confirmLabel = dayConfirmLabel(added, resolvedDraft, currentDay);

  function handleToggle() {
    setDraft(null);
    setPriceDraft(null);
    onTogglePicker();
  }

  function handleConfirm() {
    // 빈 칸이면 undefined로 넘겨 "입력 안 함"을 유지한다(0원과 구분).
    const price = resolvedPrice === "" ? undefined : Math.max(0, parseInt(resolvedPrice, 10) || 0);
    onConfirm(resolvedDraft, price);
    setDraft(null);
    setPriceDraft(null);
  }

  const dayCount = pickerDayCount(durDays);

  return (
    <div
      className={`${styles.card} ${hovered ? styles.hovered : ""}`}
      data-listing-id={experience.id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardThumb item={experience} imageClass={styles.image} tagClass={styles.imageTag} />
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>{experience.name}</h3>
          <span className={styles.badge}>{experience.type}</span>
        </div>
        <p className={styles.desc}>{experience.desc}</p>
        {/* 소요 시간·가격은 관광공사 지역기반 API에 없는 값이라 실데이터에서는
            둘 다 비어 있다. 빈 span 두 개가 남으면 간격만 벌어져 어색해서
            둘 다 없을 때는 줄 자체를 감춘다(docs/03-api-check.md §14). */}
        {(experience.duration || experience.cost) && (
          <div className={styles.meta}>
            <span className={styles.duration}>{experience.duration}</span>
            <span className={styles.cost}>{experience.cost}</span>
          </div>
        )}
        {/* 계획 없이 둘러보는 화면에서는 담기·일차 선택을 감춘다(readOnly). */}
        {!readOnly && (
          <>
            <button
              type="button"
              className={`${styles.toggleBtn} ${added ? styles.added : ""}`}
              onClick={handleToggle}
            >
              {added && (
                <svg width="18" height="18" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M2 7l3 3 6-6.5"
                    stroke="#2F5D50"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {btnLabel}
            </button>
            <DayPicker
              open={pickerOpen}
              dayCount={dayCount}
              value={resolvedDraft}
              onChange={setDraft}
              confirmLabel={confirmLabel}
              onConfirm={handleConfirm}
            >
              {/* design에는 없는 추가 입력(참가비). 관광공사 API에 체험
                  참가비가 없어서(docs/03-api-check.md §14) 예상 비용 탭의
                  체험비를 채우려면 사용자가 직접 넣는 수밖에 없다. 선택
                  입력이라 비워두면 0원으로 잡히고, 나중에 예상 비용 탭에서도
                  고칠 수 있다. */}
              <label className={styles.priceRow}>
                <span className={styles.priceLabel}>참가비 (선택)</span>
                <span className={styles.priceInputWrap}>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    className={styles.priceInput}
                    value={resolvedPrice}
                    placeholder="0"
                    onChange={(e) => setPriceDraft(e.target.value)}
                  />
                  <span className={styles.priceUnit}>원</span>
                </span>
              </label>
            </DayPicker>
          </>
        )}
      </div>
    </div>
  );
}
