import { useEffect, useRef } from "react";
import styles from "./NameDialog.module.css";

// design/salliljido.extracted.html 651-662줄, 2465-2478줄(cbSavePlan),
// 2438-2457줄(confirmPlanName). CostTab에서 "이 계획 저장하기"를 눌렀는데
// 아직 제목이 없으면 뜬다.
export default function NameDialog({ open, value, onChange, summary, onConfirm, onCancel }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [open]);

  const ready = !!value.trim();

  function handleKeyDown(e) {
    if (e.key === "Enter" && ready) onConfirm();
    else if (e.key === "Escape") onCancel();
  }

  return (
    <div className={`${styles.backdrop} ${open ? styles.open : ""}`} onClick={onCancel}>
      <div
        className={`${styles.card} slj-anim-rise-both`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.title}>계획에 이름을 붙여주세요</div>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          value={value}
          maxLength={20}
          onChange={(e) => onChange(e.target.value.slice(0, 20))}
        />
        <div className={styles.summary}>{summary}</div>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.confirmBtn} ${ready ? styles.ready : ""}`}
            disabled={!ready}
            onClick={onConfirm}
          >
            저장하기
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
