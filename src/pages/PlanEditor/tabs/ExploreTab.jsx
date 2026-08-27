import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearch } from "../../../hooks/useSearch.js";
import { usePlan } from "../../../hooks/usePlan.js";
import { useRegionListings } from "../../../hooks/useRegionListings.js";
import { stayDays } from "../../../utils/date.js";
import { CATEGORIES, CATEGORY_COLORS, SUB_FILTERS } from "../../../services/exploreListings.js";
import Skeleton from "../../../components/common/Skeleton.jsx";
import EmptyState from "../../../components/common/EmptyState.jsx";
import CategoryList from "./ExploreTab/CategoryList.jsx";
import SidebarMap from "./ExploreTab/SidebarMap.jsx";
import styles from "./ExploreTab.module.css";

function bySub(list, selected) {
  return selected.length ? list.filter((x) => selected.includes(x.sub)) : list;
}

// design/salliljido.extracted.html 1012-1227줄(dtTab2Display), 2510-2716줄(livingVals).
// 목록은 한국관광공사 지역기반 API 실호출로 채운다(services/exploreListings.js).
export default function ExploreTab({ region }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { dur, customDays } = useSearch();
  const {
    addedExperiences,
    experienceDays,
    experiencePrices,
    setExperienceDay,
    removeExperience,
    savedUtilities,
    toggleUtility,
  } = usePlan();

  const [category, setCategory] = useState("숙박");
  const [subFilters, setSubFilters] = useState({});
  const [limit, setLimit] = useState(12);
  const [hoverId, setHoverId] = useState(null);
  const [expPickerId, setExpPickerId] = useState(null);
  const [mapCollapsed, setMapCollapsed] = useState(false);

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
    setLimit(12);
    setHoverId(null);
  }

  function toggleSub(cat, sub) {
    setSubFilters((prev) => {
      const cur = prev[cat] || [];
      const next = cur.includes(sub) ? cur.filter((v) => v !== sub) : cur.concat(sub);
      return { ...prev, [cat]: next };
    });
    setLimit(12);
  }

  const activeSubSel = subFilters[category] || [];
  const fullList = listings[category] || [];
  const filteredList = bySub(fullList, activeSubSel);
  const visibleList = filteredList.slice(0, limit);
  const addedCount = addedExperiences.length + savedUtilities.length;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.list}>
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

          {/* design 2669줄: 해당 유형이 0건이면 칩을 흐리게(opacity .45) 만든다.
              소도시에서는 실제로 0건인 유형이 흔한데(예: 태안에 호텔 없음)
              원본이 이미 이 처리를 갖고 있어 그대로 쓴다. */}
          <div className={styles.subChips}>
            {SUB_FILTERS[category].map((sub) => {
              const count = fullList.filter((x) => x.sub === sub).length;
              return (
                <button
                  key={sub}
                  type="button"
                  className={`${styles.subChip} ${activeSubSel.includes(sub) ? styles.active : ""}`}
                  style={{ opacity: count ? 1 : 0.45 }}
                  onClick={() => toggleSub(category, sub)}
                >
                  {sub}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className={styles.loadGrid}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className={styles.loadCard}>
                  <Skeleton width="84px" height="68px" radius={10} />
                  <div className={styles.loadCardBody}>
                    <Skeleton width="66%" height="13px" />
                    <Skeleton width="92%" height="12px" style={{ marginTop: 11 }} />
                    <Skeleton width="44%" height="12px" style={{ marginTop: 9 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            /* design에는 목록 호출 실패 UI가 없다(사이드 지도의 에러 오버레이는
               절대 켜지지 않는 죽은 마크업이었다 — SidebarMap.jsx 주석 참고).
               실제 API를 붙이면 실패가 실제로 일어날 수 있어 최소한으로 만들었고,
               문구·아이콘·버튼 스타일은 그 죽어 있던 지도 에러 오버레이의
               것을 그대로 가져다 맞췄다(§ 완료 보고 참고). */
            <EmptyState
              icon={
                <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
                  <circle cx="13" cy="13" r="9.5" stroke="#C05F33" strokeWidth="1.5" />
                  <line x1="13" y1="8" x2="13" y2="14.5" stroke="#C05F33" strokeWidth="1.7" strokeLinecap="round" />
                  <line x1="13" y1="17.4" x2="13" y2="17.7" stroke="#C05F33" strokeWidth="1.9" strokeLinecap="round" />
                </svg>
              }
              title="정보를 불러오지 못했어요"
              description="잠시 후 다시 시도해 주세요"
              action={
                <button type="button" className={styles.moreBtn} onClick={retry}>
                  다시 시도
                </button>
              }
            />
          ) : (
            <>
              <CategoryList
                category={category}
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
                toggleUtility={toggleUtility}
                durDays={durDays}
                expPickerId={expPickerId}
                setExpPickerId={setExpPickerId}
              />

              <div className={`${styles.moreRow} ${filteredList.length > limit ? styles.visible : ""}`}>
                <button type="button" className={styles.moreBtn} onClick={() => setLimit((l) => l + 12)}>
                  더 보기
                </button>
              </div>

              {/* design 1182줄: 원본은 이 버튼이 dtTab2(현재 탭과 동일한 둘러보기)를
                  다시 호출해 아무 일도 안 일어나는 죽은 버튼이었다. 버튼 문구가
                  "체류 계획 짜기"인 만큼 체류 계획 탭으로 이동하는 게 명백한 의도라
                  판단해 그쪽으로 고쳤다(§ 보고서 참고). */}
              <div className={styles.ctaRow}>
                <button
                  type="button"
                  className={styles.ctaBtn}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("tab", "schedule");
                    setSearchParams(next);
                  }}
                >
                  {addedCount ? `담은 ${addedCount}곳으로 계획 짜기` : "체류 계획 짜기"} <span>→</span>
                </button>
                <span className={styles.ctaSource}>출처 ⓒ한국관광공사</span>
              </div>
            </>
          )}
        </div>

        {/* 지도 핀은 화면에 실제로 깔린 카드(visibleList)만 찍는다.
            원본 목업은 카테고리당 5건짜리 배열이라 전부 찍어도 문제가
            없었지만, 실데이터는 한 카테고리가 200건을 넘어(태안 자연 83건
            등) 다 찍으면 지도가 읽히지 않고 마커 클릭 → 목록 스크롤도
            아직 안 그려진 카드로는 갈 수 없다. "더 보기"로 목록이 늘면
            핀도 같이 늘어난다. */}
        <SidebarMap
          items={visibleList}
          center={{ lat: region.lat, lng: region.lng }}
          categoryColor={CATEGORY_COLORS[category]}
          hoveredId={hoverId}
          onHoverItem={setHoverId}
          onSelectItem={focusListItem}
          addedIds={category === "체험 프로그램" ? addedExperiences : []}
          mapLabel={region.name}
          collapsed={mapCollapsed}
          onToggleCollapse={() => setMapCollapsed((v) => !v)}
          legend={CATEGORIES.map((c) => ({ label: c, color: CATEGORY_COLORS[c] })).concat([
            { label: "내 계획에 추가됨", color: "#D9784E" },
          ])}
        />
      </div>
    </section>
  );
}
