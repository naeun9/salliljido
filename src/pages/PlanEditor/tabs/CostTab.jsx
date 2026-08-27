import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSearch } from "../../../hooks/useSearch.js";
import { usePlan } from "../../../hooks/usePlan.js";
import { useSaved } from "../../../hooks/useSaved.js";
import { useRegionListings } from "../../../hooks/useRegionListings.js";
import { useAuth } from "../../../hooks/useAuth.js";
import { stayDays, formatSavedDate } from "../../../utils/date.js";
import { pickPlanSnapshot } from "../../../utils/planSnapshot.js";
import {
  won,
  resolveStaySegments,
  computeCostBreakdown,
  buildCostBars,
  DEFAULT_STAY_SEGMENT_RATE,
} from "../../../utils/cost.js";
import { findListing } from "../../../services/exploreListings.js";
import { regionFilterFor } from "../../../services/supportPrograms.js";
import NameDialog from "../../../components/plan/NameDialog.jsx";
import StaySection from "./CostTab/StaySection.jsx";
import FoodSection from "./CostTab/FoodSection.jsx";
import ExperienceSection from "./CostTab/ExperienceSection.jsx";
import EtcSection from "./CostTab/EtcSection.jsx";
import BasisPanel from "./CostTab/BasisPanel.jsx";
import CostBreakdown from "./CostTab/CostBreakdown.jsx";
import styles from "./CostTab.module.css";

// design/salliljido.extracted.html 1228-1443줄(dtTabRestDisplay), 2266-2508줄(costVals).
export default function CostTab({ region, openedPlanId }) {
  const { dur, place, customDays } = useSearch();
  const plan = usePlan();
  const saved = useSaved();
  const { requireAuth } = useAuth();
  // 담은 체험의 실제 이름을 찾기 위해 둘러보기 목록을 함께 본다
  // (지역별 메모리 캐시라 추가 호출 없음).
  const { listings } = useRegionListings(region.short);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [basisOpen, setBasisOpen] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  // 같은 세션에서 여러 번 저장해도(변경사항 저장) SavedContext에 같은
  // id로 upsert되도록 세션 동안 쓸 계획 id를 들고 있는다. 마이페이지에서
  // 연 계획이면 그 id를 그대로 잇고, 새 계획이면 처음 저장할 때 만든다.
  const [savedPlanId, setSavedPlanId] = useState(openedPlanId || null);

  const nights = stayDays({ dur, customDays });
  const segs = resolveStaySegments(plan.staySegs, nights);
  const segNights = segs.reduce((sum, g) => sum + Math.max(0, (g.to || 0) - (g.from || 0) + 1), 0);

  // 참가비는 관광공사 API에 없어서 사용자가 넣은 값을 쓴다
  // (안 넣었으면 0원, docs/03-api-check.md §14).
  const experienceRows = plan.addedExperiences
    .map((id) => {
      const x = findListing(listings, "체험 프로그램", id);
      return x ? { id: x.id, name: x.name, type: x.type, price: plan.experiencePrices[id] } : null;
    })
    .filter(Boolean);

  const breakdown = computeCostBreakdown({
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
  const { stay, food, trip, exp, etc, total, cookedCount } = breakdown;

  // 막대 계산은 최종 계획 화면과 공유한다(utils/cost.js buildCostBars).
  const bars = buildCostBars({
    breakdown,
    nights,
    nightly: plan.nightly,
    staySplit: plan.staySplit,
    foodStyle: plan.foodStyle,
    foodManual: plan.foodManual,
    foodPer: plan.foodPer,
    experienceCount: experienceRows.length,
  });

  const cbChips = [region.name, `${nights}일`, plan.themes[0] || "힐링"];
  const planSummary = `${region.name} · ${nights}일 · ${plan.themes.length ? plan.themes.join(", ") : "테마 전체"}`;

  // planId가 있으면(마이페이지에서 연 계획) 탭을 옮겨도 유지해야 한다.
  function goExplore() {
    const next = new URLSearchParams(searchParams);
    next.delete("tab");
    setSearchParams(next);
  }

  function findSupport() {
    // design 2418-2422줄(cbFindSupport): 지역명 앞 2글자로 SupportPrograms의
    // 지역 필터를 미리 걸어준다. 여기서는 URL 쿼리(?region=)로 넘기고
    // SupportPrograms가 마운트 시 그 값을 초기 필터로 읽는다.
    const [reg] = regionFilterFor(region.name);
    navigate(reg ? `/support?region=${encodeURIComponent(reg)}` : "/support");
  }

  // design confirmPlanName()(2438-2457줄)의 plans.concat(...) 부분을 실제
  // SavedContext 저장으로 확장한 것. 원본은 카드 요약용 필드 몇 개만
  // 저장하지만(title/region/chips/days/cost/status), 이번 작업 지시(마이페이지
  // 3번 항목)에 따라 PlanContext 전체 스냅샷(data)도 함께 담아 재개 시
  // 그대로 복원되도록 넓혔다.
  function buildPlanRecord(id, title) {
    // pickPlanSnapshot(plan)은 이 렌더의 plan.planTitle/planSaved를 그대로
    // 담는데, 방금 dispatch한 setPlanTitle/setPlanSaved는 아직 반영 전이라
    // (React state는 비동기) 스냅샷에는 새 값을 직접 덮어써야 한다.
    const data = pickPlanSnapshot(plan);
    data.planTitle = title;
    data.planSaved = true;
    return {
      id,
      regionShort: region.short,
      regionName: region.name,
      title,
      themes: plan.themes,
      meals: plan.meals,
      days: nights,
      routineOn: plan.routineOn,
      cost: total,
      condition: { dur, place, customDays },
      data,
      savedAt: formatSavedDate(),
    };
  }

  // 저장이 끝나면 최종 계획 화면으로 넘어간다. design 2470/2456줄은
  // 토스트를 띄우느라 120ms 뒤에 옮기는데, 토스트가 아직 없으므로
  // (docs/02-todo.md ToastStack) 지연 없이 바로 이동한다.
  function goOverview(id) {
    navigate(`/plan/${encodeURIComponent(region.short)}/overview?planId=${encodeURIComponent(id)}`);
  }

  // design 2465-2478줄(cbSavePlan).
  function handleSave() {
    if (!requireAuth("계획을 저장하려면 로그인이 필요해요", "만든 일정과 예상 비용을 마이페이지에 담아 둡니다.")) return;
    if (plan.planTitle) {
      const id = savedPlanId || `p${Date.now()}`;
      if (!savedPlanId) setSavedPlanId(id);
      saved.savePlan(buildPlanRecord(id, plan.planTitle));
      plan.setPlanSaved(true);
      goOverview(id);
      return;
    }
    setNameDraft(`${region.short} ${nights}일 살기`);
    setNameDialogOpen(true);
  }

  // design 2438-2457줄(confirmPlanName). uniquePlanName 중복 처리는 아직
  // 하지 않는다(docs/02-todo.md).
  function confirmName() {
    const title = nameDraft.trim();
    if (!title) return;
    const id = savedPlanId || `p${Date.now()}`;
    setSavedPlanId(id);
    plan.setPlanTitle(title);
    plan.setPlanSaved(true);
    saved.savePlan(buildPlanRecord(id, title));
    setNameDialogOpen(false);
    goOverview(id);
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.summaryCard}>
          <div className={styles.chips}>
            {cbChips.map((c) => (
              <span key={c} className={styles.chip}>
                {c}
              </span>
            ))}
          </div>
          <div className={styles.totalRow}>
            <div className={styles.total}>{won(total)}</div>
            <div className={styles.daily}>하루 평균 {won(total / nights)}</div>
          </div>
          <p className={styles.disclaimer}>공개 자료를 바탕으로 한 추정치이며 실제와 다를 수 있습니다.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.left}>
            <div className={styles.card}>
              <StaySection
                nightly={plan.nightly}
                nights={nights}
                stayTotal={stay}
                split={plan.staySplit}
                segs={segs}
                segNights={segNights}
                onSetNightly={plan.setNightly}
                onToggleSplit={() => plan.toggleStaySplit(segs)}
                onUpdateSeg={(i, patch) => plan.updateStaySegment(i, patch, segs)}
                onRemoveSeg={(i) => plan.removeStaySegment(i, segs)}
                onAddSeg={() => {
                  const last = segs[segs.length - 1];
                  const from = last ? Math.min(nights, (last.to || 0) + 1) : 1;
                  plan.addStaySegment({ from, to: Math.min(nights, from + 2), rate: DEFAULT_STAY_SEGMENT_RATE, memo: "" }, segs);
                }}
              />
            </div>

            <div className={styles.card}>
              <FoodSection
                nights={nights}
                foodStyle={plan.foodStyle}
                foodManual={plan.foodManual}
                foodPer={plan.foodPer}
                foodTotal={food}
                cookedCount={cookedCount}
                onSetFoodStyle={plan.setFoodStyle}
                onToggleFoodManual={plan.toggleFoodManual}
                onSetFoodPer={plan.setFoodPer}
              />
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <p className={styles.cardSub}>집에서 오가는 왕복 교통비를 입력해주세요</p>
                  <h3 className={styles.cardTitle}>교통비 (왕복 기준)</h3>
                </div>
                <span className={styles.cardAmount}>{won(trip)}</span>
              </div>
              <div className={styles.amountRow}>
                <div className={styles.amountInputWrap}>
                  <input
                    type="number"
                    value={plan.tripManualTotal === undefined ? "" : plan.tripManualTotal}
                    placeholder="왕복 금액"
                    onChange={(e) => {
                      const v = e.target.value;
                      plan.setTripManualTotal(v === "" ? "" : Math.max(0, parseInt(v, 10) || 0));
                    }}
                  />
                  <span className={styles.amountUnit}>원</span>
                </div>
              </div>
              <p className={styles.cardBasis} style={{ color: trip ? "var(--gray)" : "var(--rust)" }}>
                {trip ? "체류 기간과 무관한 1회 비용으로 합산됩니다." : "금액을 입력해주세요"}
              </p>
            </div>

            <div className={styles.card}>
              <ExperienceSection
                rows={experienceRows}
                expTotal={exp}
                onRemove={plan.removeExperience}
                onSetPrice={plan.setExperiencePrice}
                onGoExplore={goExplore}
              />
            </div>

            <div className={styles.card}>
              <EtcSection
                rows={plan.etcRows}
                etcTotal={etc}
                onUpdateRow={plan.updateEtcRow}
                onRemoveRow={plan.removeEtcRow}
                onAddRow={plan.addEtcRow}
              />
            </div>

            <BasisPanel
              open={basisOpen}
              onToggle={() => setBasisOpen((v) => !v)}
              split={plan.staySplit}
              foodManual={plan.foodManual}
            />
          </div>

          <CostBreakdown
            bars={bars}
            total={won(total)}
            saveLabel={plan.planSaved ? "변경사항 저장" : "이 계획 저장하기"}
            onSave={handleSave}
            onFindSupport={findSupport}
          />
        </div>
      </div>

      <NameDialog
        open={nameDialogOpen}
        value={nameDraft}
        onChange={setNameDraft}
        summary={planSummary}
        onConfirm={confirmName}
        onCancel={() => setNameDialogOpen(false)}
      />
    </section>
  );
}
