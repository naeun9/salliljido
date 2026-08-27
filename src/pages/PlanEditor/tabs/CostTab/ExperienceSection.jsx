import { won } from "../../../../utils/cost.js";
import styles from "../CostTab.module.css";
import expStyles from "./ExperienceSection.module.css";

// design/salliljido.extracted.html 1344-1365줄. 둘러보기 탭에서 담은
// 체험(PlanContext.addedExperiences)과 연동된다.
//
// design은 체험마다 공시 참가비가 있다고 보고 금액을 그냥 찍어줬지만,
// 관광공사 API에는 참가비가 없다(docs/03-api-check.md §14). 그래서 금액
// 자리를 입력칸으로 바꿨다 — 담을 때 넣지 않았거나 나중에 알게 된 금액을
// 여기서 고칠 수 있다. 소요 시간(design의 duration)도 API에 없어서 뺐고,
// 대신 그 자리에 유형 배지를 둔다.
export default function ExperienceSection({ rows, expTotal, onRemove, onSetPrice, onGoExplore }) {
  return (
    <>
      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle}>체험 프로그램비</h3>
        <span className={styles.cardAmount}>{won(expTotal)}</span>
      </div>

      <div className={`${expStyles.list} ${rows.length ? expStyles.visible : ""}`}>
        {rows.map((x) => (
          <div key={x.id} className={expStyles.row}>
            <span className={expStyles.name}>{x.name}</span>
            <span className={expStyles.duration}>{x.type}</span>
            <span className={expStyles.costInputWrap}>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                className={expStyles.costInput}
                value={x.price === undefined ? "" : x.price}
                placeholder="0"
                aria-label={`${x.name} 참가비`}
                onChange={(e) => {
                  const v = e.target.value;
                  onSetPrice(x.id, v === "" ? undefined : Math.max(0, parseInt(v, 10) || 0));
                }}
              />
              <span className={expStyles.costUnit}>원</span>
            </span>
            <button type="button" className={expStyles.removeBtn} aria-label="제외" onClick={() => onRemove(x.id)}>
              <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                <line x1="3" y1="3" x2="12" y2="12" stroke="#6E6E68" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="12" y1="3" x2="3" y2="12" stroke="#6E6E68" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className={`${expStyles.empty} ${rows.length ? "" : expStyles.visible}`}>
        <div className={expStyles.emptyTitle}>체험 프로그램을 추가하면 여기에 반영됩니다</div>
        <button type="button" className={expStyles.emptyLink} onClick={onGoExplore}>
          둘러보기로 가기
        </button>
      </div>
    </>
  );
}
