import { Link } from "react-router-dom";
import styles from "./NotFoundView.module.css";

// design에 없는 화면. 라우팅이 생기면서 원본에는 없던 "잘못된 주소" 상황이
// 실제로 생겨서 최소한으로 만든 안내 화면이다. 지역이 없을 때
// (RegionNotFound)와 경로 자체가 없을 때(pages/NotFound) 둘이 같은 결로
// 보여야 해서 껍데기를 여기로 모았다.
//
// actions: [{ to, label, variant: "primary" | "secondary" }]
export default function NotFoundView({ title, body, actions }) {
  return (
    <div className={styles.notFound}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.body}>{body}</p>
        <div className={styles.actions}>
          {actions.map((a) => (
            <Link key={a.to} to={a.to} className={a.variant === "primary" ? styles.primary : styles.secondary}>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
