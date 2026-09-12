import styles from "./ServiceSteps.module.css";
import ServicePreview from "./ServicePreview.jsx";
const STEPS = [
  {
    num: "01",
    title: "어울리는 지역 찾기",
    desc: "머무는 기간과 관심사를 바탕으로 나에게 맞는 시군을 추천합니다.",
    chips: ["기간", "관심사", "인구감소지역"],
  },
  {
    num: "02",
    title: "지역 둘러보기",
    desc: "숙소, 주변 명소, 체험 프로그램을 지도에서 함께 살펴보세요.",
    chips: ["숙박", "주변 관광지", "체험 프로그램"],
  },
  {
    num: "03",
    title: "하루 일정 만들기",
    desc: "오전부터 저녁까지, 하고 싶은 일로 하루를 구성하세요.",
    chips: ["테마", "음식 취향", "일자별 동선"],
  },
  {
    num: "04",
    title: "비용과 지원 확인하기",
    desc: "예상 비용과 지역 지원사업을 확인해 체류를 준비하세요.",
    chips: ["예상 비용", "지자체 지원", "신청 기간"],
  },
];

// 실제 서비스 데이터와 분리된 소개용 코스. DOM 순서도 1→4로 유지한다.
//
// 왼쪽에 얇은 세로선 + 핀, 오른쪽에 가로형 카드 한 줄이 이어지는 단일 열
// 타임라인 구조다. 이전의 좌우 지그재그 배치 대신 이 방식을 쓰면 카드마다
// 높이가 달라도(예시 UI 종류별로 실제 내용 길이가 다르다) 핀이 항상 카드와
// 같은 높이에서 자연스럽게 정렬된다 — 세로선은 .steps 안에 있는 고정폭
// 핀 칸을 따라 그어지므로 좌표를 따로 맞출 필요가 없다.
export default function ServiceSteps() {
  return (
    <section id="service" className={styles.service} data-screen-label="Service">
      <div className={styles.inner}>
        <header className={styles.head}>
          <span className={styles.accent} />
          <span className={styles.eyebrow}>SERVICE</span>
          <h2 className={styles.title}>지역 선택부터 하루의 계획까지</h2>
          <p className={styles.lead}>나에게 맞는 지역을 찾고, 머무는 하루를 완성하는 네 단계.</p>
        </header>
        <nav className={styles.overview} aria-label="서비스 이용 순서">
          {STEPS.map((step, i) => <a key={step.num} href={"#service-step-" + i}><span>{step.num}</span>{["지역 찾기", "둘러보기", "일정 만들기", "비용 확인"][i]}{i < 3 && <b aria-hidden="true">→</b>}</a>)}
        </nav>
        <div className={styles.timeline}>
          <span className={styles.rail} data-start aria-hidden="true">START</span>
          <ol className={styles.steps}>
            {STEPS.map((step, i) => <li id={"service-step-" + i} key={step.num} className={styles.step}>
              <span className={styles.pin} aria-hidden="true">
                <svg width="15" height="19" viewBox="0 0 15 19" fill="none">
                  <path d="M7.5 0C3.36 0 0 3.36 0 7.5 0 13.13 7.5 19 7.5 19S15 13.13 15 7.5C15 3.36 11.64 0 7.5 0Z" fill="#24483E" />
                  <circle cx="7.5" cy="7.5" r="3" fill="#F5F3ED" />
                </svg>
              </span>
              <span className={styles.connector} aria-hidden="true" />
              <div className={styles.card}>
                <div className={styles.cardText}>
                  <span className={styles.number}>{step.num}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  <div className={styles.chips}>{step.chips.map(chip => <span key={chip}>{chip}</span>)}</div>
                </div>
                <div className={styles.preview}><ServicePreview type={i} /></div>
              </div>
            </li>)}
          </ol>
          <span className={styles.rail} data-end aria-hidden="true">GOAL</span>
        </div>
      </div>
    </section>
  );
}
