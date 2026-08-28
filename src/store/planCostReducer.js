// 예상 비용 탭의 상태 변경만 모았다. planReducer.js가 300줄을 넘어
// (CLAUDE.md 코드 원칙) 갈라 둔 것이고, case 내용은 옮기기 전 그대로다.
import { DEFAULT_NIGHTLY } from "../utils/cost.js";

export function costReducer(state, action) {
  switch (action.type) {
    case "SET_PLAN_SAVED":
      return { ...state, planSaved: action.saved };
    case "SET_NIGHTLY":
      return { ...state, nightly: action.value };
    case "TOGGLE_STAY_SPLIT":
      return {
        ...state,
        staySplit: !state.staySplit,
        staySegs: state.staySegs.length ? state.staySegs : action.fallbackSegs,
      };
    case "ADD_STAY_SEGMENT":
      return {
        ...state,
        staySegs: (state.staySegs.length ? state.staySegs : action.fallbackSegs).concat(action.segment),
      };
    case "UPDATE_STAY_SEGMENT": {
      const base = state.staySegs.length ? state.staySegs : action.fallbackSegs;
      return {
        ...state,
        staySegs: base.map((g, i) => (i === action.index ? { ...g, ...action.patch } : g)),
      };
    }
    case "REMOVE_STAY_SEGMENT": {
      const base = state.staySegs.length ? state.staySegs : action.fallbackSegs;
      return { ...state, staySegs: base.filter((_, i) => i !== action.index) };
    }
    case "SET_FOOD_STYLE":
      return { ...state, foodStyle: action.style };
    case "TOGGLE_FOOD_MANUAL":
      return {
        ...state,
        foodManual: !state.foodManual,
        foodByDay: false,
        foodPer: state.foodPer === undefined ? action.autoPer : state.foodPer,
      };
    case "SET_FOOD_PER":
      return { ...state, foodPer: action.value };
    case "SET_TRIP_MANUAL_TOTAL":
      return { ...state, tripManualTotal: action.value };
    case "ADD_ETC_ROW":
      return {
        ...state,
        etcRows: state.etcRows.concat([{ memo: "", amount: "" }]),
      };
    case "UPDATE_ETC_ROW":
      return {
        ...state,
        etcRows: state.etcRows.map((row, i) =>
          i === action.index ? { ...row, [action.key]: action.value } : row
        ),
      };
    case "REMOVE_ETC_ROW":
      return {
        ...state,
        etcRows: state.etcRows.filter((_, i) => i !== action.index),
      };
    default:
      return state;
  }
}
