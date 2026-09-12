import styles from "./DataSourceNote.module.css";

// 데이터 출처 한 줄.
//
// 왜 필요한가: 푸터를 홈에서만 보이게 바꾸면서 데이터 출처 표기가 홈에만
// 남게 됐다. 관광공사 오픈API 이용약관과 공모전 규정이 출처 표기를
// 요구하므로, 관광공사 데이터를 실제로 쓰는 화면에는 최소한의 한 줄을
// 남겨야 한다. 푸터 전체(브랜드·바로가기·약관 링크)는 홈에만 두고,
// 이 한 줄만 데이터 화면에 붙인다.
//
// 어디에 붙는지는 Layout이 경로를 보고 정한다 — 화면마다 직접 붙이면
// 새 화면을 만들 때 또 빠진다.
//
// 인쇄에서 감추지 않는다(data-print-hide 없음). 종이에 나간 자료에도
// 출처가 남아야 한다.
export default function DataSourceNote() {
  return (
    <div className={styles.note}>
      <p className={styles.text}>
        관광 정보·사진 ⓒ한국관광공사 · 걷기 코스 ⓒ한국관광공사 두루누비 · 인구감소지역 지정 현황 행정안전부 ·
        지도 ⓒ카카오
      </p>
    </div>
  );
}
