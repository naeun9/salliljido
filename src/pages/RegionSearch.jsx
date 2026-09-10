import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSearch } from "../hooks/useSearch.js";
import { REGIONS } from "../data/regions.js";
import styles from "./RegionSearch.module.css";

// design/salliljido.extracted.html 309-393줄(#find), 3591-3609줄(pickVals),
// 3985-4005줄(regionCards/ctaBg 등 계산식). 값은 원본 그대로.
// 광역 아래 한 줄 설명. 파일럿이 29곳으로 늘어 이름을 다 적을 수 없어
// 대표 세 곳만 쓰고 나머지는 개수로 말한다. 개수는 REGIONS에서 세므로
// 지역을 더해도 문구가 어긋나지 않는다.
const REGION_LEADS = {
  강원: ["평창", "고성", "영월"],
  충남: ["공주", "태안", "부여"],
  경북: ["안동", "문경", "울진"],
};
const countOf = (region) => REGIONS.filter((r) => r.region === region).length;

const REGION_OPTIONS = [
  ...Object.entries(REGION_LEADS).map(([value, leads]) => ({
    value,
    sub: `${leads.join("·")} 등 ${countOf(value)}곳`,
  })),
  { value: "상관없음", sub: `세 지역 ${REGIONS.length}곳에서 모두 찾아드려요` },
];

const DURATION_OPTIONS = ["1주", "2주", "1달", "직접 입력"];

const PLACE_OPTIONS = [
  { value: "자연", icon: NatureIcon },
  { value: "바다", icon: SeaIcon },
  { value: "산", icon: MountainIcon },
  { value: "소도시", icon: TownIcon },
];

function NatureIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.4" stroke={color} strokeWidth="1.4" />
      <circle cx="10" cy="10" r="2.4" fill={color} />
    </svg>
  );
}
function SeaIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <line x1="2" y1="7" x2="18" y2="7" stroke={color} strokeWidth="1.4" />
      <line x1="2" y1="12" x2="18" y2="12" stroke={color} strokeWidth="1.4" />
      <line x1="2" y1="17" x2="18" y2="17" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}
function MountainIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 16 L8 5 L14 16 Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M11 16 L15 9 L18.5 16 Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function TownIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="8" width="6" height="9.5" stroke={color} strokeWidth="1.4" />
      <rect x="11" y="4" width="6.5" height="13.5" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}

export default function RegionSearch() {
  const { region, dur, place, customDays, setRegion, setDur, setPlace, setCustomDays, reset } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const didReset = useRef(false);

  // 이 화면에 들어올 때마다 조건을 새로 고른다. 조건은 localStorage에 남아
  // 있어서 예전에 고른 값이 선택된 채 열렸는데, "지역 찾기"는 처음부터
  // 고르는 자리라 이전 선택이 남아 있으면 방금 고른 것처럼 보인다.
  //
  // 저장된 계획을 여는 경로는 영향받지 않는다 — 그쪽은 /plan/:id 에서
  // search.restore(계획의 condition)으로 되돌리고, 이 화면을 거치지 않는다.
  //
  // 홈 캐러셀에서 지역을 누르고 들어온 경우(location.state.region)만 그
  // 지역을 남긴다. 그러지 않으면 방금 누른 선택이 초기화돼 버린다.
  //
  // useEffect가 아니라 useLayoutEffect다. useEffect는 브라우저가 화면을
  // 한 번 그린 뒤에 돌아서, 예전 선택이 잠깐 켜졌다가 풀리는 게 보였다.
  // useLayoutEffect는 그리기 전에 돌고 그 안에서 일어난 상태 변경도
  // 같은 프레임에 반영되므로, 처음부터 빈 상태로 그려진다.
  useLayoutEffect(() => {
    if (didReset.current) return;
    didReset.current = true;
    reset(location.state?.region);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ready = !!(region && dur && place);
  const showCustomDur = dur === "직접 입력";
  const customDurWarn = (customDays || 0) > 30;
  const customDurHint = customDurWarn
    ? "최대 30일까지 계획할 수 있습니다"
    : "1일부터 30일까지 입력할 수 있습니다";

  function handleCustomDaysChange(e) {
    const v = parseInt(e.target.value, 10);
    setCustomDays(Number.isNaN(v) ? "" : v);
  }

  // design 4007-4012줄: 결과 화면으로 넘어간다. "찾는 중..." 스켈레톤은
  // RegionResult 화면 쪽 관심사라 여기서는 이동만 한다(다음 단계에서 연결).
  function handleSubmit() {
    if (!ready) return;
    navigate("/find/result");
  }

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.inner}>
          <h1 className={styles.title}>어디서 살아볼까요?</h1>

          <div className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepNum}>01</span>
              <h2 className={styles.stepTitle}>어느 지역이 궁금하세요?</h2>
            </div>
            <div className={styles.grid}>
              {REGION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.optionBtn} ${region === opt.value ? styles.selected : ""}`}
                  onClick={() => setRegion(opt.value)}
                >
                  <div className={styles.optionLabel}>{opt.value}</div>
                  <div className={styles.optionSub}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepNum}>02</span>
              <h2 className={styles.stepTitle}>얼마나 머무르실 건가요?</h2>
            </div>
            <div className={styles.grid}>
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`${styles.optionBtn} ${dur === d ? styles.selected : ""}`}
                  onClick={() => setDur(d)}
                >
                  <div className={styles.optionLabel}>{d}</div>
                </button>
              ))}
            </div>
            <div className={`${styles.customDur} ${showCustomDur ? styles.open : ""}`}>
              <div className={styles.customDurInputWrap}>
                <input type="number" value={customDays} min={1} max={30} onChange={handleCustomDaysChange} />
                <span className={styles.customDurUnit}>일</span>
              </div>
              <span
                className={styles.customDurHint}
                style={{ color: customDurWarn ? "var(--rust)" : "var(--gray)" }}
              >
                {customDurHint}
              </span>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepNum}>03</span>
              <h2 className={styles.stepTitle}>어떤 곳에서 지내고 싶으세요?</h2>
            </div>
            <div className={styles.grid}>
              {PLACE_OPTIONS.map(({ value, icon: Icon }) => {
                const selected = place === value;
                const color = selected ? "var(--forest)" : "var(--gray)";
                return (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.optionBtn} ${styles.placeBtn} ${selected ? styles.selected : ""}`}
                    onClick={() => setPlace(value)}
                  >
                    <Icon color={color} />
                    <span className={styles.optionLabel}>{value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.ctaRow}>
            <button
              type="button"
              disabled={!ready}
              className={`${styles.submitBtn} ${ready ? styles.ready : ""}`}
              onClick={handleSubmit}
            >
              지역 추천받기 <span className={styles.submitArrow}>→</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
