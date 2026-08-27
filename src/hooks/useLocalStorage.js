import { useEffect, useState } from "react";

// localStorage와 동기화되는 useState. 값이 바뀔 때마다 저장하고, 최초
// 마운트 시 저장된 값이 있으면 그걸로 초기화한다(새로고침해도 유지).
// SavedContext(저장한 지역/계획/프로그램)가 이 훅 위에서 reducer를 돌린다.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage를 못 쓰는 환경(프라이빗 모드 용량 초과 등)이면 그냥
      // 이번 세션 메모리 상태로만 동작한다.
    }
  }, [key, value]);

  return [value, setValue];
}
