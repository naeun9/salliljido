import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearch } from "../../../hooks/useSearch.js";
import { usePlan } from "../../../hooks/usePlan.js";
import { useRegionListings } from "../../../hooks/useRegionListings.js";
import { stayDays } from "../../../utils/date.js";
import { CATEGORIES, CATEGORY_COLORS, findListingAnywhere } from "../../../services/exploreListings.js";
import { DEFAULT_STAY_SEGMENT_RATE } from "../../../utils/cost.js";
import CategoryList from "./ExploreTab/CategoryList.jsx";
import SubChips from "./ExploreTab/SubChips.jsx";
import ListStates from "./ExploreTab/ListStates.jsx";
import Pagination from "./ExploreTab/Pagination.jsx";
import { ADDED_MARKER_COLOR } from "./ExploreTab/ExploreMap.jsx";
import SidebarMap from "./ExploreTab/SidebarMap.jsx";
import PlaceDetailModal from "../../../components/plan/PlaceDetailModal.jsx";
import styles from "./ExploreTab.module.css";

// 하위 칩(여러 개 선택 가능)으로 목록을 거른다. routineGenerator에도 하위
// 유형으로 거르는 함수가 있지만 그쪽은 한 유형만 받는다 — 이름을 갈라 둔다.
function filterBySelectedSubs(list, selected) {
  return selected.length ? list.filter((x) => selected.includes(x.sub)) : list;
}

// design/salliljido.extracted.html 1012-1227줄(dtTab2Display), 2510-2716줄(livingVals).
// 목록은 한국관광공사 지역기반 API 실호출로 채운다(services/exploreListings.js).
const PAGE_SIZE = 6; // 한 페이지에 보여 줄 항목 수

// 계획 화면의 탭으로도 쓰이고, 계획 없이 지역만 둘러보는 화면
// (/region/:regionId/explore)에서도 그대로 쓰인다. 두 쓰임의 차이는
// props로만 가른다(복사본을 두지 않는다):
//   readOnly  담기 버튼을 감춘다. 계획이 없는 화면에서는 담아도 담긴 것이
//             어디에도 남지 않기 때문이다(RegionExplore.jsx 주석 참고).
//   ctaLabel  하단 버튼 문구. 기본은 "체류 계획 짜기".
//   onCta     하단 버튼 동작. 기본은 같은 화면의 체류 계획 탭으로 이동.
export default function ExploreTab({ region, readOnly = false, ctaLabel, onCta }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { dur, customDays } = useSearch();
  const {
    addedExperiences,
    experienceDays,
    experiencePrices,
    setExperienceDay,
    removeExperience,
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

  const [category, setCategory] = useState("숙박");
  const [subFilters, setSubFilters] = useState({});
  const [page, setPage] = useState(1);
  const [hoverId, setHoverId] = useState(null);
  const [dayPickerId, setDayPickerId] = useState(null);
  const [stayPickerId, setStayPickerId] = useState(null);
  const [mapCollapsed, setMapCollapsed] = useState(false);
  // 카드 본문을 누르면 뜨는 장소 상세. 체류 계획·최종 계획과 같은 모달이다.
  const [detailItem, setDetailItem] = useState(null);
  const listTopRef = useRef(null);

  // 지도 마커를 누르면 그 카드로 목록을 스크롤하고 강조 상태로 둔다.
  function focusListItem(id) {
    setHoverId(id);
    const card = document.querySelector(`[data-listing-id="${id}"]`);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // design은 카테고리를 바꿀 때마다 700ms 가짜 로딩을 보여줬지만(2663줄
  // startLoad("li", 700)), 실제로는 지역 하나를 한 번만 부르고 카테고리는
  // 그 결과를 나눠 쓰는 구조라 로딩은 "지역이 바뀔 때"만 뜬다. 카테고리
  // 전환은 추가 호출 없이 즉시 바뀐다(호출 최소화).
  const { listings, loading, error: loadError, retry } = useRegionListings(region.short);

  const durDays = stayDays({ dur, customDays });

  function selectCategory(cat) {
    setCategory(cat);
    setPage(1);
    setHoverId(null);
    setDayPickerId(null);
    setStayPickerId(null);
  }

  // 페이지를 바꾸면 목록 맨 위로 올려 준다 — 안 그러면 아래쪽에 머문 채
  // 내용만 갈려 어디로 갔는지 알기 어렵다.
  function goPage(next) {
    setPage(next);
    setHoverId(null);
    if (listTopRef.current) listTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleSub(cat, sub) {
    setSubFilters((prev) => {
      const cur = prev[cat] || [];
      const next = cur.includes(sub) ? cur.filter((v) => v !== sub) : cur.concat(sub);
      return { ...prev, [cat]: next };
    });
    setPage(1);
  }

  const activeSubSel = subFilters[category] || [];
  const fullList = listings[category] || [];
  const filteredList = filterBySelectedSubs(fullList, activeSubSel);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleList = filteredList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // 숙박은 "며칠~며칠" 구간이 붙어서 예상 비용 탭의 숙박 구간(staySegs)에
  // 직접 들어간다. 여기서는 그 구간에서 숙소 id만 뽑아 쓴다.
  const stayPicks = staySegs.filter((g) => g.stayId);
  // 담은 숙소는 지도 라벨에 기간을 함께 보여 준다("1~5일차"). 담지 않은
  // 숙소에는 붙이지 않는다.
  const markerSubLabels = Object.fromEntries(stayPicks.map((g) => [g.stayId, `${g.from}~${g.to}일차`]));
  const addedIds = addedExperiences
    .concat(savedUtilities)
    .concat(savedSpots)
    .concat(stayPicks.map((g) => g.stayId));
  const addedCount = addedIds.length;

  // 담은 곳은 지금 보고 있는 카테고리가 아니어도 지도에 계속 남는다.
  // 카테고리를 바꾸면 사라져서 "내가 뭘 담았더라"를 놓치기 쉬웠다.
  const addedMarkers = addedIds
    .map((id) => findListingAnywhere(listings, id))
    .filter((x) => x && !visibleList.some((v) => v.id === x.id));

  function handleStayConfirm(id, from, to) {
    setStayPick(id, from, to, DEFAULT_STAY_SEGMENT_RATE, staySegs);
    setStayPickerId(null);
  }

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.list}>
          <div ref={listTopRef} />
          <div className={styles.chips}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.chip} ${category === cat ? styles.active : ""}`}
                onClick={() => selectCategory(cat)}
              >
                {cat}
                <span className={styles.chipDot} style={{ background: CATEGORY_COLORS[cat] }} />
              </button>
            ))}
          </div>

          {loading || loadError ? (
            <ListStates loading={loading} error={loadError} onRetry={retry} />
          ) : (
            <>
              <CategoryList
                category={category}
                onOpenDetail={setDetailItem}
                subChips={
                  <SubChips
                    category={category}
                    fullList={fullList}
                    selected={activeSubSel}
                    onToggle={toggleSub}
                  />
                }
                filteredList={filteredList}
                visibleList={visibleList}
                hoverId={hoverId}
                setHoverId={setHoverId}
                addedExperiences={addedExperiences}
                experienceDays={experienceDays}
                experiencePrices={experiencePrices}
                setExperienceDay={setExperienceDay}
                removeExperience={removeExperience}
                savedUtilities={savedUtilities}
                utilityDays={utilityDays}
                onConfirmUtility={(id, day) => {
                  // 이미 담겨 있고 같은 일차를 다시 고르면 빼기(체험과 동일).
                  if (savedUtilities.includes(id) && utilityDays[id] === day) toggleUtility(id);
                  else setUtilityDay(id, day);
                  setDayPickerId(null);
                }}
                savedSpots={savedSpots}
                spotDays={spotDays}
                onConfirmSpot={(id, day) => {
                  if (savedSpots.includes(id) && spotDays[id] === day) toggleSpot(id);
                  else setSpotDay(id, day);
                  setDayPickerId(null);
                }}
                stayPicks={stayPicks}
                stayPickerId={stayPickerId}
                setStayPickerId={setStayPickerId}
                onStayConfirm={handleStayConfirm}
                onStayRemove={(id) => {
                  removeStayPick(id, staySegs);
                  setStayPickerId(null);
                }}
                durDays={durDays}
                dayPickerId={dayPickerId}
                setDayPickerId={setDayPickerId}
                readOnly={readOnly}
              />

              <Pagination page={safePage} totalPages={totalPages} onChange={goPage} />

              {/* design 1182줄: 원본은 이 버튼이 dtTab2(현재 탭과 동일한 둘러보기)를
                  다시 호출해 아무 일도 안 일어나는 죽은 버튼이었다. 버튼 문구가
                  "체류 계획 짜기"인 만큼 체류 계획 탭으로 이동하는 게 명백한 의도라
                  판단해 그쪽으로 고쳤다(§ 보고서 참고). */}
              <div className={styles.ctaRow}>
                <button
                  type="button"
                  className={styles.ctaBtn}
                  onClick={() => {
                    if (onCta) {
                      onCta();
                      return;
                    }
                    const next = new URLSearchParams(searchParams);
                    next.set("tab", "schedule");
                    setSearchParams(next);
                  }}
                >
                  {ctaLabel || (addedCount ? `담은 ${addedCount}곳으로 계획 짜기` : "체류 계획 짜기")}{" "}
                  <span>→</span>
                </button>
                <span className={styles.ctaSource}>출처 ⓒ한국관광공사</span>
              </div>
            </>
          )}
        </div>

        {/* 지도 핀은 지금 페이지에 깔린 카드(visibleList) + 계획에 담은 곳
            전체를 찍는다. 실데이터는 한 카테고리가 200건을 넘어(태안 자연
            83건) 다 찍으면 읽히지 않으므로 목록과 같은 범위만 보여 주되,
            담은 곳은 카테고리를 바꿔도 계속 남게 따로 얹는다. */}
        <SidebarMap
          items={visibleList}
          addedMarkers={addedMarkers}
          markerSubLabels={markerSubLabels}
          center={{ lat: region.lat, lng: region.lng }}
          categoryColor={CATEGORY_COLORS[category]}
          hoveredId={hoverId}
          onHoverItem={setHoverId}
          onSelectItem={focusListItem}
          addedIds={addedIds}
          mapLabel={region.name}
          collapsed={mapCollapsed}
          onToggleCollapse={() => setMapCollapsed((v) => !v)}
          legend={
            readOnly
              ? CATEGORIES.map((c) => ({ label: c, color: CATEGORY_COLORS[c] }))
              : CATEGORIES.map((c) => ({
                  label: c,
                  color: CATEGORY_COLORS[c],
                })).concat([
                  // 체험 프로그램 카테고리 색(주황)과 겹쳐 구분이 안 돼서
                  // 담은 곳은 진한 초록으로 옮겼다(ExploreMap.ADDED_MARKER_COLOR).
                  { label: "계획에 추가됨", color: ADDED_MARKER_COLOR },
                ])
          }
        />
      </div>

      {/* 목록 카드에서 연 장소 상세. 담기 버튼·링크 클릭과는 구분된다
          (ExploreTab/cardClick.js). 상세 조회는 모달을 열 때만 부른다. */}
      <PlaceDetailModal
        selection={
          detailItem
            ? {
                id: detailItem.id,
                place: detailItem.name,
                tag: detailItem.type,
                desc: detailItem.desc || detailItem.note || "",
                addr: detailItem.addr,
                mapX: detailItem.mapX,
                mapY: detailItem.mapY,
              }
            : null
        }
        contentTypeId={detailItem ? detailItem.contentTypeId : ""}
        onClose={() => setDetailItem(null)}
      />
    </section>
  );
}
