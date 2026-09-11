import { useState } from "react";
import DayNav from "../PlanEditor/tabs/ScheduleTab/DayNav.jsx";
import ScheduleMap from "../PlanEditor/tabs/ScheduleTab/ScheduleMap.jsx";
import { findStayMarker } from "../../services/addedItems.js";
import { buildRoutePins } from "../../utils/route.js";
import styles from "./ScheduleMapView.module.css";

// 최종 계획의 "지도 보기". 원본 디자인에는 없는 뷰라 새 값은 만들지 않고
// 체류 계획 탭의 것을 그대로 가져다 쓴다:
//   - 일차/주차 네비게이션 → ScheduleTab/DayNav
//   - 지도(번호 핀·경로선·숙소 아이콘·걷기 코스) → ScheduleTab/ScheduleMap
// 두 컴포넌트를 복사하지 않고 공유하므로 한쪽을 고치면 양쪽이 같이 바뀐다.
//
// 최종 계획은 보기 전용이라 편집 요소(다른 곳 보기·시간 수정·일정 추가)는
// 넘기지 않는다. 지도에서 핀을 누르거나 목록을 누르면 상세 모달만 열린다.
export default function ScheduleMapView({ days, region, onSelectItem }) {
  const [week, setWeek] = useState(0);
  const [day, setDay] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hoverIndex, setHoverIndex] = useState(-1);

  const durDays = days.length;
  // 직접 담은 항목이 있는 날에 점을 찍는다(체류 계획 탭과 같은 표시).
  // 그쪽은 plan에서 뽑지만 여기는 이미 만들어진 일정에서 바로 알 수 있다.
  const daysWithAdds = days
    .filter((d) => d.cells.some((c) => c.items.some((it) => it.mine)))
    .map((d) => d.day);
  const today = days.find((d) => d.day === day) || days[0];
  // 셀(오전·오후·저녁)에 흩어져 있는 항목을 시간순 한 줄로 편다.
  const items = today ? today.cells.flatMap((c) => c.items) : [];

  const pins = buildRoutePins(items).map((p, i) => ({
    ...p,
    hot: hoverIndex === i || selectedIndex === i,
  }));
  const stayMarker = findStayMarker(region.staySegs, day, region.listings);

  return (
    <div className={styles.wrap} data-print-hide>
      <DayNav
        durDays={durDays}
        week={week}
        day={day}
        daysWithAdds={daysWithAdds}
        onPickWeek={(w) => {
          setWeek(w);
          setDay(Math.min(w * 7 + 1, durDays));
          setSelectedIndex(-1);
        }}
        onPickDay={(d) => {
          setDay(d);
          setSelectedIndex(-1);
        }}
      />

      <div className={styles.grid}>
        <ScheduleMap
          routineOn
          items={pins}
          stay={stayMarker}
          center={{ lat: region.lat, lng: region.lng }}
          mapLabel={`${day}일차 일정`}
          // 지도 아래 줄(이동 거리 · 마커 범례)은 그리지 않는다 — 오른쪽
          // 목록이 같은 항목을 번호까지 붙여 이미 보여 준다.
          showMeta={false}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onHover={setHoverIndex}
        />

        <ol className={styles.list}>
          {items.map((it, i) => (
            <li key={`${it.place}-${i}`}>
              <button
                type="button"
                className={`${styles.row} ${selectedIndex === i ? styles.rowOn : ""}`}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(-1)}
                onClick={() => {
                  setSelectedIndex(i);
                  onSelectItem(today, { slot: it.slot, time: it.time }, it);
                }}
              >
                {/* 번호는 지도 핀과 같은 순서다(오전 1 · 오후 2 · 저녁 3). */}
                <span className={styles.num}>{i + 1}</span>
                <span className={styles.body}>
                  <span className={styles.slot}>
                    {it.slot} {it.time}
                  </span>
                  <span className={styles.place}>{it.place}</span>
                  {it.addr && <span className={styles.addr}>{it.addr}</span>}
                </span>
                <span className={`${styles.tag} ${it.mine ? styles.mine : ""}`}>{it.tag}</span>
              </button>
            </li>
          ))}

          {items.length === 0 && <li className={styles.empty}>이 날은 일정이 없어요</li>}
        </ol>
      </div>
    </div>
  );
}
