import styles from "./ProgramCard.module.css";

// 지원 프로그램 카드. design/salliljido.extracted.html 1747-1791줄.
// program: services/supportPrograms.js의 getAllPrograms() 결과 항목 1개.
export default function ProgramCard({ program, saved, onToggleSave }) {
  return (
    <div className={styles.card} style={{ opacity: program.opacity, filter: program.filter }}>
      <div className={styles.top}>
        <span className={styles.badge} style={{ background: program.badgeBg, color: program.badgeFg }}>
          {program.status}
        </span>
        <span className={styles.dLabel}>{program.dLabel}</span>
      </div>

      <h3 className={styles.name}>{program.name}</h3>
      <div className={styles.city}>{program.city}</div>

      <ul className={styles.benefits}>
        {program.benefits.map((b) => (
          <li key={b} className={styles.benefit}>
            <span className={styles.dot} />
            {b}
          </li>
        ))}
      </ul>

      <div className={styles.infoGrid}>
        <div>
          <div className={styles.infoLabel}>신청 기간</div>
          <div className={styles.infoValue}>{program.period}</div>
        </div>
        <div>
          <div className={styles.infoLabel}>모집 대상</div>
          <div className={styles.infoValue}>{program.target}</div>
        </div>
        <div>
          <div className={styles.infoLabel}>모집 인원</div>
          <div className={styles.infoValue}>{program.quota}</div>
        </div>
        {/* 체류 기간은 원본 카드에 없던 칸이다. infoGrid가
            repeat(auto-fit, minmax(120px, 1fr))이라 칸이 하나 늘어도
            레이아웃 규칙은 그대로다. 값을 아직 안 채운 항목에서는
            빈 칸이 남지 않도록 통째로 뺀다. */}
        {program.stayWeeks && (
          <div>
            <div className={styles.infoLabel}>체류 기간</div>
            <div className={styles.infoValue}>{program.stayWeeks}</div>
          </div>
        )}
      </div>

      <div className={styles.ctaRow}>
        {/* 공고 URL을 아직 못 채운 항목은 버튼을 숨긴다 — 예전에는 전부
            https://www.gov.kr로 고정된 자리표시용 링크였다. */}
        {program.url && (
        <a href={program.url} target="_blank" rel="noopener" className={styles.applyBtn}>
          신청 페이지로 이동
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M4.6 2h6.4v6.4" stroke="#FFFDFA" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="11" y1="2" x2="3.4" y2="9.6" stroke="#FFFDFA" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M8.2 11H2V4.8" stroke="#FFFDFA" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </a>
        )}
        <button
          type="button"
          className={`${styles.saveBtn} ${saved ? styles.saveBtnActive : ""}`}
          onClick={onToggleSave}
        >
          <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
            <path
              d="M1.7 1.4h9.6v11.8l-4.8-3.9-4.8 3.9z"
              stroke={saved ? "#2F5D50" : "#6E6E68"}
              strokeWidth="1.4"
              strokeLinejoin="round"
              fill={saved ? "#2F5D50" : "none"}
            />
          </svg>
          {saved ? "관심 등록됨" : "관심 등록"}
        </button>
        {/* design 1786-1789줄: 이 알림 안내 영역은 원본에서도 display:none이
            하드코딩돼 있어(nudgeDisplay 값과 바인딩되지 않음) 실제로는
            한 번도 보이지 않는다. 알림 설정 화면도 아직 없어 그대로
            비활성 상태로만 옮겼다(동작에 영향 없는 잔재). */}
        <span className={styles.notifyNudge}>
          <button type="button" className={styles.notifyBtn}>
            설정하기
          </button>
        </span>
      </div>

      {/* 문의처도 원본에 없던 줄이다. 실제 공고에는 거의 항상 있어서
          받아 두되, 안 채운 항목에서는 보이지 않는다. */}
      {program.contact && <div className={styles.contact}>문의 {program.contact}</div>}
    </div>
  );
}
