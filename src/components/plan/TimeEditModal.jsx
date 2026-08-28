import { useEffect, useState } from "react";
import Modal from "../common/Modal.jsx";
import TimeRangeFields from "./TimeRangeFields.jsx";
import styles from "./AddScheduleModal.module.css";

// 타임라인 항목의 시간을 고치는 모달.
//
// design에는 "직접 입력"으로 만든 일정에만 시간 입력이 있었다. 자동 생성
// 슬롯(오전/오후/저녁)과 담은 체험은 시간이 고정이라 바꿀 방법이 없었는데,
// 체험은 특히 임의로 오후 14:00으로 배정돼서(관광공사 API에 운영 시간대가
// 없다 — docs/03-api-check.md §14) 고칠 수 있어야 한다.
//
// 마크업·클래스는 "직접 입력" 모달(AddScheduleModal)의 것을 그대로 쓰고,
// 시간 입력은 같은 TimeRangeFields를 공유한다.
export default function TimeEditModal({ open, item, onSubmit, onReset, onCancel }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // 열릴 때마다 지금 값으로 초기화한다. "09:00 – 11:30" 형태를 갈라서 채운다.
  useEffect(() => {
    if (!open || !item) return;
    const [s = "", e = ""] = String(item.time || "")
      .split("–")
      .map((t) => t.trim());
    setStart(s);
    setEnd(e);
  }, [open, item]);

  if (!item) return null;

  return (
    <Modal open={open} onBackdropClick={onCancel} zIndex={96}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>시간 수정</div>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label>일정</label>
            <input type="text" value={item.place} readOnly />
          </div>
          <TimeRangeFields start={start} end={end} onChangeStart={setStart} onChangeEnd={setEnd} />
          <p className={styles.timeHint}>시간을 바꾸면 그 시간대로 자리를 옮깁니다.</p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            취소
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onReset}>
            기본값으로
          </button>
          <button
            type="button"
            className={`${styles.submitBtn} ${start ? styles.ready : ""}`}
            disabled={!start}
            onClick={() => onSubmit(start, end)}
          >
            저장
          </button>
        </div>
      </div>
    </Modal>
  );
}
