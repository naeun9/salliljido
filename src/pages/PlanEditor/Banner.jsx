import { useState } from "react";
import styles from "./Banner.module.css";

// design/salliljido.extracted.html 752-789줄. 삭제 버튼(dtDeleteDisplay)은
// 마이페이지에서 기존 계획을 열었을 때만 보이는데 그 진입 경로가 아직 없어
// 뺐다(docs/02-todo.md 참고). 저장 버튼은 RegionIntro와 같은 "지역 저장"
// 버튼이다 — design도 detailVals()에서 같은 dtToggleSave/dtSaveLabel을
// 공유해서 쓴다.
export default function Banner({
  region,
  planTitle,
  onCommitTitle,
  saved,
  onToggleSave,
  onBack,
  backLabel,
  onDelete,
  chipLine,
  dirty,
  planCost,
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState("");

  const titleText = planTitle || "제목 없는 계획";

  function startRename() {
    setDraft(planTitle);
    setRenaming(true);
  }
  function commit() {
    onCommitTitle(draft.trim());
    setRenaming(false);
  }
  function cancel() {
    setRenaming(false);
  }
  function handleKeyDown(e) {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") cancel();
  }

  return (
    <section className={styles.banner}>
      <div className={styles.texture} style={{ background: region.swatch }} />
      <div className={styles.overlay} />
      <div className={styles.row}>
        <div className={styles.left}>
          <button type="button" className={styles.backBtn} onClick={onBack}>
            ← {backLabel}
          </button>

          {!renaming && (
            <div className={styles.titleRow}>
              <button type="button" className={styles.title} onClick={startRename}>
                {titleText}
              </button>
              {dirty && <span className={styles.unsavedBadge}>임시 저장 안 됨</span>}
              <button
                type="button"
                className={styles.renameBtn}
                onClick={startRename}
                aria-label="계획 이름 짓기"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 12h3l7-7-3-3-7 7z" stroke="#FFFDFA" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
                {!planTitle && <span>제목 수정</span>}
              </button>
            </div>
          )}

          {renaming && (
            <div className={styles.editRow}>
              <input
                type="text"
                className={styles.editInput}
                value={draft}
                maxLength={20}
                placeholder="계획 이름"
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button type="button" className={styles.editConfirm} onClick={commit}>
                확인
              </button>
              <button type="button" className={styles.editCancel} onClick={cancel}>
                취소
              </button>
            </div>
          )}

          <div className={styles.metaRow}>
            <span className={styles.metaRegion}>{region.name}</span>
            <span className={styles.metaDivider}>·</span>
            <span className={styles.metaCondition}>{chipLine}</span>
            {planCost && (
              <>
                <span className={styles.metaDivider}>·</span>
                <span className={styles.metaCondition}>예상 {planCost}</span>
              </>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            aria-label={saved ? "저장됨" : "저장하기"}
            className={`${styles.saveBtn} ${saved ? styles.saved : ""}`}
            onClick={onToggleSave}
          >
            <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
              <path
                d="M1.7 1.4h9.6v11.8l-4.8-3.9-4.8 3.9z"
                stroke="#FFFDFA"
                strokeWidth="1.4"
                strokeLinejoin="round"
                fill={saved ? "#FFFDFA" : "none"}
              />
            </svg>
            <span>{saved ? "저장됨" : "저장하기"}</span>
          </button>
          {onDelete && (
            <button type="button" aria-label="계획 삭제" className={styles.deleteBtn} onClick={onDelete}>
              <svg width="15" height="16" viewBox="0 0 15 16" fill="none">
                <path
                  d="M2.5 4.5h10M6 2.2h3M3.8 4.5l.6 9h6.2l.6-9M6.3 7v4M8.7 7v4"
                  stroke="#FFFDFA"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
