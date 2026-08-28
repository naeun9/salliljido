import { createContext, useMemo, useReducer } from "react";
import { initialState, reducer } from "./planReducer.js";

// PlanEditor의 3개 탭이 공유하는 상태. 상태 정의·리듀서는 planReducer.js에
// 있고 여기서는 Provider와 액션 함수만 만든다(design state 2102줄).
export const PlanContext = createContext(null);

// utils/planSnapshot.js가 만든 스냅샷을 여기로 넘겨 기본값 위에 덮어쓴다.
export function PlanProvider({ children, initial }) {
  const [state, dispatch] = useReducer(
    reducer,
    initial ? { ...initialState, ...initial } : initialState,
  );

  const value = useMemo(
    () => ({
      ...state,
      setPlanTitle: (title) => dispatch({ type: "SET_PLAN_TITLE", title }),
      setExperienceDay: (id, day, price) =>
        dispatch({ type: "SET_EXPERIENCE_DAY", id, day, price }),
      setExperiencePrice: (id, value) =>
        dispatch({ type: "SET_EXPERIENCE_PRICE", id, value }),
      removeExperience: (id) => dispatch({ type: "REMOVE_EXPERIENCE", id }),
      toggleUtility: (id) => dispatch({ type: "TOGGLE_UTILITY", id }),
      toggleSpot: (id) => dispatch({ type: "TOGGLE_SPOT", id }),
      setUtilityDay: (id, day) =>
        dispatch({ type: "SET_UTILITY_DAY", id, day }),
      setSpotDay: (id, day) => dispatch({ type: "SET_SPOT_DAY", id, day }),
      setItemTime: (key, start, end) =>
        dispatch({ type: "SET_ITEM_TIME", key, start, end }),
      setTripExtra: (value) => dispatch({ type: "SET_TRIP_EXTRA", value }),
      toggleFoodByDay: () => dispatch({ type: "TOGGLE_FOOD_BY_DAY" }),
      setFoodDay: (day, value) =>
        dispatch({ type: "SET_FOOD_DAY", day, value }),
      setStayPick: (id, from, to, rate, fallbackSegs) =>
        dispatch({ type: "SET_STAY_PICK", id, from, to, rate, fallbackSegs }),
      removeStayPick: (id, fallbackSegs) =>
        dispatch({ type: "REMOVE_STAY_PICK", id, fallbackSegs }),
      toggleTheme: (theme) => dispatch({ type: "TOGGLE_THEME", theme }),
      toggleMeal: (meal) => dispatch({ type: "TOGGLE_MEAL", meal }),
      startRoutine: () => dispatch({ type: "START_ROUTINE" }),
      setMealOverride: (day, cuisine) =>
        dispatch({ type: "SET_MEAL_OVERRIDE", day, cuisine }),
      setPick: (day, slot, value) =>
        dispatch({ type: "SET_PICK", day, slot, value }),
      addCustomItem: (item) => dispatch({ type: "ADD_CUSTOM_ITEM", item }),
      removeCustomItem: (id) => dispatch({ type: "REMOVE_CUSTOM_ITEM", id }),
      bumpRegenSeed: () => dispatch({ type: "BUMP_REGEN_SEED" }),
      resetForRegenAll: () => dispatch({ type: "RESET_FOR_REGEN_ALL" }),

      setPlanSaved: (saved) => dispatch({ type: "SET_PLAN_SAVED", saved }),
      setNightly: (value) => dispatch({ type: "SET_NIGHTLY", value }),
      toggleStaySplit: (fallbackSegs) =>
        dispatch({ type: "TOGGLE_STAY_SPLIT", fallbackSegs }),
      addStaySegment: (segment, fallbackSegs) =>
        dispatch({ type: "ADD_STAY_SEGMENT", segment, fallbackSegs }),
      updateStaySegment: (index, patch, fallbackSegs) =>
        dispatch({ type: "UPDATE_STAY_SEGMENT", index, patch, fallbackSegs }),
      removeStaySegment: (index, fallbackSegs) =>
        dispatch({ type: "REMOVE_STAY_SEGMENT", index, fallbackSegs }),
      setFoodStyle: (style) => dispatch({ type: "SET_FOOD_STYLE", style }),
      toggleFoodManual: (autoPer) =>
        dispatch({ type: "TOGGLE_FOOD_MANUAL", autoPer }),
      setFoodPer: (value) => dispatch({ type: "SET_FOOD_PER", value }),
      setTripManualTotal: (value) =>
        dispatch({ type: "SET_TRIP_MANUAL_TOTAL", value }),
      addEtcRow: () => dispatch({ type: "ADD_ETC_ROW" }),
      updateEtcRow: (index, key, value) =>
        dispatch({ type: "UPDATE_ETC_ROW", index, key, value }),
      removeEtcRow: (index) => dispatch({ type: "REMOVE_ETC_ROW", index }),
    }),
    [state],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
