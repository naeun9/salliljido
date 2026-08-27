import styles from "./DayNav.module.css";

// design/salliljido.extracted.html 865-877줄, 3162-3186줄(week/day 계산).
export default function DayNav({ durDays, week, day, onPickWeek, onPickDay, daysWithAdds }) {
  const weekCount = Math.ceil(durDays / 7);
  const showWeekTabs = durDays > 7;
  const dayCount = Math.min(7, durDays - week * 7);

  return (
    <>
      <div className={`${styles.weekTabs} ${showWeekTabs ? styles.visible : ""}`}>
        {Array.from({ length: weekCount }, (_, w) => (
          <button
            key={w}
            type="button"
            className={`${styles.weekTab} ${week === w ? styles.active : ""}`}
            onClick={() => onPickWeek(w)}
          >
            {w + 1}주차
          </button>
        ))}
      </div>

      <div className={styles.dayTabs}>
        {Array.from({ length: dayCount }, (_, i) => {
          const n = week * 7 + i + 1;
          return (
            <button
              key={n}
              type="button"
              className={`${styles.dayTab} ${day === n ? styles.active : ""}`}
              onClick={() => onPickDay(n)}
            >
              {n}일차
              <span className={`${styles.dot} ${daysWithAdds.includes(n) ? styles.visible : ""}`} />
            </button>
          );
        })}
      </div>
    </>
  );
}
