import { buildXlsx, downloadBlob, safeFileName } from "../utils/xlsx.js";

// 최종 계획 내보내기. design 2046줄(exportXlsx)·3388줄(ovPrint)은 문구만
// 있고 동작이 없어서, 화면이 이미 들고 있는 값(days/bars)을 그대로 표로 옮긴다.

// 시트 1 "일정": 일차 / 테마 / 시간대 / 장소명 / 카테고리 / 주소
function scheduleRows(days) {
  const rows = [["일차", "테마", "시간대", "장소명", "카테고리", "주소"]];
  days.forEach((d) => {
    d.cells.forEach((cell) => {
      cell.items.forEach((item) => {
        rows.push([
          d.label,
          d.theme || "",
          // 시간이 정해진 항목은 "오전 09:30"처럼, 없으면 시간대만.
          item.time ? `${cell.slot} ${item.time}` : cell.slot,
          item.place || "",
          item.tag || "",
          item.addr || "",
        ]);
      });
    });
  });
  return rows;
}

// 시트 2 "예상 비용": 항목 / 금액 / 근거 + 합계 행
function costRows(bars, total) {
  const rows = [["항목", "금액", "근거"]];
  bars.forEach((bar) => {
    rows.push([bar.label, Number(bar.value) || 0, bar.basis || ""]);
  });
  rows.push(["합계", Number(total) || 0, ""]);
  return rows;
}

// 파일명: 계획이름_지역명.xlsx
export function exportPlanXlsx({ title, regionName, days, bars, total }) {
  const blob = buildXlsx([
    { name: "일정", rows: scheduleRows(days) },
    { name: "예상 비용", rows: costRows(bars, total) },
  ]);
  const name = `${safeFileName(title) || "계획"}_${safeFileName(regionName)}.xlsx`;
  downloadBlob(blob, name);
  return name;
}

// design 3388줄: 메뉴를 먼저 닫고 인쇄 대화상자를 띄운다. 메뉴가 열린 채로
// 인쇄하면 그 메뉴가 종이에 같이 찍힌다(data-print-hide로 감추지만,
// 브라우저가 인쇄 미리보기를 만드는 시점이 더 빨라서 60ms를 둔다).
export function printPlan() {
  setTimeout(() => window.print(), 60);
}
