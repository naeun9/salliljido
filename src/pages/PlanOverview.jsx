import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSearch } from "../hooks/useSearch.js";
import { usePlan } from "../hooks/usePlan.js";
import { useSaved } from "../hooks/useSaved.js";
import { useConfirm } from "../hooks/useConfirm.js";
import { useRegionListings } from "../hooks/useRegionListings.js";
import { PlanProvider } from "../store/PlanContext.jsx";
import { getRegionByShort } from "../services/regionRecommend.js";
import { getAllPrograms, regionFilterFor } from "../services/supportPrograms.js";
import { buildFullSchedule } from "../services/dayTimeline.js";
import { findListingAnywhere } from "../services/exploreListings.js";
import { resolveStayCondition } from "../utils/date.js";
import { won, computePlanCost } from "../utils/cost.js";
import { totalRouteDistanceLabel } from "../utils/route.js";
import { topDistricts } from "../utils/address.js";
import RegionNotFound from "../components/region/RegionNotFound.jsx";
import ConfirmModal from "../components/common/ConfirmModal.jsx";
import OverviewHeader from "./PlanOverview/OverviewHeader.jsx";
import MetricsRow from "./PlanOverview/MetricsRow.jsx";
import RegionGlance from "./PlanOverview/RegionGlance.jsx";
import FullSchedule from "./PlanOverview/FullSchedule.jsx";
import CostSummary from "./PlanOverview/CostSummary.jsx";
import SupportSection from "./PlanOverview/SupportSection.jsx";
import PlaceDetailModal from "../components/plan/PlaceDetailModal.jsx";
import styles from "./PlanOverview.module.css";

// design/salliljido.extracted.html 1446-1695줄(Overview 화면),
// 3261-3412줄(overviewVals). 저장한 계획을 한 화면에 펼쳐 보는 곳이다.
function PlanOverviewInner({ openedPlanId, savedPlan }) {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const search = useSearch();
  const plan = usePlan();
  const saved = useSaved();
  const { confirm, ask, cancel, doConfirm } = useConfirm();

  const [view, setView] = useState("card");
  const [expanded, setExpanded] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);
  const [selection, setSelection] = useState(null);

  const region = getRegionByShort(regionId);
  // 담은 체험·식당의 실제 이름은 둘러보기 목록에서 찾는다(지역 단위 캐시).
  const { listings } = useRegionListings(region ? region.short : null);
  // 상세 API는 타입별로 응답 필드가 달라 contentTypeId가 필요하다.
  const selectionListing = selection && selection.id ? findListingAnywhere(listings, selection.id) : null;

  if (!region) {
    return <RegionNotFound />;
  }

  const { nights } = resolveStayCondition(search);

  // 예상 비용 탭과 같은 계산을 쓴다(utils/cost.js computePlanCost).
  const { breakdown, bars } = computePlanCost({ plan, nights });

  const days = buildFullSchedule({
    nights,
    themes: plan.themes,
    meals: plan.meals,
    mealOverride: plan.mealOverride,
    regenSeed: plan.regenSeed,
    addedExperiences: plan.addedExperiences,
    experienceDays: plan.experienceDays,
    savedUtilities: plan.savedUtilities,
    utilityDays: plan.utilityDays,
    savedSpots: plan.savedSpots,
    spotDays: plan.spotDays,
    rtCustom: plan.rtCustom,
    rtPick: plan.rtPick,
    listings,
  });

  // "주요 동선"은 원본이 `{대표 장소} 일대 · {지역}읍 일대`였다. 앞쪽은
  // data/regions.js에 손으로 적은 태그(바다/산)였고 뒤쪽 "○○읍"은 실제
  // 지명이 아니었다(안동에는 안동읍이 없다). 이제 계획에 실제로 담긴
  // 장소들의 주소에서 읍·면·동을 뽑아 많이 나온 순으로 쓴다.
  // 주소에 읍면동이 없는 지역(속초처럼 시 아래 도로명만 있는 곳)에서는
  // 뽑히는 게 없어서, 그때는 구체적인 말 대신 지역 이름만 쓴다.
  const areas = topDistricts(
    days.flatMap((d) => d.cells.flatMap((c) => c.items)),
    2
  );
  const routeAreaLabel = areas.length ? areas.map((a) => `${a} 일대`).join(" · ") : `${region.name} 일대`;

  const themeLine = plan.themes.length ? plan.themes.join(", ") : "테마 전체";
  const title = plan.planTitle || `${region.short} ${nights}일 계획`;
  const placeCount = days.reduce((s, d) => s + d.cells.reduce((n, c) => n + c.items.length, 0), 0);

  // design 3304-3309줄.
  const metrics = [
    { label: "체류 기간", value: `${nights}일` },
    { label: "총 예상 비용", value: won(breakdown.total) },
    { label: "하루 평균", value: won(breakdown.total / nights) },
    { label: "담은 장소", value: `${placeCount}곳` },
  ];

  // design 3340-3344줄(ovFacts). 첫 항목은 원본이 "숙소"라고 쓰면서 실제로는
  // 식당·카페 위시리스트(liWish → savedUtilities)를 세고 있어, 숫자와 맞도록
  // 라벨만 "담은 식당"으로 고쳤다(지시 3번).
  const facts = [
    {
      label: "담은 식당",
      value: plan.savedUtilities.length ? `담은 식당 ${plan.savedUtilities.length}곳` : "미정",
    },
    { label: "주요 동선", value: routeAreaLabel },
    // 예전에는 design의 가짜 공식(`체류일 × 11km`)을 썼다. 실제 좌표가
    // 생겨서 하루 동선 거리를 체류 기간만큼 더한 값으로 바꿨다.
    { label: "이동 거리", value: `전체 약 ${totalRouteDistanceLabel(days)}` },
  ];
  const clusters = [
    { x: "32%", y: "34%", label: `${region.places[0]} 일대` },
    { x: "68%", y: "66%", label: `${region.short}읍 일대` },
  ];

  // design 3323줄: 같은 시도(강원/충남/경북)의 미마감 프로그램 최대 2건.
  const programs = getAllPrograms()
    .filter((p) => p.region === region.region && p.status !== "마감")
    .slice(0, 2);

  const editPath = `/plan/${encodeURIComponent(region.short)}?tab=schedule${
    openedPlanId ? `&planId=${encodeURIComponent(openedPlanId)}` : ""
  }`;

  // design 3389-3393줄(ovBack)은 둘러보기 탭(dtTab:2)으로 보내는데, 버튼
  // 라벨이 "편집하기"·"루틴 편집으로"라 목적지와 어긋난다. 라벨대로
  // 체류 계획 탭으로 고쳤다(지시 2번).
  function goEdit(e) {
    if (e) e.preventDefault();
    navigate(editPath);
  }

  // 이름은 PlanContext와 저장된 계획 양쪽을 함께 갱신해야 새로고침 뒤에도
  // 유지된다(design은 planTitle과 planTitles를 같이 고친다, 3357-3363줄).
  function commitTitle(next) {
    plan.setPlanTitle(next);
    if (savedPlan)
      saved.savePlan({
        ...savedPlan,
        title: next,
        data: { ...savedPlan.data, planTitle: next },
      });
  }

  function deletePlan() {
    if (!openedPlanId) return;
    ask("이 계획을 삭제할까요?", title, () => {
      saved.removePlan(openedPlanId);
      navigate("/mypage");
    });
  }

  function goSupport(e) {
    e.preventDefault();
    const [reg] = regionFilterFor(region.name);
    navigate(reg ? `/support?region=${encodeURIComponent(reg)}` : "/support");
  }

  function goIntro(e) {
    e.preventDefault();
    navigate(`/region/${encodeURIComponent(region.short)}`);
  }

  // 상세 모달에 넘길 값. id·좌표는 상세 조회(api/tour/detail)와
  // 카카오맵 링크에 쓴다.
  function selectItem(d, c, it) {
    setSelection({ ...it, day: d.day, slot: c.slot });
  }

  function toggleExport() {
    setExportOpen((v) => !v);
    setExportNotice(false);
  }

  return (
    <div className={styles.page}>
      <OverviewHeader
        title={title}
        subline={`${region.name} · ${nights}일 · ${themeLine}`}
        onCommitTitle={commitTitle}
        onBackMy={() => navigate("/mypage")}
        onEdit={goEdit}
        onDelete={openedPlanId ? deletePlan : null}
        exportOpen={exportOpen}
        onToggleExport={toggleExport}
        exportNotice={exportNotice}
        onExportNotice={() => setExportNotice(true)}
      />

      <MetricsRow metrics={metrics} />

      <RegionGlance
        regionName={region.name}
        intro={region.reason}
        facts={facts}
        clusters={clusters}
        region={region}
        rangeNote="숙소에서 반경 약 12km 안에서 지냅니다"
        onGoIntro={goIntro}
        onGoRoute={goEdit}
      />

      <FullSchedule
        days={days}
        view={view}
        onSetView={setView}
        expanded={expanded}
        onToggleExpand={() => setExpanded((v) => !v)}
        onSelectItem={selectItem}
      />

      <CostSummary bars={bars} total={won(breakdown.total)} />

      <SupportSection programs={programs} onGoSupport={goSupport} />

      <section className={styles.impact}>
        <div className={styles.impactInner}>
          <p className={styles.impactNote}>
            {region.short}에서 {nights}일 머무는 동안의 소비가 지역에 남습니다. · 인구감소지역 지정 현황 자료
            행정안전부
          </p>
          <p className={styles.source}>
            출처 ⓒ한국관광공사 · 인구감소지역 지정 현황 행정안전부 · 일정과 비용은 공개 자료를 바탕으로 한
            추정치입니다.
          </p>
        </div>
      </section>

      <div className={styles.mobileBar} data-print-hide>
        <button type="button" className={styles.mobileEdit} onClick={goEdit}>
          편집하기
        </button>
        <button type="button" className={styles.mobileExport} onClick={toggleExport}>
          내보내기
        </button>
      </div>

      {/* 우하단 카드(design ovSel) 대신 중앙 상세 모달. 체류 계획 탭과 같은
          컴포넌트를 쓴다. 원본 카드에 있던 "루틴 편집으로" 버튼은 뺐다 —
          같은 이동을 상단 "편집" 버튼이 이미 갖고 있고, 모달은 장소 정보만
          보여 주는 자리로 정리했다. */}
      <PlaceDetailModal
        selection={selection}
        contentTypeId={selectionListing ? selectionListing.contentTypeId : ""}
        onClose={() => setSelection(null)}
      />

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

// PlanEditor와 같은 방식으로 저장된 스냅샷을 PlanProvider에 실어 준다.
export default function PlanOverview() {
  const [searchParams] = useSearchParams();
  const search = useSearch();
  const saved = useSaved();

  const planId = searchParams.get("planId");
  const openedPlan = planId ? saved.plans.find((p) => p.id === planId) : null;

  useEffect(() => {
    if (openedPlan) search.restore(openedPlan.condition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedPlan?.id]);

  return (
    <PlanProvider initial={openedPlan?.data}>
      <PlanOverviewInner openedPlanId={openedPlan ? openedPlan.id : null} savedPlan={openedPlan} />
    </PlanProvider>
  );
}
