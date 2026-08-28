import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSaved } from "../hooks/useSaved.js";
import { useSearch } from "../hooks/useSearch.js";
import { useAuth } from "../hooks/useAuth.js";
import { useConfirm } from "../hooks/useConfirm.js";
import { getRegionByShort } from "../services/regionRecommend.js";
import { getSavedProgramCards } from "../services/supportPrograms.js";
import ConfirmModal from "../components/common/ConfirmModal.jsx";
import RegionsSection from "./MyPage/RegionsSection.jsx";
import PlansSection from "./MyPage/PlansSection.jsx";
import ProgramsSection from "./MyPage/ProgramsSection.jsx";
import styles from "./MyPage.module.css";

const MP_LOAD_MS = 900; // design startLoad("mp", 900)

// design/salliljido.extracted.html 1810-1982줄(appDisplay). design의
// seedRegions/seedRoutines(항상 보이는 데모용 카드 2~3개)는 옮기지
// 않았다 — 이번 작업은 저장 기능을 실제로 연결하는 것이 핵심이라, 진짜
// 저장한 적 없는데도 계획/지역이 보이면 오히려 혼란스럽다. 대신 빈
// 상태를 정확히 그 조건(저장한 게 하나도 없을 때)에 맞춰 보여준다.
export default function MyPage() {
  const navigate = useNavigate();
  const saved = useSaved();
  const search = useSearch();
  const auth = useAuth();
  const { confirm, ask, cancel, doConfirm } = useConfirm();

  const [loading, setLoading] = useState(true);
  const [fadingIds, setFadingIds] = useState([]);
  const [renamingId, setRenamingId] = useState(null);
  const [renameDraft, setRenameDraft] = useState("");

  // design goPlan(4029-4038줄): 원본은 마이페이지 "화면"으로 아예 못
  // 들어오게 막는 방식이라(비로그인이면 게이트만 뜨고 화면 전환 자체가
  // 안 됨), 실제 라우트가 있는 여기서도 같은 결과가 나오도록 비로그인
  // 상태로 직접 들어오면 게이트를 띄우고 홈으로 돌려보낸다.
  useEffect(() => {
    if (!auth.auth) {
      auth.requireAuth(
        "마이페이지는 로그인 후 볼 수 있어요",
        "저장한 지역과 계획을 계정에 담아 두려면 로그인이 필요합니다."
      );
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.auth]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), MP_LOAD_MS);
    return () => clearTimeout(timer);
  }, []);

  const regions = saved.savedRegions
    .map((r) => {
      const full = getRegionByShort(r.short);
      return full ? { ...full, savedAt: r.savedAt } : null;
    })
    .filter(Boolean);
  const plans = saved.plans;
  const programs = getSavedProgramCards(saved.savedPrograms);

  // 저장한 것이 하나도 없는지는 로딩과 무관하게 처음부터 알 수 있다 —
  // 세 값 모두 localStorage에서 동기적으로 읽어 온 것이고, 아래 loading은
  // design의 연출용 지연(startLoad("mp", 900))일 뿐 실제 비동기 로드가
  // 아니다.
  //
  // 원본은 `!isLoading("mp") && ...`로 계산해서(3528-3529줄), 로딩 900ms
  // 동안은 세 섹션의 빈 상태를 보여주다가 로딩이 끝나면 통째로 "아직
  // 저장한 것이 없어요"로 바뀌었다. 원본은 시드 데이터(seedRegions/
  // seedRoutines)가 항상 있어서 이 경로를 안 탔지만, 시드를 뺀 지금은
  // 데모로 처음 로그인하면 "만든 계획" 섹션이 떴다가 사라진다.
  // 로딩 조건을 빼서 첫 프레임부터 결론이 바뀌지 않게 했다.
  const allEmpty = regions.length === 0 && plans.length === 0 && programs.length === 0;

  // design fadeOut(id, run)(240ms): 삭제 확정 후 opacity 트랜지션이 끝나면
  // 실제로 목록에서 뺀다.
  function fadeThenRun(id, run) {
    setFadingIds((cur) => cur.concat(id));
    setTimeout(() => {
      run();
      setFadingIds((cur) => cur.filter((x) => x !== id));
    }, 240);
  }

  function unsaveRegion(region) {
    ask("저장한 지역에서 뺄까요?", region.name, () =>
      fadeThenRun(`rg-${region.short}`, () => saved.toggleRegion(region.short))
    );
  }

  function removePlan(plan) {
    ask("이 계획을 삭제할까요?", plan.title, () =>
      fadeThenRun(`rt-${plan.id}`, () => saved.removePlan(plan.id))
    );
  }

  function unsaveProgram(program) {
    ask("관심 목록에서 뺄까요?", program.name, () => saved.toggleProgram(program.id));
  }

  // design mpVals()의 t.open(4428920줄 부근): 계획을 만들 당시 조건부터
  // 되돌린 뒤 PlanEditor로 넘어간다.
  function openPlan(plan) {
    search.restore(plan.condition);
    // design 3504-3505줄: 완성된 계획(status !== "작성 중", 여기서는
    // routineOn)은 최종 계획 화면으로, 작성 중이면 편집 화면으로 연다.
    const base = `/plan/${encodeURIComponent(plan.regionShort)}`;
    navigate(`${plan.routineOn ? `${base}/overview` : base}?planId=${encodeURIComponent(plan.id)}`);
  }

  function startEdit(plan) {
    setRenamingId(plan.id);
    setRenameDraft(plan.title);
  }
  function saveEdit(plan) {
    const title = renameDraft.trim();
    if (title) saved.savePlan({ ...plan, title });
    setRenamingId(null);
  }

  if (!auth.auth) return null;

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <h1 className={styles.heading}>마이페이지</h1>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>저장한 지역</div>
            <div className={styles.statValue}>{regions.length}곳</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>만든 계획</div>
            <div className={styles.statValue}>{plans.length}개</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>관심 프로그램</div>
            <div className={styles.statValue}>{programs.length}개</div>
          </div>
        </div>
      </section>

      {allEmpty ? (
        <section className={styles.allEmpty}>
          <div className={styles.allEmptyInner}>
            <span className={styles.allEmptyIcon}>
              <svg width="30" height="30" viewBox="0 0 26 26" fill="none">
                <path
                  d="M6.5 3.5h13v19l-6.5-5.2-6.5 5.2z"
                  stroke="#2F5D50"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className={styles.allEmptyTitle}>아직 저장한 것이 없어요</div>
            <p className={styles.allEmptyDesc}>마음에 드는 지역을 찾아 계획을 세워보세요</p>
            <button type="button" className={styles.allEmptyBtn} onClick={() => navigate("/find")}>
              지역 찾아보기 <span>→</span>
            </button>
          </div>
        </section>
      ) : (
        <>
          <RegionsSection
            loading={loading}
            regions={regions}
            fadingShorts={fadingIds}
            onUnsave={unsaveRegion}
          />
          <PlansSection
            plans={plans}
            fadingIds={fadingIds}
            renamingId={renamingId}
            renameDraft={renameDraft}
            onDraftChange={setRenameDraft}
            onStartEdit={startEdit}
            onSaveEdit={saveEdit}
            onOpen={openPlan}
            onRemove={removePlan}
          />
          <ProgramsSection programs={programs} onUnsave={unsaveProgram} />
        </>
      )}

      <section className={styles.logoutSection}>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={() => {
            auth.logout();
            navigate("/");
          }}
        >
          로그아웃
        </button>
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
