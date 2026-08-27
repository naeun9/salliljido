import styles from "./TabBar.module.css";

// design/salliljido.extracted.html 791-796줄. 뱃지 번호(1/2/3)는 화면
// 순서(둘러보기→체류 계획→예상 비용) 기준이고, 탭 자체의 내부 id
// (explore/schedule/cost)와는 무관하게 원본 숫자를 그대로 옮겼다.
const TABS = [
  { id: "explore", label: "둘러보기", badge: 1 },
  { id: "schedule", label: "체류 계획", badge: 2 },
  { id: "cost", label: "예상 비용", badge: 3 },
];

export default function TabBar({ active, onChange }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${active === tab.id ? styles.active : ""}`}
            onClick={() => onChange(tab.id)}
          >
            <span className={styles.badge}>{tab.badge}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
