import styles from "./SupportSection.module.css";

// design/salliljido.extracted.html 1655-1670줄.
// 해당 지역에 미마감 프로그램이 없으면 섹션 전체가 사라진다(ovSupDisplay).
export default function SupportSection({ programs, onGoSupport }) {
  if (programs.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>이 지역 지원 프로그램</h2>
        <p className={styles.lead}>지원을 받으면 비용이 줄어들 수 있어요.</p>
        <div className={styles.cards}>
          {programs.map((p) => (
            <div key={p.id} className={styles.card}>
              <div className={styles.name}>{p.name}</div>
              <div className={styles.meta}>
                {p.city} · 신청 {p.period}
              </div>
              <div className={styles.summary}>{p.summary}</div>
            </div>
          ))}
        </div>
        <a href="#support" className={styles.moreLink} onClick={onGoSupport} data-print-hide>
          전체 지원 프로그램 보기
        </a>
      </div>
    </section>
  );
}
