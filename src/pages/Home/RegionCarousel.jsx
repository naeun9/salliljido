import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../hooks/useSearch.js";
import { carouselPhoto, photoBackground } from "../../data/regionPhotos.js";
import styles from "./RegionCarousel.module.css";

// design/salliljido.extracted.html 195-238줄(#regions), 3839-3849줄(regions 데이터).
const REGIONS = [
  {
    order: "01 / 03",
    name: "강원",
    cities: ["속초", "삼척", "양양", "정선"],
    desc: "바다와 산이 30분 거리에 함께 있습니다. 아침엔 해안을 걷고 오후엔 폐선로와 탄광촌을 지나며, 계절마다 다른 속도로 흐르는 곳.",
    swatch: "repeating-linear-gradient(135deg, #DCE8E2 0 12px, #CFE0D8 12px 24px)",
    imageNote: "동해 해안선",
  },
  {
    order: "02 / 03",
    name: "충남",
    cities: ["서산", "태안", "보령", "홍성"],
    desc: "서해의 낮은 지평선과 갯벌, 넓은 농지가 이어집니다. 수도권에서 두 시간 남짓, 처음 머물러 보기에 부담이 적은 지역.",
    swatch: "repeating-linear-gradient(135deg, #F0E3D2 0 12px, #E7D8C4 12px 24px)",
    imageNote: "서해 갯벌과 염전",
  },
  {
    order: "03 / 03",
    name: "경북",
    cities: ["안동", "영주", "봉화", "의성"],
    desc: "오래된 마을과 서원, 목재 향이 남은 골목이 있습니다. 손으로 하는 일과 느린 대화가 아직 생활의 일부인 내륙 지역.",
    swatch: "repeating-linear-gradient(135deg, #E7EBE0 0 12px, #DBE2D3 12px 24px)",
    imageNote: "안동 고택 마당",
  },
];

const COUNT = REGIONS.length;
const AUTOPLAY_MS = 7000; // design 2188줄: carouselInterval 기본값 7초

export default function RegionCarousel() {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const touchXRef = useRef(null);
  const sectionRef = useRef(null);
  // 사용자가 화살표·점·스와이프로 직접 넘긴 뒤에는 자동재생을 되살리지
  // 않는다(design 2192줄 halt와 같은 규칙). 화면 밖으로 나갔다 들어와도
  // 마찬가지라 ref로 들고 있는다.
  const haltedRef = useRef(false);
  const navigate = useNavigate();
  const { setRegion } = useSearch();

  // design은 페이지가 열리는 순간부터 타이머를 돌린다(2185-2190줄). 그러면
  // 홈 맨 위에서 한참 읽고 내려왔을 때 이미 2~3번째 지역이 떠 있어서, 세 곳을
  // 소개하는 섹션인데 첫 지역을 못 보고 지나친다. 섹션이 화면에 들어올 때
  // 1번부터 시작하고 나가면 멈추도록 바꿨다(간격 7초는 원본 그대로).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      startTimer();
      return () => clearInterval(timerRef.current);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (haltedRef.current) return;
          setIdx(0);
          startTimer();
        } else {
          clearInterval(timerRef.current);
        }
      },
      // 절반쯤 보이면 "도착했다"로 친다 — 카드가 화면에 걸치기만 해도
      // 타이머가 돌면 첫 장을 놓치는 문제가 그대로 남는다.
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startTimer() {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % COUNT);
    }, AUTOPLAY_MS);
  }

  // design 2192줄: 수동 조작 시 자동재생을 멈춘다(다시 시작하지 않음).
  function halt() {
    haltedRef.current = true;
    clearInterval(timerRef.current);
  }

  function goTo(i) {
    halt();
    setIdx(((i % COUNT) + COUNT) % COUNT);
  }

  function handleTouchStart(e) {
    touchXRef.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e) {
    if (touchXRef.current == null) return;
    const dx = e.changedTouches[0].clientX - touchXRef.current;
    if (Math.abs(dx) > 40) goTo(idx + (dx < 0 ? 1 : -1));
    touchXRef.current = null;
  }

  // design 3909-3914줄: 카드를 클릭하면 해당 지역을 선택한 채로 조건 선택
  // 화면으로 이동한다.
  function openFind(regionName) {
    setRegion(regionName);
    navigate("/find");
  }

  return (
    <section id="regions" data-screen-label="Regions" className={styles.regions} ref={sectionRef}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.headText}>
            <div className={styles.eyebrow}>PILOT REGIONS</div>
            <h2 className={styles.title}>세 곳에서 먼저 시작합니다</h2>
          </div>
          <div className={styles.arrows}>
            <button
              type="button"
              aria-label="이전 지역"
              className={styles.arrowBtn}
              onClick={() => goTo(idx - 1)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="다음 지역"
              className={styles.arrowBtn}
              onClick={() => goTo(idx + 1)}
            >
              →
            </button>
          </div>
        </div>

        <div className={styles.track} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className={styles.trackInner} style={{ transform: `translateX(-${idx * 100}%)` }}>
            {REGIONS.map((r) => {
              // 광역 단위 카드라 대표 시군의 관광사진을 쓴다(data/regionPhotos.js).
              const photo = carouselPhoto(r.name);
              return (
                <div key={r.name} className={styles.slide}>
                  <div className={styles.card} onClick={() => openFind(r.name)}>
                    <div
                      className={styles.cardImage}
                      style={{ background: photoBackground(photo, r.swatch) }}
                    >
                      {!photo && <div className={styles.cardImageNote}>image · {r.imageNote}</div>}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardOrder}>{r.order}</div>
                      <h3 className={styles.cardName}>{r.name}</h3>
                      <div className={styles.cardCities}>
                        {r.cities.map((c) => (
                          <span key={c} className={styles.cardCity}>
                            {c}
                          </span>
                        ))}
                      </div>
                      <p className={styles.cardDesc}>{r.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.dots}>
          {REGIONS.map((r, i) => (
            <button
              key={r.name}
              type="button"
              aria-label={r.name}
              className={`${styles.dot} ${i === idx ? styles.active : ""}`}
              style={{ width: i === idx ? "26px" : "8px" }}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
