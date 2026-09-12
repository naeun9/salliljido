import { regionPhoto } from "../../data/regionPhotos.js";
import { getAllPrograms } from "../../services/supportPrograms.js";
import styles from "./ServicePreview.module.css";

function Photo({ region, className }) {
  return <img className={className} src={regionPhoto(region)?.url} alt="" loading="lazy" />;
}

// "04 비용과 지원 확인하기" 예시에 실제 지원 프로그램 데이터 1건을 보여준다
// (SupportTeaser.jsx가 쓰는 것과 같은 목록에서, 마감 임박 → 모집 중 순위가
// 가장 앞선 한 건). 모듈이 로드될 때 한 번만 계산해 매 렌더마다 다시
// 정렬하지 않는다.
const topProgram = [...getAllPrograms()].sort((a, b) => a.rank - b.rank)[0];

// 서비스 흐름을 보여주는 축약 예시 UI. 실제 페이지를 그대로 줄여
// overflow:hidden으로 자르는 방식이 아니라, 카드 안에서 핵심 내용이
// 잘리지 않고 한 화면에 다 들어오도록 처음부터 짧게 구성했다. 버튼·칩·
// 선택 상태 색은 실제 기능 화면(RegionSearch 등)과 같은 토큰을 쓴다 —
// 홈에서 본 것과 실제로 들어갔을 때 화면이 다른 사이트처럼 보이지
// 않아야 한다는 요구 때문이다.
export default function ServicePreview({ type }) {
  return (
    <div className={styles.preview}>
      {type === 0 && <div className={styles.find}>
        <div className={styles.label}>머무는 기간</div>
        <div className={styles.options}><span>3일</span><span className={styles.selected}>일주일</span><span>한 달</span></div>
        <div className={styles.label}>나의 관심사</div>
        <div className={styles.options}><span className={styles.selected}>자연과 산책</span><span>문화와 역사</span><span>맛집 탐방</span></div>
        <div className={styles.result}>
          <Photo region="정선" />
          <div><span className={styles.kicker}>이런 지역은 어때요?</span><strong>강원 정선</strong><p>산과 강을 따라, 느긋한 일주일</p></div>
        </div>
      </div>}
      {type === 1 && <div className={styles.explore}>
        <div className={styles.destination}><Photo region="양양" /><div><span>이번에 머물 곳</span><strong>강원 양양</strong></div></div>
        <div className={styles.places}>
          <div className={styles.place}><span className={styles.placeKicker}>추천 숙소</span><strong>바다뷰 숙소 12곳</strong><span className={styles.placeArrow} aria-hidden="true">→</span></div>
          <div className={styles.place}><span className={styles.placeKicker}>주변 관광지</span><strong>하조대 등 8곳</strong><span className={styles.placeArrow} aria-hidden="true">→</span></div>
          <div className={styles.place}><span className={styles.placeKicker}>체험 프로그램</span><strong>서핑, 로컬 클래스</strong><span className={styles.placeArrow} aria-hidden="true">→</span></div>
        </div>
      </div>}
      {type === 2 && <div className={styles.planner}>
        <div className={styles.plannerHead}><span className={styles.kicker}>하루 일정</span><span className={styles.day}>DAY 01</span></div>
        <div className={styles.notes}>
          {[["09:00", "해변 산책", "양양 죽도해변", "양양"], ["12:00", "로컬 맛집", "여유로운 점심 식사", "양양"], ["15:00", "서핑 체험", "초보자도 가능한 클래스", "양양"]].map(([hour, title, desc, region]) =>
            <div className={styles.planRow} key={hour}>
              <span className={styles.time}>{hour}</span>
              <Photo region={region} className={styles.planThumb} />
              <div className={styles.note}><strong>{title}</strong><span>{desc}</span></div>
            </div>)}
        </div>
      </div>}
      {type === 3 && <div className={styles.budget}>
        <div className={styles.budgetLeft}>
          <span className={styles.kicker}>예상 비용</span>
          <strong className={styles.totalCost}>약 620,000원</strong>
          <div className={styles.budgetRows}>{["숙박", "식비", "교통 · 체험"].map((label, i) => <div key={label}><span>{label}</span><span className={styles.bar} style={{ "--width": [78, 52, 35][i] + "%" }} /></div>)}</div>
        </div>
        {topProgram && <div className={styles.budgetRight}>
          <span className={styles.kicker}>지자체 지원 프로그램</span>
          <div className={styles.programCard}>
            <div className={styles.programHead}>
              <span className={styles.programCity}>{topProgram.city}</span>
              <span className={styles.programStatus} style={{ color: topProgram.badgeFg, background: topProgram.badgeBg }}>{topProgram.status}</span>
            </div>
            <strong className={styles.programName}>{topProgram.name}</strong>
            <span className={styles.programSummary}>{topProgram.summary}</span>
          </div>
        </div>}
      </div>}
    </div>
  );
}
