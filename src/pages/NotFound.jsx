import NotFoundView from "../components/common/NotFoundView.jsx";
import Footer from "../components/common/Footer.jsx";

// 없는 경로(App.jsx의 path="*")로 들어왔을 때. design에는 없는 화면이라
// 지역을 못 찾았을 때(RegionNotFound)와 같은 셸을 쓰고 문구만 바꿨다.
// 헤더는 Layout이 이미 깔아 주고, 푸터는 랜딩처럼 화면이 직접 렌더한다.
export default function NotFound() {
  return (
    <div>
      <NotFoundView
        title="페이지를 찾을 수 없어요"
        body="주소가 잘못되었거나 더 이상 제공하지 않는 페이지예요. 홈에서 다시 시작하거나 지역부터 찾아보세요."
        actions={[
          { to: "/", label: "홈으로 돌아가기", variant: "primary" },
          { to: "/find", label: "지역 찾기", variant: "secondary" },
        ]}
      />
      <Footer />
    </div>
  );
}
