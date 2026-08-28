import { ALL_THEMES, ALL_CUISINES, CUISINE_HINTS } from "../../../../services/routineGenerator.js";
import styles from "./ConditionPanel.module.css";

// design/salliljido.extracted.html 802-838줄. "계획 만들기" 버튼은 원본에도
// 테마/음식을 하나도 안 골라도 눌린다(고르지 않으면 전체 중에서 알아서
// 고른다, routineGenerator.pickCuisine 참고) — disabled는 로딩 중일 때만.
// availableMeals: 그 지역에 실제 후보가 있는 음식 분류. 여기 없는 분류는
// 하위 필터의 0건 칩과 같은 방식(opacity .45)으로 흐리게 하고 누를 수
// 없게 한다 — 고를 수는 있는데 결과가 안 나오면 화면이 거짓말을 한다.
// 접었을 때 보이는 요약 문구. design 2790줄(dtCondSummary).
// 음식은 "실제로 쓰이는" 분류만 적는다 — 그 지역에 없는 분류가 골라져
// 있으면(예전에 저장한 계획) 그대로 적었을 때 화면이 거짓말을 한다.
// pickCuisine도 후보 있는 것만 돌린다.
function buildSummary({ themePrefs, meals, availableMeals, durDays }) {
  const themeLabel = themePrefs.length >= 3 ? `테마 ${themePrefs.length}종` : themePrefs.join("·");
  const usable = availableMeals ? meals.filter((m) => availableMeals.includes(m)) : meals;
  const mealLabel =
    usable.length === 0 ? "음식 전체" : usable.length >= 3 ? `음식 ${usable.length}종` : usable.join("·");
  return `${themeLabel} · ${mealLabel} · ${durDays}일`;
}

export default function ConditionPanel({
  themes,
  meals,
  availableMeals,
  onToggleTheme,
  onToggleMeal,
  routineOn,
  condOpen,
  onExpand,
  themePrefs,
  durDays,
  loading,
  onMakeRoutine,
  onAskRegen,
}) {
  const collapsedVisible = routineOn && !condOpen;
  const openVisible = !collapsedVisible;

  return (
    <>
      <div className={`${styles.collapsed} ${collapsedVisible ? styles.visible : ""}`}>
        <span className={styles.summary}>{buildSummary({ themePrefs, meals, availableMeals, durDays })}</span>
        <button type="button" className={styles.changeBtn} onClick={onExpand}>
          조건 변경
        </button>
        <button type="button" className={styles.regenBtn} disabled={loading} onClick={onAskRegen}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={`${styles.regenIcon} ${loading ? styles.spinning : ""}`}
          >
            <path d="M12 7a5 5 0 1 1-1.5-3.6" stroke="#2F5D50" strokeWidth="1.5" strokeLinecap="round" />
            <path
              d="M12.2 1.6v2.6H9.6"
              stroke="#2F5D50"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {loading ? "만드는 중..." : "다시 만들기"}
        </button>
      </div>

      <div className={`${styles.open} ${openVisible ? styles.visible : ""}`}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>어떤 시간을 보내고 싶으세요?</span>
          <div className={styles.chipCol}>
            <div className={styles.chips}>
              {ALL_THEMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.themeChip} ${themes.includes(t) ? styles.active : ""}`}
                  onClick={() => onToggleTheme(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <span className={styles.helpText}>고르신 취향을 섞어 매일 다르게 짜드립니다</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.row}>
          <span className={styles.rowLabel}>어떤 음식을 좋아하세요?</span>
          <div className={styles.chipCol}>
            <div className={styles.chips}>
              {ALL_CUISINES.map((m) => {
                // 목록을 아직 못 받았으면(availableMeals 없음) 전부 열어 둔다.
                const usable = !availableMeals || availableMeals.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    className={`${styles.mealChip} ${meals.includes(m) ? styles.active : ""}`}
                    style={usable ? undefined : { opacity: 0.45, cursor: "not-allowed" }}
                    disabled={!usable}
                    title={usable ? undefined : `이 지역에는 ${m} 정보가 없어요`}
                    onClick={() => onToggleMeal(m)}
                  >
                    {m}
                    <span className={styles.mealHint}>{CUISINE_HINTS[m]}</span>
                  </button>
                );
              })}
            </div>
            <span className={styles.helpText}>고르신 취향을 중심으로 매일 다르게 짜드립니다</span>
          </div>
          <button
            type="button"
            className={`${styles.makeBtn} ${!loading ? styles.ready : ""}`}
            disabled={loading}
            onClick={onMakeRoutine}
          >
            {loading ? "만드는 중..." : "계획 만들기"}
          </button>
        </div>
      </div>
    </>
  );
}
