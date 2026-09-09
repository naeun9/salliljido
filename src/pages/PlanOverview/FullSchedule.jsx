import ScheduleMapView from "./ScheduleMapView.jsx";
import styles from "./FullSchedule.module.css";

const SLOTS = ["오전", "오후", "저녁"];
const EXPAND_LIMIT = 5; // design 3337줄: 5일까지는 접기 버튼 없이 다 보여준다

// design/salliljido.extracted.html 1542-1613줄.
export default function FullSchedule({
  days,
  view,
  onSetView,
  expanded,
  onToggleExpand,
  onSelectItem,
  // 지도 보기에만 필요한 값(지역 중심 좌표·숙박 구간·목록). 카드/표 보기는
  // 쓰지 않는다.
  mapRegion,
}) {
  const table = view === "table";
  const map = view === "map";
  const cards = !table && !map;
  const collapsed = !expanded && days.length > EXPAND_LIMIT;
  const showExpand = days.length > EXPAND_LIMIT && cards;

  // 인쇄(PDF)는 어떤 보기를 켜 뒀든 항상 카드 목록 전체가 나가야 한다.
  // 예전에는 화면에 보이는 것만 그려서, 표/지도 보기 상태로 내보내면
  // 일정이 통째로 빠지고(지도는 인쇄에서 감춰진다) 카드 보기에서도
  // 접혀 있으면 6일차부터 사라졌다. 그래서 날짜 카드는 언제나 전부
  // 그려 두고, 화면에서만 감춘다(.screenOff는 인쇄에서 다시 보인다).

  return (
    <section className={styles.section} data-print-plain data-ov-schedule>
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 className={styles.heading}>전체 일정</h2>
          <div className={styles.tabs} data-print-hide>
            <button
              type="button"
              className={`${styles.tab} ${cards ? styles.tabOn : ""}`}
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
            <button
              type="button"
              className={`${styles.tab} ${map ? styles.tabOn : ""}`}
              onClick={() => onSetView("map")}
            >
              지도 보기
            </button>
          </div>
        </div>

        {/* 지도 보기. 인쇄에서는 빠진다(ScheduleMapView의 data-print-hide) —
            인쇄물은 예전처럼 카드 보기 내용만 나간다. */}
        {map && <ScheduleMapView days={days} region={mapRegion} onSelectItem={onSelectItem} />}

        <div className={`${styles.cards} ${cards ? "" : styles.screenOff}`}>
          {days.map((d, i) => (
            <div
              key={d.day}
              className={`${styles.dayBlock} ${cards && collapsed && i >= EXPAND_LIMIT ? styles.screenOffBlock : ""}`}
              data-ov-day
            >
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
                    {c.items.map((it, n) => (
                      <button
                        key={`${it.place}-${n}`}
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

        {showExpand && (
          <div className={styles.expandRow} data-print-hide>
            <button type="button" className={styles.expandBtn} onClick={onToggleExpand}>
              {expanded ? "접기" : `전체 ${days.length}일 펼쳐보기`}
            </button>
          </div>
        )}

        {table && (
          <div className={styles.tableWrap} data-print-hide>
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
                <div key={d.day} className={styles.tableRow}>
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
