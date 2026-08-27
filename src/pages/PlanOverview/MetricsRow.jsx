import styles from "./MetricsRow.module.css";

// design/salliljido.extracted.html 1488-1497줄.
// 칸 사이 구분선은 원본이 m.divider로 인라인 처리했는데(첫 칸은 없음,
// narrow일 때는 세 번째 칸도 없음) 여기서는 같은 규칙을 CSS로 옮겼다.
export default function MetricsRow({ metrics }) {
  return (
    <section className={styles.section}>
      <div className={styles.card}>
        {metrics.map((m) => (
          <div key={m.label} className={styles.cell}>
            <div className={styles.label}>{m.label}</div>
            <div className={styles.value}>{m.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
