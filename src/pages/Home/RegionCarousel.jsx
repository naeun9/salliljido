import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../hooks/useSearch.js";
import { carouselPhoto, photoBackground } from "../../data/regionPhotos.js";
import { REGIONS as PILOT_REGIONS } from "../../data/regions.js";
import styles from "./RegionCarousel.module.css";

// design/salliljido.extracted.html 195-238줄(#regions), 3839-3849줄(regions 데이터).
//
// cities는 원본이 4칸이었다. 파일럿이 광역당 9~10곳으로 늘었지만 칩을 열 개씩
// 늘어놓으면 카드가 이름 목록이 되어 버려서, 대표 4곳만 그대로 두고 남은
// 개수를 칩 하나로 덧붙인다(아래 cityChips). 개수는 REGIONS에서 세므로
// 지역을 더해도 문구가 어긋나지 않는다.
const REGIONS = [
  {
    name: "강원",
    cities: ["평창", "고성", "양양", "삼척"],
    desc: "바다와 산이 30분 거리에 함께 있습니다. 아침엔 해안을 걷고 오후엔 폐선로와 탄광촌을 지나며, 계절마다 다른 속도로 흐르는 곳.",
    swatch: "repeating-linear-gradient(135deg, #f0f0f0 0 12px, #CFE0D8 12px 24px)",
    imageNote: "동해 해안선",
  },
  {
    name: "충남",
    cities: ["공주", "태안", "보령", "서천"],
    desc: "서해의 낮은 지평선과 갯벌, 넓은 농지가 이어집니다. 수도권에서 두 시간 남짓, 처음 머물러 보기에 부담이 적은 지역.",
    swatch: "repeating-linear-gradient(135deg, #F0E3D2 0 12px, #E7D8C4 12px 24px)",
    imageNote: "서해 갯벌과 염전",
  },
  {
    name: "경북",
    cities: ["안동", "영주", "봉화", "의성"],
    desc: "오래된 마을과 서원, 목재 향이 남은 골목이 있습니다. 손으로 하는 일과 느린 대화가 아직 생활의 일부인 내륙 지역.",
    swatch: "repeating-linear-gradient(135deg, #E7EBE0 0 12px, #DBE2D3 12px 24px)",
    imageNote: "안동 고택 마당",
  },
];

// 카드에 그릴 칩: 대표 4곳 + "외 N곳". 남은 곳이 없으면 덧붙이지 않는다.
function cityChips(region) {
  const total = PILOT_REGIONS.filter((r) => r.region === region.name).length;
  const rest = total - region.cities.length;
  return rest > 0 ? [...region.cities, `외 ${rest}곳`] : region.cities;
}

const COUNT = REGIONS.length;
// Hero.jsx와 같은 기준: 움직임을 줄여 달라고 한 사람에게는 자동 재생을
// 켜지 않는다.
function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
const AUTOPLAY_MS = 5000;

// 직접 고르는 캐러셀. 선택한 카드는 가운데에 유지한다.
export default function RegionCarousel() {
  const [idx, setIdx] = useState(0);
  const pointerRef = useRef(null);
  const draggedRef = useRef(false);
  const navigate = useNavigate();
  const { setRegion } = useSearch();

  function goTo(i) { setIdx((i + COUNT) % COUNT); }

  // 홈에서는 가만히 둬도 옆 카드가 차례로 보이도록 자동 재생한다.
  // 화살표·점·드래그로 직접 넘기면 idx가 바뀌면서 이 효과가 다시
  // 실행돼 타이머가 그 시점부터 새로 시작한다 — 자동 넘김이 방금 사용자가
  // 고른 카드를 곧바로 밀어내지 않는다.
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const t = setInterval(() => setIdx((i) => (i + 1) % COUNT), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [idx]);
  function openFind(name) {
    setRegion(name);
    navigate("/find", { state: { region: name } });
  }
  function pointerDown(e) {
    if (!e.isPrimary || e.button !== 0) return;
    pointerRef.current = { x: e.clientX, y: e.clientY };
    draggedRef.current = false;
  }
  function pointerUp(e) {
    const start = pointerRef.current;
    pointerRef.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - start.y)) {
      draggedRef.current = true;
      goTo(idx + (dx < 0 ? 1 : -1));
    }
  }
  return (
    <section id="regions" data-screen-label="Regions" className={styles.regions}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.headText}>
            <div className={styles.eyebrow}>PILOT REGIONS</div>
            <h2 className={styles.title}>강원 · 충남 · 경북에서 시작합니다</h2>
            <p className={styles.lead}>세 지역의 인구감소지역 29곳을 만나보세요.</p>
          </div>
          <div className={styles.arrows}>
            <button type="button" aria-label="이전 지역" className={styles.arrowBtn} onClick={() => goTo(idx - 1)}>←</button>
            <button type="button" aria-label="다음 지역" className={styles.arrowBtn} onClick={() => goTo(idx + 1)}>→</button>
          </div>
        </div>
        <div className={styles.track} role="region" aria-label="체류 지역 선택" aria-roledescription="캐러셀"
          onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={() => { pointerRef.current = null; }}>
          <div className={styles.trackInner}>
            {REGIONS.map((r, i) => {
              const photo = carouselPhoto(r.name);
              const offset = (i - idx + COUNT + 1) % COUNT - 1;
              const selected = i === idx;
              return (
                <div key={r.name} className={styles.slide} data-selected={selected} style={{ "--offset": offset }}>
                  <div className={styles.card} role="button" tabIndex={0} aria-pressed={selected}
                    aria-label={r.name + (selected ? " 선택됨, 지역 찾기" : " 선택")}
                    onClick={() => {
                      if (draggedRef.current) { draggedRef.current = false; return; }
                      if (selected) openFind(r.name); else goTo(i);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                        e.preventDefault(); goTo(idx + (e.key === "ArrowRight" ? 1 : -1));
                      } else if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault(); if (selected) openFind(r.name); else goTo(i);
                      }
                    }}>
                    <div className={styles.cardImage} style={{ background: photoBackground(photo, r.swatch) }}>
                      <span className={styles.locationLabel}>{r.name} {photo?.title || r.imageNote}</span>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardHeading}><h3 className={styles.cardName}>{r.name}</h3><span className={styles.cardArrow} aria-hidden="true">↗</span></div>
                      <div className={styles.cardCities}>{cityChips(r).map((c) => <span key={c} className={styles.cardCity}>{c}</span>)}</div>
                      <p className={styles.cardDesc}>{r.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.dots}>
          {REGIONS.map((r, i) => <button key={r.name} type="button" aria-label={r.name + " 선택"} aria-pressed={i === idx}
            className={styles.dot} data-active={i === idx} onClick={() => goTo(i)} />)}
        </div>
        <p className={styles.selection} aria-live="polite">{REGIONS[idx].name} <span>· 옆 카드를 선택하거나 좌우로 넘겨보세요</span></p>
      </div>
    </section>
  );
}