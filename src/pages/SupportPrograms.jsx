import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  REGION_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  SUP_LOAD_MS,
  getAllPrograms,
  filterPrograms,
  sortPrograms,
  asOfLabel,
} from "../services/supportPrograms.js";
import { useSaved } from "../hooks/useSaved.js";
import { useAuth } from "../hooks/useAuth.js";
import { useConfirm } from "../hooks/useConfirm.js";
import Skeleton from "../components/common/Skeleton.jsx";
import ConfirmModal from "../components/common/ConfirmModal.jsx";
import ProgramFilter from "../components/support/ProgramFilter.jsx";
import ProgramCard from "../components/support/ProgramCard.jsx";
import styles from "./SupportPrograms.module.css";

const ALL_PROGRAMS = getAllPrograms();

// design/salliljido.extracted.html 1697-1809줄(#support).
export default function SupportPrograms() {
  const [searchParams] = useSearchParams();

  // design 4412-4415줄(cbFindSupport): 예상 비용 탭의 "지원 프로그램
  // 찾아보기"에서 넘어오면 ?region= 값으로 지역 필터를 미리 걸어둔다.
  const [regionFilter, setRegionFilter] = useState(() => {
    const r = searchParams.get("region");
    return r && REGION_FILTER_OPTIONS.includes(r) ? [r] : [];
  });
  const [statusFilter, setStatusFilter] = useState([]);
  const [sort, setSort] = useState("deadline");
  const saved = useSaved();
  const { requireAuth } = useAuth();
  const { confirm, ask, cancel, doConfirm } = useConfirm();
  const [loading, setLoading] = useState(true);

  // design 4148줄(goScreen의 startLoad("sup", 900)): 화면 진입 시 900ms
  // 스켈레톤을 보여준 뒤 목록을 노출한다.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), SUP_LOAD_MS);
    return () => clearTimeout(timer);
  }, []);

  function toggleRegion(r) {
    setRegionFilter((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : cur.concat([r])));
  }
  function toggleStatus(s) {
    setStatusFilter((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : cur.concat([s])));
  }
  function clearFilters() {
    setRegionFilter([]);
    setStatusFilter([]);
  }
  // design 4357175줄: 로그인 필요 + 등록 해제 전에만 확인창. 등록 시
  // 토스트는 ToastStack이 아직 없어(docs/02-todo.md) 생략했다.
  function toggleSave(program) {
    if (
      !requireAuth(
        "관심 등록하려면 로그인이 필요해요",
        "마감일을 챙겨 드리려면 계정에 담아 둘 필요가 있어요."
      )
    )
      return;
    if (saved.savedPrograms.includes(program.id)) {
      ask("관심 목록에서 뺄까요?", program.name, () => saved.toggleProgram(program.id));
      return;
    }
    saved.toggleProgram(program.id);
  }

  const shown = sortPrograms(filterPrograms(ALL_PROGRAMS, { regionFilter, statusFilter }), sort);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>지자체 지원 프로그램</h1>
            <p className={styles.subtitle}>한 달 살기를 지원하는 지자체 프로그램을 모아 보여드립니다</p>
          </div>
          <span className={styles.asOf}>{asOfLabel()}</span>
        </div>

        <ProgramFilter
          regionOptions={REGION_FILTER_OPTIONS}
          statusOptions={STATUS_FILTER_OPTIONS}
          regionFilter={regionFilter}
          statusFilter={statusFilter}
          onToggleRegion={toggleRegion}
          onToggleStatus={toggleStatus}
          onClearRegion={() => setRegionFilter([])}
          onClearStatus={() => setStatusFilter([])}
          count={shown.length}
          sort={sort}
          onSort={setSort}
        />

        {loading ? (
          <div className={styles.grid}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <Skeleton width="92px" height="22px" radius={999} />
                <Skeleton width="70%" height="15px" style={{ marginTop: 20 }} />
                <Skeleton width="96%" height="12px" style={{ marginTop: 18 }} />
                <Skeleton width="80%" height="12px" style={{ marginTop: 9 }} />
                <Skeleton width="190px" height="44px" radius={10} style={{ marginTop: 24 }} />
              </div>
            ))}
          </div>
        ) : shown.length ? (
          <div className={styles.grid}>
            {shown.map((p) => (
              <ProgramCard
                key={p.id}
                program={p}
                saved={saved.savedPrograms.includes(p.id)}
                onToggleSave={() => toggleSave(p)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
                <rect x="3" y="5" width="20" height="16" rx="3" stroke="#2F5D50" strokeWidth="1.5" />
                <line x1="3" y1="10.5" x2="23" y2="10.5" stroke="#2F5D50" strokeWidth="1.5" />
              </svg>
            </span>
            <div className={styles.emptyTitle}>조건에 맞는 프로그램이 없어요</div>
            <p className={styles.emptyDesc}>필터를 조금 넓혀보시면 어떨까요</p>
            <button type="button" className={styles.emptyBtn} onClick={clearFilters}>
              필터 초기화
            </button>
          </div>
        )}

        <div className={styles.disclaimer}>
          <p>
            프로그램 정보는 각 지자체 공식 공고를 바탕으로 정리했으며, 실제 내용은 변경될 수 있습니다. 신청 전
            공식 페이지에서 확인해 주세요.
          </p>
        </div>
      </div>

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
