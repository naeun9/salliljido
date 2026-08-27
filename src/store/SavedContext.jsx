import { createContext, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { formatSavedDate } from "../utils/date.js";

// 저장한 지역/계획/관심 프로그램 상태. design state의 savedRegions/plans/
// saved(program id 목록, 2102줄)에 대응한다. RegionIntro·PlanEditor·
// SupportPrograms·MyPage가 전부 이 하나를 공유해야 저장 상태가 화면
// 간에 항상 동기화된다(이번 작업 지시 2번 항목).
export const SavedContext = createContext(null);

const STORAGE_KEY = "salliljido.saved.v1";

const initialState = {
  savedRegions: [], // { short, savedAt }[] — design state.savedRegions는 short만 담지만
  // 마이페이지 카드의 "OOOO.OO.OO 저장" 표시(1879줄)를 위해 저장 시각을 같이 둔다.
  savedPrograms: [], // design state.saved: 지원 프로그램 id 배열
  plans: [], // design state.plans: 저장된 체류 계획 배열
};

function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_REGION": {
      const on = state.savedRegions.some((r) => r.short === action.short);
      return {
        ...state,
        savedRegions: on
          ? state.savedRegions.filter((r) => r.short !== action.short)
          : state.savedRegions.concat({ short: action.short, savedAt: formatSavedDate() }),
      };
    }
    case "TOGGLE_PROGRAM": {
      const on = state.savedPrograms.includes(action.id);
      return {
        ...state,
        savedPrograms: on
          ? state.savedPrograms.filter((x) => x !== action.id)
          : state.savedPrograms.concat(action.id),
      };
    }
    // design confirmPlanName()(2438-2457줄): 계획은 id로 upsert한다 —
    // 같은 id로 다시 저장하면(변경사항 저장) 덮어쓰고, 새 id면 추가한다.
    case "SAVE_PLAN": {
      const exists = state.plans.some((p) => p.id === action.plan.id);
      return {
        ...state,
        plans: exists
          ? state.plans.map((p) => (p.id === action.plan.id ? action.plan : p))
          : state.plans.concat(action.plan),
      };
    }
    case "REMOVE_PLAN":
      return { ...state, plans: state.plans.filter((p) => p.id !== action.id) };
    default:
      return state;
  }
}

export function SavedProvider({ children }) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, initialState);
  const dispatch = (action) => setState((prev) => reducer(prev, action));

  const value = useMemo(
    () => ({
      ...state,
      toggleRegion: (short) => dispatch({ type: "TOGGLE_REGION", short }),
      toggleProgram: (id) => dispatch({ type: "TOGGLE_PROGRAM", id }),
      savePlan: (plan) => dispatch({ type: "SAVE_PLAN", plan }),
      removePlan: (id) => dispatch({ type: "REMOVE_PLAN", id }),
    }),
    [state]
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}
