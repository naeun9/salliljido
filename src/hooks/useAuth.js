import { useContext } from "react";
import { AuthContext } from "../store/AuthContext.jsx";

// AuthContext(로그인 상태)를 소비하는 훅.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 안에서만 쓸 수 있습니다.");
  return ctx;
}
