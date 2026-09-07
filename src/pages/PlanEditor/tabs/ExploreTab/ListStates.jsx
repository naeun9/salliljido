import Skeleton from "../../../../components/common/Skeleton.jsx";
import EmptyState from "../../../../components/common/EmptyState.jsx";
import styles from "../ExploreTab.module.css";

// 둘러보기 목록의 로딩·실패 상태. ExploreTab.jsx가 300줄을 넘어 떼어냈고
// 마크업은 옮기기 전 그대로다.
//
// design에는 목록 호출 실패 UI가 없다(사이드 지도의 에러 오버레이는 절대
// 켜지지 않는 죽은 마크업이었다 — SidebarMap.jsx 주석 참고). 실제 API를
// 붙이면 실패가 실제로 일어날 수 있어 최소한으로 만들었고, 문구·아이콘·
// 버튼 스타일은 그 죽어 있던 지도 에러 오버레이의 것을 그대로 맞췄다.
export default function ListStates({ loading, error, errorCode, onRetry }) {
  if (loading) {
    return (
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
    );
  }

  if (!error) return null;

  // 관광공사(공공데이터포털) 서버가 응답하지 않는 경우와 그 밖의 실패를
  // 나눠 안내한다. 제목에 "관광공사 서버"라고 적어야 우리 서비스가 고장 난
  // 것으로 읽히지 않는다 — 실제로 2026-09-06에 게이트웨이가 몇 시간 동안
  // 응답하지 않는 일이 있었다. "다시 시도" 버튼은 두 경우 모두 그대로 쓴다.
  const timedOut = errorCode === "TIMEOUT";

  return (
    <EmptyState
      icon={
        <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
          <circle cx="13" cy="13" r="9.5" stroke="#C05F33" strokeWidth="1.5" />
          <line x1="13" y1="8" x2="13" y2="14.5" stroke="#C05F33" strokeWidth="1.7" strokeLinecap="round" />
          <line
            x1="13"
            y1="17.4"
            x2="13"
            y2="17.7"
            stroke="#C05F33"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      }
      title={timedOut ? "관광공사 서버가 응답하지 않습니다" : "정보를 불러오지 못했어요"}
      description="잠시 후 다시 시도해 주세요"
      action={
        <button type="button" className={styles.moreBtn} onClick={onRetry}>
          다시 시도
        </button>
      }
    />
  );
}
