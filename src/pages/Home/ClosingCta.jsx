import { Link } from "react-router-dom";
import { regionPhoto } from "../../data/regionPhotos.js";
import styles from "./ClosingCta.module.css";

// design/salliljido.extracted.html 269-277줄(Closing CTA)에서 출발했지만,
// 좌우 2단(왼쪽 문구·오른쪽 사진)으로 바꿔 달라는 요청에 맞춰 다시
// 구성했다. 흰 박스 카드로 띄우지 않는다 — 여기는 새 기능 소개가 아니라
// 페이지의 마지막 CTA라, 다른 색 배경의 박스를 만들면 "또 하나의 카드"로
// 보인다. 웹 기본 배경(웜아이보리) 위에 문구·사진만 놓고 바로 Footer로
// 이어지게 한다.
export default function ClosingCta() {
  const photo = regionPhoto("고성");
  return (
    <section data-screen-label="Closing CTA" className={styles.closing}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <h2 className={styles.title}>지금, 새로운 일상을 시작해보세요</h2>
          <p className={styles.lead}>살릴지도와 함께 나에게 맞는 지역을 찾고, 머무는 하루를 계획해보세요.</p>
          <div className={styles.ctaRow}>
            <Link to="/find" className={styles.cta}>
              나에게 맞는 지역 찾기 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <img className={styles.photo} src={photo?.url} alt="" loading="lazy" />
      </div>
    </section>
  );
}
