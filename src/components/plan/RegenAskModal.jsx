import Modal from "../common/Modal.jsx";
import styles from "./RegenAskModal.module.css";

// design/salliljido.extracted.html 637-647줄.
export default function RegenAskModal({ open, onKeep, onAll, onCancel }) {
  return (
    <Modal open={open} onBackdropClick={onCancel} zIndex={94}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>계획을 다시 만들까요?</div>
        <p className={styles.body}>
          같은 조건으로 다른 장소 조합을 뽑습니다. 직접 추가한 일정은 그대로 둘까요?
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.keepBtn} onClick={onKeep}>
            유지하고 만들기
          </button>
          <button type="button" className={styles.allBtn} onClick={onAll}>
            모두 새로 만들기
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            취소
          </button>
        </div>
      </div>
    </Modal>
  );
}
