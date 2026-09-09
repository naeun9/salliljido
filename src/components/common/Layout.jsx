import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import AuthGate from "./AuthGate.jsx";
import ScrollManager from "./ScrollManager.jsx";

// 원본엔 없던 파일. 원본은 화면 전환이 display:none 토글이라 헤더가 이미
// 항상 DOM에 한 번만 있었지만, react-router로 화면을 실제 라우트로 나누면서
// 모든 라우트가 같은 헤더를 공유하도록 감싸는 레이아웃이 필요해 추가했다.
// AuthGate(로그인 게이트 팝업)도 같은 이유로 여기 한 번만 둔다.
//
// 푸터도 여기서 한 번만 그린다. 예전에는 홈·약관·404 세 화면이 각자
// 불렀는데, 데이터 출처 표기를 푸터로 모으면서 관광공사 데이터를 실제로
// 쓰는 화면(지역 소개·둘러보기·계획 편집·최종 계획)에 출처가 하나도
// 남지 않게 됐다. 화면마다 붙이면 새 화면을 만들 때 또 빠지므로,
// 라우트 전체가 공유하는 이 자리에 둔다.
export default function Layout() {
  return (
    <>
      {/* 라우트가 바뀌면 맨 위에서 시작하고, 뒤로 가기는 보던 위치로 돌린다. */}
      <ScrollManager />
      <Header />
      <Outlet />
      <Footer />
      <AuthGate />
    </>
  );
}
