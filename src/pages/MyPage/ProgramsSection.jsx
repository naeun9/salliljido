import { Link } from "react-router-dom";
import ProgramCard from "./ProgramCard.jsx";
import styles from "./ProgramsSection.module.css";

// design/salliljido.extracted.html 1936-1971줄.
export default function ProgramsSection({ programs, onUnsave }) {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>관심 등록한 지원 프로그램</h2>
        <Link to="/support" className={styles.moreLink}>
          전체 프로그램 보기
        </Link>
      </div>

      {programs.length ? (
        <div className={styles.grid}>
          {programs.map((p) => (
            <ProgramCard key={p.id} program={p} onUnsave={() => onUnsave(p)} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className={styles.emptyIcon}>
            <rect x="3" y="5" width="20" height="16" rx="3" stroke="#4A7C6F" strokeWidth="1.4" />
            <line x1="3" y1="10.5" x2="23" y2="10.5" stroke="#4A7C6F" strokeWidth="1.4" />
            <rect x="7" y="14" width="7" height="3" rx="1.5" fill="#DCE8E2" />
          </svg>
          <div className={styles.emptyTitle}>지원 프로그램을 둘러보세요</div>
          <p className={styles.emptyDesc}>관심 등록한 공고의 마감일을 여기서 챙길 수 있습니다.</p>
          <Link to="/support" className={styles.emptyBtn}>
            지원 프로그램 보기
          </Link>
        </div>
      )}
    </section>
  );
}
