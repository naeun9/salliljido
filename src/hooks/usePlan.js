import { useContext } from "react";
import { PlanContext } from "../store/PlanContext.jsx";

// PlanContext(체류 계획 상태)를 소비하는 훅.
export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan은 PlanProvider 안에서만 쓸 수 있습니다.");
  return ctx;
}
