import { createContext, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";

// 지역 찾기(조건 선택) 화면의 선택 상태. design state의 region/dur/place/
// customDays(2102줄)에 대응. RegionResult, RegionIntro 등 다음 화면에서
// 이 조건으로 추천 목록을 계산하므로(design pool()/recs(), 3611-3675줄)
// 화면 하나에 가두지 않고 여기서 공유한다. PlanContext와 분리한 이유:
// 저건 지역을 고른 "이후"(체류 계획) 상태라 관심사가 다르다.
//
// localStorage에 담는 이유: 원본은 화면 전환이 display 토글이라 조건이
// 사라질 일이 없었지만, 라우팅이 생기면서 새로고침하거나 /plan/:id 같은
// 주소로 바로 들어오면 조건이 초기화돼 체류 일수·비용이 기본값으로
// 되돌아갔다. 저장하는 값은 전부 사용자가 고른 것(지역/기간/라이프스타일)
// 이고 관광공사 API 응답은 담지 않는다.
export const SearchContext = createContext(null);

const STORAGE_KEY = "salliljido.search.v1";

const initialState = {
  region: "", // "강원" | "충남" | "경북" | "상관없음"
  dur: "", // "1주" | "2주" | "1달" | "직접 입력"
  place: "", // "자연" | "바다" | "산" | "소도시"
  customDays: 5, // design 기본값(2102줄)
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_REGION":
      return { ...state, region: action.region };
    case "SET_DUR":
      return { ...state, dur: action.dur };
    case "SET_PLACE":
      return { ...state, place: action.place };
    case "SET_CUSTOM_DAYS":
      return { ...state, customDays: action.customDays };
    // 저장된 계획을 다시 열 때(MyPage) 그 계획을 만들 당시의 조건을
    // 한 번에 되돌린다. PlanEditor는 이 조건(dur/place/customDays)으로
    // 체류 일수를 계산하므로, 계획을 여는 순간 마운트되기 전에 미리
    // 맞춰둬야 한다.
    case "RESTORE":
      return { ...state, ...action.condition };
    default:
      return state;
  }
}

export function SearchProvider({ children }) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, initialState);
  const dispatch = (action) => setState((prev) => reducer(prev, action));

  const value = useMemo(
    () => ({
      ...state,
      setRegion: (region) => dispatch({ type: "SET_REGION", region }),
      setDur: (dur) => dispatch({ type: "SET_DUR", dur }),
      setPlace: (place) => dispatch({ type: "SET_PLACE", place }),
      setCustomDays: (customDays) => dispatch({ type: "SET_CUSTOM_DAYS", customDays }),
      restore: (condition) => dispatch({ type: "RESTORE", condition }),
    }),
    [state]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}
