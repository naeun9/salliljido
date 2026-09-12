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
      {/* 유형 배지는 원본에 없던 것이다. 관광 부서의 여행 경비 지원과
          농업 부서의 귀농귀촌 살아보기는 성격이 전혀 달라서 구분이
          필요한데, .top의 상태 배지 옆에 또 배지를 붙이면 둘이 헷갈린다.
          그래서 지역명 줄에 붙이고 색도 상태 배지와 다른 조합을 썼다
          (services/supportPrograms.js의 TYPE_COLOR). */}
      <div className={styles.cityRow}>
        <span className={styles.city}>{program.city}</span>
        {program.type && (
          <span
            className={styles.typeBadge}
            style={{ background: program.typeBg, color: program.typeFg, borderColor: program.typeBorder }}
          >
            {program.type}
          </span>
        )}
      </div>

      <ul className={styles.benefits}>
        {program.benefits.map((b) => (
          <li key={b} className={styles.benefit}>
            <span className={styles.dot} />
            {b}
          </li>
        ))}
      </ul>

      {/* 체류 기간은 원본 카드에 없던 칸이다. infoGrid가
          repeat(auto-fit, minmax(120px, 1fr))이라 칸이 늘거나 줄어도
          레이아웃 규칙은 그대로다.
          원본은 네 칸이 늘 채워진다고 보고 그렸지만, 실제 공고에는
          모집 대상이 첨부파일에만 있거나(부여) 인원 제한이 아예 없는
          경우(서천 반값여행)가 있다. 라벨만 있고 값이 빈 칸을 남기지
          않도록 값이 없으면 칸을 통째로 뺀다. */}
      <div className={styles.infoGrid}>
        {program.period && (
          <div>
            <div className={styles.infoLabel}>신청 기간</div>
            <div className={styles.infoValue}>{program.period}</div>
          </div>
        )}
        {program.target && (
          <div>
            <div className={styles.infoLabel}>모집 대상</div>
            <div className={styles.infoValue}>{program.target}</div>
          </div>
        )}
        {program.quota && (
          <div>
            <div className={styles.infoLabel}>모집 인원</div>
            <div className={styles.infoValue}>{program.quota}</div>
          </div>
        )}
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
              <line
                x1="11"
                y1="2"
                x2="3.4"
                y2="9.6"
                stroke="#FFFDFA"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
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
