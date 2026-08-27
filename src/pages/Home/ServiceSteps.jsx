import { useEffect, useRef } from "react";
import styles from "./ServiceSteps.module.css";

// design/salliljido.extracted.html 113-193줄(#service). 4개 스텝 블록이
// 텍스트/그라디언트만 다르고 구조가 동일해 배열+map으로 중복을 없앴다.
const STEPS = [
  {
    num: "01",
    title: "어울리는 지역 찾기",
    desc: "기간과 관심사를 고르면 맞는 시군을 골라드려요",
    chips: ["기간", "관심사", "인구감소지역"],
    art: "repeating-linear-gradient(135deg, #EAF0EB 0 12px, #E1EAE3 12px 24px)",
    label: "screen · 추천 지역 카드와 지도",
  },
  {
    num: "02",
    title: "지역 둘러보기",
    desc: "숙소와 갈 만한 곳, 체험 프로그램을 한 지도에서",
    chips: ["숙박", "주변 관광지", "체험 프로그램"],
    art: "repeating-linear-gradient(135deg, #F0E3D2 0 12px, #E7D8C4 12px 24px)",
    label: "screen · 둘러보기 지도와 목록",
  },
  {
    num: "03",
    title: "하루 일정 만들기",
    desc: "오전·오후·저녁으로 하루를 채워드려요",
    chips: ["테마", "음식 취향", "일자별 동선"],
    art: "repeating-linear-gradient(135deg, #E7EBE0 0 12px, #DBE2D3 12px 24px)",
    label: "screen · 체류 계획 타임라인",
  },
  {
    num: "04",
    title: "비용과 지원 확인하기",
    desc: "얼마가 드는지, 어떤 지원을 받을 수 있는지",
    chips: ["예상 비용", "지자체 지원", "신청 기간"],
    art: "repeating-linear-gradient(135deg, #EFE9DE 0 12px, #E6DED0 12px 24px)",
    label: "screen · 예상 비용과 지원 프로그램",
  },
];

export default function ServiceSteps() {
  const revealRef = useRef(null);

  // design 2133-2154줄: 마운트 시 화면 아래쪽에 있는 카드만 숨겼다가
  // 뷰포트에 들어오면 순서대로(110ms 간격) 나타나게 한다.
  useEffect(() => {
    const container = revealRef.current;
    if (!container) return;
    const cards = Array.from(container.querySelectorAll("[data-reveal]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = cards.indexOf(entry.target);
          setTimeout(() => {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "none";
          }, Math.max(0, i) * 110);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) return;
      card.style.opacity = "0";
      card.style.transform = "translateY(16px)";
      io.observe(card);
    });
    return () => io.disconnect();
  }, []);

  return (
    <section id="service" data-screen-label="Service" className={styles.service}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.eyebrow}>SERVICE</div>
          <h2 className={styles.title}>
            머무는 데 필요한 것들을,
            <br />한자리에서
          </h2>
          <p className={styles.lead}>짧은 체류를 준비하는 과정을 순서대로 안내합니다.</p>
        </div>

        <div className={styles.steps} ref={revealRef}>
          {STEPS.map((step, i) => (
            <div key={step.num}>
              <div className={`${styles.step} ${i % 2 === 1 ? styles.reverse : ""}`}>
                <div data-reveal className={styles.stepText}>
                  <div className={styles.stepNum}>{step.num}</div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                  <div className={styles.stepChips}>
                    {step.chips.map((chip) => (
                      <span key={chip} className={styles.stepChip}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
                <div data-reveal className={styles.stepArt} style={{ background: step.art }}>
                  <span className={styles.stepArtLabel}>{step.label}</span>
                </div>
              </div>
              {i < STEPS.length - 1 && <div className={styles.connector} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
