import { Link } from "react-router-dom";
import { HERO_PHOTO } from "../../data/regionPhotos.js";
import styles from "./Hero.module.css";

// design/salliljido.extracted.html 84-111줄(#top, Hero).
// 빗금 텍스처 값은 Hero.module.css의 .texture와 같은 값이다 — 사진을
// 얹으면서 배경을 인라인으로 덮어쓰기 때문에 폴백을 여기 한 번 더 적는다.
const HERO_TEXTURE =
  "repeating-linear-gradient(118deg, #7E8F72 0 26px, #93A184 26px 52px, #6F8470 52px 78px, #A9AE96 78px 104px, #586E63 104px 130px)";

export default function Hero() {
  return (
    <section id="top" data-screen-label="Hero" className={styles.hero}>
      {/* design의 빗금 텍스처 자리에 관광사진을 깐다. 사진이 죽으면 빗금이
          그대로 보이도록 두 겹으로 깔았다(data/regionPhotos.js).
          "image · …" 목업 라벨은 실제 사진이 들어와서 지웠다. */}
      <div
        className={styles.texture}
        style={{ backgroundImage: `url("${HERO_PHOTO.url}"), ${HERO_TEXTURE}` }}
      />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            <span className={styles.eyebrowText}>인구감소지역 체류 안내 서비스</span>
          </div>
          <h1 className={styles.title}>
            며칠이라도,
            <br />그 지역에서
            <br />
            살아보는 여행
          </h1>
          <p className={styles.lead}>인구감소지역에서 며칠~한 달 살기를 준비하는 사람들을 위한 안내 서비스</p>
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
