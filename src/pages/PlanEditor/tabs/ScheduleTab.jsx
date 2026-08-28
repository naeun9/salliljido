import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearch } from "../../../hooks/useSearch.js";
import { usePlan } from "../../../hooks/usePlan.js";
import { stayDays } from "../../../utils/date.js";
import { useRegionListings } from "../../../hooks/useRegionListings.js";
import { findListing } from "../../../services/exploreListings.js";
import { availableCuisines } from "../../../services/routineGenerator.js";
import { buildDayTimeline, resolveThemePrefs, resolveDayContext } from "../../../services/dayTimeline.js";
import { buildSelection } from "../../../services/scheduleSelection.js";
import { useRoutineActions } from "../../../hooks/useRoutineActions.js";
import { buildRoutePins, routeDistanceLabel } from "../../../utils/route.js";
import { toLatLng } from "../../../utils/geo.js";
import ScheduleModals from "./ScheduleTab/ScheduleModals.jsx";
import ScheduleStates from "./ScheduleTab/ScheduleStates.jsx";
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
  const [timeEdit, setTimeEdit] = useState(null); // 시간 수정 중인 항목
  // 계획 생성·재생성(로딩 연출 포함)은 훅으로 뺐다.
  const { routineLoading, regenAsk, setRegenAsk, makeRoutine, askRegen, regenKeep, regenAll } =
    useRoutineActions(plan, () => {
      setDay(1);
      setWeek(0);
      setCondOpen(false);
    });

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
    savedUtilities: plan.savedUtilities,
    utilityDays: plan.utilityDays,
    savedSpots: plan.savedSpots,
    spotDays: plan.spotDays,
    rtCustom: plan.rtCustom,
    rtPick: plan.rtPick,
    listings,
    itemTimes: plan.itemTimes,
  });

  // 그날 묵는 숙소(둘러보기에서 기간으로 담은 것). 경로선·이동거리에는
  // 넣지 않고 지도에 집 아이콘으로, 타임라인에는 한 줄로만 보여 준다.
  const stayMarker = findStayMarker(plan.staySegs, day, listings);

  const pins = buildRoutePins(items).map((p, i) => ({
    ...p,
    hot: hoverIndex === i || selectedIndex === i,
  }));
  const distance = routeDistanceLabel(pins);

  // 지도 핀·타임라인 카드를 누르면 뜨는 상세(services/scheduleSelection.js).
  const { selection, contentTypeId: selectionTypeId } = buildSelection({
    selectedIndex,
    items,
    pins,
    day,
    listings,
  });

  const daysWithAdds = plan.addedExperiences.map((id) => plan.experienceDays[id] || 1);

  const showHint =
    plan.routineOn && !rtHintClosed && Object.keys(plan.rtPick).length === 0 && plan.rtCustom.length === 0;

  // --- 핸들러 ---
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
      // 담은 곳은 세 종류(체험·식당카페·관광지)라 어느 목록에서 뺄지
      // timeKey 접두어로 가린다(services/addedItems.js에서 붙인다).
      const kind = String(item.timeKey || "").split(":")[0];
      if (kind === "util") plan.toggleUtility(item.id);
      else if (kind === "spot") plan.toggleSpot(item.id);
      else plan.removeExperience(item.id);
    } else {
      setCuisineMenuOpen(false);
      setRtPicker({ slot: item.slot, dinner: !!item.isDinner });
    }
  }
  function selectMapItem(i) {
    setSelectedIndex((prev) => (prev === i ? -1 : i));
    setHoverIndex(i);
  }

  // 시간 수정 저장/초기화. 키는 services/dayTimeline.js의 timeKey를 쓴다.
  function applyTime(start, end) {
    plan.setItemTime(timeEdit.timeKey, start, end);
    setTimeEdit(null);
  }

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

          <ScheduleStates routineOn={plan.routineOn} loading={routineLoading} />

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
                onEditTime={(item) => setTimeEdit(item)}
                stayName={stayMarker ? stayMarker.place : null}
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
          stay={plan.routineOn ? stayMarker : null}
          center={{ lat: region.lat, lng: region.lng }}
          distance={distance}
          mapLabel={plan.routineOn ? `${day}일차 일정` : region.short}
          selectedIndex={selectedIndex}
          onSelect={selectMapItem}
          onHover={setHoverIndex}
        />
      </div>

      <ScheduleModals
        selection={selection}
        selectionTypeId={selectionTypeId}
        onCloseSelection={() => setSelectedIndex(-1)}
        timeEdit={timeEdit}
        setTimeEdit={setTimeEdit}
        saveTime={applyTime}
        resetTime={() => applyTime("", "")}
        day={day}
        rtPicker={rtPicker}
        setRtPicker={setRtPicker}
        savedUtilities={plan.savedUtilities}
        theme={theme}
        cuisine={cuisine}
        listings={listings}
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

// 그날 묵는 숙소 마커. 구간(staySegs)에서 오늘이 포함된 것을 찾아
// 목록에서 좌표를 얻는다.
function findStayMarker(staySegs, day, listings) {
  const seg = staySegs.find((g) => g.stayId && g.from <= day && day <= g.to);
  const listing = seg ? findListing(listings, "숙박", seg.stayId) : null;
  return listing ? { place: listing.name, at: toLatLng(listing) } : null;
}
