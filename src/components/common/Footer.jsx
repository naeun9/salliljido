import { Link, useLocation } from "react-router-dom";
import styles from "./Footer.module.css";

// design/salliljido.extracted.html 279-307줄. 원본은 랜딩 전용이었지만
// 지금은 Layout이 모든 라우트 아래에 한 번 그린다 — 데이터 출처 표기를
// 여기로 모았기 때문에, 관광공사 데이터를 쓰는 화면이면 어디서든 출처가
// 보여야 한다.
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
    <footer className={styles.footer} data-print-hide>
      <div className={styles.inner}>
        <div className={styles.row}>
          <div className={styles.brand}>
            <div className={styles.brandName}>살릴지도</div>
            {/* 히어로 서브 카피와 같은 문장이다 — 한쪽만 바꾸면 어긋난다. */}
            <p className={styles.brandDesc}>며칠이든 한 달이든, 조용한 지역에서 지내볼 준비를 돕습니다</p>
          </div>
          <div className={styles.links}>
            <div className={styles.heading}>바로가기</div>
            <a href={section("service")}>서비스 소개</a>
            <a href={section("regions")}>파일럿 지역</a>
            <a href={section("support")}>지원 프로그램</a>
          </div>
          <div className={styles.sources}>
            <div className={styles.heading}>데이터 출처</div>
            {/* 화면마다 흩어져 있던 출처 표기(지역 소개 · 둘러보기 탭 ·
                예상 비용 탭)를 여기 한 곳으로 모았다. 화면 안에서는
                본문을 가리기만 하고, 어차피 모두 같은 출처라 한 번만
                적으면 된다. */}
            <ul className={styles.sourceList}>
              <li>관광 정보·사진 ⓒ한국관광공사</li>
              <li>걷기 코스 ⓒ한국관광공사 두루누비</li>
              <li>인구감소지역 지정 현황 · 행정안전부</li>
              <li>지도 ⓒ카카오</li>
              <li>비용은 공개 자료를 바탕으로 한 추정치이며 실제와 다를 수 있습니다.</li>
            </ul>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© 2026 살릴지도 · 파일럿 서비스</span>
          {/* design에는 없던 줄. 구글 OAuth 게시에 약관·처리방침 링크가 필요하다. */}
          <div className={styles.policyLinks}>
            <Link to="/terms">서비스 이용약관</Link>
            <Link to="/privacy">개인정보처리방침</Link>
            <a href="mailto:contact@sallil.kr">contact@sallil.kr</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
