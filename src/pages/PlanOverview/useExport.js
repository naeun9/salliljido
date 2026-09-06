import { useState } from "react";
import { useToast } from "../../hooks/useToast.js";
import { exportPlanXlsx, printPlan } from "../../services/planExport.js";

// 최종 계획 내보내기 메뉴의 상태와 동작. PlanOverview.jsx가 300줄을 넘어
// 떼어냈다(CLAUDE.md 코드 원칙).
export function usePlanExport(getPlanData) {
  const [exportOpen, setExportOpen] = useState(false);
  const { showToast } = useToast();

  // 인쇄와 엑셀 모두 메뉴를 먼저 닫는다 — 열린 메뉴가 종이에 찍히거나
  // 파일을 받은 뒤에도 남아 있으면 지저분하다.
  function handlePrint() {
    setExportOpen(false);
    printPlan();
  }

  function handleExportXlsx() {
    setExportOpen(false);
    try {
      const name = exportPlanXlsx(getPlanData());
      showToast(`${name} 파일을 내려받았어요`);
    } catch (err) {
      // 파일 저장은 브라우저 설정(다운로드 차단 등)에 막힐 수 있다.
      showToast("내보내기에 실패했어요", { kind: "fail" });
      console.error("[내보내기]", err);
    }
  }

  return {
    exportOpen,
    toggleExport: () => setExportOpen((v) => !v),
    handlePrint,
    handleExportXlsx,
  };
}
