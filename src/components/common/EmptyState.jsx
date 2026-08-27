import styles from "./EmptyState.module.css";

// 빈 상태(아이콘+문구, 선택적 액션). design 1077-1083줄(체험 없음),
// 1166-1172줄(식당·카페 없음) 등에서 아이콘만 바꿔 반복된다.
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className={styles.empty}>
      <span className={styles.icon}>{icon}</span>
      <div className={styles.title}>{title}</div>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
