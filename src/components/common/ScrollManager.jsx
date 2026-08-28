import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// 원본엔 없던 파일. 원본은 화면 전환이 display:none 토글이라 스크롤 위치가
// 화면마다 따로 없었지만(문서는 하나였다), react-router로 라우트를 나눈 뒤로는
// 새 화면으로 가도 이전 화면의 스크롤 위치가 그대로 남는다 — 지역 소개 화면
// 아래쪽에서 "이 지역 살펴보기"를 누르면 계획 화면 중간부터 보였다.
//
// 규칙:
//  - PUSH/REPLACE(링크·버튼으로 새 화면) → 항상 맨 위에서 시작
//  - POP(뒤로/앞으로 가기) → 그 화면에서 보고 있던 위치로 복원
//  - 해시(#service)가 있으면 건드리지 않는다. 앵커 이동이 우선이다.
//  - 경로는 그대로고 쿼리만 바뀌면(계획 화면의 `?tab=`) 화면 이동이 아니라
//    같은 화면 안의 전환이므로 스크롤을 건드리지 않는다. 탭마다 위치를 따로
//    기억하지 않고 그냥 두는 쪽을 택했다 — 탭바가 상단 고정이라 어느 탭이든
//    바로 다시 누를 수 있고, 짧은 탭으로 옮기면 브라우저가 알아서 끝까지만
//    내려 준다. 뒤로 가기로 탭을 되돌아갈 때는 위 POP 규칙대로 복원된다.
const positions = new Map();

// POP 복원은 데이터가 늦게 붙는 화면(목록·지도)에서 한 번에 안 된다.
// 관광공사 API 응답이 붙어 문서가 원래 길이로 자랄 때까지 기다려야 해서,
// 프레임 수가 아니라 시간으로 예산을 잡는다(실측 1초 안팎에 채워진다).
const RESTORE_BUDGET_MS = 1500;

export default function ScrollManager() {
  const { key, hash, pathname } = useLocation();
  const navType = useNavigationType();
  const keyRef = useRef(key);
  // 직전에 처리한 위치. 쿼리만 바뀐 전환을 가려내고, StrictMode가 같은
  // 이동에 대해 효과를 두 번 실행할 때 두 번째를 건너뛰는 데도 쓴다.
  const lastRef = useRef({ key: null, pathname: null });

  // 브라우저 자체 복원을 끄고 이 컴포넌트가 전담한다. 둘이 같이 돌면
  // 새로고침 직후 브라우저가 먼저 옮겨 놓은 위치와 어긋난다.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // 지금 화면의 스크롤 위치를 계속 기록해 둔다(뒤로 가기 때 쓸 값).
  useEffect(() => {
    keyRef.current = key;
    const onScroll = () => positions.set(keyRef.current, window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    // 떠날 때 window.scrollY를 한 번 더 저장하면 안 된다. 정리 함수는
    // 아래 useLayoutEffect(맨 위로 이동)보다 늦게 돌아서, 이미 0이 된
    // 값을 이전 화면 위치로 덮어쓴다. 기록은 스크롤 이벤트에만 맡긴다.
    return () => window.removeEventListener("scroll", onScroll);
  }, [key]);

  useLayoutEffect(() => {
    const prev = lastRef.current;
    const handled = prev.key === key;
    const sameScreen = prev.pathname === pathname;
    lastRef.current = { key, pathname };

    if (handled || hash) return;
    // 탭 전환(같은 경로 + 쿼리만 변경)은 그대로 둔다.
    if (sameScreen && navType !== "POP") return;

    const target = navType === "POP" ? (positions.get(key) ?? 0) : 0;
    let frame = 0;
    const deadline = performance.now() + RESTORE_BUDGET_MS;

    const jump = () => {
      // html에 scroll-behavior: smooth가 걸려 있어서, 화면 전환은 잠깐
      // 꺼 두고 즉시 이동시킨다(전환할 때마다 스르륵 올라가면 어지럽다).
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, target);
      root.style.scrollBehavior = prev;
    };

    jump();

    // 복원은 문서가 아직 짧으면 원하는 위치까지 못 간다. 자랄 때까지 재시도.
    // 단, 그 사이 사용자가 직접 스크롤하면 즉시 손을 뗀다 — 안 그러면
    // 사용자가 움직인 화면을 우리가 도로 끌어당긴다.
    if (target > 0) {
      let stopped = false;
      const stop = () => {
        stopped = true;
      };
      const events = ["wheel", "touchstart", "keydown"];
      events.forEach((e) => window.addEventListener(e, stop, { passive: true, once: true }));

      const retry = () => {
        if (stopped || performance.now() > deadline) return;
        if (Math.abs(window.scrollY - target) > 2) {
          jump();
          frame = requestAnimationFrame(retry);
        }
      };
      frame = requestAnimationFrame(retry);

      return () => {
        events.forEach((e) => window.removeEventListener(e, stop));
        if (frame) cancelAnimationFrame(frame);
      };
    }

    return () => frame && cancelAnimationFrame(frame);
  }, [key, hash, pathname, navType]);

  return null;
}
