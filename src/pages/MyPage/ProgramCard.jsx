import styles from "./ProgramCard.module.css";

// 관심 등록한 지원 프로그램 카드. design/salliljido.extracted.html
// 1943-1961줄. SupportPrograms의 ProgramCard와는 레이아웃이 달라(혜택
// 목록 없이 마감 요약 한 줄) 별도로 둔다.
export default function ProgramCard({ program, onUnsave }) {
  return (
    <div className={styles.card} style={{ opacity: program.opacity, filter: program.filter }}>
      <div className={styles.top}>
        <span className={styles.badge} style={{ background: program.badgeBg, color: program.badgeFg }}>
          {program.status}
        </span>
        <span className={styles.city}>{program.city}</span>
      </div>
      <h3 className={styles.name}>{program.name}</h3>
      <div className={styles.deadline} style={{ color: program.deadlineColor }}>
        {program.deadlineLabel}
      </div>
      <div className={styles.ctaRow}>
        <a href={program.url} target="_blank" rel="noopener" className={styles.applyBtn}>
          신청 페이지로 이동
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M4.6 2h6.4v6.4" stroke="#FFFDFA" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="11" y1="2" x2="3.4" y2="9.6" stroke="#FFFDFA" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M8.2 11H2V4.8" stroke="#FFFDFA" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </a>
      </div>
      <button type="button" aria-label="관심 해제" className={styles.unsaveBtn} onClick={onUnsave}>
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
    </div>
  );
}
