import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import styles from "./Header.module.css";
import menuStyles from "./MobileMenu.module.css";

// design/salliljido.extracted.html 41-82줄, 3883줄의 화면→활성 nav 매핑을 그대로 옮김.
// 원본 변수명(service/regions/support)이 실제 라벨과 어긋나 헷갈려서
// (예: "지원 프로그램" 링크가 내부적으로는 "regions"), 매핑 결과는 동일하게
// 유지하되 여기서는 라벨과 일치하는 이름(find/programs/mypage)을 썼다.
function activeNavId(pathname) {
  if (pathname === "/") return "home";
  if (pathname === "/support") return "programs";
  if (pathname === "/mypage") return "mypage";
  // /find, /find/result, /region/:id, /plan/:id 는 전부 "지역 찾기" 흐름.
  // 예전엔 여기 안 걸리는 경로를 전부 "find"로 떨어뜨렸는데, 없는 주소
  // 화면(pages/NotFound)이 생기면서 404에서도 "지역 찾기"에 밑줄이 그어졌다.
  // 그래서 해당 흐름만 명시적으로 잡고 나머지(로그인·404)는 비워 둔다.
  if (pathname === "/find" || pathname.startsWith("/find/")) return "find";
  if (pathname.startsWith("/region/") || pathname.startsWith("/plan/")) return "find";
  return "";
}

const MYPAGE_GATE = [
  "마이페이지는 로그인 후 볼 수 있어요",
  "저장한 지역과 계획을 계정에 담아 두려면 로그인이 필요합니다.",
];

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { auth, requireAuth, logout } = useAuth();
  const [rawScrolled, setRawScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const isHome = pathname === "/";
  // 원본 3880줄: landing 화면이 아니면 헤더는 항상 스크롤된(불투명) 스타일.
  const scrolled = isHome ? rawScrolled : true;
  const active = activeNavId(pathname);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setRawScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  function handleLogoClick(e) {
    e.preventDefault();
    setMenuOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  }

  // design goPlan(4029-4038줄): 비로그인이면 이동을 막고 게이트를 띄운다.
  function handleMypageClick(e) {
    setMenuOpen(false);
    if (!auth) {
      e.preventDefault();
      requireAuth(...MYPAGE_GATE);
    }
  }

  function handleLogout() {
    logout();
    setAccountMenuOpen(false);
  }

  const navItems = [
    { id: "home", label: "홈", to: "/" },
    { id: "find", label: "지역 찾기", to: "/find" },
    { id: "programs", label: "지원 프로그램", to: "/support" },
    { id: "mypage", label: "마이페이지", to: "/mypage" },
  ];

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`} data-print-hide>
        <a href="/" onClick={handleLogoClick} aria-label="살릴지도 홈으로" className={styles.logo}>
          살릴지도
        </a>
        <div className={styles.actions}>
          <nav className={styles.nav}>
            {navItems.map((item) =>
              item.id === "home" ? (
                <a
                  key={item.id}
                  href="/"
                  onClick={handleLogoClick}
                  className={`${styles.navLink} ${active === item.id ? styles.active : ""}`}
                >
                  {item.label}
                  <span className={styles.navUnderline} />
                </a>
              ) : (
                <Link
                  key={item.id}
                  to={item.to}
                  onClick={item.id === "mypage" ? handleMypageClick : undefined}
                  className={`${styles.navLink} ${active === item.id ? styles.active : ""}`}
                >
                  {item.label}
                  <span className={styles.navUnderline} />
                </Link>
              )
            )}
          </nav>
          <div className={styles.authArea}>
            {!auth && (
              <Link to="/login" state={{ from: pathname }} className={styles.loginBtn}>
                로그인
              </Link>
            )}
            {auth === "demo" && <span className={styles.demoBadge}>데모</span>}
            {auth && (
              <div className={styles.accountWrap}>
                <button
                  type="button"
                  aria-label="계정 메뉴"
                  className={styles.avatarBtn}
                  onClick={() => setAccountMenuOpen((v) => !v)}
                >
                  {auth === "demo" ? "데" : "나"}
                </button>
                {accountMenuOpen && (
                  <div className={styles.accountMenu}>
                    <Link
                      to="/mypage"
                      className={styles.accountMenuItem}
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      마이페이지
                    </Link>
                    <button type="button" className={styles.accountMenuItem} onClick={handleLogout}>
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <button className={styles.burger} aria-label="메뉴 열기" onClick={() => setMenuOpen(true)}>
          <span className={styles.burgerBar} />
          <span className={styles.burgerBar} />
          <span className={styles.burgerBar} />
        </button>
      </header>

      <div className={`${menuStyles.overlay} ${menuOpen ? menuStyles.open : ""}`} data-print-hide>
        <div className={menuStyles.overlayTop}>
          <a
            href="/"
            onClick={handleLogoClick}
            aria-label="살릴지도 홈으로"
            className={menuStyles.overlayLogo}
          >
            살릴지도
          </a>
          <button
            className={menuStyles.overlayClose}
            aria-label="메뉴 닫기"
            onClick={() => setMenuOpen(false)}
          >
            ×
          </button>
        </div>
        <nav className={menuStyles.overlayNav}>
          <a href="/" onClick={handleLogoClick} className={menuStyles.overlayLink}>
            홈
          </a>
          <Link to="/find" className={menuStyles.overlayLink} onClick={() => setMenuOpen(false)}>
            지역 찾기
          </Link>
          <Link to="/support" className={menuStyles.overlayLink} onClick={() => setMenuOpen(false)}>
            지원 프로그램
          </Link>
          <Link to="/mypage" className={menuStyles.overlayLink} onClick={handleMypageClick}>
            마이페이지
          </Link>
          {/* design 79줄: 이 버튼은 라벨만 mobileAuthLabel(로그인/마이페이지)로
              바뀌고 클릭 핸들러는 항상 goLogin(로그인 화면 이동)에 묶여
              있어서, 로그인 상태에서도 "마이페이지"를 누르면 로그인
              화면으로 가는 오동작이 있었다. 라벨과 다른 곳으로 보내는
              눈에 띄는 오작동이라 라벨에 맞게 고쳤다(§ 완료 보고 참고). */}
          {auth ? (
            <Link to="/mypage" className={menuStyles.overlayCta} onClick={() => setMenuOpen(false)}>
              마이페이지
            </Link>
          ) : (
            <Link
              to="/login"
              state={{ from: pathname }}
              className={menuStyles.overlayCta}
              onClick={() => setMenuOpen(false)}
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
