import { useToast } from "../../../../hooks/useToast.js";

// 체류 계획에서 일정을 뺄 때의 동작 + "되돌리기" 토스트.
// design 2306·2857·2923줄이 전부 같은 방식이다 — 빼기 전 값을 들고 있다가
// 되돌리기를 누르면 그대로 되돌려 놓는다.
export function useRemoveWithUndo(plan) {
  const { showToast } = useToast();

  // 담은 곳(체험·식당카페·관광지)을 일정에서 뺀다. 어느 목록에서 뺄지는
  // timeKey 접두어로 가린다(services/addedItems.js에서 붙인다).
  function removeAdded(item) {
    const kind = String(item.timeKey || "").split(":")[0];
    if (kind === "util") {
      const day = plan.utilityDays[item.id];
      plan.toggleUtility(item.id);
      showToast("일정에서 뺐어요", { undo: () => plan.setUtilityDay(item.id, day) });
    } else if (kind === "spot") {
      const day = plan.spotDays[item.id];
      plan.toggleSpot(item.id);
      showToast("일정에서 뺐어요", { undo: () => plan.setSpotDay(item.id, day) });
    } else {
      const day = plan.experienceDays[item.id];
      const price = plan.experiencePrices[item.id];
      plan.removeExperience(item.id);
      showToast("일정에서 뺐어요", { undo: () => plan.setExperienceDay(item.id, day, price) });
    }
  }

  // 직접 추가한 일정. 되돌리기는 지웠던 항목을 그대로 다시 넣는다
  // (ADD_CUSTOM_ITEM은 같은 id면 덮어쓰기라 중복되지 않는다).
  function removeCustom(cid) {
    const prev = plan.rtCustom.find((c) => c.id === cid);
    plan.removeCustomItem(cid);
    showToast("일정에서 뺐어요", { undo: prev ? () => plan.addCustomItem(prev) : null });
  }

  return { removeAdded, removeCustom };
}
