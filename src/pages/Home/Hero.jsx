import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HERO_PHOTOS } from "../../data/regionPhotos.js";
import styles from "./Hero.module.css";

// design/salliljido.extracted.html 84-111줄(#top, Hero).

// 사진 전환 간격. 지역 소개 본문 슬라이드(Features.jsx)는 3.6초인데,
// 여기는 첫 화면이고 글을 읽는 동안 배경이 자꾸 바뀌면 산만해서 더 길게 뒀다.
// 겹치는 시간(1.1초)은 지역 소개 슬라이드와 같은 값이다(Hero.module.css .photo).
const SLIDE_INTERVAL_MS = 5500;

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Hero() {
  // 움직임을 줄여 달라고 한 사람에게는 첫 장으로 고정한다 — 나머지 넉 장은
  // 받지도 않는다.
  const [reduced] = useState(prefersReducedMotion);
  const [idx, setIdx] = useState(0);
  // 첫 화면에서 사진 5장을 한꺼번에 받으면 첫 그림이 늦어진다. 지금 장과
  // 다음 장까지만 DOM에 올려서, 나머지는 차례가 가까워질 때 받게 한다.
  const [mounted, setMounted] = useState(reduced ? 1 : 2);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % HERO_PHOTOS.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    setMounted((m) => Math.max(m, Math.min(HERO_PHOTOS.length, idx + 2)));
  }, [idx, reduced]);

  return (
    <section id="top" data-screen-label="Hero" className={styles.hero}>
      {/* design의 빗금 텍스처 자리에 관광사진을 깐다. 사진이 죽으면 아래
          빗금이 그대로 보인다(data/regionPhotos.js).
          "image · …" 목업 라벨은 실제 사진이 들어와서 지웠다. */}
      <div className={styles.texture} />
      {HERO_PHOTOS.slice(0, mounted).map((photo, i) => (
        <div
          key={photo.url}
          className={styles.photo}
          style={{ backgroundImage: `url("${photo.url}")`, opacity: idx === i ? 1 : 0 }}
        />
      ))}
      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            <span className={styles.eyebrowText}>인구감소지역 체류 안내 서비스</span>
          </div>
          <h1 className={styles.title}>
            스쳐 가지 않고,
            <br />그 지역에서
            <br />
            살아보는 시간
          </h1>
          <p className={styles.lead}>며칠이든 한 달이든, 조용한 지역에서 지내볼 준비를 돕습니다</p>
          <div className={styles.ctaRow}>
            <Link to="/find" className={styles.primaryCta}>
              어디서 살아볼까?
              <span className={styles.primaryCtaArrow}>→</span>
            </Link>
            <a href="#service" className={styles.secondaryCta}>
              서비스 둘러보기
            </a>
          </div>
        </div>
      </div>

      <a href="#service" className={`${styles.scrollHint} slj-anim-bob`}>
        <span className={styles.scrollLabel}>SCROLL</span>
        <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
          <line x1="6" y1="0" x2="6" y2="15" stroke="#FAF8F4" strokeWidth="1" />
          <line x1="1" y1="10.5" x2="6" y2="16" stroke="#FAF8F4" strokeWidth="1" />
          <line x1="11" y1="10.5" x2="6" y2="16" stroke="#FAF8F4" strokeWidth="1" />
        </svg>
      </a>
    </section>
  );
}
