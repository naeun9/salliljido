import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearch } from "../../../hooks/useSearch.js";
import { usePlan } from "../../../hooks/usePlan.js";
import { stayDays } from "../../../utils/date.js";
import { useRegionListings } from "../../../hooks/useRegionListings.js";
import { getSlotPoolOptions, availableCuisines, getPickerMine } from "../../../services/routineGenerator.js";
import { buildDayTimeline, resolveThemePrefs, resolveDayContext } from "../../../services/dayTimeline.js";
import { buildRoutePins, routeDistanceLabel } from "../../../utils/route.js";
import Skeleton from "../../../components/common/Skeleton.jsx";
import ScheduleModals from "./ScheduleTab/ScheduleModals.jsx";
import ConditionPanel from "./ScheduleTab/ConditionPanel.jsx";
import DayNav from "./ScheduleTab/DayNav.jsx";
import Timeline from "./ScheduleTab/Timeline.jsx";
import ScheduleMap from "./ScheduleTab/ScheduleMap.jsx";
import styles from "./ScheduleTab.module.css";

// design/salliljido.extracted.html 799-1011줄(dtTab1Display), 2718-3258줄(detailVals).
export default function ScheduleTab({ region }) {
  const { dur, customDays } = useSearch();
  const plan = usePlan();
  const [searchParams, setSearchParams] = useSearchParams();
  // 담은 체험·식당의 실제 이름/주소/좌표는 둘러보기 목록에서 찾아 쓴다.
  // 같은 지역이면 이미 메모리에 캐싱돼 있어 추가 호출이 없다.
  const { listings } = useRegionListings(region.short);

  const [day, setDay] = useState(1);
  const [week, setWeek] = useState(0);
  const [condOpen, setCondOpen] = useState(false);
  const [rtHintClosed, setRtHintClosed] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [cuisineMenuOpen, setCuisineMenuOpen] = useState(false);
  const [rtPicker, setRtPicker] = useState(null); // { slot, dinner }
  const [cf, setCf] = useState(null); // { editId, slot }
  const [regenAsk, setRegenAsk] = useState(false);
  const [routineLoading, setRoutineLoading] = useState(false);

  const durDays = stayDays({ dur, customDays });
  // 일차별 테마·메뉴 결정은 최종 계획 화면(PlanOverview)과 같은 규칙을
  // 써야 해서 services/dayTimeline.js로 뺐다.
  // 그 지역에 실제 후보가 있는 음식 분류. 조건 칩·음식 종류 메뉴에서
  // 나머지를 못 고르게 하는 데 쓴다(15개 시군 전부 주점 0건 등).
  const availableMeals = availableCuisines(listings);
  const themePrefs = resolveThemePrefs(plan.themes);
  const { theme, cuisine } = resolveDayContext({
    day,
    themes: plan.themes,
    meals: plan.meals,
    mealOverride: plan.mealOverride,
    listings,
  });

  // 하루 일정 조립과 지도 값 계산은 services/dayTimeline.js·utils/route.js로
  // 옮겼다(로직은 동일). 이 컴포넌트는 화면 상태만 들고 있는다.
  const items = buildDayTimeline({
    day,
    themes: plan.themes,
    meals: plan.meals,
    mealOverride: plan.mealOverride,
    regenSeed: plan.regenSeed,
    addedExperiences: plan.addedExperiences,
    experienceDays: plan.experienceDays,
    rtCustom: plan.rtCustom,
    rtPick: plan.rtPick,
    listings,
  });

  const pins = buildRoutePins(items).map((p, i) => ({
    ...p,
    hot: hoverIndex === i || selectedIndex === i,
  }));
  const distance = routeDistanceLabel(pins);

  const daysWithAdds = plan.addedExperiences.map((id) => plan.experienceDays[id] || 1);

  const showHint =
    plan.routineOn && !rtHintClosed && Object.keys(plan.rtPick).length === 0 && plan.rtCustom.length === 0;

  // --- 핸들러 ---
  function makeRoutine() {
    if (routineLoading) return;
    setRoutineLoading(true);
    setTimeout(() => {
      setRoutineLoading(false);
      plan.startRoutine();
      setDay(1);
      setWeek(0);
      setCondOpen(false);
    }, 1200);
  }
  function askRegen() {
    if (!routineLoading) setRegenAsk(true);
  }
  function regenKeep() {
    setRegenAsk(false);
    setRoutineLoading(true);
    setTimeout(() => {
      setRoutineLoading(false);
      plan.bumpRegenSeed();
    }, 1000);
  }
  function regenAll() {
    setRegenAsk(false);
    setRoutineLoading(true);
    setTimeout(() => {
      setRoutineLoading(false);
      plan.resetForRegenAll();
    }, 1000);
  }
  function openCustomForm(slot, editId) {
    setCf({ slot, editId: editId || null });
  }
  function submitCustom(form) {
    plan.addCustomItem({
      id: cf.editId || `c${Date.now()}`,
      day,
      slot: form.slot,
      name: form.name,
      start: form.start,
      end: form.end,
      place: form.place,
      memo: form.memo,
      cost: form.cost,
    });
    setCf(null);
    setRtHintClosed(true);
  }
  function handleSwap(item) {
    if (item.custom) {
      openCustomForm(item.slot, item.cid);
    } else if (item.mine) {
      plan.removeExperience(item.id);
    } else {
      setCuisineMenuOpen(false);
      setRtPicker({ slot: item.slot, dinner: !!item.isDinner });
    }
  }
  function selectMapItem(i) {
    setSelectedIndex((prev) => (prev === i ? -1 : i));
    setHoverIndex(i);
  }

  const pickerMine = getPickerMine(plan.savedUtilities, listings);
  const pickerPlaces = rtPicker
    ? getSlotPoolOptions({ slot: rtPicker.slot, dinner: rtPicker.dinner, theme, cuisine, listings })
    : [];

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.main}>
          <ConditionPanel
            themes={plan.themes}
            meals={plan.meals}
            onToggleTheme={plan.toggleTheme}
            onToggleMeal={plan.toggleMeal}
            availableMeals={availableMeals}
            routineOn={plan.routineOn}
            condOpen={condOpen}
            onExpand={() => setCondOpen(true)}
            themePrefs={themePrefs}
            durDays={durDays}
            loading={routineLoading}
            onMakeRoutine={makeRoutine}
            onAskRegen={askRegen}
          />

          {!plan.routineOn && !routineLoading && (
            <div className={styles.empty}>
              <svg width="28" height="28" viewBox="0 0 26 26" fill="none" style={{ marginBottom: 16 }}>
                <circle cx="3.5" cy="6" r="2" fill="#DCE8E2" />
                <line x1="9" y1="6" x2="23" y2="6" stroke="#4A7C6F" strokeWidth="1.4" />
                <circle cx="3.5" cy="13" r="2" stroke="#4A7C6F" strokeWidth="1.3" />
                <line x1="9" y1="13" x2="23" y2="13" stroke="#4A7C6F" strokeWidth="1.4" />
                <circle cx="3.5" cy="20" r="2" stroke="#4A7C6F" strokeWidth="1.3" />
                <line x1="9" y1="20" x2="18" y2="20" stroke="#4A7C6F" strokeWidth="1.4" />
              </svg>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.02em", color: "#2B2B29" }}>
                테마와 식사 스타일을 고르면 하루 일정을 만들어 드립니다
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 15.5, lineHeight: 1.75, color: "#6E6E68" }}>
                고른 조건에 맞춰 오전·오후·저녁 세 갈래로 하루를 채워 드립니다.
              </p>
            </div>
          )}

          {routineLoading && (
            <div className={styles.loading}>
              <div className={styles.loadingTitle}>하루 일정을 짜고 있어요</div>
              <div className={styles.loadingRows}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={styles.loadingRow}>
                    <Skeleton width="76px" height="13px" style={{ marginTop: 8 }} />
                    <div className={styles.loadingCard}>
                      <Skeleton width="62px" height="58px" radius={9} />
                      <div className={styles.loadingCardBody}>
                        <Skeleton width="58%" height="13px" />
                        <Skeleton width="86%" height="12px" style={{ marginTop: 11 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.routineOn && !routineLoading && (
            <div className={styles.routine}>
              <DayNav
                durDays={durDays}
                week={week}
                day={day}
                daysWithAdds={daysWithAdds}
                onPickWeek={(w) => {
                  setWeek(w);
                  setDay(Math.min(w * 7 + 1, durDays));
                }}
                onPickDay={setDay}
              />

              <Timeline
                day={day}
                dayTitle={`${day}일차 일정`}
                dayTheme={theme}
                items={items}
                hoveredIndex={hoverIndex}
                selectedIndex={selectedIndex}
                cuisine={cuisine}
                cuisineMenuOpen={cuisineMenuOpen}
                availableMeals={availableMeals}
                showHint={showHint}
                onCloseHint={() => setRtHintClosed(true)}
                onHoverItem={setHoverIndex}
                onSelectItem={selectMapItem}
                onInsertBefore={(slot) => openCustomForm(slot, null)}
                onSwapItem={handleSwap}
                onDeleteCustom={(cid) => plan.removeCustomItem(cid)}
                onSetCuisine={(c) => {
                  plan.setMealOverride(day, c);
                  setCuisineMenuOpen(false);
                }}
                onToggleCuisineMenu={() => setCuisineMenuOpen((v) => !v)}
              />

              <div className={styles.ctaRow}>
                <button
                  type="button"
                  className={styles.ctaBtn}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("tab", "cost");
                    setSearchParams(next);
                  }}
                >
                  예상 비용 확인하기 <span>→</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <ScheduleMap
          routineOn={plan.routineOn}
          items={plan.routineOn ? pins : []}
          center={{ lat: region.lat, lng: region.lng }}
          distance={distance}
          mapLabel={plan.routineOn ? `${day}일차 일정` : region.short}
          selectedIndex={selectedIndex}
          onSelect={selectMapItem}
          onHover={setHoverIndex}
        />
      </div>

      <ScheduleModals
        day={day}
        rtPicker={rtPicker}
        setRtPicker={setRtPicker}
        pickerMine={pickerMine}
        pickerPlaces={pickerPlaces}
        setPick={plan.setPick}
        openCustomForm={openCustomForm}
        cf={cf}
        setCf={setCf}
        editingCustom={cf?.editId ? plan.rtCustom.find((c) => c.id === cf.editId) : null}
        submitCustom={submitCustom}
        regenAsk={regenAsk}
        setRegenAsk={setRegenAsk}
        regenKeep={regenKeep}
        regenAll={regenAll}
      />
    </section>
  );
}
