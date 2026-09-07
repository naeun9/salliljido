import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./store/AuthContext.jsx";
import { SearchProvider } from "./store/SearchContext.jsx";
import { SavedProvider } from "./store/SavedContext.jsx";
import { ToastProvider } from "./store/ToastContext.jsx";
import Layout from "./components/common/Layout.jsx";
import ToastStack from "./components/common/ToastStack.jsx";
import Home from "./pages/Home.jsx";
import RegionSearch from "./pages/RegionSearch.jsx";
import RegionResult from "./pages/RegionResult.jsx";
import RegionIntro from "./pages/RegionIntro.jsx";
import RegionExplore from "./pages/RegionExplore.jsx";
import PlanEditor from "./pages/PlanEditor.jsx";
import PlanOverview from "./pages/PlanOverview.jsx";
import SupportPrograms from "./pages/SupportPrograms.jsx";
import MyPage from "./pages/MyPage.jsx";
import Login from "./pages/Login.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import NotFound from "./pages/NotFound.jsx";

// 화면 목록과 경로는 docs/01-analysis.md §1 표를 따른다.
// design의 overview(최종 계획) 화면은 detail의 하위 전체화면이라 요청
// 구조표에는 없지만, 자체 상단 바를 가진 별도 화면이라 탭이 아닌
// /plan/:regionId/overview 경로로 잡았다.
export default function App() {
  return (
    <BrowserRouter>
      {/* ToastProvider가 가장 바깥이다 — AuthContext(로그인 완료 안내)처럼
          다른 store도 토스트를 띄우기 때문이다. */}
      <ToastProvider>
        <AuthProvider>
          <SearchProvider>
            <SavedProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/find" element={<RegionSearch />} />
                  <Route path="/find/result" element={<RegionResult />} />
                  <Route path="/region/:regionId" element={<RegionIntro />} />
                  {/* 계획을 만들지 않고 지역만 둘러보는 화면 */}
                  <Route path="/region/:regionId/explore" element={<RegionExplore />} />
                  <Route path="/plan/:regionId" element={<PlanEditor />} />
                  <Route path="/plan/:regionId/overview" element={<PlanOverview />} />
                  <Route path="/support" element={<SupportPrograms />} />
                  <Route path="/mypage" element={<MyPage />} />
                  <Route path="/login" element={<Login />} />
                  {/* design에는 없는 화면. 구글 OAuth 게시에 필요하다. */}
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  {/* 없는 주소도 헤더가 있는 안내 화면으로 받는다. Layout 안에
                    두어야 헤더가 같이 나온다. */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </SavedProvider>
          </SearchProvider>
        </AuthProvider>
        {/* design 522줄: 화면 오른쪽 아래 고정. 라우트 밖에 한 번만 둔다. */}
        <ToastStack />
      </ToastProvider>
    </BrowserRouter>
  );
}
