import { SUB_FILTERS } from "../../../../services/exploreListings.js";
import styles from "../ExploreTab.module.css";

// 카테고리 아래 하위 유형 칩(호텔·펜션 …). design 2669줄: 해당 유형이
// 0건이면 칩을 흐리게(opacity .45) 만든다. 소도시에서는 실제로 0건인 유형이
// 흔한데(예: 태안에 호텔 없음) 원본이 이미 이 처리를 갖고 있어 그대로 쓴다.
//
// 자리는 카테고리 제목 줄(이미 아래 선이 있다) 바로 밑이다 —
// "숙박 · 예약은 외부 서비스로 연결됩니다" 안내보다 위에 있으면 무엇에 대한
// 필터인지 읽히지 않았다. ExploreTab.jsx가 300줄을 넘어 떼어냈다.
export default function SubChips({ category, fullList, selected, onToggle }) {
  return (
    <div className={styles.subChips}>
      {SUB_FILTERS[category].map((sub) => {
        const count = fullList.filter((x) => x.sub === sub).length;
        return (
          <button
            key={sub}
            type="button"
            className={`${styles.subChip} ${selected.includes(sub) ? styles.active : ""}`}
            style={{ opacity: count ? 1 : 0.45 }}
            onClick={() => onToggle(category, sub)}
          >
            {sub}
          </button>
        );
      })}
    </div>
  );
}
