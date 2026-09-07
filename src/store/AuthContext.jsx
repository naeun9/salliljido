import { createContext, useMemo, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { useToast } from "../hooks/useToast.js";

// 로그인 상태. design state의 auth("google"|"demo"|null)/hasLoggedInBefore
// (2102줄)에 대응한다. 새로고침해도 유지되도록 auth/hasLoggedInBefore만
// localStorage에 담고, gate(로그인 게이트 팝업)는 화면에 떠 있는 동안만
// 필요한 값이라 세션 메모리에만 둔다.
export const AuthContext = createContext(null);

const STORAGE_KEY = "salliljido.auth.v1";
const initialPersisted = { auth: null, hasLoggedInBefore: false };

// design finishLogin()(3788-3794줄)의 이름 그대로. 이 서비스에는 아직 계정
// 이름 개념이 없어서 로그인 종류로만 부른다.
const NAMES = { demo: "데모 이용자", google: "김서연" };

export function AuthProvider({ children }) {
  const [persisted, setPersisted] = useLocalStorage(STORAGE_KEY, initialPersisted);
  const [gate, setGate] = useState(null); // { title, body } | null — design state.gate
  const { showToast } = useToast();

  function login(kind) {
    const first = !persisted.hasLoggedInBefore;
    setPersisted({ auth: kind, hasLoggedInBefore: true });
    setGate(null);
    showToast(first ? `환영합니다, ${NAMES[kind] || "이용자"}님` : "다시 오셨네요");
  }
  function logout() {
    setPersisted((prev) => ({ ...prev, auth: null }));
  }
  function openGate(title, body) {
    setGate({ title, body });
  }
  function closeGate() {
    setGate(null);
  }
  // design requireAuth(title, body)(4446-4451줄 부근): 로그인 상태면 true,
  // 아니면 게이트를 띄우고 false. design의 pendingAction/loginFrom은
  // 로그인 성공 후에도 실제로 아무 데서도 읽지 않는 죽은 상태라(끝까지
  // 확인함) 옮기지 않았다 — 로그인 게이트를 통과한 뒤 사용자가 하려던
  // 동작(저장 등)을 자동으로 재시도하지는 않는다(원본도 마찬가지).
  function requireAuth(title, body) {
    if (persisted.auth) return true;
    openGate(title, body);
    return false;
  }

  const value = useMemo(
    () => ({
      auth: persisted.auth,
      hasLoggedInBefore: persisted.hasLoggedInBefore,
      gate,
      login,
      logout,
      openGate,
      closeGate,
      requireAuth,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [persisted, gate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
