import Modal from "../common/Modal.jsx";
import { REST_OPTIONS } from "../../services/routineGenerator.js";
import styles from "./PickerModal.module.css";

// design/salliljido.extracted.html 596-635줄, 3204-3221줄(계산식).
export default function PickerModal({
  open,
  slot,
  mine,
  places,
  onPickMine,
  onPickPlace,
  onPickRest,
  onCustom,
  onClose,
}) {
  return (
    <Modal open={open} onBackdropClick={onClose} zIndex={95}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <div className={styles.title}>{slot ? `${slot} 일정 고르기` : ""}</div>
          <p className={styles.sub}>담아둔 곳이나 추천 장소, 숙소에서 보내는 시간 중에 고를 수 있어요.</p>
        </div>
        <div className={styles.body}>
          {mine.length > 0 && (
            <>
              <div className={`${styles.sectionLabel} ${styles.mine}`}>내가 담은 곳</div>
              {mine.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`${styles.option} ${styles.mine}`}
                  onClick={() => onPickMine(o)}
                >
                  <span className={styles.optionName}>{o.name}</span>
                  <span className={styles.optionMeta}>{o.meta}</span>
                </button>
              ))}
            </>
          )}

          <div className={styles.sectionLabel}>추천 장소</div>
          {places.map((p) => (
            <button
              key={p.id || p.place}
              type="button"
              className={styles.option}
              onClick={() => onPickPlace(p)}
            >
              <span className={styles.optionName}>{p.place}</span>
              <span className={styles.optionMeta}>
                {p.tag} · {p.desc}
              </span>
            </button>
          ))}

          <div className={styles.sectionLabel}>숙소에서 보내기</div>
          {REST_OPTIONS.map((r) => (
            <button key={r.id} type="button" className={styles.restOption} onClick={() => onPickRest(r)}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path
                  d={r.icon}
                  stroke="#6E6E68"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={styles.restName}>{r.name}</span>
            </button>
          ))}

          <button type="button" className={styles.customBtn} onClick={onCustom}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="3" x2="8" y2="13" stroke="#C05F33" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="3" y1="8" x2="13" y2="8" stroke="#C05F33" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className={styles.customLabel}>직접 입력하기</span>
          </button>
        </div>
        <div className={styles.foot}>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </Modal>
  );
}
