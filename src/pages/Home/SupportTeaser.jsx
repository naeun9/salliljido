import { Link } from "react-router-dom";
import { getAllPrograms } from "../../services/supportPrograms.js";
import styles from "./SupportTeaser.module.css";

// design/salliljido.extracted.html 240-267줄(#support), 3850-3854줄(programs 데이터).
//
// 원본은 이 자리에 카드 세 장을 하드코딩해 뒀다(정선·서산·영주). 지원
// 프로그램 목록이 실제 공고로 바뀌면서 그 셋은 전부 실재하지 않는 사업이
// 됐고, "충남 서산"은 파일럿 29곳에 있지도 않았다. 이제 같은 목록
// (data/supportPrograms.js)에서 앞의 세 건을 가져온다 — 홈과 지원 프로그램
// 화면이 다른 말을 할 수 없다.
//
// 카드는 원본대로 최대 세 장이고, 공고가 그보다 적으면 있는 만큼만 그린다
// (그리드가 auto-fit이라 두 장이면 두 장이 폭을 나눠 갖는다).
const TEASER_COUNT = 3;

// 마감 임박 → 모집 중 → 예정 → 마감 순으로 앞의 세 건. 마감된 공고도
// 빼지 않는다 — 카드마다 상태 배지가 붙어 있어 오해할 일이 없고, 한 장만
// 남으면 카드가 폭을 다 차지해 원본의 3열 리듬이 무너진다.
function teaserPrograms() {
  return getAllPrograms()
    .sort((a, b) => a.rank - b.rank)
    .slice(0, TEASER_COUNT);
}

export default function SupportTeaser() {
  const programs = teaserPrograms();
  return (
    <section id="support" data-screen-label="Support" className={styles.support}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.eyebrow}>SUPPORT</div>
          <h2 className={styles.title}>지자체 지원 프로그램을 모았습니다</h2>
          <p className={styles.lead}>
            숙박비 지원, 체험 프로그램, 빈집 재생까지. 공고가 흩어져 있어 놓치기 쉬운 사업들을 지역·기간별로
            정리했습니다.
          </p>
        </div>

        <div className={styles.grid}>
          {programs.map((p) => (
            <div key={p.id} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardRegion}>{p.city}</span>
                {/* 상태 색은 목록 화면 배지와 같은 값을 쓴다(badgeFg). */}
                <span className={styles.cardStatus} style={{ color: p.badgeFg }}>
                  {p.status}
                </span>
              </div>
              <h3 className={styles.cardTitle}>{p.name}</h3>
              <p className={styles.cardBenefit}>{p.summary}</p>
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
