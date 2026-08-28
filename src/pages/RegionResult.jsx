import { Fragment, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSearch } from "../hooks/useSearch.js";
import { getRecommendations } from "../services/regionRecommend.js";
import { stayDays } from "../utils/date.js";
import Skeleton from "../components/common/Skeleton.jsx";
import MapPlaceholder from "../components/map/MapPlaceholder.jsx";
import ResultMap from "./RegionResult/ResultMap.jsx";
import RegionCard from "../components/region/RegionCard.jsx";
import styles from "./RegionResult.module.css";

// design/salliljido.extracted.html 395-494줄(#find/result), 3985-4025줄(계산식).
export default function RegionResult() {
  const search = useSearch();
  const { region, dur, place } = search;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState([]);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const [compareOpen, setCompareOpen] = useState(false);

  const hasConditions = !!(region && dur && place);

  // design 3985줄 ready 게이트와 동일한 조건. 조건 없이 이 화면으로 직접
  // 들어오면(URL 직접 입력, 새로고침 등) 조건 선택 화면으로 돌려보낸다.
  useEffect(() => {
    if (!hasConditions) return;
    let cancelled = false;
    setLoading(true);
    getRecommendations({ region, place }).then((result) => {
      if (!cancelled) {
        setRecs(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, place, hasConditions]);

  if (!hasConditions) {
    return <Navigate to="/find" replace />;
  }

  const recCount = recs.length;

  const chipRegion = region === "상관없음" ? "지역 상관없음" : region;
  const chipDuration =
    dur === "직접 입력" ? `${stayDays(search)}일 체류` : `${dur} 체류`;
  const chipPlace = place;

  const resultsHeading = loading
    ? "조건에 맞는 지역을 찾고 있어요"
    : recCount >= 3
      ? "이 조건이라면, 이 세 곳을 권합니다"
      : recCount === 0
        ? "추천 결과"
        : `이 조건이라면, 이 ${recCount}곳을 권합니다`;


  const compareRows = [
    { label: "한적함", cells: recs.map((r) => r.quietText) },
    { label: "생활 편의", cells: recs.map((r) => r.convText) },
    { label: "워케이션", cells: recs.map((r) => r.wcText) },
    { label: "주요 특징", cells: recs.map((r) => (r.tags || []).slice(0, 2).join(", ")) },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.chips}>
            <span className={styles.chip}>{chipRegion}</span>
            <span className={styles.chip}>{chipDuration}</span>
            <span className={styles.chip}>{chipPlace}</span>
            {/* design 402, 4013줄: 선택값은 초기화하지 않고 화면만 돌아간다 */}
            <button type="button" className={styles.resetBtn} onClick={() => navigate("/find")}>
              조건 다시 고르기
            </button>
          </div>

          <h2 className={styles.heading}>{resultsHeading}</h2>
          <p className={styles.subtext}>
            방문객이 적은 인구감소지역 중에서 골랐어요 · 지정 현황 자료 행정안전부
          </p>

          {loading ? (
            <div className={styles.loadRow}>
              <div className={styles.skeletonCol}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <Skeleton width="100%" height="168px" radius={0} />
                    <div className={styles.skeletonCardBody}>
                      <Skeleton width="62%" height="13px" />
                      <Skeleton width="88%" height="13px" style={{ marginTop: 10 }} />
                      <Skeleton width="148px" height="40px" radius={10} style={{ marginTop: 18 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.mapLoading}>지도를 불러오는 중</div>
            </div>
          ) : (
            <>

              <div className={styles.resultsRow}>
                <div className={styles.cardsCol}>
                  {recs.map((r, i) => (
                    <RegionCard
                      key={r.short}
                      region={r}
                      best={i === 0}
                      hovered={hoverIdx === i}
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(-1)}
                    />
                  ))}

                  <button
                    type="button"
                    className={styles.compareToggle}
                    onClick={() => setCompareOpen((v) => !v)}
                  >
                    {compareOpen ? "비교 접기" : "세 곳 비교하기"}
                  </button>

                  {compareOpen && (
                    <div className={styles.compareTable}>
                      <div
                        className={styles.compareGrid}
                        style={{
                          gridTemplateColumns: `minmax(72px, .8fr) ${recs.map(() => "1fr").join(" ")}`,
                        }}
                      >
                        <span className={styles.compareHead}>항목</span>
                        {recs.map((r) => (
                          <span key={r.short} className={styles.compareShort}>
                            {r.short}
                          </span>
                        ))}
                        {compareRows.map((row) => (
                          <Fragment key={row.label}>
                            <span className={styles.compareLabel}>{row.label}</span>
                            {row.cells.map((c, i) => (
                              <span key={i} className={styles.compareCell}>
                                {c}
                              </span>
                            ))}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.mapCol}>
                  {/* 지도는 실제 카카오맵이고, SDK를 못 불러오면 목업 셸로
                      폴백한다. 폴백에는 마커를 찍지 않는다 — 예전 mx/my는
                      실제 좌표가 아니라 목업 지도 위 % 값이었다. */}
                  <ResultMap
                    recs={recs}
                    hoverIdx={hoverIdx}
                    onHover={setHoverIdx}
                    fallback={<MapPlaceholder label="추천 지역 위치" className={styles.map} />}
                  />
                  <p className={styles.mapCaption}>
                    카드에 마우스를 올리면 해당 지역 마커가 강조됩니다.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
