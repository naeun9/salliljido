import { useContext } from "react";
import { ToastContext } from "../store/ToastContext.jsx";

// 토스트를 띄우는 훅. showToast("문구", { link, kind, undo })로 쓴다.
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast는 ToastProvider 안에서만 쓸 수 있습니다.");
  return ctx;
}
