import { useContext } from "react";
import { SavedContext } from "../store/SavedContext.jsx";

// SavedContext(저장한 지역/계획/관심 프로그램)를 소비하는 훅.
export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved는 SavedProvider 안에서만 쓸 수 있습니다.");
  return ctx;
}
