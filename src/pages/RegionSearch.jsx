import { useNavigate } from "react-router-dom";
import { useSearch } from "../hooks/useSearch.js";
import styles from "./RegionSearch.module.css";

// design/salliljido.extracted.html 309-393줄(#find), 3591-3609줄(pickVals),
// 3985-4005줄(regionCards/ctaBg 등 계산식). 값은 원본 그대로.
const REGION_OPTIONS = [
  { value: "강원", sub: "속초·삼척·양양·정선" },
  { value: "충남", sub: "서산·태안·보령·홍성" },
  { value: "경북", sub: "안동·영주·봉화·의성" },
  { value: "상관없음", sub: "세 지역에서 모두 찾아드려요" },
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
  const { region, dur, place, customDays, setRegion, setDur, setPlace, setCustomDays } =
    useSearch();
  const navigate = useNavigate();

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
                <input
                  type="number"
                  value={customDays}
                  min={1}
                  max={30}
                  onChange={handleCustomDaysChange}
                />
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
