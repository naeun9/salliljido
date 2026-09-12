import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";

// 토스트 알림 상태. design state.toasts(2102줄)와 showToast()(3766-3770줄)를
// 옮긴 것이다.
//
// design의 시그니처: showToast(text, withLink, kind, undo)
//   text  문구
//   link  true면 "보러가기" 버튼이 붙는다(마이페이지로 이동)
//   kind  "ok" | "fail" — 아이콘 색과 모양만 달라진다
//   undo  함수를 주면 "되돌리기" 버튼이 붙고, 누르면 그 함수를 부른다
// 이름 있는 인자가 읽기 쉬워서 옵션 객체로 받되, 값과 동작은 그대로다.
export const ToastContext = createContext(null);

// design 3769줄: 3초 뒤 스스로 사라진다.
const TOAST_TTL_MS = 3000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);
  // 화면을 옮기거나 컴포넌트가 사라질 때 남은 타이머를 정리한다.
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((text, { link = false, kind = "ok", undo = null } = {}) => {
    seq.current += 1;
    const id = `t${seq.current}`;
    setToasts((prev) => prev.concat({ id, text, link, kind, undo }));
    timers.current.set(
      id,
      setTimeout(() => {
        timers.current.delete(id);
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_TTL_MS)
    );
    return id;
  }, []);

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach(clearTimeout);
      map.clear();
    };
  }, []);

  const value = useMemo(() => ({ toasts, showToast, dismiss }), [toasts, showToast, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
