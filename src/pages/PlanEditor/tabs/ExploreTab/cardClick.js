// 카드 본문을 누르면 상세 모달, 카드 안 버튼·링크·입력은 원래 동작.
//
// 카드 전체에 onClick을 걸면 "계획에 추가" 버튼이나 예약 링크를 눌러도
// 모달이 같이 뜬다. 컨트롤에서 시작한 클릭은 무시한다.
const CONTROLS = "button, a, select, input, textarea, label";

export function cardBodyClick(handler) {
  return (e) => {
    if (e.target.closest(CONTROLS)) return;
    handler();
  };
}
