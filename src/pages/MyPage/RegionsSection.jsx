import { Link } from "react-router-dom";
import Skeleton from "../../components/common/Skeleton.jsx";
import RegionCard from "./RegionCard.jsx";
import styles from "./RegionsSection.module.css";

// design mypageVals()의 swatches(12px 줄무늬) — RegionResult 카드의
// SWATCHES(10px)와 값이 미묘하게 달라 그대로 별도로 둔다.
const SWATCHES = [
  "repeating-linear-gradient(135deg, #DCE8E2 0 12px, #CFE0D8 12px 24px)",
  "repeating-linear-gradient(135deg, #F0E3D2 0 12px, #E7D8C4 12px 24px)",
  "repeating-linear-gradient(135deg, #E7EBE0 0 12px, #DBE2D3 12px 24px)",
];

// design/salliljido.extracted.html 1845-1893줄.
export default function RegionsSection({ loading, regions, fadingShorts, onUnsave }) {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>저장한 지역</h2>
        <Link to="/find" className={styles.moreLink}>
          지역 더 찾아보기
        </Link>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton width="100%" height="132px" radius={0} />
              <div className={styles.skeletonBody}>
                <Skeleton width="60%" height="14px" />
                <Skeleton width="84%" height="12px" style={{ marginTop: 12 }} />
              </div>
            </div>
          ))}
        </div>
      ) : regions.length ? (
        <div className={styles.grid}>
          {regions.map((r, i) => (
            <RegionCard
              key={r.short}
              region={r}
              swatch={SWATCHES[i % 3]}
              fading={fadingShorts.includes(r.short)}
              onUnsave={() => onUnsave(r)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className={styles.emptyIcon}>
            <circle cx="13" cy="11" r="7.5" stroke="#4A7C6F" strokeWidth="1.4" />
            <circle cx="13" cy="11" r="2.6" fill="#DCE8E2" />
            <line x1="13" y1="19" x2="13" y2="24" stroke="#4A7C6F" strokeWidth="1.4" />
          </svg>
          <div className={styles.emptyTitle}>마음에 드는 지역을 저장해보세요</div>
          <p className={styles.emptyDesc}>추천 결과에서 북마크를 누르면 여기에 모입니다.</p>
          <Link to="/find" className={styles.emptyBtn}>
            지역 찾기
          </Link>
        </div>
      )}
    </section>
  );
}
