import { useNavigate, useParams } from "react-router-dom";
import { PlanProvider } from "../store/PlanContext.jsx";
import { getRegionByShort } from "../services/regionRecommend.js";
import { regionPhoto, photoBackground } from "../data/regionPhotos.js";
import RegionNotFound from "../components/region/RegionNotFound.jsx";
import ExploreTab from "./PlanEditor/tabs/ExploreTab.jsx";
import styles from "./RegionExplore.module.css";

// design에는 없던 화면. 계획을 만들지 않고 "그 지역에 뭐가 있는지"만 보는
// 길이 없어서, 지역 소개에서 바로 들어오는 둘러보기 전용 화면을 냈다.
// 본문은 계획 화면의 둘러보기 탭(ExploreTab)을 그대로 쓴다 — 복사본을 두면
// 둘이 갈라지므로, 차이는 ExploreTab의 props(readOnly/ctaLabel/onCta)로만 준다.
//
// 담기(계획에 추가)는 이 화면에서 감춘다(readOnly).
// PlanContext는 계획 화면이 켜져 있는 동안만 사는 메모리 상태이고,
// localStorage에는 "저장하기"를 눌렀을 때만 스냅샷으로 들어간다
// (utils/planSnapshot.js). 즉 이 화면에서 담으면 담긴 것이 남을 곳이 없고,
// 계획 화면으로 넘어가는 순간 다른 PlanProvider가 새로 뜨면서 조용히
// 사라진다. 담은 줄 알았는데 없어지는 것보다 처음부터 안 보여 주는 편이
// 정직하다고 판단했다. 계획을 만들 사람은 하단 CTA로 넘어가면 된다.
// (PlanProvider로 감싸는 이유: ExploreTab이 usePlan()을 쓰기 때문이다.
//  readOnly라 상태는 늘 비어 있고, 아무것도 저장되지 않는다.)
export default function RegionExplore() {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const region = getRegionByShort(regionId);

  if (!region) return <RegionNotFound />;

  return (
    <div>
      {/* 헤더는 계획 화면 배너(PlanEditor/Banner)의 값을 그대로 쓰되
          계획 이름·조건 칩·저장 버튼 없이 지역명만 둔다. */}
      <section className={styles.header}>
        <div
          className={styles.texture}
          style={{ background: photoBackground(regionPhoto(region.short), region.swatch) }}
        />
        <div className={styles.overlay} />
        <div className={styles.row}>
          <div className={styles.left}>
            <button type="button" className={styles.backBtn} onClick={() => navigate(`/region/${regionId}`)}>
              ← 지역 소개로 돌아가기
            </button>
            <h1 className={styles.title}>{region.name}</h1>
          </div>
        </div>
      </section>

      <PlanProvider>
        <ExploreTab
          region={region}
          readOnly
          ctaLabel="이 지역에서 지내보기"
          onCta={() => navigate(`/plan/${regionId}?tab=schedule`)}
        />
      </PlanProvider>
    </div>
  );
}
