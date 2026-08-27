import { useEffect, useState } from "react";

// 좁은 화면(모바일) 여부. design의 state.narrow(window.innerWidth < 760,
// 2123줄)와 같은 기준이고, CSS 쪽 `@media (max-width: 759px)`와도 맞는다.
const QUERY = "(max-width: 759px)";

export function useNarrowScreen() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = (e) => setNarrow(e.matches);
    setNarrow(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return narrow;
}
