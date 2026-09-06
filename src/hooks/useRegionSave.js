import { useAuth } from "./useAuth.js";
import { useSaved } from "./useSaved.js";
import { useToast } from "./useToast.js";

// 지역 저장/해제. design dtToggleSave()를 옮긴 것으로, 지역 소개(RegionIntro)와
// 계획 화면 배너(PlanEditor)가 똑같은 동작을 하고 있어 한곳으로 모았다.
// 토스트 문구는 design 3113줄("마이페이지에 저장했어요")과 같은 결이다.
//
// ask는 화면마다 자기 ConfirmModal을 들고 있어서 인자로 받는다
// (design도 저장 해제할 때만 확인창을 띄운다).
export function useRegionSave(region, ask) {
  const saved = useSaved();
  const { requireAuth } = useAuth();
  const { showToast } = useToast();

  const isSaved = !!region && saved.savedRegions.some((r) => r.short === region.short);

  function toggleSave() {
    if (!region) return;
    if (!requireAuth("저장하려면 로그인이 필요해요", "이 지역을 마이페이지에 담아 두려면 로그인해 주세요."))
      return;
    if (isSaved) {
      ask("저장한 지역에서 뺄까요?", region.name, () => {
        saved.toggleRegion(region.short);
        showToast("저장한 지역에서 뺐어요");
      });
      return;
    }
    saved.toggleRegion(region.short);
    showToast("마이페이지에 저장했어요", { link: true });
  }

  return { isSaved, toggleSave };
}
