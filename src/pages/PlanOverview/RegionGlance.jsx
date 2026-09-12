import RegionGlanceMap from "./RegionGlanceMap.jsx";
import styles from "./RegionGlance.module.css";

// design/salliljido.extracted.html 1499-1540줄.
// 지도는 카카오맵(RegionGlanceMap)이고, SDK를 못 불러오면 원본 목업
// (빗금 배경 + 반경 원 + 클러스터 라벨)으로 폴백한다.
export default function RegionGlance({
  region,
  regionName,
  intro,
  facts,
  clusters,
  rangeNote,
  onGoIntro,
  onGoRoute,
}) {
  // 카카오맵 SDK를 못 불러오거나(키 없음·도메인 미등록·네트워크) 좌표가
  // 아직 없을 때 쓰는 목업 지도. 지도 자리가 화면의 절반을 차지해서
  // 에러 상자로 바꾸면 레이아웃이 비어 보이고, 목업은 이미 원본 디자인
  // 그대로라 그대로 두는 편이 자연스럽다(완료 보고 참고).
  const mockMap = (
    <div className={styles.map}>
      <span className={styles.radius} />
      {clusters.map((c) => (
        <span key={c.label} className={styles.cluster} style={{ left: c.x, top: c.y }}>
          <span className={styles.clusterDot} />
          <span className={styles.clusterLabel}>{c.label}</span>
        </span>
      ))}
      <span className={styles.centerPin}>
        <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
          <path d="M3 8.2 9 3.2l6 5V15H3z" stroke="#FFFDFA" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={styles.mapTag}>map · 체류 범위</span>
    </div>
  );

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* 인쇄에서는 제목을 뺀다 — 지도와 소개 산문이 빠지면 남는 것이
            요약 지표 세 줄뿐이라, 제목이 있으면 새 섹션이 시작하는 것처럼
            보여 첫 장이 도리어 장황해진다. */}
        <h2 className={styles.heading} data-print-hide>
          지역 한눈에
        </h2>
        <div className={styles.row}>
          <div className={styles.left}>
            <div className={styles.nameRow}>
              <span className={styles.name}>{regionName}</span>
              <span className={styles.badge}>인구감소지역</span>
            </div>
            {/* 지역 소개 산문은 화면에서만 보여 준다. 인쇄 첫 장은
                계획 정보(이름·지역·기간·비용·요약 지표)만 담아야 해서,
                읽을거리를 빼면 한 장에 다 들어간다. */}
            <p className={styles.intro} data-print-hide>
              {intro}
            </p>
            <div className={styles.facts}>
              {facts.map((f) => (
                <div key={f.label} className={styles.factRow}>
                  <span className={styles.factLabel}>{f.label}</span>
                  <span className={styles.factValue}>{f.value}</span>
                </div>
              ))}
            </div>
            <a href="#intro" className={styles.introLink} onClick={onGoIntro} data-print-hide>
              지역 소개 다시 보기
            </a>
          </div>

          {/* 지도는 종이에서 눌러볼 수도 확대할 수도 없어서 인쇄에서 뺀다. */}
          <div className={styles.right} data-print-hide>
            <RegionGlanceMap region={region} fallback={mockMap} />
            <div className={styles.mapFoot}>
              <span className={styles.rangeNote}>{rangeNote}</span>
              <a href="#route" className={styles.routeLink} onClick={onGoRoute} data-print-hide>
                날짜별 동선 보기
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
