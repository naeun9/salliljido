import styles from "./AddScheduleModal.module.css";

// design/salliljido.extracted.html 556-570줄의 시작/종료 시간 입력.
// 원래 "직접 입력" 모달 안에만 있던 것을 자동 생성 슬롯·담은 체험의 시간도
// 고칠 수 있게 되면서 떼어냈다. 마크업·클래스는 옮기기 전 그대로라 두 곳의
// 생김새가 같다.
export const TIME_OPTIONS = [""].concat(
  Array.from({ length: 34 }, (_, i) => {
    const m = 6 * 60 + i * 30;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  })
);

export default function TimeRangeFields({ start, end, onChangeStart, onChangeEnd }) {
  return (
    <div className={styles.timeRow}>
      <div className={styles.field}>
        <label>시작 시간</label>
        <select value={start} onChange={(e) => onChangeStart(e.target.value)}>
          {TIME_OPTIONS.map((t) => (
            <option key={t || "empty"} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label>종료 시간</label>
        <select value={end} onChange={(e) => onChangeEnd(e.target.value)}>
          {TIME_OPTIONS.map((t) => (
            <option key={t || "empty"} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
