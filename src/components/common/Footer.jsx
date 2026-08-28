import { useLocation } from "react-router-dom";
import styles from "./Footer.module.css";

// design/salliljido.extracted.html 279-307줄. 원본은 랜딩 전용이었지만
// 없는 경로 안내(pages/NotFound)에서도 쓴다.
//
// 바로가기 링크는 전부 Home 안의 섹션으로 가는 앵커다. Home에서는 페이지 내
// 앵커(#service)로 두어 전역 scroll-behavior의 부드러운 스크롤을 그대로 쓰고,
// Home이 아닌 화면에서는 그 앵커가 가리킬 섹션이 없으므로 홈으로 이동하면서
// 해당 섹션으로 가도록 "/#service" 형태로 바꾼다 — 안 그러면 눌러도 아무 일도
// 안 일어나는 죽은 링크가 된다.
export default function Footer() {
  const isHome = useLocation().pathname === "/";
  const section = (id) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.row}>
          <div className={styles.brand}>
            <div className={styles.brandName}>살릴지도</div>
            <p className={styles.brandDesc}>
              인구감소지역에서 며칠~한 달 살기를 준비하는 사람들을 위한 안내 서비스
            </p>
          </div>
          <div className={styles.links}>
            <div className={styles.heading}>바로가기</div>
            <a href={section("service")}>서비스 소개</a>
            <a href={section("regions")}>파일럿 지역</a>
            <a href={section("support")}>지원 프로그램</a>
          </div>
          <div className={styles.sources}>
            <div className={styles.heading}>데이터 출처</div>
            <ul className={styles.sourceList}>
              <li>관광 정보·사진 ⓒ한국관광공사</li>
              <li>인구감소지역 지정 현황 · 행정안전부</li>
              <li>비용은 공개 자료를 바탕으로 한 추정치이며 실제와 다를 수 있습니다.</li>
            </ul>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© 2026 살릴지도 · 파일럿 서비스</span>
          <a href="mailto:contact@sallil.kr">contact@sallil.kr</a>
        </div>
      </div>
    </footer>
  );
}
