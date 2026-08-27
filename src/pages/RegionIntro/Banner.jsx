import { useState } from "react";
import styles from "./Banner.module.css";

// design/salliljido.extracted.html 679-703줄.
export default function Banner({ region, chips, saved, onToggleSave, onBack }) {
  const [tipOpen, setTipOpen] = useState(false);

  return (
    <section className={styles.banner}>
      <div className={styles.texture} style={{ background: region.swatch }} />
      <div className={styles.overlay} />
      <div className={styles.imageNote}>image · {region.imageNote}</div>

      <div className={styles.row}>
        <div className={styles.left}>
          <button type="button" className={styles.backBtn} onClick={onBack}>
            <span className={styles.backArrow}>←</span> 추천 결과로 돌아가기
          </button>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{region.name}</h1>
            <span
              className={styles.badge}
              onMouseEnter={() => setTipOpen(true)}
              onMouseLeave={() => setTipOpen(false)}
              onClick={() => setTipOpen((v) => !v)}
            >
              인구감소지역
              <span className={`${styles.badgeTip} ${tipOpen ? styles.open : ""}`}>
                행정안전부가 지정한 인구감소지역이에요. 머무는 것만으로 지역에 보탬이 됩니다.
              </span>
            </span>
          </div>
          <div className={styles.chips}>
            {chips.map((c) => (
              <span key={c} className={styles.chip}>
                {c}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label={saved ? "저장됨" : "저장하기"}
          className={`${styles.saveBtn} ${saved ? styles.saved : ""}`}
          onClick={onToggleSave}
        >
          <svg width="14" height="16" viewBox="0 0 13 15" fill="none">
            <path
              d="M1.7 1.4h9.6v11.8l-4.8-3.9-4.8 3.9z"
              stroke="#FFFDFA"
              strokeWidth="1.4"
              strokeLinejoin="round"
              fill={saved ? "#FFFDFA" : "none"}
            />
          </svg>
          <span className={styles.saveText}>{saved ? "저장됨" : "저장하기"}</span>
        </button>
      </div>
    </section>
  );
}
