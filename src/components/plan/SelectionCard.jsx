import styles from "./SelectionCard.module.css";

// design/salliljido.extracted.html 1684-1694줄. 일정 항목을 누르면 우하단에
// 떠오르는 상세 카드(ovSel).
//
// 원래 최종 계획 화면 전용이었는데 체류 계획 탭도 같은 것을 쓰게 되면서
// 공용 자리로 옮겼다. 체류 계획 탭에서는 지도 핀 위에 정보 카드를 띄우던
// 원본 방식(주소가 넘치고 같은 내용이 두 번 보였다)을 이 카드로 대체한다.
// 아래 버튼 문구·동작만 화면마다 달라 props로 받는다.
export default function SelectionCard({ selection, actionLabel = "루틴 편집으로", onEdit, onClose }) {
  if (!selection) return null;

  const { day, slot, time, place, tag, desc, addr } = selection;

  return (
    <div className={styles.card} data-print-hide>
      <div className={styles.meta}>
        {day}일차 · {slot} {time || ""}
      </div>
      <div className={styles.place}>{place}</div>
      <span className={styles.tag}>{tag}</span>
      {/* 관광공사 목록 API에는 소개 문구(overview)가 없어서 설명 자리에
          주소를 넣어 두는데(docs/03-api-check.md §14), 그러면 주소가 두 번
          나온다. 설명이 주소와 같으면 아래 주소 줄 하나만 남긴다. */}
      {desc && desc !== addr && <p className={styles.desc}>{desc}</p>}
      <div className={styles.addr}>{addr}</div>
      <div className={styles.actions}>
        {onEdit && (
          <button type="button" className={styles.editBtn} onClick={onEdit}>
            {actionLabel}
          </button>
        )}
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
