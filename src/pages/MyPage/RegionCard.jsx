import { Link } from "react-router-dom";
import { regionPhoto } from "../../data/regionPhotos.js";
import styles from "./RegionCard.module.css";

// 저장한 지역 카드. design/salliljido.extracted.html 1864-1883줄.
// region: getRegionByShort() 결과에 savedAt(SavedContext)을 합친 값.
export default function RegionCard({ region, swatch, fading, onUnsave }) {
  return (
    <div className={`${styles.card} ${fading ? styles.fading : ""}`}>
      <div className={styles.image} style={{ background: swatch }}>
        {/* 사진이 깔리면 목업 라벨은 지운다(다른 화면과 같은 처리). */}
        {!regionPhoto(region.short) && <span className={styles.imageNote}>image · {region.imageNote}</span>}
      </div>
      <button type="button" aria-label="저장 해제" className={styles.unsaveBtn} onClick={onUnsave}>
        <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
          <path
            d="M1.7 1.4h9.6v11.8l-4.8-3.9-4.8 3.9z"
            fill="#2F5D50"
            stroke="#2F5D50"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>{region.name}</h3>
          <span className={styles.declineBadge}>인구감소지역</span>
        </div>
        <p className={styles.reason}>{region.reason}</p>
        <div className={styles.savedAt}>{region.savedAt} 저장</div>
        <Link to={`/region/${encodeURIComponent(region.short)}`} className={styles.openLink}>
          지역 소개 보기 <span>→</span>
        </Link>
      </div>
    </div>
  );
}
