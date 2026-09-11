import { useNavigate, useParams } from "react-router-dom";
import { useSearch } from "../hooks/useSearch.js";
import { useRegionSave } from "../hooks/useRegionSave.js";
import { useConfirm } from "../hooks/useConfirm.js";
import { getRegionByShort } from "../services/regionRecommend.js";
import { regionAbout } from "../services/regionProfile.js";
import { resolveStayCondition } from "../utils/date.js";
import { hasJong } from "../utils/korean.js";
import RegionNotFound from "../components/region/RegionNotFound.jsx";
import ConfirmModal from "../components/common/ConfirmModal.jsx";
import Banner from "./RegionIntro/Banner.jsx";
import Features from "./RegionIntro/Features.jsx";
import styles from "./RegionIntro.module.css";

// design/salliljido.extracted.html 678-750줄, 2986-3103줄(detailVals 중
// intro 관련 계산). "dtStats"/"dtWhy"/"dtLocNote"/"dtMx"/"dtMy"/"inWhy"/
// "regionPrograms"는 값은 계산되지만 이 화면 어디에도 마크업으로 안 걸려
// 있던 죽은 코드라 옮기지 않았다(§ 보고서 참고).
// ABOUT 문단. 예전에는 지역명과 places만 갈아끼운 같은 문장이 29곳에 그대로
// 나갔고, "마트와 병원, 시장이 모여 있어"처럼 확인할 수 없는 말도 섞여 있었다.
// 지금은 그 지역 관광공사 목록 실측값으로 문장을 골라 잇는다
// (services/regionProfile.js). 첫 문장만 여기서 붙인다 — 고른 조건에 대한
// 대답이라 지역 데이터가 아니라 화면 맥락에서 나오는 말이다.
function buildAbout(region) {
  const place = (region.places || ["자연"])[0];
  return (
    place +
    (hasJong(place) ? "과" : "와") +
    " 가까워 고르신 조건에 잘 맞는 곳입니다. " +
    regionAbout(region, { hasJong })
  );
}

export default function RegionIntro() {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const search = useSearch();
  const region = getRegionByShort(regionId);
  const { confirm, ask, cancel, doConfirm } = useConfirm();
  // design dtToggleSave(4409322줄): 로그인 필요 + 저장 해제 시에만 확인창.
  const { isSaved, toggleSave } = useRegionSave(region, ask);

  if (!region) {
    return <RegionNotFound />;
  }

  // 표시와 계산이 같은 조건에서 나오도록 공용 리졸버를 쓴다.
  const { dur, place, customDays } = search;
  const cond = resolveStayCondition({ dur, place, customDays });
  const chips = [cond.durLabel, cond.place];
  const about = buildAbout(region);
  // design 3095-3096줄: pool() 항목엔 swatch가 없어 항상 기본 초록 텍스처로
  // 떨어진다(RegionResult 카드용 swatch는 getRecommendations()가 그때그때
  // 만들어 붙이는 값이라 여기선 못 쓴다). imageNote는 POOL에 다 있어 지금은
  // 안 쓰이지만 데이터가 비어도 원본처럼 안전하게 기본값을 둔다.
  const bannerRegion = {
    ...region,
    swatch:
      region.swatch ||
      "repeating-linear-gradient(118deg, #7E8F72 0 26px, #93A184 26px 52px, #6F8470 52px 78px, #A9AE96 78px 104px, #586E63 104px 130px)",
    imageNote: region.imageNote || "지역 대표 풍경",
  };

  return (
    <div className={styles.page}>
      <Banner
        region={bannerRegion}
        chips={chips}
        saved={isSaved}
        onToggleSave={toggleSave}
        onBack={() => navigate("/find/result")}
      />

      <section data-in-reveal style={{ animationDelay: ".18s" }} className={styles.about}>
        <div className={styles.aboutInner}>
          <div className={styles.aboutText}>
            <div className={styles.aboutEyebrow}>ABOUT</div>
            <p className={styles.aboutBody}>{about}</p>
          </div>
        </div>
      </section>

      <Features region={region} />

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          {/* design 3067줄: 계획 화면(/plan/:regionId)으로 들어간다. 지역은
              PlanEditor도 같은 URL 파라미터 패턴으로 받고, 기간·라이프스타일은
              이미 앱 전역에 있는 SearchContext를 그대로 읽으면 되므로 이
              화면에서 PlanContext로 따로 넘길 값은 없다.

              원본은 버튼이 하나("여기서 지내보기")뿐이라 계획을 짜러 갈
              생각이 없는 사람도 같은 문을 지나야 했다. 먼저 뭐가 있는지만
              보고 싶은 길(둘러보기 탭)을 보조 버튼으로 따로 냈다. */}
          <div className={styles.ctaRow}>
            <button
              type="button"
              className={styles.ctaSubBtn}
              onClick={() => navigate(`/region/${regionId}/explore`)}
            >
              이 지역 둘러보기
            </button>
            <button type="button" className={styles.ctaBtn} onClick={() => navigate(`/plan/${regionId}`)}>
              <span className={styles.ctaArrow}>이 지역에서 지내보기 →</span>
            </button>
          </div>
        </div>
      </section>

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
