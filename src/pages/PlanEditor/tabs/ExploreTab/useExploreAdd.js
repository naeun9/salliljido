import { usePlan } from "../../../../hooks/usePlan.js";
import { useToast } from "../../../../hooks/useToast.js";
import { DEFAULT_STAY_SEGMENT_RATE } from "../../../../utils/cost.js";

// 둘러보기 목록에서 "계획에 추가/빼기"를 할 때의 동작 + 안내 토스트.
//
// 네 카테고리가 담는 방식은 다르지만(체험·식당·관광지는 일차 하나, 숙박은
// 구간) 사용자에게 보이는 결과는 같아서 문구를 한곳에서 만든다. design은
// 체험에만 담기가 있었고 문구가 "N일차 일정에 추가했어요"(2612줄) /
// "일정에서 뺐어요"(2608줄, 되돌리기 포함)였다 — 그 문구를 그대로 쓴다.
//
// 되돌리기: 뺄 때 직전 값(일차·구간)을 클로저에 담아 두었다가 그대로
// 되돌려 놓는다. design 2608줄도 같은 방식이다(prevAdded/prevDays 복원).
export function useExploreAdd(setDayPickerId, setStayPickerId) {
  const {
    addedExperiences,
    experienceDays,
    setExperienceDay,
    removeExperience,
    experiencePrices,
    savedUtilities,
    utilityDays,
    toggleUtility,
    setUtilityDay,
    savedSpots,
    spotDays,
    toggleSpot,
    setSpotDay,
    staySegs,
    setStayPick,
    removeStayPick,
  } = usePlan();
  const { showToast } = useToast();

  function toastAdded(day) {
    showToast(`${day}일차 일정에 추가했어요`, { link: true });
  }
  function toastRemoved(undo) {
    showToast("일정에서 뺐어요", { undo });
  }

  // 이미 담겨 있고 같은 일차를 다시 고르면 빼기(design의 체험 동작).
  function confirmUtility(id, day) {
    if (savedUtilities.includes(id) && utilityDays[id] === day) {
      const prevDay = utilityDays[id];
      toggleUtility(id);
      toastRemoved(() => setUtilityDay(id, prevDay));
    } else {
      setUtilityDay(id, day);
      toastAdded(day);
    }
    setDayPickerId(null);
  }

  function confirmSpot(id, day) {
    if (savedSpots.includes(id) && spotDays[id] === day) {
      const prevDay = spotDays[id];
      toggleSpot(id);
      toastRemoved(() => setSpotDay(id, prevDay));
    } else {
      setSpotDay(id, day);
      toastAdded(day);
    }
    setDayPickerId(null);
  }

  // 체험도 같은 일차·같은 금액을 다시 고르면 빼기다(옮기기 전 CategoryList의
  // onConfirm에 있던 판단을 그대로 가져왔다).
  function confirmExperience(id, day, price) {
    const isOn = addedExperiences.includes(id);
    if (isOn && day === experienceDays[id] && price === experiencePrices[id]) {
      removeExperience(id);
      toastRemoved(() => setExperienceDay(id, day, price));
    } else {
      setExperienceDay(id, day, price);
      toastAdded(day);
    }
    setDayPickerId(null);
  }

  // 숙박은 일차 하나가 아니라 구간이라 문구가 다르다.
  function confirmStay(id, from, to) {
    setStayPick(id, from, to, DEFAULT_STAY_SEGMENT_RATE, staySegs);
    setStayPickerId(null);
    showToast(`${from}~${to}일차 숙소로 담았어요`, { link: true });
  }

  function removeStay(id) {
    const prev = staySegs.find((g) => g.stayId === id);
    removeStayPick(id, staySegs);
    setStayPickerId(null);
    showToast("숙소를 뺐어요", {
      undo: prev
        ? () => setStayPick(id, prev.from, prev.to, prev.rate ?? DEFAULT_STAY_SEGMENT_RATE, staySegs)
        : null,
    });
  }

  return { confirmUtility, confirmSpot, confirmExperience, confirmStay, removeStay };
}
