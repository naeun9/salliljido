import { useEffect, useRef } from "react";
import styles from "./ConfirmModal.module.css";

// design/salliljido.extracted.html 534-545줄(confirmDisplay). 계획 삭제,
// 지역/프로그램 저장 해제 등 여러 곳에서 공유하는 확인 모달. 배경 알파(.32)가
// 다른 모달(.42)과 달라 공용 Modal 셸 대신 NameDialog와 같은 방식으로
// 독립 구현했다. 확인 버튼 문구는 design도 용도와 무관하게 항상 "삭제"로
// 고정돼 있어("저장한 지역에서 뺄까요?"에도 "삭제" 버튼을 그대로 쓴다) 그대로
// 옮겼다.
export default function ConfirmModal({ open, title, target, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (open && cancelRef.current) cancelRef.current.focus();
  }, [open]);

  function handleKeyDown(e) {
    if (e.key === "Escape") onCancel();
  }

  return (
    <div className={`${styles.backdrop} ${open ? styles.open : ""}`} onKeyDown={handleKeyDown}>
      <div className={styles.card}>
        <div className={styles.title}>{title}</div>
        {target && <div className={styles.target}>{target}</div>}
        <div className={styles.actions}>
          <button ref={cancelRef} type="button" className={styles.cancelBtn} onClick={onCancel}>
            취소
          </button>
          <button type="button" className={styles.confirmBtn} onClick={onConfirm}>
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
