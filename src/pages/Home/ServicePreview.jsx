import { regionPhoto } from "../../data/regionPhotos.js";
import { getAllPrograms } from "../../services/supportPrograms.js";
import styles from "./ServicePreview.module.css";

function Photo({ region, className }) {
  return <img className={className} src={regionPhoto(region)?.url} alt="" loading="lazy" />;
}

// "03 하루 일정" 예시의 항목 아이콘. 장소 사진을 반복해서 쓰는 대신
// 종류를 상징하는 라인 아이콘 하나로 통일한다(요청: 서로 다른
// 아이콘 라이브러리·이모지를 섞지 말 것) — RegionSearch.jsx의
// NatureIcon 등과 같은 획(strokeWidth 1.4, 22 viewBox 기준 스케일)으로
// 새로 그렸다.
function LeafIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 16C4 9 9 4 16 4C16 11 11 16 4 16Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.2 14.8L14 6" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function BowlIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 10h14c0 4-3 7-7 7s-7-3-7-7Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7.5 3c0 1.1 1 1.1 1 2.2s-1 1.1-1 2.2M13 3c0 1.1 1 1.1 1 2.2s-1 1.1-1 2.2" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function WaveIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 8c2 0 2-2.4 4-2.4S8 8 10 8s2-2.4 4-2.4S16 8 18 8" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2 13c2 0 2-2.4 4-2.4S8 13 10 13s2-2.4 4-2.4S16 13 18 13" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// "04 비용과 지원 확인하기" 예시에 실제 지원 프로그램 데이터 1건을 보여준다
// (SupportTeaser.jsx가 쓰는 것과 같은 목록에서, 마감 임박 → 모집 중 순위가
// 가장 앞선 한 건). 모듈이 로드될 때 한 번만 계산해 매 렌더마다 다시
// 정렬하지 않는다.
const topProgram = [...getAllPrograms()].sort((a, b) => a.rank - b.rank)[0];

const PLAN_ITEMS = [
  ["09:00", "해변 산책", "양양 죽도해변", LeafIcon],
  ["12:00", "로컬 맛집", "여유로운 점심 식사", BowlIcon],
  ["15:00", "서핑 체험", "초보자도 가능한 클래스", WaveIcon],
];
const BUDGET_ROWS = [
  ["숙박", 78],
  ["식비", 52],
  ["교통 · 체험", 35],
];

// 서비스 흐름을 실제 동작하는 예시처럼 반복 재생하는 축약 UI. 실제
// 페이지를 그대로 줄여 넣지 않고, 카드 안에서 핵심 내용이 잘리지 않게
// 처음부터 짧게 구성했다. 버튼·칩·선택 상태 색은 실제 기능 화면
// (RegionSearch 등)과 같은 토큰을 써서, 홈에서 본 것과 실제로 들어갔을
// 때 화면이 다른 사이트처럼 보이지 않게 한다.
//
// 반복 애니메이션(선택 → 결과 등장, 순차 등장, 막대 채워짐)은 전부 CSS
// keyframes다(ServicePreview.module.css) — JS 타이머 없이도 컴포넌트가
// 화면에 붙어 있는 동안 계속 반복되고, prefers-reduced-motion이면 전역
// 규칙으로 멈추고 최종 상태만 보인다.
export default function ServicePreview({ type }) {
  return (
    <div className={styles.preview}>
      {type === 0 && <div className={styles.find}>
        <div className={styles.label}>머무는 기간</div>
        <div className={styles.options}><span>3일</span><span className={styles.period}>일주일</span><span>한 달</span></div>
        <div className={styles.label}>나의 관심사</div>
        <div className={styles.options}><span className={styles.interest}>자연과 산책</span><span>문화와 역사</span><span>맛집 탐방</span></div>
        <div className={styles.result}>
          <Photo region="정선" />
          <div><span className={styles.kicker}>이런 지역은 어때요?</span><strong>강원 정선</strong><p>산과 강을 따라, 느긋한 일주일</p></div>
        </div>
      </div>}
      {type === 1 && <div className={styles.explore}>
        <div className={styles.destination}><Photo region="양양" /><div><span>이번에 머물 곳</span><strong>강원 양양</strong></div></div>
        <div className={styles.places}>
          <div className={styles.place} style={{ "--order": 0 }}><span className={styles.placeKicker}>추천 숙소</span><strong>바다뷰 숙소 12곳</strong><span className={styles.placeArrow} aria-hidden="true">→</span></div>
          <div className={styles.place} style={{ "--order": 1 }}><span className={styles.placeKicker}>주변 관광지</span><strong>하조대 등 8곳</strong><span className={styles.placeArrow} aria-hidden="true">→</span></div>
          <div className={styles.place} style={{ "--order": 2 }}><span className={styles.placeKicker}>체험 프로그램</span><strong>서핑, 로컬 클래스</strong><span className={styles.placeArrow} aria-hidden="true">→</span></div>
        </div>
      </div>}
      {type === 2 && <div className={styles.planner}>
        <div className={styles.plannerHead}><span className={styles.kicker}>하루 일정</span><span className={styles.day}>DAY 01</span></div>
        {/* 시간 점 + 세로선으로 실제 일정 화면(ScheduleTab/Timeline)처럼
            "계획표" 느낌을 냈다 — 왼쪽에 시간, 가운데 점을 이은 선,
            오른쪽에 장소 카드. */}
        <div className={styles.notes}>
          {PLAN_ITEMS.map(([hour, title, desc, Icon], i) =>
            <div className={styles.planRow} key={hour} style={{ "--order": i }}>
              <div className={styles.planTime}>
                <span className={styles.time}>{hour}</span>
                <span className={styles.planDot} />
              </div>
              <div className={styles.planCard}>
                <span className={styles.planIcon}><Icon color="#214D42" /></span>
                <div className={styles.note}><strong>{title}</strong><span>{desc}</span></div>
              </div>
            </div>)}
        </div>
      </div>}
      {type === 3 && <div className={styles.budget}>
        <div className={styles.budgetLeft}>
          <span className={styles.kicker}>예상 비용</span>
          <strong className={styles.totalCost}>약 620,000원</strong>
          <div className={styles.budgetRows}>{BUDGET_ROWS.map(([label, pct], i) => <div key={label}><span>{label}</span><span className={styles.bar} style={{ "--width": pct + "%", "--order": i }} /></div>)}</div>
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
