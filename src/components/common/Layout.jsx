import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import DataSourceNote from "./DataSourceNote.jsx";
import AuthGate from "./AuthGate.jsx";
import ScrollManager from "./ScrollManager.jsx";

// 원본엔 없던 파일. 원본은 화면 전환이 display:none 토글이라 헤더가 이미
// 항상 DOM에 한 번만 있었지만, react-router로 화면을 실제 라우트로 나누면서
// 모든 라우트가 같은 헤더를 공유하도록 감싸는 레이아웃이 필요해 추가했다.
// AuthGate(로그인 게이트 팝업)도 같은 이유로 여기 한 번만 둔다.

// 푸터 전체(브랜드·바로가기·데이터 출처·약관 링크)는 홈에서만 그린다.
// 원본 design도 푸터를 랜딩 전용으로 뒀고(279-307줄), 계획 편집처럼
// 작업하는 화면 아래에 80px 색면이 붙으면 화면이 끝난 것처럼 보여
// 방해가 된다.
//
// 대신 데이터 출처 표기는 홈에만 둘 수 없다 — 관광공사 오픈API 이용약관과
// 공모전 규정이 출처 표기를 요구하는데, 정작 그 데이터를 쓰는 화면에
// 표기가 하나도 없게 된다. 그래서 관광공사 데이터를 실제로 쓰는 화면에는
// 한 줄짜리 출처(DataSourceNote)를 남긴다.
const HOME_PATH = "/";

// 출처 한 줄이 붙는 화면. 관광공사 데이터(목록·상세·걷기 코스·방문자수·
// 사진)를 실제로 쓰는 곳만이다.
//   /find/result — 추천 카드 게이지(관광 목록 실측)와 지역 사진
//   /region/:id, /region/:id/explore — 지역 소개 통계·사진, 둘러보기 목록
//   /plan/:id — 둘러보기·일정 자동 생성이 관광 목록을 쓴다
//   /mypage — 저장한 지역 카드의 사진
// 빠지는 곳과 이유:
//   / — 푸터가 출처를 이미 담고 있다
//   /plan/:id/overview — 화면 맨 아래에 자체 출처 섹션이 있다(.impact)
//   /find, /login, /privacy, /terms, 404 — 관광공사 데이터를 쓰지 않는다
//   /support — 지자체 공고 데이터라 관광공사 출처와 무관하고,
//              화면에 이미 자체 안내 문구가 있다
function usesTourData(pathname) {
  if (pathname === "/find/result" || pathname === "/mypage") return true;
  if (pathname.startsWith("/region/")) return true;
  // 최종 계획(/plan/:id/overview)은 자체 출처 섹션이 있어 제외한다.
  if (pathname.startsWith("/plan/")) return !pathname.endsWith("/overview");
  return false;
}

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === HOME_PATH;

  return (
    <>
      {/* 라우트가 바뀌면 맨 위에서 시작하고, 뒤로 가기는 보던 위치로 돌린다. */}
      <ScrollManager />
      <Header />
      <Outlet />
      {isHome && <Footer />}
      {!isHome && usesTourData(pathname) && <DataSourceNote />}
      <AuthGate />
    </>
  );
}
