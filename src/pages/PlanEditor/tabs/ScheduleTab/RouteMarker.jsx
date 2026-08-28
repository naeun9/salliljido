import styles from "./RouteMarker.module.css";

// design/salliljido.extracted.html 981-989줄의 번호 핀.
//
// 원본에는 핀 위에 뜨는 정보 카드(이름·태그·설명·주소)가 붙어 있었는데,
// 주소가 실데이터에서 길어 176px 박스를 넘치고 화면 우하단의 상세 카드
// (SelectionCard)와 같은 내용을 두 번 보여 줬다. 지도에는 번호만 남기고
// 상세는 SelectionCard 한 곳에서만 보여 준다.
//
// 위치는 CustomOverlay가 좌표로 잡는다. 여기서는 모양만 그린다.
export default function RouteMarker({ num, color, size, selected, onClick, onMouseEnter, onMouseLeave }) {
  return (
    <div
      className={styles.markerBase}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span
        className={`${styles.num} ${selected ? styles.selected : ""}`}
        style={{ width: size, height: size, background: color }}
      >
        {num}
      </span>
    </div>
  );
}
