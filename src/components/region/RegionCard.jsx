import { Link } from "react-router-dom";
import { regionPhoto, photoBackground } from "../../data/regionPhotos.js";
import styles from "./RegionCard.module.css";

// 추천 결과 카드. design/salliljido.extracted.html 430-457줄.
// region: services/regionRecommend.js의 getRecommendations() 결과 항목 1개.
export default function RegionCard({ region, best, hovered, onMouseEnter, onMouseLeave }) {
  return (
    <div
      className={`${styles.card} ${hovered ? styles.hovered : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 빗금 자리에 그 지역 관광사진(다른 화면과 같은 방식).
          사진이 없거나 URL이 죽으면 아래 빗금이 그대로 보인다. */}
      <div
        className={styles.swatch}
        style={{ background: photoBackground(regionPhoto(region.short), region.swatch) }}
      />
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>{region.name}</h3>
          {best && <span className={styles.bestBadge}>가장 잘 맞아요</span>}
          <span className={styles.declineBadge}>인구감소지역</span>
        </div>
        <p className={styles.reason}>{region.reason}</p>
        <div className={styles.metrics}>
          {region.metrics.map((m) => (
            <div key={m.label} className={styles.metric}>
              <span className={styles.metricLabel}>{m.label}</span>
              <span className={styles.metricDots}>
                {[1, 2, 3].map((n) => (
                  <span key={n} className={`${styles.metricDot} ${n <= m.level ? styles.filled : ""}`} />
                ))}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.tags}>
          {region.tags.map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
        </div>
        <Link to={`/region/${encodeURIComponent(region.short)}`} className={styles.openLink}>
          이 지역 살펴보기 <span>→</span>
        </Link>
      </div>
    </div>
  );
}
