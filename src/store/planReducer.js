// 계획 상태의 초기값과 리듀서. PlanContext.jsx가 300줄을 넘어(CLAUDE.md
// 코드 원칙) 상태 정의와 Provider를 갈랐다. 내용은 옮기기 전 그대로다.
import { DEFAULT_NIGHTLY } from "../utils/cost.js";
import { costReducer } from "./planCostReducer.js";

export const initialState = {
  planTitle: "", // design state.planTitle
  planSaved: false, // design state.planSaved
  addedExperiences: [], // design state.liAdded: 체험 프로그램 중 일정에 담은 것
  experienceDays: {}, // design state.expDay: { [체험id]: 며칠차 }
  // { [체험id]: 참가비 } — 관광공사 API에 체험 가격이 없어서(docs/03-api-check.md
  // §14) 사용자가 직접 넣는 값이다. 안 넣으면 0원으로 계산한다.
  experiencePrices: {},
  savedUtilities: [], // design state.liWish: 식당·카페 중 계획에 담은 것
  // 담은 식당·카페 / 주변 관광지를 몇 일차에 넣을지. { [id]: 일차 }
  // 체험(experienceDays)만 있던 것을 세 카테고리로 넓혔다 — 담기만 하고
  // 일차가 없으면 어느 날 일정에 넣어야 할지 알 수 없었다.
  utilityDays: {},
  spotDays: {},
  // 일정 항목별로 사용자가 고친 시간. { [키]: { start, end } }
  // 키는 자동 생성 슬롯이면 "{일차}|{원래 슬롯}", 담은 체험이면 "exp:{id}".
  // design에는 직접 추가한 일정에만 시간 입력이 있었는데(546-594줄),
  // 자동 배정된 시간도 고칠 수 있어야 해서 넓혔다.
  itemTimes: {},
  // 왕복 교통비 외에 현지 이동 등 따로 드는 교통비. design에는 없던 항목이다.
  tripExtraTotal: "",
  // 하루마다 식비 예산을 따로 짤 때 쓰는 값. { [일차]: 금액 }
  foodDaily: {},
  foodByDay: false,
  savedSpots: [], // 주변 관광지 중 계획에 담은 것. design에는 담기가 없던
  // 카테고리인데, 둘러보기에서 담은 곳이 계획으로 이어지는 흐름을 네
  // 카테고리 모두에 열어 주면서 추가했다(식당·카페와 같은 구조).

  themes: [], // design state.themes: 선택한 테마(힐링/레저/문화탐방/워케이션)
  meals: [], // design state.meals: 선택한 음식 취향
  routineOn: false, // design state.routineOn: 계획 생성 여부
  mealOverride: {}, // design state.mealOverride: { [일차]: 그날만 바꾼 음식 종류 }
  rtCustom: [], // design state.rtCustom: 직접 추가한 일정 [{id,day,slot,name,start,end,place,memo,cost}]
  rtPick: {}, // design state.rtPick: { "일차|슬롯": 선택한 대체 장소 }
  regenSeed: 0, // design state.regenSeed: "다시 만들기" 누른 횟수(추천 순환용)

  // 예상 비용 탭(design costVals(), 2266-2508줄)
  nightly: DEFAULT_NIGHTLY, // design state.nightly
  staySplit: false, // design state.staySplit
  staySegs: [], // design state.staySegs: [{from,to,rate,memo}]
  foodStyle: "반반", // design state.foodStyle
  foodManual: false, // design state.foodManual
  foodPer: undefined, // design state.foodPer
  tripManualTotal: undefined, // design state.tripManualTotal
  etcRows: [{ memo: "", amount: "" }], // design state.etcRows
};

export function reducer(state, action) {
  switch (action.type) {
    case "SET_PLAN_TITLE":
      return { ...state, planTitle: action.title };
    case "SET_EXPERIENCE_DAY": {
      const added = state.addedExperiences.includes(action.id)
        ? state.addedExperiences
        : state.addedExperiences.concat(action.id);
      // 담을 때 참가비를 같이 넣을 수 있다(선택). 안 넣으면 건드리지 않는다.
      const prices =
        action.price === undefined
          ? state.experiencePrices
          : { ...state.experiencePrices, [action.id]: action.price };
      return {
        ...state,
        addedExperiences: added,
        experienceDays: { ...state.experienceDays, [action.id]: action.day },
        experiencePrices: prices,
      };
    }
    case "REMOVE_EXPERIENCE": {
      const { [action.id]: _removedDay, ...restDays } = state.experienceDays;
      const { [action.id]: _removedPrice, ...restPrices } =
        state.experiencePrices;
      return {
        ...state,
        addedExperiences: state.addedExperiences.filter(
          (id) => id !== action.id,
        ),
        experienceDays: restDays,
        experiencePrices: restPrices,
      };
    }
    case "SET_EXPERIENCE_PRICE":
      return {
        ...state,
        experiencePrices: {
          ...state.experiencePrices,
          [action.id]: action.value,
        },
      };
    // 숙박은 "며칠부터 며칠까지 묵을지"가 붙어서 다른 카테고리와 성격이
    // 다르다. 별도 상태를 또 두지 않고 예상 비용 탭이 이미 쓰는 숙박 구간
    // (staySegs)에 stayId를 실어 한 곳에서 관리한다 — 그래야 둘러보기에서
    // 고른 숙소와 비용 탭의 구간이 어긋나지 않는다.
    case "SET_STAY_PICK": {
      const base = state.staySegs.length
        ? state.staySegs
        : action.fallbackSegs || [];
      const rest = base.filter((g) => g.stayId !== action.id);
      const segment = {
        from: action.from,
        to: action.to,
        rate: action.rate,
        memo: "",
        stayId: action.id,
      };
      return {
        ...state,
        // 숙소를 골랐다는 것은 구간을 나눠 쓰겠다는 뜻이다.
        staySplit: true,
        staySegs: rest
          .concat(segment)
          .sort((a, b) => (a.from || 0) - (b.from || 0)),
      };
    }
    case "REMOVE_STAY_PICK": {
      const base = state.staySegs.length
        ? state.staySegs
        : action.fallbackSegs || [];
      return { ...state, staySegs: base.filter((g) => g.stayId !== action.id) };
    }

    case "SET_TRIP_EXTRA":
      return { ...state, tripExtraTotal: action.value };
    // 일별 입력과 "직접 입력"(하루 단가)은 둘 다 켜져 있어도 계산은 하나만
    // 쓰기 때문에(calcFoodTotal이 foodByDay를 먼저 본다), 화면이 거짓말하지
    // 않도록 한쪽을 켜면 다른 쪽은 꺼 둔다.
    case "TOGGLE_FOOD_BY_DAY":
      return { ...state, foodByDay: !state.foodByDay, foodManual: false };
    case "SET_FOOD_DAY": {
      const next = { ...state.foodDaily };
      if (action.value === "") delete next[action.day];
      else next[action.day] = action.value;
      return { ...state, foodDaily: next };
    }

    case "SET_ITEM_TIME": {
      const next = { ...state.itemTimes };
      if (!action.start && !action.end) delete next[action.key];
      else next[action.key] = { start: action.start, end: action.end };
      return { ...state, itemTimes: next };
    }

    case "TOGGLE_SPOT": {
      const on = state.savedSpots.includes(action.id);
      const days = { ...state.spotDays };
      if (on) delete days[action.id];
      return {
        ...state,
        savedSpots: on
          ? state.savedSpots.filter((id) => id !== action.id)
          : state.savedSpots.concat(action.id),
        spotDays: days,
      };
    }

    // 담기 + 일차 지정을 한 번에. 체험의 SET_EXPERIENCE_DAY와 같은 모양이다.
    case "SET_SPOT_DAY":
      return {
        ...state,
        savedSpots: state.savedSpots.includes(action.id)
          ? state.savedSpots
          : state.savedSpots.concat(action.id),
        spotDays: { ...state.spotDays, [action.id]: action.day },
      };

    case "TOGGLE_UTILITY": {
      const on = state.savedUtilities.includes(action.id);
      const days = { ...state.utilityDays };
      if (on) delete days[action.id];
      return {
        ...state,
        savedUtilities: on
          ? state.savedUtilities.filter((id) => id !== action.id)
          : state.savedUtilities.concat(action.id),
        utilityDays: days,
      };
    }
    case "SET_UTILITY_DAY":
      return {
        ...state,
        savedUtilities: state.savedUtilities.includes(action.id)
          ? state.savedUtilities
          : state.savedUtilities.concat(action.id),
        utilityDays: { ...state.utilityDays, [action.id]: action.day },
      };
    case "TOGGLE_THEME": {
      const on = state.themes.includes(action.theme);
      return {
        ...state,
        themes: on
          ? state.themes.filter((v) => v !== action.theme)
          : state.themes.concat(action.theme),
      };
    }
    case "TOGGLE_MEAL": {
      const on = state.meals.includes(action.meal);
      return {
        ...state,
        meals: on
          ? state.meals.filter((v) => v !== action.meal)
          : state.meals.concat(action.meal),
      };
    }
    case "START_ROUTINE":
      return { ...state, routineOn: true };
    case "SET_MEAL_OVERRIDE":
      return {
        ...state,
        mealOverride: { ...state.mealOverride, [action.day]: action.cuisine },
      };
    case "SET_PICK":
      return {
        ...state,
        rtPick: {
          ...state.rtPick,
          [`${action.day}|${action.slot}`]: action.value,
        },
      };
    case "ADD_CUSTOM_ITEM": {
      const exists = state.rtCustom.some((c) => c.id === action.item.id);
      return {
        ...state,
        rtCustom: exists
          ? state.rtCustom.map((c) =>
              c.id === action.item.id ? action.item : c,
            )
          : state.rtCustom.concat(action.item),
      };
    }
    case "REMOVE_CUSTOM_ITEM":
      return {
        ...state,
        rtCustom: state.rtCustom.filter((c) => c.id !== action.id),
      };
    case "BUMP_REGEN_SEED":
      return { ...state, regenSeed: state.regenSeed + 1 };
    // design regenAll()(3023-3025줄): 담은 체험과 음식 종류 변경만 초기화하고
    // 직접 추가한 일정(rtCustom)·명시적으로 고른 장소(rtPick)는 남긴다.
    case "RESET_FOR_REGEN_ALL":
      return {
        ...state,
        addedExperiences: [],
        experienceDays: {},
        mealOverride: {},
        regenSeed: state.regenSeed + 1,
      };

    default:
      // 예상 비용 탭의 값들은 costReducer가 맡는다(파일 길이 규칙).
      return costReducer(state, action);
  }
}

// initial: 저장된 계획을 다시 열 때(MyPage "이어서 만들기"/"계획 보기")
