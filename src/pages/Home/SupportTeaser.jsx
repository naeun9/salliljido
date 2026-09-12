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
// 리드 문구의 "빈집 재생"도 같은 이유로 뺐다 — 원본 카피가 열거한 세
// 항목 중 빈집 재생 사업은 확인된 공고에 없다. 실제 지원 내용(영월의
// 연수비, 영덕의 숙박비·체험비 지원)을 덮으면서 프로그램이 늘어도
// 어긋나지 않는 "체류 활동비"로 바꿨다.
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
            숙박비 지원, 체험비 지원, 체류 활동비까지. 공고가 흩어져 있어 놓치기 쉬운 사업들을 지역·기간별로
            정리했습니다.
          </p>
        </div>

        <div className={styles.grid}>
          {programs.map((p) => (
            <div key={p.id} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardRegion}>{p.city}</span>
                {/* 실제 지원 프로그램 목록(components/support/ProgramCard)의
                    상태 배지와 같은 모양(배경+글자색 칩)으로 맞춘다 — 홈에서
                    본 상태 표시가 실제 화면과 다르게 보이지 않도록. */}
                <span className={styles.cardStatus} style={{ background: p.badgeBg, color: p.badgeFg }}>
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
