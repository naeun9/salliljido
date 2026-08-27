import styles from "./FullSchedule.module.css";

const SLOTS = ["오전", "오후", "저녁"];
const EXPAND_LIMIT = 5; // design 3337줄: 5일까지는 접기 버튼 없이 다 보여준다

// design/salliljido.extracted.html 1542-1613줄.
export default function FullSchedule({ days, view, onSetView, expanded, onToggleExpand, onSelectItem }) {
  const table = view === "table";
  const shown = expanded || days.length <= EXPAND_LIMIT ? days : days.slice(0, EXPAND_LIMIT);
  const showExpand = days.length > EXPAND_LIMIT && !table;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 className={styles.heading}>전체 일정</h2>
          <div className={styles.tabs} data-print-hide>
            <button
              type="button"
              className={`${styles.tab} ${table ? "" : styles.tabOn}`}
              onClick={() => onSetView("card")}
            >
              카드 보기
            </button>
            <button
              type="button"
              className={`${styles.tab} ${table ? styles.tabOn : ""}`}
              onClick={() => onSetView("table")}
            >
              표 보기
            </button>
          </div>
        </div>

        {!table && (
          <div className={styles.cards}>
            {shown.map((d) => (
              <div key={d.day} className={styles.dayBlock} data-ov-block>
                <div className={styles.dayHead}>
                  <span className={styles.dayLabel}>{d.label}</span>
                  <span className={styles.dayTheme}>{d.theme}</span>
                  <span className={styles.dayWeek}>{d.weekday}</span>
                </div>
                <div className={styles.cells}>
                  {d.cells.map((c) => (
                    <div key={c.slot} className={styles.cell}>
                      <div className={styles.cellHead}>
                        <span className={styles.cellSlot}>{c.slot}</span>
                        <span className={styles.cellTime}>{c.time}</span>
                      </div>
                      {c.items.map((it, i) => (
                        <button
                          key={`${it.place}-${i}`}
                          type="button"
                          className={styles.itemBtn}
                          onClick={() => onSelectItem(d, c, it)}
                        >
                          <div className={`${styles.itemName} ${it.mine ? styles.mine : ""}`}>{it.place}</div>
                          <span className={`${styles.itemTag} ${it.mine ? styles.mine : ""}`}>{it.tag}</span>
                        </button>
                      ))}
                      {c.items.length === 0 && <div className={styles.empty}>비어 있는 시간</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {showExpand && (
          <div className={styles.expandRow} data-print-hide>
            <button type="button" className={styles.expandBtn} onClick={onToggleExpand}>
              {expanded ? "접기" : `전체 ${days.length}일 펼쳐보기`}
            </button>
          </div>
        )}

        {table && (
          <div className={styles.tableWrap}>
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <div className={styles.th}>일차</div>
                {SLOTS.map((s) => (
                  <div key={s} className={styles.th}>
                    {s}
                  </div>
                ))}
              </div>
              {days.map((d) => (
                <div key={d.day} className={styles.tableRow} data-ov-block>
                  <div className={styles.rowHead}>
                    <div className={styles.rowLabel}>{d.label}</div>
                    <div className={styles.rowTheme}>{d.theme}</div>
                  </div>
                  {d.cells.map((c) => (
                    <div key={c.slot} className={styles.td}>
                      {c.items.map((it, i) => (
                        <button
                          key={`${it.place}-${i}`}
                          type="button"
                          className={`${styles.cellBtn} ${it.mine ? styles.mine : ""}`}
                          onClick={() => onSelectItem(d, c, it)}
                        >
                          {it.place}
                        </button>
                      ))}
                      {c.items.length === 0 && <div className={styles.tdEmpty}>—</div>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
