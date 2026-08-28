import Skeleton from "../../../../components/common/Skeleton.jsx";
import styles from "../ScheduleTab.module.css";

// 계획을 만들기 전 안내와 만드는 중 스켈레톤. design 803-878줄.
// ScheduleTab.jsx가 300줄 규칙(CLAUDE.md)을 넘겨서 떼어냈고, 마크업·클래스는
// 옮기기 전 그대로다.
export default function ScheduleStates({ routineOn, loading }) {
  return (
    <>
      {!routineOn && !loading && (
        <div className={styles.empty}>
          <svg width="28" height="28" viewBox="0 0 26 26" fill="none" style={{ marginBottom: 16 }}>
            <circle cx="3.5" cy="6" r="2" fill="#DCE8E2" />
            <line x1="9" y1="6" x2="23" y2="6" stroke="#4A7C6F" strokeWidth="1.4" />
            <circle cx="3.5" cy="13" r="2" stroke="#4A7C6F" strokeWidth="1.3" />
            <line x1="9" y1="13" x2="23" y2="13" stroke="#4A7C6F" strokeWidth="1.4" />
            <circle cx="3.5" cy="20" r="2" stroke="#4A7C6F" strokeWidth="1.3" />
            <line x1="9" y1="20" x2="18" y2="20" stroke="#4A7C6F" strokeWidth="1.4" />
          </svg>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.02em", color: "#2B2B29" }}>
            테마와 식사 스타일을 고르면 하루 일정을 만들어 드립니다
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 15.5, lineHeight: 1.75, color: "#6E6E68" }}>
            고른 조건에 맞춰 오전·오후·저녁 세 갈래로 하루를 채워 드립니다.
          </p>
        </div>
      )}

      {loading && (
        <div className={styles.loading}>
          <div className={styles.loadingTitle}>하루 일정을 짜고 있어요</div>
          <div className={styles.loadingRows}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.loadingRow}>
                <Skeleton width="76px" height="13px" style={{ marginTop: 8 }} />
                <div className={styles.loadingCard}>
                  <Skeleton width="62px" height="58px" radius={9} />
                  <div className={styles.loadingCardBody}>
                    <Skeleton width="58%" height="13px" />
                    <Skeleton width="86%" height="12px" style={{ marginTop: 11 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
