import { useState } from "react";
import styles from "./OverviewHeader.module.css";

// design/salliljido.extracted.html 1447-1486줄.
// 내보내기(인쇄/PDF·엑셀)는 UI만 옮기고 동작은 아직 붙이지 않았다 —
// 로그인 화면의 구글 버튼과 같은 방식으로 안내만 띄운다(docs/02-todo.md).
export default function OverviewHeader({
  title,
  subline,
  onCommitTitle,
  onBackMy,
  onEdit,
  onDelete,
  exportOpen,
  onToggleExport,
  exportNotice,
  onExportNotice,
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState("");

  function startRename() {
    setDraft(title);
    setRenaming(true);
  }
  function commit() {
    const next = draft.trim();
    if (next) onCommitTitle(next);
    setRenaming(false);
  }
  function handleKeyDown(e) {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") setRenaming(false);
  }

  return (
    <section className={styles.header}>
      <div className={styles.row}>
        <div className={styles.left}>
          <button type="button" className={styles.backBtn} onClick={onBackMy} data-print-hide>
            <span className={styles.backArrow}>←</span> 마이페이지로 돌아가기
          </button>

          {!renaming && (
            <div className={styles.titleRow}>
              <h1 className={styles.title} onClick={startRename}>
                {title}
              </h1>
              <button
                type="button"
                className={styles.renameBtn}
                aria-label="계획 이름 수정"
                onClick={startRename}
                data-print-hide
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 12h3l7-7-3-3-7 7z" stroke="#FFFDFA" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
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
            </div>
          )}

          <div className={styles.subline}>{subline}</div>
        </div>

        <div className={styles.actions} data-print-hide>
          <button type="button" className={styles.editBtn} onClick={onEdit}>
            편집하기
          </button>

          <div className={styles.exportWrap}>
            <button type="button" className={styles.exportBtn} onClick={onToggleExport}>
              내보내기
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 4.2 6 7.8l3.5-3.6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {exportOpen && (
              <div className={styles.exportMenu}>
                <button type="button" className={styles.exportItem} onClick={onExportNotice}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <rect x="4" y="1.5" width="8" height="4" stroke="#2F5D50" strokeWidth="1.4" />
                    <rect
                      x="1.8"
                      y="5.5"
                      width="12.4"
                      height="6"
                      rx="1.4"
                      stroke="#2F5D50"
                      strokeWidth="1.4"
                    />
                    <rect x="4.5" y="9.5" width="7" height="5" stroke="#2F5D50" strokeWidth="1.4" />
                  </svg>
                  인쇄 / PDF로 저장
                </button>
                <button type="button" className={styles.exportItem} onClick={onExportNotice}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <rect x="2.5" y="2" width="11" height="12" rx="1.4" stroke="#2F5D50" strokeWidth="1.4" />
                    <line x1="2.5" y1="6" x2="13.5" y2="6" stroke="#2F5D50" strokeWidth="1.2" />
                    <line x1="7" y1="6" x2="7" y2="14" stroke="#2F5D50" strokeWidth="1.2" />
                  </svg>
                  엑셀(.xlsx)로 내보내기
                </button>
                {/* TODO(내보내기 구현): 인쇄용 CSS와 xlsx 생성이 붙기 전까지는
                    안내만 한다. design 2046줄 exportXlsx / 3384줄 ovPrint 참고. */}
                {exportNotice && <p className={styles.exportNotice}>내보내기는 아직 준비 중이에요.</p>}
              </div>
            )}
          </div>

          {onDelete && (
            <button type="button" className={styles.deleteBtn} aria-label="계획 삭제" onClick={onDelete}>
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
