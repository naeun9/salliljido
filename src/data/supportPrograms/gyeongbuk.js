// 경북 지자체 체류지원 프로그램. 필드 뜻과 넣는 기준은 ../supportPrograms.js 머리말 참고.
import { PROGRAM_TYPE } from "./types.js";

export const GYEONGBUK_PROGRAMS = [
  {
    id: "yeongdeok-heal-stay-2026-4",
    type: PROGRAM_TYPE.STAY_TRIP,
    name: "영덕 치유 이음스테이션 (영덕 일주일 살기) 4회차",
    city: "경북 영덕군",
    benefits: [
      "숙박비 1일 6만 원, 최대 36만 원 지원",
      "체험비 4박 6만 원 / 6박 10만 원 지원",
      "참가비 5만 원은 영덕사랑상품권으로 전액 환급",
      "웨이마크 프리미엄 커리어 진단 지원",
    ],
    // 공고에 "~ 2026. 9. 13.(일) 23:59까지"만 적혀 있고 접수 시작일
    // 표기가 없다. 비워 두면 카드 신청 기간이 "~ 9.13"으로 나온다.
    // (기사에는 "4·5회차 9월 14일부터 모집"으로 나오는데 공고와 맞지
    //  않아 공고 쪽을 따랐다. 5회차 공고는 아직 올라오지 않았다.)
    start: "",
    end: "2026-09-13",
    target: "영덕군 외 타 지역 거주 만 20세 이상 청년·직장인 (SNS 홍보 가능자)",
    quota: "최대 20명",
    stayWeeks: "4박 또는 6박 (여행 10.1~10.7)",
    contact: "054-730-5883",
    url: "https://ydstay.kr/trip-info/tourProgram/detail?id=101",
    posted: "",
    checkedAt: "2026-09-12",
  },
  {
    id: "yeongdeok-heal-stay-2026",
    type: PROGRAM_TYPE.STAY_TRIP,
    name: "영덕 치유 이음스테이션 (영덕 일주일 살기) 2·3회차",
    city: "경북 영덕군",
    benefits: [
      "숙박비 1일 4만 원, 6박 기준 최대 24만 원 지원",
      "체험비 6박 기준 최대 10만 원 지원",
      "선상낚시 체험·로컬 네트워킹 프로그램 제공",
      "참가비 5만 원은 영덕사랑상품권으로 전액 환급",
    ],
    // 기본 모집은 7.27~8.13이고, 3회차 추가모집이 8.27까지였다. 마지막으로
    // 접수를 받은 날을 end로 둔다.
    start: "2026-07-27",
    end: "2026-08-27",
    target: "영덕군 외 타 지역 거주 만 20세 이상 청년·직장인 (SNS 홍보 가능자)",
    quota: "회차당 최대 20명",
    stayWeeks: "4박 또는 6박 7일",
    contact: "054-730-5883",
    url: "https://ydstay.kr/trip-info/tourProgram/detail?id=95",
    posted: "2026-07-27",
    checkedAt: "2026-09-12",
  },
  {
    id: "bonghwa-live-2026",
    type: PROGRAM_TYPE.RURAL_LIFE,
    name: "2026년 봉화愛살래 (체류형 귀농인의 집)",
    city: "경북 봉화군",
    benefits: ["소천면 모듈러주택 제공", "귀농·귀촌 교육 프로그램 제공 (월 10일 이상 참석 필수)"],
    start: "2026-01-20",
    end: "2026-03-13",
    target: "귀농·귀촌에 관심 있는 만 18~65세 도시민",
    quota: "8가구 (16명)",
    // 우리 서비스가 다루는 며칠~한 달보다 훨씬 길다. 그래도 지자체가 내건
    // 체류지원이라 빼지 않고, 유형 배지와 이 칸으로 성격을 드러낸다.
    stayWeeks: "8개월",
    contact: "054-679-6857",
    url: "https://www.bonghwa.go.kr/gobonghwa/bbs/board.php?bo_table=gotic&wr_id=568",
    posted: "2026-01-26",
    checkedAt: "2026-09-12",
  },
];
