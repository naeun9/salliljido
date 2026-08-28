import styles from "./DayPicker.module.css";

// "몇 일차에 넣을까요?" 피커. design 1086-1114줄의 체험 카드 안에만 있던
// 것을 그대로 떼어냈다(마크업·클래스·값 동일). 식당·카페와 주변 관광지도
// 일차를 고르게 되면서 세 카드가 같은 UI를 쓴다 — 복사본을 만들지 않는다.
//
// children으로 피커 안에 줄을 더 넣을 수 있다(체험의 "참가비" 입력).
export default function DayPicker({
  open,
  dayCount,
  value,
  onChange,
  confirmLabel,
  onConfirm,
  label = "몇 일차에 넣을까요?",
  children,
}) {
  return (
    <div className={`${styles.picker} ${open ? styles.open : ""}`}>
      <span className={styles.pickerLabel}>{label}</span>
      <div className={styles.dayOptions}>
        {Array.from({ length: dayCount }, (_, i) => {
          const n = i + 1;
          return (
            <button
              key={n}
              type="button"
              className={`${styles.dayOption} ${value === n ? styles.selected : ""}`}
              onClick={() => onChange(n)}
            >
              {n}일차
            </button>
          );
        })}
      </div>
      {children}
      <button type="button" className={styles.pickerConfirm} onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  );
}

// 담기 버튼과 피커가 같이 쓰는 라벨 규칙. 세 카드가 같은 문구를 쓰도록 모았다.
export function dayToggleLabel(added, currentDay) {
  return added ? `추가됨 · ${currentDay}일차` : "계획에 추가";
}

export function dayConfirmLabel(added, draftDay, currentDay) {
  if (!added) return `${draftDay}일차에 넣기`;
  return draftDay === currentDay ? "계획에서 빼기" : `${draftDay}일차로 옮기기`;
}

// 일차 칩은 8개까지만 보여 준다(design 값). 한 달 살기면 30일이라
// 카드 안에 다 깔면 카드가 피커로 뒤덮인다.
export function pickerDayCount(durDays) {
  return Math.min(durDays, 8);
}
