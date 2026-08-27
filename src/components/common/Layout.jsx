import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import AuthGate from "./AuthGate.jsx";

// 원본엔 없던 파일. 원본은 화면 전환이 display:none 토글이라 헤더가 이미
// 항상 DOM에 한 번만 있었지만, react-router로 화면을 실제 라우트로 나누면서
// 모든 라우트가 같은 헤더를 공유하도록 감싸는 레이아웃이 필요해 추가했다.
// AuthGate(로그인 게이트 팝업)도 같은 이유로 여기 한 번만 둔다.
export default function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <AuthGate />
    </>
  );
}
