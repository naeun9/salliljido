// 강원 지자체 체류지원 프로그램. 필드 뜻과 넣는 기준은 ../supportPrograms.js 머리말 참고.
import { PROGRAM_TYPE } from "./types.js";

export const GANGWON_PROGRAMS = [
  {
    id: "yeongwol-live-2026",
    type: PROGRAM_TYPE.RURAL_LIFE,
    name: "2026년 강원에서 살아보기 (귀촌형)",
    city: "강원 영월군",
    benefits: [
      "예밀포도마을 주거 공간 1개월 무료 제공",
      "마을 프로그램 참여 시 연수비 월 10만 원",
      "영농 실습·지역민 교류 활동 지원",
      "수당 지급형 농작업 일자리 연계 가능",
    ],
    // 3기 신청 기간. 1기(5.20~7.1)·2기(7.10~8.3)는 이미 끝났고, 지금
    // 열려 있는 회차만 싣는다 — 끝난 회차까지 늘어놓으면 어느 걸 신청해야
    // 하는지 알 수 없다.
    start: "2026-08-10",
    end: "2026-09-14",
    target: "영월군 이주를 희망하는 타 지역 거주 도시민 (만 18세 이상)",
    quota: "5가구",
    stayWeeks: "1개월 (3기 9.28~10.27)",
    contact: "033-370-7883",
    url: "https://www.yw.go.kr/agri/selectBbsNttView.do?key=700&bbsNo=68&nttNo=154160",
    posted: "2026-05-27",
    checkedAt: "2026-09-12",
  },
];
