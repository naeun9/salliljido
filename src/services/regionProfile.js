// 지역 소개 문구와 추천 결과 게이지가 함께 쓰는 판정 규칙.
//
// 예전에는 두 화면이 각자 지역명 해시로 점수를 만들었다(design 2966·3646줄).
// 계산식이 서로 달라 같은 지역인데 화면마다 다른 말을 했고, 무엇보다 값이
// 실제와 무관했다 — 카페가 1곳인 화천·봉화·의성에 "코워킹 공간이 있어요"가
// 붙고, 카페가 15곳인 양양에는 "몇 곳 있어요"가 붙어 그 지역 tags의
// "카페 밀집"과 정면으로 어긋났다.
//
// 지금은 data/regions.js의 counts(그 지역 관광공사 목록 실측값) 하나만 보고
// 두 화면이 같은 함수를 부른다. 화면이 어긋날 수가 없다.
//
// 판정에 쓰지 않는 것: 마트·병원·코워킹 공간은 관광공사 목록에 없는 정보라
// 있다/없다를 말하지 않는다. 방문객 수도 없어서 "한적함"은 관광 콘텐츠가
// 얼마나 적은지로 대신 본다(아래 quietLevel 주석 참고).

// 구간 경계. 여기만 고치면 두 화면이 같이 움직인다.
const CAFE_MANY = 10; // 카페가 여러 곳
const CAFE_SOME = 3; // 카페가 몇 곳
const FOOD_MANY = 40; // 식당이 넉넉
const FOOD_SOME = 20; // 식당이 고루 있음
const FOOD_FEW = 10; // 식당이 많지 않음
const QUIET_VERY = 100; // 목록 전체가 100건 미만이면 매우 한적
const QUIET_MID = 200;

const counts = (region) => region?.counts || { total: 0, stay: 0, food: 0, cafe: 0 };

// 카페(FD05) 건수. 0건인 지역은 지금 없지만 새 지역이 들어올 수 있어 남겨 둔다.
export function cafeLevel(region) {
  const { cafe } = counts(region);
  if (cafe >= CAFE_MANY) return 3;
  if (cafe >= CAFE_SOME) return 2;
  if (cafe >= 1) return 1;
  return 0;
}

// 식사류(FD에서 카페 FD05를 뺀 수). 카페를 빼는 이유: 워케이션 지표가
// 카페를 따로 세기 때문에, 합쳐서 세면 카페가 3곳뿐인 철원·영주에도
// "식당과 카페가 넉넉해"가 붙어 카페를 과장하게 된다. 두 줄이 서로 다른
// 것을 말하도록 겹치지 않게 나눴다.
// 마트·병원은 이 목록에 없으므로 말하지 않는다.
export function foodLevel(region) {
  const { food } = counts(region);
  if (food >= FOOD_MANY) return 3;
  if (food >= FOOD_SOME) return 2;
  if (food >= FOOD_FEW) return 1;
  return 0;
}

// "한적함"은 방문객 수 데이터가 없다. 대신 그 지역 관광 목록이 얼마나
// 얇은지로 본다 — 사람을 끌어모으는 곳 자체가 적다는 뜻이라 완전한 대체는
// 아니지만, 지역명 해시보다는 실제에 가깝다. 방문자수 API가 생기면 이
// 함수만 바꾸면 된다.
export function quietLevel(region) {
  const { total } = counts(region);
  if (total < QUIET_VERY) return 3;
  if (total < QUIET_MID) return 2;
  return 1;
}

// 숙소 선택지. 계획 화면에서 숙소를 고르게 되므로 미리 알려 준다.
export function stayLevel(region) {
  const { stay } = counts(region);
  if (stay >= 50) return 3;
  if (stay >= 20) return 2;
  if (stay >= 10) return 1;
  return 0;
}

// ── 지역 소개 "특징" 카드에 들어가는 한 줄 ──

export function cafeNote(region) {
  return [
    "관광 정보에 오른 카페가 없어요. 숙소에서 일할 준비를 해 두세요",
    "카페가 한두 곳뿐이라 숙소에서 일할 준비를 해 두는 게 좋아요",
    "일할 만한 카페가 몇 곳 있어요",
    "카페가 여러 곳이라 자리를 옮겨 가며 일하기 좋아요",
  ][cafeLevel(region)];
}

export function foodNote(region) {
  return [
    "식당 선택지가 적어 장을 봐 두는 편이 편해요",
    "식당이 많지는 않아 문 여는 시간을 확인해 두면 좋아요",
    "식당이 고루 있어 며칠 지내기에 무리가 없어요",
    "식당이 넉넉해 끼니 해결이 어렵지 않아요",
  ][foodLevel(region)];
}

// ── 추천 결과 카드의 3점 게이지 ──
// 라벨은 design 그대로 두고 값만 실측 기준으로 바꿨다. "코워킹 있음"은
// 관광공사 목록에 없는 정보라 카페 개수를 말하는 문구로 바꿨다.
const QUIET_TEXT = ["", "보통", "한적함", "매우 한적함"];
const FOOD_TEXT = ["제한적", "제한적", "기본은 갖춤", "여유 있음"];
const CAFE_TEXT = ["카페 없음", "카페 한두 곳", "카페 몇 곳", "카페 여럿"];

// 게이지는 3점 만점이라 0단계(카페·식당이 아예 없는 지역)도 1칸으로 보여 준다.
const gauge = (level) => Math.max(1, level);

export function regionMetrics(region) {
  const quiet = quietLevel(region);
  const food = foodLevel(region);
  const cafe = cafeLevel(region);
  return {
    metrics: [
      { label: "한적함", level: quiet },
      { label: "생활 편의", level: gauge(food) },
      { label: "워케이션", level: gauge(cafe) },
    ],
    quietText: QUIET_TEXT[quiet],
    convText: FOOD_TEXT[food],
    wcText: CAFE_TEXT[cafe],
  };
}

// ── 지역 소개 ABOUT 문단 ──
// 지역마다 다른 문단이 나오도록 네 갈래(성격·한적함·먹을 곳·숙소)를 각각
// 실측값으로 고른 뒤 이어 붙인다. 예전에는 지역명과 places만 갈아끼운
// 같은 문장이 29곳에 그대로 나갔고, 갈리게 해 둔 분기마저 29곳 모두 같은
// 쪽으로 떨어져 한 번도 갈리지 않았다.

// 관광지 네 갈래(자연 NA·역사 HS·문화 VE·레저 LS) 중 그 지역에서 뚜렷하게
// 많은 쪽. data/regions.js의 theme에 미리 적어 둔 값이고, 1위와 2위가
// 한두 건 차이면 "혼합"으로 적혀 있다.
//
// 문구는 각 갈래에 실제로 뭐가 들어 있는지 보고 썼다. 처음에는 역사를
// "서원과 옛 마을", 문화를 "박물관과 전시관"이라고 썼는데 열어 보니
// 역사는 절·사당·안보유적이 주력이고(태백은 절이 10곳) 문화는 공원·
// 전망대·리조트가 주력이라(홍천은 주제공원 5곳) 둘 다 실제와 달랐다.
const THEME_LINE = {
  자연: "산과 물가, 숲처럼 바깥에서 시간을 보낼 곳이 가장 많습니다.",
  역사: "옛 절과 유적이 많아 걸으며 보는 시간이 깁니다.",
  문화: "공원과 전망대, 박물관처럼 사람 손이 닿은 볼거리가 많습니다.",
  레저: "레포츠 시설이 많아 몸을 쓰는 하루가 어울립니다.",
  혼합: "자연과 유적, 공원이 어느 한쪽으로 치우치지 않고 섞여 있습니다.",
};

const QUIET_LINE = [
  "",
  "볼거리가 많은 편이라 주말과 성수기에는 사람이 늘어납니다.",
  "이름난 곳이 몇 있지만 대체로 붐비지 않습니다.",
  "관광지로 알려진 곳이 많지 않아 하루가 조용하게 흐릅니다.",
];

const STAY_LINE = [
  "숙소가 손에 꼽아 일정을 정하면 바로 잡는 편이 좋습니다.",
  "숙소가 많지 않아 일정이 정해지면 일찍 잡는 편이 좋습니다.",
  "숙소는 몇 갈래로 고를 수 있습니다.",
  "숙소는 선택지가 넓습니다.",
];

// 먹을 곳은 식당 수와 카페 수를 같이 본다 — 둘이 같이 움직이지 않는 지역이
// 있어서다(영주는 식당 41곳에 카페 3곳, 청도는 식당 13곳에 카페 18곳).
function foodLine(region) {
  const food = foodLevel(region);
  const cafe = cafeLevel(region);
  if (food <= 0) {
    return cafe >= 2
      ? "식당은 손에 꼽지만 카페는 그보다 여유가 있습니다."
      : "식당 선택지가 적어 장을 봐서 해결하는 날이 생깁니다.";
  }
  if (food === 1) {
    return cafe >= 3
      ? "식당은 많지 않은 대신 카페가 여럿이라 낮 시간은 밖에서 보내게 됩니다."
      : "식당이 많지 않아 문 여는 시간과 쉬는 날을 미리 보아 두는 편이 좋습니다.";
  }
  if (food === 2) {
    return cafe >= 2
      ? "식당이 고루 있고 카페도 몇 곳 있어 며칠 지내기에 무리가 없습니다."
      : "식당은 고루 있지만 카페는 한두 곳뿐입니다.";
  }
  return cafe >= 3
    ? "식당과 카페가 모두 넉넉해 끼니와 커피를 걱정할 일은 거의 없습니다."
    : "식당은 넉넉한 편이지만 카페는 몇 곳으로 갈립니다.";
}

export function regionAbout(region, { hasJong }) {
  const place = (region.places || ["자연"])[0];
  const short = region.short;
  const opening =
    short +
    (hasJong(short) ? "은 " : "는 ") +
    place +
    (hasJong(place) ? "을" : "를") +
    " 곁에 둔 인구감소지역입니다.";
  return [
    opening,
    THEME_LINE[region.theme] || THEME_LINE.자연,
    QUIET_LINE[quietLevel(region)],
    foodLine(region),
    STAY_LINE[stayLevel(region)],
  ].join(" ");
}
