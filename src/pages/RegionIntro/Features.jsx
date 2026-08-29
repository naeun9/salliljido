import { useEffect, useState } from "react";
import { hasJong } from "../../utils/korean.js";
import { regionPhotoSlides } from "../../data/regionPhotos.js";
import styles from "./Features.module.css";

// design/salliljido.extracted.html 718-740줄, 3075-3079줄(inStats),
// 2995-3000줄(inSlides).
//
// design의 슬라이드 4장은 "여기에 사진이 들어간다"는 목업 그라데이션이었다
// (2995줄). 그 자리에 그 지역 관광사진 4장을 넣는다 — 장수·간격·크로스페이드는
// 원본 그대로다. 사진이 없는 지역은 예전 그라데이션으로 돌아간다.
const SLIDE_BACKGROUNDS = [
  "repeating-linear-gradient(118deg, #8B9A80 0 22px, #9EAB8E 22px 44px)",
  "repeating-linear-gradient(118deg, #A2A48F 0 22px, #B2B39E 22px 44px)",
  "repeating-linear-gradient(118deg, #7E8F86 0 22px, #92A198 22px 44px)",
  "repeating-linear-gradient(118deg, #B0A390 0 22px, #C0B49F 22px 44px)",
];
const SLIDE_INTERVAL_MS = 3600; // design startIntroSlides(), 2181-2183줄

function buildStats(region, insights) {
  const places = region.places || ["바다"];
  const last = places[places.length - 1];
  const { quietLevel, convLevel, wcLevel } = insights;
  return [
    {
      label: "자연환경",
      icon: "M3 15l4.5-6 3.5 4.2L14 9l3 6z M13.5 5.5a1.6 1.6 0 1 0 0-.1",
      note: places.join("와 ") + (hasJong(last) ? "이" : "가") + " 걸어서 닿는 거리에 있어요",
    },
    {
      label: "생활 편의",
      icon: "M3.5 7h13l-1 9.5h-11z M7 7V4.8a3 3 0 0 1 6 0V7",
      note:
        convLevel >= 3 ? "마트와 병원, 시장이 읍내에 모여 있어요" : "기본 편의시설은 있지만 선택지는 적어요",
    },
    {
      label: "워케이션 환경",
      icon: "M3 5.5h14v8H3z M7 16.5h6",
      note: wcLevel >= 3 ? "조용한 카페와 코워킹 공간이 있어요" : "일할 만한 카페가 몇 곳 있어요",
    },
    {
      label: "교통 접근",
      icon: "M6 3.5h8v11H6z M8 17h4 M8 6.5h4",
      note:
        quietLevel <= 1
          ? "버스 위주라 현지 이동은 여유를 두는 게 좋아요"
          : "고속버스와 기차로 수도권에서 2시간 안팎이에요",
    },
  ];
}

export default function Features({ region, insights }) {
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlideIdx((i) => (i + 1) % 4), SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const stats = buildStats(region, insights);
  const photos = regionPhotoSlides(region.short);
  // 사진이 있으면 사진 4장, 없으면 목업 그라데이션 4장.
  const slides = SLIDE_BACKGROUNDS.map((bg, i) => {
    const photo = photos[i];
    return {
      key: photo ? photo.url : bg,
      background: photo ? `url("${photo.url}") center / cover no-repeat` : bg,
      title: photo ? photo.title : "",
    };
  });

  return (
    <section data-in-reveal style={{ animationDelay: ".31s" }} className={styles.section}>
      <div className={styles.row}>
        <div className={styles.stats}>
          {stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statIcon}>
                <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
                  <path
                    d={s.icon}
                    stroke="#2F5D50"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className={styles.statBody}>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statNote}>{s.note}</div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.imageCol}>
          {slides.map((s, i) => (
            <div
              key={s.key}
              className={styles.slide}
              style={{ background: s.background, opacity: slideIdx === i ? 1 : 0 }}
              role="img"
              aria-label={s.title || `${region.short} 풍경`}
            />
          ))}
          {/* 목업 라벨(image · ○○ 풍경) 자리에는 지금 보이는 사진의 제목을
              쓴다. 사진이 없으면 예전 라벨 그대로. */}
          <span className={styles.imageCaption}>
            {slides[slideIdx].title || `image · ${region.short} 풍경`}
          </span>
        </div>
      </div>
    </section>
  );
}
