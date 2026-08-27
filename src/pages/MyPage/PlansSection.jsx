import PlanRow from "./PlanRow.jsx";
import styles from "./PlansSection.module.css";

// design/salliljido.extracted.html 1895-1934줄. 저장한 지역 섹션과 달리
// 로딩 스켈레톤이 없다(원본도 mpRoutinesDisplay/mpRoutinesEmpty가
// isLoading과 무관하게 routines.length만 본다) — 그대로 옮겼다.
export default function PlansSection({ plans, fadingIds, renamingId, renameDraft, onDraftChange, onStartEdit, onSaveEdit, onOpen, onRemove }) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>만든 계획</h2>

        {plans.length ? (
          <div className={styles.list}>
            {plans.map((p) => (
              <PlanRow
                key={p.id}
                plan={p}
                fading={fadingIds.includes(`rt-${p.id}`)}
                editing={renamingId === p.id}
                draft={renameDraft}
                onDraftChange={onDraftChange}
                onStartEdit={() => onStartEdit(p)}
                onSaveEdit={() => onSaveEdit(p)}
                onOpen={() => onOpen(p)}
                onRemove={() => onRemove(p)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className={styles.emptyIcon}>
              <circle cx="3.5" cy="6" r="2" fill="#DCE8E2" />
              <line x1="9" y1="6" x2="23" y2="6" stroke="#4A7C6F" strokeWidth="1.4" />
              <circle cx="3.5" cy="13" r="2" stroke="#4A7C6F" strokeWidth="1.3" />
              <line x1="9" y1="13" x2="23" y2="13" stroke="#4A7C6F" strokeWidth="1.4" />
              <circle cx="3.5" cy="20" r="2" stroke="#4A7C6F" strokeWidth="1.3" />
              <line x1="9" y1="20" x2="18" y2="20" stroke="#4A7C6F" strokeWidth="1.4" />
            </svg>
            <div className={styles.emptyTitle}>지역을 고르면 하루 일정을 만들어 드립니다</div>
            <p className={styles.emptyDesc}>저장한 지역에서 "이어서 보기"를 누르면 계획 만들기로 넘어갑니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}
