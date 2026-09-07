import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HERO_PHOTOS } from "../../data/regionPhotos.js";
import styles from "./Hero.module.css";

// design/salliljido.extracted.html 84-111줄(#top, Hero).

// 사진 한 장이 머무는 시간. 지역 소개 본문 슬라이드(Features.jsx)는 3.6초인데,
// 여기는 첫 화면이고 글을 읽는 동안 배경이 자꾸 바뀌면 산만해서 훨씬 길게 뒀다.
// 겹치는 시간(1.1초)은 지역 소개 슬라이드와 같은 값이다(Hero.module.css).
const SLIDE_INTERVAL_MS = 9000;
// Hero.module.css의 .incoming 페이드 길이와 같아야 한다 — 이 시간이 지나야
// 새 사진이 완전히 덮으므로, 그때 바닥 사진을 갈아 끼운다.
const FADE_MS = 1100;

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Hero() {
  // 움직임을 줄여 달라고 한 사람에게는 첫 장으로 고정한다 — 나머지 넉 장은
  // 받지도 않는다.
  const [reduced] = useState(prefersReducedMotion);
  // current = 바닥에 깔린 사진(항상 불투명), incoming = 그 위로 서서히
  // 나타나는 다음 사진. 예전처럼 한 장을 지우면서 다른 한 장을 띄우면
  // 중간에 둘 다 반투명해져 뒤의 빗금 배경이 비쳤다(가운데서 25%).
  // 아래 것을 불투명하게 둔 채 위에만 덮어씌우면 늘 100% 가려진다.
  const [current, setCurrent] = useState(0);
  const [incoming, setIncoming] = useState(null);
  // 다음 사진 미리 받기는 첫 그림이 그려진 뒤에 시작한다. 처음부터 걸어 두면
  // preload가 우선순위를 가져가 첫 사진보다 먼저 받아 온다(실측: 413ms 대
  // 613ms) — 첫 화면이 그만큼 늦어진다.
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    if (reduced) return undefined;
    let swap;
    const warmUp = setTimeout(() => setWarm(true), 2000);
    const tick = setInterval(() => {
      setCurrent((cur) => {
        const next = (cur + 1) % HERO_PHOTOS.length;
        setIncoming(next);
        // 다 덮은 뒤에 바닥을 갈아 끼운다. 위 사진은 key가 같아 DOM 그대로
        // 남으므로 확대 애니메이션이 끊기지 않는다.
        swap = setTimeout(() => {
          setCurrent(next);
          setIncoming(null);
        }, FADE_MS);
        return cur;
      });
    }, SLIDE_INTERVAL_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(swap);
      clearTimeout(warmUp);
    };
  }, [reduced]);

  // 바닥 한 장 + (전환 중이면) 나타나는 한 장. fade는 "이 층이 올라오면서
  // 서서히 나타나야 하는가"다 — 바닥은 이미 다 보이는 상태라 false.
  const layers = [{ url: HERO_PHOTOS[current].url, fade: false }];
  if (incoming !== null) layers.push({ url: HERO_PHOTOS[incoming].url, fade: true });

  return (
    <section id="top" data-screen-label="Hero" className={styles.hero}>
      {/* design의 빗금 텍스처 자리에 관광사진을 깐다. 사진이 죽으면 아래
          빗금이 그대로 보인다(data/regionPhotos.js).
          "image · …" 목업 라벨은 실제 사진이 들어와서 지웠다. */}
      <div className={styles.texture} />
      {/* 바닥 → 나타나는 사진 순서. 배열로 그려야 React가 key로 짝을 지어,
          나타나던 사진이 바닥이 될 때 같은 DOM을 그대로 쓴다(확대가 처음부터
          다시 시작되지 않는다).
          페이드는 바깥 층, 확대는 안쪽 층에 나눠 걸었다 — 한 요소에 두 개를
          같이 걸면 페이드 클래스를 뗄 때 확대까지 다시 시작된다. */}
      {layers.map((layer) => (
        <div key={layer.url} className={`${styles.photo} ${layer.fade ? styles.fadeIn : ""}`}>
          <div
            className={reduced ? styles.image : `${styles.image} ${styles.zoom}`}
            style={{ backgroundImage: `url("${layer.url}")` }}
          />
        </div>
      ))}
      {/* 다음 사진을 미리 받아 둔다 — 전환이 시작될 때 빈 칸이 스치지 않게.
          화면에는 보이지 않고 브라우저 캐시에만 들어간다. */}
      {warm && <link rel="preload" as="image" href={HERO_PHOTOS[(current + 1) % HERO_PHOTOS.length].url} />}
      <div className={styles.overlay} />
      {/* 글자가 놓이는 쪽에만 농도를 조금 더 준다(2-4). */}
      <div className={styles.textScrim} />

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
