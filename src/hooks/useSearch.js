import { useContext } from "react";
import { SearchContext } from "../store/SearchContext.jsx";

// SearchContext(지역/기간/라이프스타일 선택 상태)를 소비하는 훅.
export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch는 SearchProvider 안에서만 쓸 수 있습니다.");
  return ctx;
}
