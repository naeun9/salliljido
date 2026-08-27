import styles from "./PlanRow.module.css";
import { won } from "../../utils/cost.js";

// 만든 계획 목록 행. design/salliljido.extracted.html 1900-1925줄.
// design은 chips(테마 1개+음식 1개)만 저장해뒀다가 metaLine에서
// 합치므로(4428938줄) 여기서도 첫 테마·첫 음식만 보여준다.
export default function PlanRow({ plan, fading, editing, draft, onDraftChange, onStartEdit, onSaveEdit, onOpen, onRemove }) {
  const metaLine = [plan.regionName, `${plan.days}일`, [plan.themes?.[0], plan.meals?.[0]].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(" · ");

  const inProgress = !plan.routineOn;

  return (
    <div className={`${styles.row} ${fading ? styles.fading : ""}`}>
      <div className={styles.main}>
        <div className={styles.titleRow}>
          {!editing && (
            <>
              <h3 className={styles.title}>{plan.title}</h3>
              <button type="button" aria-label="이름 수정" className={styles.editBtn} onClick={onStartEdit}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M9.6 1.9l2.5 2.5-7.4 7.4-3.2.7.7-3.2z" stroke="#6E6E68" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              </button>
              {inProgress && <span className={styles.badge}>작성 중</span>}
            </>
          )}
          {editing && (
            <>
              <input
                type="text"
                className={styles.editInput}
                value={draft}
                maxLength={20}
                onChange={(e) => onDraftChange(e.target.value.slice(0, 20))}
                autoFocus
              />
              <button type="button" className={styles.saveEditBtn} onClick={onSaveEdit}>
                확인
              </button>
            </>
          )}
        </div>
        <div className={styles.metaLine}>{metaLine}</div>
      </div>

      <div className={styles.side}>
        <span className={styles.cost}>{won(plan.cost)}</span>
        <span className={styles.made}>{plan.savedAt} 작성</span>
      </div>

      <div className={styles.actions}>
        <button type="button" className={`${styles.openBtn} ${inProgress ? styles.openOutline : styles.openSolid}`} onClick={onOpen}>
          {inProgress ? "이어서 만들기" : "계획 보기"}
        </button>
        <button type="button" aria-label="계획 삭제" className={styles.removeBtn} onClick={onRemove}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <line x1="3" y1="3" x2="12" y2="12" stroke="#6E6E68" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="12" y1="3" x2="3" y2="12" stroke="#6E6E68" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
