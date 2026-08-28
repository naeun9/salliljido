import { Link } from "react-router-dom";
import styles from "./ClosingCta.module.css";

// design/salliljido.extracted.html 269-277줄(Closing CTA).
export default function ClosingCta() {
  return (
    <section data-screen-label="Closing CTA" className={styles.closing}>
      <div className={styles.inner}>
        <h2 className={styles.title}>한 달이 어렵다면, 사흘부터 시작해도 됩니다</h2>
        <p className={styles.lead}>기간과 관심사만 알려주시면, 어울리는 지역부터 찾아드립니다.</p>
        <div className={styles.ctaRow}>
          <Link to="/find" className={styles.cta}>
            어디서 살아볼까? <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
