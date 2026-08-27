import { FOOD_RATE_BY_STYLE, wonInMan } from "../../../../utils/cost.js";
import styles from "./BasisPanel.module.css";

// design/salliljido.extracted.html 1394-1409줄, 2500-2506줄(cbBasisRows).
// 식비 문구의 금액은 utils/cost.js의 FOOD_RATE_BY_STYLE에서 그대로 만들어
// 쓴다 — design은 사람이 쓴 문자열이었는데, 그러면 단가 상수를 조정했을 때
// 안내 문구만 옛 금액을 말하게 된다.
export default function BasisPanel({ open, onToggle, split, foodManual }) {
  const rows = [
    {
      label: "숙박비",
      text: split
        ? "구간별로 입력한 1박 금액과 기간을 각각 곱해 합산합니다."
        : "직접 입력한 1박 금액에 체류 일수를 곱해 계산합니다.",
    },
    {
      label: "식비",
      text: foodManual
        ? "직접 입력한 1일 금액을 체류 일수에 곱해 계산합니다."
        : `외식 중심 ${wonInMan(FOOD_RATE_BY_STYLE["외식 중심"])} · 반반 ${wonInMan(FOOD_RATE_BY_STYLE["반반"])} · 자취 중심 ${wonInMan(FOOD_RATE_BY_STYLE["자취 중심"])}을 1일 기준으로 봅니다. 공개 자료를 바탕으로 한 추정치입니다.`,
    },
    { label: "교통비", text: "집에서 오가는 왕복 교통비를 직접 입력받습니다." },
    // design은 "공시 참가비를 합산"이라고 썼지만 관광공사 API에 참가비가
    // 없어서(docs/03-api-check.md §14) 사용자가 넣은 금액을 쓴다. 문구도
    // 실제 동작에 맞게 고쳤다.
    { label: "체험비", text: "둘러보기 탭에서 담은 프로그램에 직접 입력한 참가비를 합산합니다. 입력하지 않은 프로그램은 0원으로 봅니다." },
    { label: "기타", text: "직접 입력한 금액을 그대로 더합니다." },
  ];

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.toggleBtn} onClick={onToggle}>
        비용 산정 기준
        <span className={styles.toggleLabel}>{open ? "접기" : "펼치기"}</span>
      </button>
      <div className={`${styles.body} ${open ? styles.open : ""}`}>
        <div className={styles.divider} />
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <span className={styles.label}>{row.label}</span>
            <span className={styles.text}>{row.text}</span>
          </div>
        ))}
        <p className={styles.source}>출처 ⓒ한국관광공사 · 인구감소지역 지정 현황 · 행정안전부</p>
      </div>
    </div>
  );
}
