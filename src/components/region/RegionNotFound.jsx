import NotFoundView from "../common/NotFoundView.jsx";

// 존재하지 않는 regionId로 /region/:id, /plan/:id에 들어왔을 때 보여준다.
// design에는 없는 화면(원본은 항상 detail이 채워진 채로만 이 화면들에
// 왔다). RegionIntro/PlanEditor가 공유하는 컴포넌트.
export default function RegionNotFound() {
  return (
    <NotFoundView
      title="지역 정보를 찾을 수 없어요"
      body="주소가 잘못되었거나 더 이상 제공하지 않는 지역이에요. 추천 결과를 다시 보거나 조건을 다시 골라주세요."
      actions={[
        { to: "/find/result", label: "추천 결과 다시 보기", variant: "primary" },
        { to: "/find", label: "조건 다시 고르기", variant: "secondary" },
      ]}
    />
  );
}
