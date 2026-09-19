import { useEffect, useRef, useState } from "react";
import styles from "./ProblemDataSection.module.css";

const DOTS = Array.from({ length: 29 }, (_, index) => index);

const CARDS = [
  {
    label: "원인",
    value: "40%",
    subtitle: "전국 시군구 약 40%가 인구감소지역으로 지정",
    body: "거주민 감소는 식당·카페·생활 서비스의 축소로 이어지고, 방문객이 이용할 수 있는 여행 인프라도 함께 줄어듭니다.",
    source: "행정안전부 「인구감소지역 지정 고시」",
    visual: "progress",
  },
  {
    label: "현상",
    value: "12개 지역",
    subtitle: "파일럿 29곳 중 등록 카페 5건 미만",
    body: "카페 정보조차 충분하지 않은 지역에서는 며칠 머물며 생활할 동선을 구성하기 어렵습니다.",
    source: "한국관광공사 TourAPI 및 자체 실측 · 2026.09",
    visual: "dots",
  },
  {
    label: "결과",
    value: "14개 지역",
    subtitle: "파일럿 29곳 중 온라인 숙박 정보 20건 미만",
    body: "숙박 선택지가 적고 방문이 주말에 집중되면서, 체류형 여행 일정을 계획하기 어려워집니다.",
    source: "한국관광공사 TourAPI · 관광빅데이터 · 2026.09",
    visual: "distribution",
  },
];

function DataVisual({ type }) {
  if (type === "dots") {
    return (
      <div className={styles.dotVisual} aria-label="전체 29개 지역 중 12개 지역">
        <div className={styles.dots} aria-hidden="true">
          {DOTS.map((dot) => (
            <span
              key={dot}
              className={dot < 12 ? styles.dotActive : styles.dot}
              style={dot < 12 ? { "--dot-index": dot } : undefined}
            />
          ))}
        </div>
        <span className={styles.visualCaption}>12 / 29</span>
      </div>
    );
  }

  const isDistribution = type === "distribution";

  return (
    <div className={styles.barVisual}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.barFill} style={{ width: isDistribution ? "48.3%" : "40%" }} />
      </div>
      <span className={styles.visualCaption}>
        {isDistribution ? "14곳 / 전체 29곳" : "전체 시군구의 약 40%"}
      </span>
    </div>
  );
}

export default function ProblemDataSection() {
  const sectionRef = useRef(null);
  const [entered, setEntered] = useState(false);
  const [counts, setCounts] = useState({ cause: 0, result: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      setEntered(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setEntered(true);
        observer.disconnect();
      },
      { threshold: 0.18 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!entered) return undefined;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setCounts({ cause: 40, result: 14 });
      return undefined;
    }

    const duration = 900;
    const startedAt = performance.now();
    let frameId;

    const update = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts({
        cause: Math.round(40 * eased),
        result: Math.round(14 * eased),
      });
      if (progress < 1) frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [entered]);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${entered ? styles.entered : ""}`}
      aria-labelledby="problem-data-title"
    >
      <div className={styles.inner}>
        <header className={styles.head}>
          <span className={styles.accent} aria-hidden="true" />
          <h2 id="problem-data-title" className={styles.title}>
            상권이 사라진 지역, 여행을 ‘계획’하는 것부터 장벽입니다.
          </h2>
          <p className={styles.lead}>
            인구 유출로 지역의 생활 상권이 줄어들면서, 여행자는 숙소와 카페 같은 기본 정보조차 찾기 어려워졌습니다.
            <br />
            머무는 여행을 계획하기 전, 정보 부족이라는 첫 번째 장벽을 만나게 됩니다.
          </p>
        </header>

        <div className={styles.cards}>
          {CARDS.map((card) => (
            <article key={card.label} className={styles.card}>
              <span className={styles.label}>{card.label}</span>
              <strong className={styles.value}>
                {card.visual === "progress" && `${counts.cause}%`}
                {card.visual === "dots" && card.value}
                {card.visual === "distribution" && `${counts.result}개 지역`}
              </strong>
              <h3 className={styles.subtitle}>{card.subtitle}</h3>
              <DataVisual type={card.visual} />
              <p className={styles.body}>{card.body}</p>
              <p className={styles.source}>출처: {card.source}</p>
            </article>
          ))}
        </div>

        <div className={styles.transition}>
          <span className={styles.eyebrow}>WHY SALLILJIDO</span>
          <h2 className={styles.transitionTitle}>
            그래서 인구감소지역의 여행은
            <br />
            검색이 아니라 ‘발굴’이 필요합니다.
          </h2>
          <p className={styles.transitionDescription}>
            숙박, 생활 편의, 관광지, 지자체 지원처럼 여러 공공데이터에 흩어진 정보를 한곳에 모아
            <br />
            지역을 발견하는 순간부터 체류 계획까지 하나의 흐름으로 연결합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
