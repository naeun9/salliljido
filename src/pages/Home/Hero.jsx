import { Link } from "react-router-dom";
import styles from "./Hero.module.css";

// design/salliljido.extracted.html 84-111줄(#top, Hero).
export default function Hero() {
  return (
    <section id="top" data-screen-label="Hero" className={styles.hero}>
      <div className={styles.texture} />
      <div className={styles.overlay} />
      <div className={styles.imageNote}>
        image · 한적한 바닷가 / 시골 마을 골목 (full-bleed)
      </div>

      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            <span className={styles.eyebrowText}>
              인구감소지역 체류 안내 서비스
            </span>
          </div>
          <h1 className={styles.title}>
            며칠이라도,
            <br />그 지역에서
            <br />
            살아보는 여행
          </h1>
          <p className={styles.lead}>
            인구감소지역에서 며칠~한 달 살기를 준비하는 사람들을 위한 안내
            서비스
          </p>
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

      <a href="#service" className={styles.scrollHint}>
        <span className={styles.scrollLabel}>SCROLL</span>
        <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
          <line x1="6" y1="0" x2="6" y2="15" stroke="#FAF8F4" strokeWidth="1" />
          <line
            x1="1"
            y1="10.5"
            x2="6"
            y2="16"
            stroke="#FAF8F4"
            strokeWidth="1"
          />
          <line
            x1="11"
            y1="10.5"
            x2="6"
            y2="16"
            stroke="#FAF8F4"
            strokeWidth="1"
          />
        </svg>
      </a>
    </section>
  );
}
