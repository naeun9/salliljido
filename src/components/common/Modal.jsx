import styles from "./Modal.module.css";

// 모달 공통 배경 오버레이. design 534-677줄의 여러 모달(AddScheduleModal,
// PickerModal, RegenAskModal 등)이 카드 안쪽 모양은 각자 다르지만 이
// 배경(반투명 검정 + 중앙 정렬)만은 똑같이 공유한다. z-index는 모달마다
// 달라(92~96) props로 받는다.
export default function Modal({ open, onBackdropClick, zIndex, children }) {
  return (
    <div
      className={`${styles.backdrop} ${open ? styles.open : ""}`}
      style={{ zIndex }}
      onClick={onBackdropClick}
    >
      {children}
    </div>
  );
}
