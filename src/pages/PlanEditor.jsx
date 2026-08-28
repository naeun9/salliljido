import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSearch } from "../hooks/useSearch.js";
import { usePlan } from "../hooks/usePlan.js";
import { useSaved } from "../hooks/useSaved.js";
import { useAuth } from "../hooks/useAuth.js";
import { useConfirm } from "../hooks/useConfirm.js";
import { PlanProvider } from "../store/PlanContext.jsx";
import { getRegionByShort } from "../services/regionRecommend.js";
import { resolveStayCondition } from "../utils/date.js";
import { DEFAULT_NIGHTLY, won, computeCostBreakdown } from "../utils/cost.js";
import RegionNotFound from "../components/region/RegionNotFound.jsx";
import ConfirmModal from "../components/common/ConfirmModal.jsx";
import Banner from "./PlanEditor/Banner.jsx";
import TabBar from "./PlanEditor/TabBar.jsx";
import ExploreTab from "./PlanEditor/tabs/ExploreTab.jsx";
import ScheduleTab from "./PlanEditor/tabs/ScheduleTab.jsx";
import CostTab from "./PlanEditor/tabs/CostTab.jsx";
import styles from "./PlanEditor.module.css";

const VALID_TABS = ["explore", "schedule", "cost"];
const DEFAULT_SWATCH =
  "repeating-linear-gradient(118deg, #7E8F72 0 26px, #93A184 26px 52px, #6F8470 52px 78px, #A9AE96 78px 104px, #586E63 104px 130px)";

// design/salliljido.extracted.html 751-1227줄(detailDisplay 컨테이너 +
// dtTab2Display). design에는 PlanDetail(최종 계획) 화면이 따로 없어(§
// docs/01-analysis.md 1-1) 이 화면 하나가 작성/열람을 겸한다.
function PlanEditorInner({ openedPlanId }) {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = useSearch();
  const plan = usePlan();
  const saved = useSaved();
  const { requireAuth } = useAuth();
  const { confirm, ask, cancel, doConfirm } = useConfirm();

  const region = getRegionByShort(regionId);

  // 지역 저장(북마크)은 RegionIntro의 dtToggleSave와 같은 SavedContext를 쓴다.
  const regionSaved = region ? saved.savedRegions.some((r) => r.short === region.short) : false;

  if (!region) {
    return <RegionNotFound />;
  }

  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : "explore";

  // planId(마이페이지에서 연 계획)가 있으면 탭을 바꿔도 유지해야 한다 —
  // 전체를 교체하면 openedPlanId가 사라져 삭제 버튼/뒤로가기 라벨이
  // 잘못된 상태로 돌아간다.
  function setActiveTab(id) {
    const next = new URLSearchParams(searchParams);
    if (id === "explore") next.delete("tab");
    else next.set("tab", id);
    setSearchParams(next, { replace: false });
  }

  function toggleRegionSave() {
    if (!requireAuth("저장하려면 로그인이 필요해요", "이 지역을 마이페이지에 담아 두려면 로그인해 주세요."))
      return;
    if (regionSaved) {
      ask("저장한 지역에서 뺄까요?", region.name, () => saved.toggleRegion(region.short));
      return;
    }
    saved.toggleRegion(region.short);
  }

  // design dtDeletePlan(4405197줄): 마이페이지에서 연 계획일 때만(openedPlanId)
  // 배너에 삭제 버튼이 뜬다.
  function deletePlan() {
    if (!openedPlanId) return;
    ask("이 계획을 삭제할까요?", plan.planTitle || "", () => {
      saved.removePlan(openedPlanId);
      navigate("/mypage");
    });
  }

  // 표시(durLabel)와 계산(nights)을 같은 곳에서 뽑아 둘이 어긋나지 않게 한다
  // (utils/date.js resolveStayCondition 주석 참고).
  const { dur, place, customDays } = search;
  const { nights, durLabel, place: placeLabel } = resolveStayCondition({ dur, place, customDays });
  const chipLine = `${durLabel} · ${placeLabel}`;

  const bannerRegion = { ...region, swatch: region.swatch || DEFAULT_SWATCH };

  // design 775-776줄(dtCostDisplay/dtPlanCost): 계획을 만든 뒤에는 배너에도
  // 예상 총비용이 같이 보인다 — 예상 비용 탭과 같은 계산 함수를 그대로 쓴다.
  // 체험 참가비는 사용자가 넣은 값이라 목록을 다시 조회할 필요 없이
  // PlanContext만 보면 된다(이름은 안 쓰고 금액만 합산하므로).
  const experienceRows = plan.addedExperiences.map((id) => ({ id, price: plan.experiencePrices[id] }));
  const { total } = computeCostBreakdown({
    nights,
    nightly: plan.nightly,
    staySplit: plan.staySplit,
    staySegs: plan.staySegs,
    foodStyle: plan.foodStyle,
    foodManual: plan.foodManual,
    foodPer: plan.foodPer,
    tripManualTotal: plan.tripManualTotal,
    experienceRows,
    etcRows: plan.etcRows,
    rtCustom: plan.rtCustom,
    rtPick: plan.rtPick,
  });

  // design planDirty()(2090-2093줄). 원본의 tripCost 조건은 실제로는
  // costVals()가 그 이름을 안 쓰고(tripManualTotal을 쓴다) 항상 false라
  // 죽어있던 조건이라 그대로 뺐다(완료 보고 참고).
  const dirty =
    !plan.planSaved &&
    (plan.routineOn ||
      plan.addedExperiences.length > 0 ||
      plan.nightly !== DEFAULT_NIGHTLY ||
      plan.etcRows.some((x) => x.amount !== "" && x.amount !== undefined));

  return (
    <div className={styles.page}>
      <Banner
        region={bannerRegion}
        planTitle={plan.planTitle}
        onCommitTitle={plan.setPlanTitle}
        saved={regionSaved}
        onToggleSave={toggleRegionSave}
        // design dtBackLabel/dtBackLink(4405197줄 부근): 마이페이지에서 연
        // 계획이면 마이페이지로, 아니면 지역 소개로 돌아간다.
        backLabel={openedPlanId ? "마이페이지로 돌아가기" : "지역 소개로 돌아가기"}
        onBack={() => navigate(openedPlanId ? "/mypage" : `/region/${regionId}`)}
        onDelete={openedPlanId ? deletePlan : null}
        chipLine={chipLine}
        dirty={dirty}
        planCost={plan.routineOn ? won(total) : null}
      />
      <TabBar active={activeTab} onChange={setActiveTab} />

      <div className={`${styles.tabPanel} ${activeTab === "explore" ? styles.active : ""}`}>
        <ExploreTab region={region} />
      </div>
      <div className={`${styles.tabPanel} ${activeTab === "schedule" ? styles.active : ""}`}>
        <ScheduleTab region={region} />
      </div>
      <div className={`${styles.tabPanel} ${activeTab === "cost" ? styles.active : ""}`}>
        <CostTab region={region} openedPlanId={openedPlanId} />
      </div>

      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        target={confirm?.target}
        onConfirm={doConfirm}
        onCancel={cancel}
      />
    </div>
  );
}

export default function PlanEditor() {
  const [searchParams] = useSearchParams();
  const search = useSearch();
  const saved = useSaved();

  const planId = searchParams.get("planId");
  const openedPlan = planId ? saved.plans.find((p) => p.id === planId) : null;

  // MyPage에서 "이어서 만들기"/"계획 보기"로 넘어올 때는 클릭 핸들러가
  // 먼저 조건을 복원한 뒤 navigate하지만, URL을 직접 열었을 때를 대비한
  // 방어적 복원이다.
  useEffect(() => {
    if (openedPlan) search.restore(openedPlan.condition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedPlan?.id]);

  return (
    <PlanProvider initial={openedPlan?.data}>
      <PlanEditorInner openedPlanId={openedPlan ? openedPlan.id : null} />
    </PlanProvider>
  );
}
