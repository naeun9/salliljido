import { useMapContext } from "./KakaoMap.jsx";

// 원본 디자인의 확대(+)/축소(−) 버튼. design 971-980줄.
// 목업 시절에는 클릭해도 아무 일이 없는 장식이었는데(핸들러 자체가 없었다)
// 실제 지도가 붙으면서 map.setLevel()에 연결했다. 카카오 기본 ZoomControl로
// 바꾸지 않는 이유는 그러면 원본 버튼 디자인이 사라지기 때문이다.
// 모양은 화면별 CSS 클래스를 그대로 받아 쓴다.
export default function MapZoomControl({ className, buttonClassName }) {
  const ctx = useMapContext();

  function step(delta) {
    if (!ctx) return;
    ctx.map.setLevel(ctx.map.getLevel() + delta, { animate: true });
  }

  return (
    <div className={className}>
      <button type="button" aria-label="확대" className={buttonClassName} onClick={() => step(-1)}>
        +
      </button>
      <button type="button" aria-label="축소" className={buttonClassName} onClick={() => step(1)}>
        −
      </button>
    </div>
  );
}
