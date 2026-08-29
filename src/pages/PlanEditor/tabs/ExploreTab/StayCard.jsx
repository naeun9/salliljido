import { useState } from "react";
import CardThumb from "./CardThumb.jsx";
import { visitKoreaSearchUrl } from "../../../../utils/externalLinks.js";
import styles from "./StayCard.module.css";

// design/salliljido.extracted.html 1052-1067줄.
//
// design에는 숙박에 담기 기능이 없었다(체험만 있었다). 네 카테고리 모두
// 계획에 담을 수 있게 열면서 숙박에도 붙였는데, 숙박은 "며칠부터 며칠까지
// 묵을지"가 함께 정해져야 해서 체험의 "몇 일차" 선택과 다른 입력이 필요하다.
// 고른 구간은 예상 비용 탭의 숙박 구간(staySegs)으로 그대로 들어간다.
export default function StayCard({
  stay,
  hovered,
  onMouseEnter,
  onMouseLeave,
  added,
  currentRange,
  durDays,
  pickerOpen,
  onTogglePicker,
  onConfirm,
  onRemove,
  readOnly = false,
}) {
  const [draft, setDraft] = useState(null);
  const range = draft || currentRange || { from: 1, to: Math.min(3, durDays) };
  const from = Math.min(Math.max(1, range.from), durDays);
  const to = Math.min(Math.max(from, range.to), durDays);
  const nights = to - from + 1;

  function setFrom(v) {
    const f = Math.min(Math.max(1, v), durDays);
    setDraft({ from: f, to: Math.max(f, to) });
  }
  function setTo(v) {
    const t = Math.min(Math.max(from, v), durDays);
    setDraft({ from, to: t });
  }
  function handleToggle() {
    setDraft(null);
    onTogglePicker();
  }

  return (
    <div
      className={`${styles.card} ${hovered ? styles.hovered : ""}`}
      data-listing-id={stay.id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardThumb item={stay} imageClass={styles.image} tagClass={styles.imageTag} />
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>{stay.name}</h3>
          <span className={styles.badge}>{stay.type}</span>
        </div>
        <div className={styles.location}>{stay.location}</div>

        {/* 담기 버튼과 예약 링크는 한 줄에 둔다. 담은 뒤 버튼 문구가
            길어져 줄이 바뀌어도 왼쪽 끝이 어긋나지 않는다.
            계획 없이 둘러보는 화면에서는 담기·구간 선택을 감춘다(readOnly).
            예약 사이트 링크는 그대로 둔다 — 보기 전용에서도 쓸모가 있다. */}
        <div className={styles.actions}>
          {!readOnly && (
            <button
              type="button"
              className={`${styles.toggleBtn} ${added ? styles.added : ""}`}
              onClick={handleToggle}
            >
              {added && (
                <svg width="16" height="16" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M2 7l3 3 6-6.5"
                    stroke="#2F5D50"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {added ? `추가됨 · ${currentRange.from}~${currentRange.to}일차` : "계획에 추가"}
            </button>
          )}
          {/* design은 모든 숙소가 visitkorea 메인으로 가는 링크였다(어느
              숙소를 눌러도 같은 곳). contentId로 그 숙소의 구석구석 검색
              결과로 보낸다. 문구도 실제 목적지에 맞게 고쳤다 — 관광공사
              소개 페이지지 예약 사이트가 아니다(utils/externalLinks.js). */}
          <a href={visitKoreaSearchUrl(stay.name)} target="_blank" rel="noopener" className={styles.link}>
            구석구석에서 보기
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
              <path d="M4.6 2h6.4v6.4" stroke="#2F5D50" strokeWidth="1.4" strokeLinecap="round" />
              <line
                x1="11"
                y1="2"
                x2="3.4"
                y2="9.6"
                stroke="#2F5D50"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path d="M8.2 11H2V4.8" stroke="#2F5D50" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </a>
        </div>

        {!readOnly && (
          <div className={`${styles.picker} ${pickerOpen ? styles.open : ""}`}>
            <span className={styles.pickerLabel}>며칠부터 며칠까지 묵으실 건가요?</span>
            <div className={styles.rangeRow}>
              <label className={styles.rangeField}>
                <span className={styles.rangeLabel}>시작</span>
                <select
                  className={styles.rangeSelect}
                  value={from}
                  onChange={(e) => setFrom(Number(e.target.value))}
                >
                  {Array.from({ length: durDays }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}일차
                    </option>
                  ))}
                </select>
              </label>
              <span className={styles.rangeDash}>~</span>
              <label className={styles.rangeField}>
                <span className={styles.rangeLabel}>종료</span>
                <select
                  className={styles.rangeSelect}
                  value={to}
                  onChange={(e) => setTo(Number(e.target.value))}
                >
                  {Array.from({ length: durDays }, (_, i) => (
                    <option key={i + 1} value={i + 1} disabled={i + 1 < from}>
                      {i + 1}일차
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className={styles.rangeHint}>{nights}박 예정 · 예상 비용의 숙박 구간에 함께 반영됩니다</p>
            <div className={styles.pickerActions}>
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={() => {
                  onConfirm(from, to);
                  setDraft(null);
                }}
              >
                {added ? "구간 저장" : "계획에 추가"}
              </button>
              {added && (
                <button type="button" className={styles.removeBtn} onClick={onRemove}>
                  빼기
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
