import { useEffect, useState } from "react";
import Modal from "../common/Modal.jsx";
import styles from "./AddScheduleModal.module.css";

// design/salliljido.extracted.html 546-594줄, 1995-2023줄(openCustomForm/submitCustom).
const TIME_OPTIONS = [""].concat(
  Array.from({ length: 34 }, (_, i) => {
    const m = 6 * 60 + i * 30;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  })
);

const BLANK = { name: "", start: "", end: "", place: "", memo: "", cost: "" };

export default function AddScheduleModal({ open, editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(BLANK);

  useEffect(() => {
    if (open) setForm(editing ? { ...BLANK, ...editing } : BLANK);
  }, [open, editing]);

  const name = form.name.trim();
  const ready = !!name;

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    if (!ready) return;
    // design 2007-2009줄: 시작 시간의 시각으로 슬롯(오전/오후/저녁)을 정한다.
    const hour = form.start ? parseInt(form.start.split(":")[0], 10) : null;
    const slot = hour === null ? editing?.slot || "오전" : hour < 12 ? "오전" : hour < 18 ? "오후" : "저녁";
    onSubmit({ ...form, name, slot });
  }

  return (
    <Modal open={open} onBackdropClick={onCancel} zIndex={96}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>{editing ? "일정 수정" : "직접 입력"}</div>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label>일정 이름</label>
            <input
              type="text"
              value={form.name}
              maxLength={30}
              placeholder="서핑 강습, 친구 만나기, 장보기"
              onChange={(e) => set("name", e.target.value.slice(0, 30))}
            />
          </div>
          <div className={styles.timeRow}>
            <div className={styles.field}>
              <label>시작 시간</label>
              <select value={form.start} onChange={(e) => set("start", e.target.value)}>
                {TIME_OPTIONS.map((t) => (
                  <option key={t || "empty"} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>종료 시간</label>
              <select value={form.end} onChange={(e) => set("end", e.target.value)}>
                {TIME_OPTIONS.map((t) => (
                  <option key={t || "empty"} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label>장소</label>
            <input
              type="text"
              value={form.place}
              maxLength={30}
              placeholder="죽도해변"
              onChange={(e) => set("place", e.target.value.slice(0, 30))}
            />
          </div>
          <div className={styles.field}>
            <label>메모</label>
            <input
              type="text"
              value={form.memo}
              maxLength={50}
              placeholder="보드 대여 포함"
              onChange={(e) => set("memo", e.target.value.slice(0, 50))}
            />
          </div>
          <div className={styles.field}>
            <label>비용</label>
            <div className={styles.costRow}>
              <input
                type="text"
                value={form.cost}
                placeholder="0"
                onChange={(e) => set("cost", e.target.value.replace(/[^0-9]/g, ""))}
              />
              <span className={styles.costUnit}>원</span>
            </div>
            <span className={styles.costHint}>입력하면 예상 비용의 기타 항목에 더해집니다</span>
          </div>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.submitBtn} ${ready ? styles.ready : ""}`}
            onClick={handleSubmit}
          >
            {editing ? "저장하기" : "추가하기"}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            취소
          </button>
        </div>
      </div>
    </Modal>
  );
}
