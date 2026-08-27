import styles from "../CostTab.module.css";

// design/salliljido.extracted.html 1261-1266, 1318-1323줄. 숙박 나눠입력/
// 식비 직접입력 토글이 모양이 완전히 같아 하나로 뺐다.
export default function ToggleSwitch({ on, label, onClick }) {
  return (
    <button type="button" className={styles.toggleBtn} onClick={onClick}>
      <span className={styles.toggleTrack} style={{ background: on ? "#2F5D50" : "#DCD7CC" }}>
        <span className={styles.toggleKnob} style={{ left: on ? "21px" : "3px" }} />
      </span>
      <span className={styles.toggleLabel}>{label}</span>
    </button>
  );
}
