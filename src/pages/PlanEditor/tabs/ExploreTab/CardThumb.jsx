import { useState } from "react";
import styles from "./CardThumb.module.css";

// 카드 썸네일. design 원본은 실제 사진이 없어서 늘 스와치(대각선 패턴) +
// 모노스페이스 "image" 라벨이었는데, 실제 API에는 사진이 있는 항목과 없는
// 항목이 섞여 있다(숙박은 절반 가까이가 사진 없음, docs/03-api-check.md §14).
//
// 그래서 사진이 있으면 사진을, 없으면 design의 그 스와치+라벨을 그대로
// 보여준다 — 빈 값 처리 방식을 원본 플레이스홀더에 맞춘 것이다.
// 4개 카드(StayCard/ExperienceCard/SpotCard/UtilCard)가 같은 마크업을
// 쓰고 있어 중복을 피하려고 컴포넌트로 뺐고, 클래스명은 각 카드의
// CSS 모듈에서 그대로 받아 쓴다(스타일 값은 하나도 안 바뀐다).
export default function CardThumb({ item, imageClass, tagClass }) {
  // 관광공사 이미지 서버가 간헐적으로 404를 주는 항목이 있어, 로드에
  // 실패하면 스와치 플레이스홀더로 되돌린다.
  const [failed, setFailed] = useState(false);
  const src = failed ? "" : item.image;

  // 사진이 없는 항목(지역에 따라 15~20%)은 design의 빗금 스와치 + "image"
  // 라벨을 쓰다가, 무슨 뜻인지 알기 어려워 담백한 안내 문구로 바꿨다.
  if (!src) {
    return (
      <div className={imageClass} style={{ background: "var(--hairline)", padding: 0 }}>
        <span className={styles.pending}>
          이미지
          <br />
          준비중
        </span>
      </div>
    );
  }

  return (
    <div className={imageClass} style={{ background: item.swatch, overflow: "hidden", padding: 0 }}>
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}
