import { useEffect, useRef, useState } from "react";

// 요소가 화면에 들어왔는지 알려준다. 홈 랜딩의 등장 애니메이션과 서비스
// 카드 순차 재생이 "스크롤해서 그 자리에 왔을 때" 시작되도록 하는 데 쓴다.
//
// once: true  — 한 번 들어오면 계속 true. 등장 애니메이션용(다시 올라갔다
//               내려와도 글자가 또 튀어나오지 않는다).
//        false — 들어오고 나갈 때마다 바뀐다. 재생/정지 제어용(화면 밖에서
//               타이머가 계속 도는 것을 막는다).
//
// IntersectionObserver가 없는 환경에서는 바로 true를 돌려준다 — 애니메이션
// 없이 완성된 상태로 보이는 편이 아무것도 안 보이는 것보다 낫다.
export function useInView({ threshold = 0.25, once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return [ref, inView];
}
