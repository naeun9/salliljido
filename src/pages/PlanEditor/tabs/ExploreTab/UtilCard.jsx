import { useState } from "react";
import CardThumb from "./CardThumb.jsx";
import DayPicker, {
  dayConfirmLabel,
  dayToggleLabel,
  pickerDayCount,
} from "./DayPicker.jsx";
import styles from "./UtilCard.module.css";

// design/salliljido.extracted.html 1148-1163줄. design의 "가보고 싶어요"
// 토글은 문구를 "계획에 추가"로 바꾸고(네 카테고리 담기 문구 통일),
// 담을 때 몇 일차인지도 고르게 했다 — 체험과 같은 피커(DayPicker)를 쓴다.
// 담긴 곳은 PlanContext.savedUtilities(design liWish)에 들어간다.
export default function UtilCard({
  util,
  saved,
  currentDay,
  durDays,
  hovered,
  onMouseEnter,
  onMouseLeave,
  pickerOpen,
  onTogglePicker,
  onConfirm,
  readOnly = false,
}) {
  const [draft, setDraft] = useState(null);
  const resolvedDraft = Math.min(draft ?? currentDay ?? 1, durDays);

  function handleToggle() {
    setDraft(null);
    onTogglePicker();
  }
  function handleConfirm() {
    onConfirm(resolvedDraft);
    setDraft(null);
  }

  return (
    <div
      className={`${styles.card} ${hovered ? styles.hovered : ""}`}
      data-listing-id={util.id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardThumb
        item={util}
        imageClass={styles.image}
        tagClass={styles.imageTag}
      />
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>{util.name}</h3>
          <span className={styles.badge}>{util.type}</span>
        </div>
        <p className={styles.note}>{util.note}</p>
        {/* 계획 없이 둘러보는 화면에서는 담기를 감춘다(readOnly). */}
        {!readOnly && (
          <>
            <button
              type="button"
              className={`${styles.wishBtn} ${saved ? styles.on : ""}`}
              onClick={handleToggle}
            >
              {saved && (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 7.5l3 3 6-6.5"
                    stroke="#2F5D50"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {dayToggleLabel(saved, currentDay)}
            </button>
            <DayPicker
              open={pickerOpen}
              dayCount={pickerDayCount(durDays)}
              value={resolvedDraft}
              onChange={setDraft}
              confirmLabel={dayConfirmLabel(saved, resolvedDraft, currentDay)}
              onConfirm={handleConfirm}
            />
          </>
        )}
      </div>
    </div>
  );
}
