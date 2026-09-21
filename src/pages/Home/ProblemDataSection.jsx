import { useEffect, useRef, useState } from "react";
import { useInView } from "../../hooks/useInView.js";
import styles from "./ProblemDataSection.module.css";

const DOTS = Array.from({ length: 29 }, (_, index) => index);

const CARDS = [
  {
    label: "원인",
    value: "40%",
    subtitle: "전국 시군구 약 40%가 인구감소지역으로 지정",
    source: "행정안전부 「인구감소지역 지정 고시」",
    visual: "progress",
  },
  {
    label: "현상",
    value: "12개 지역",
    subtitle: "파일럿 29곳 중 등록 카페 5건 미만",
    source: "한국관광공사 TourAPI 및 자체 실측 · 2026.09",
    visual: "dots",
  },
  {
    label: "결과",
    value: "14개 지역",
    subtitle: "파일럿 29곳 중 온라인 숙박 정보 20건 미만",
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
  const cardsRef = useRef(null);
  // 마무리 화면은 스크롤해서 도착했을 때 글자가 차례로 떠오른다.
  const [transitionRef, transitionIn] = useInView({ threshold: 0.4 });
  const [entered, setEntered] = useState(false);
  const [counts, setCounts] = useState({ cause: 0, result: 0 });

  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards) return undefined;

    if (
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      setEntered(true);
      return undefined;
    }

    let startFrame;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        startFrame = requestAnimationFrame(() => setEntered(true));
      },
      { threshold: 0.25 },
    );

    observer.observe(cards);
    return () => {
      observer.disconnect();
      if (startFrame) cancelAnimationFrame(startFrame);
    };
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

  // 통계 카드 3장과 "WHY SALLILJIDO" 마무리 블록은 원래 한 <section> 안에
  // 있었다. 둘을 합치면 자연 높이가 1500px쯤이라 랜딩 2번째 화면부터
  // 한 화면(100svh)에 담는다는 요구를 만족할 수 없어, 내용은 그대로 둔 채
  // 두 개의 전체 화면 섹션으로 나눴다.
  return (
    <>
    <section
      className={`${styles.section} ${entered ? styles.entered : ""}`}
      aria-labelledby="problem-data-title"
    >
      <div className={styles.inner}>
        <header className={styles.head}>
          <span className={styles.accent} aria-hidden="true" />
          <h2 id="problem-data-title" className={styles.title}>
            상권이 사라진 지역,
            <br className={styles.titleBreak} />{" "}
            여행을 ‘계획’하는 것부터 장벽입니다.
          </h2>
          <p className={styles.lead}>
            인구가 줄어든 지역은 숙소와 식당, 카페 정보부터 찾기 어렵습니다.
            <br />
            며칠 머물 계획을 세우려 해도 필요한 정보가 부족하거나 흩어져 있습니다.
          </p>
        </header>

        <div ref={cardsRef} className={styles.cards}>
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
              <p className={styles.source}>출처: {card.source}</p>
            </article>
          ))}
        </div>

      </div>
    </section>

    <section
      ref={transitionRef}
      className={`${styles.transitionSection} ${transitionIn ? styles.transitionIn : ""}`}
      aria-labelledby="problem-transition-title"
    >
      {/* 배경에 아주 옅은 점 격자가 천천히 흐른다. 장식이라 읽는 데
          방해되지 않도록 가운데만 보이고 가장자리는 사라진다. */}
      <span className={styles.dotField} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.transition}>
          <span className={styles.eyebrow}>WHY SALLILJIDO</span>
          <h2 id="problem-transition-title" className={styles.transitionTitle}>
            인구감소지역의 여행은
            <br />
            검색이 아니라 ‘발굴’이 필요합니다.
          </h2>
          <p className={styles.transitionDescription}>
            흩어진 공공데이터를 모아, 지역 선택부터 체류 계획까지 하나의 흐름으로 잇습니다.
          </p>
        </div>
      </div>
    </section>
    </>
  );
}
