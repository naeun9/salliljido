import { useState } from "react";

// "계획 만들기 / 다시 만들기"의 로딩 연출과 상태를 한데 모은 훅.
// ScheduleTab.jsx가 300줄을 넘어(CLAUDE.md 코드 원칙) 떼어냈고, 동작·시간은
// 옮기기 전 그대로다(design 2836-2851줄: 생성 1200ms, 재생성 1000ms —
// 실제 계산은 즉시 끝나지만 원본이 이 연출을 갖고 있어 유지한다).
export function useRoutineActions(plan, onStarted) {
  const [routineLoading, setRoutineLoading] = useState(false);
  const [regenAsk, setRegenAsk] = useState(false);

  function run(ms, apply) {
    setRoutineLoading(true);
    setTimeout(() => {
      setRoutineLoading(false);
      apply();
    }, ms);
  }

  return {
    routineLoading,
    regenAsk,
    setRegenAsk,
    makeRoutine() {
      if (routineLoading) return;
      run(1200, () => {
        plan.startRoutine();
        onStarted();
      });
    },
    askRegen() {
      if (!routineLoading) setRegenAsk(true);
    },
    // 담은 것은 그대로 두고 자동 생성 슬롯만 다시 뽑는다.
    regenKeep() {
      setRegenAsk(false);
      run(1000, () => plan.bumpRegenSeed());
    },
    // 고른 대체 장소·직접 추가까지 지우고 처음부터 다시 만든다.
    regenAll() {
      setRegenAsk(false);
      run(1000, () => plan.resetForRegenAll());
    },
  };
}
