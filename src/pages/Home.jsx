import Hero from "./Home/Hero.jsx";
import ServiceSteps from "./Home/ServiceSteps.jsx";
import RegionCarousel from "./Home/RegionCarousel.jsx";
import SupportTeaser from "./Home/SupportTeaser.jsx";
import ClosingCta from "./Home/ClosingCta.jsx";
import Footer from "../components/common/Footer.jsx";

// design/salliljido.extracted.html 83-308줄(landingDisplay). 원본은 화면
// 전환이 display:none 토글이라 이 섹션들이 늘 한 DOM에 같이 있었지만,
// react-router에서는 "/" 라우트 하나가 이 섹션들을 그대로 이어붙인 형태다.
export default function Home() {
  return (
    <div>
      <Hero />
      <ServiceSteps />
      <RegionCarousel />
      <SupportTeaser />
      <ClosingCta />
      <Footer />
    </div>
  );
}
