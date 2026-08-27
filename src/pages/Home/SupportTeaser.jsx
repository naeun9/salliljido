import { Link } from "react-router-dom";
import styles from "./SupportTeaser.module.css";

// design/salliljido.extracted.html 240-267줄(#support), 3850-3854줄(programs 데이터).
const PROGRAMS = [
  {
    region: "강원 정선",
    title: "정선 한 달 살기 체류 지원",
    benefit: "숙박비 최대 70% 지원, 지역 체험 프로그램 3회 참여 포함.",
    period: "2026.03.02 – 04.10",
    status: "모집 중",
    statusColor: "#D9784E",
  },
  {
    region: "충남 서산",
    title: "서산 살아보기 워케이션",
    benefit: "공유오피스 무료 이용과 4주 숙소 연계, 교통비 일부 정산.",
    period: "2026.04.15 – 05.20",
    status: "예정",
    statusColor: "#6E6E68",
  },
  {
    region: "경북 영주",
    title: "영주 빈집 재생 체류단",
    benefit: "리모델링한 한옥 숙소 제공, 마을 활동 참여 시 활동비 지급.",
    period: "2026.05.06 – 06.12",
    status: "예정",
    statusColor: "#6E6E68",
  },
];

export default function SupportTeaser() {
  return (
    <section id="support" data-screen-label="Support" className={styles.support}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.eyebrow}>SUPPORT</div>
          <h2 className={styles.title}>지자체 지원 프로그램을 모았습니다</h2>
          <p className={styles.lead}>
            숙박비 지원, 체험 프로그램, 빈집 재생까지. 공고가 흩어져 있어 놓치기 쉬운
            사업들을 지역·기간별로 정리했습니다.
          </p>
        </div>

        <div className={styles.grid}>
          {PROGRAMS.map((p) => (
            <div key={p.title} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardRegion}>{p.region}</span>
                <span className={styles.cardStatus} style={{ color: p.statusColor }}>
                  {p.status}
                </span>
              </div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardBenefit}>{p.benefit}</p>
              <div className={styles.cardPeriod}>
                <span className={styles.cardPeriodLabel}>신청 기간</span>
                <span className={styles.cardPeriodValue}>{p.period}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.ctaRow}>
          <Link to="/support" className={styles.cta}>
            전체 지원 프로그램 보기 <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
