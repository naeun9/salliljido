import styles from "./Toast.module.css";

// design/salliljido.extracted.html 524-530줄(토스트 한 개).
// 아이콘 모양·색은 4085-4087줄의 kind 분기를 그대로 옮겼다.
const ICON_PATH = {
  ok: "M2 7l3 3 6-6.5",
  fail: "M6.5 2.5v5M6.5 10.2v.3",
};
const ICON_STROKE = { ok: "#181818", fail: "#C05F33" };

export default function Toast({ toast, onAction }) {
  const kind = toast.kind === "fail" ? "fail" : "ok";
  // design 4083-4084줄: 되돌리기가 있으면 "되돌리기", 아니면 "보러가기".
  // 둘 다 없으면 버튼 자체를 감춘다.
  const actionLabel = toast.undo ? "되돌리기" : "보러가기";
  const hasAction = !!toast.undo || !!toast.link;

  return (
    <div className={`${styles.toast} slj-anim-rise-toast`} role="status">
      <span className={`${styles.icon} ${kind === "fail" ? styles.fail : ""}`}>
        <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
          <path
            d={ICON_PATH[kind]}
            stroke={ICON_STROKE[kind]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.text}>{toast.text}</span>
      {hasAction && (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
