import { useState } from "react";
import CardThumb from "./CardThumb.jsx";
import DayPicker, { dayConfirmLabel, dayToggleLabel, pickerDayCount } from "./DayPicker.jsx";
import styles from "./SpotCard.module.css";

// design/salliljido.extracted.html 1125-1137줄. 원본은 액션 버튼 없이 정보만
// 보여줬는데, 네 카테고리 모두 계획에 담을 수 있게 열면서 담기 버튼을 붙였다.
// 담을 때 몇 일차인지도 고른다 — 체험과 같은 피커(DayPicker)를 쓴다.
export default function SpotCard({
  spot,
  hovered,
  onMouseEnter,
  onMouseLeave,
  saved,
  currentDay,
  durDays,
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
      data-listing-id={spot.id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardThumb item={spot} imageClass={styles.image} tagClass={styles.imageTag} />
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>{spot.name}</h3>
          <span className={styles.badge}>{spot.type}</span>
        </div>
        <p className={styles.desc}>{spot.desc}</p>
        {/* 계획 없이 둘러보는 화면에서는 담기를 감춘다(readOnly). */}
        {!readOnly && (
          <>
            <button
              type="button"
              className={`${styles.saveBtn} ${saved ? styles.on : ""}`}
              onClick={handleToggle}
            >
              {saved && (
                <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M2 7l3 3 6-6.5"
                    stroke="#2F5D50"
                    strokeWidth="2.4"
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
