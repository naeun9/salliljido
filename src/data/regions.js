// 파일럿 지역 단일 소스.
//
// 15곳 모두 행정안전부가 지정한 인구감소지역이다(「지방자치분권 및 지역균형
// 발전에 관한 특별법」 제2조, 2021년 10월 최초 지정, 5년 단위). 2026-09-09에
// 전수 확인해 속초·인제(관심지역)와 홍성(미지정)을 빼고 같은 광역의
// 인구감소지역인 평창·고성·공주로 바꿨다 — 화면 곳곳의 "인구감소지역" 배지가
// 조건 없이 붙기 때문에(components/region/RegionCard.jsx 등) 목록에 관심지역이
// 섞여 있으면 그 배지가 틀린 말이 된다. 지역을 더할 때도 같은 기준을 지킬 것.
//
// 예전에는 이 목록이 두 곳에 나뉘어 있었다 — services/regionRecommend.js의
// REGION_POOL(추천용 정보)과 data/regionCodes.js의 REGION_LDONG_CODES
// (관광공사 조회용 법정동 코드). 같은 15개 지역을 각자 들고 있어서 한쪽에만
// 지역을 추가하면 추천에는 뜨는데 둘러보기가 "법정동 코드가 없습니다"로
// 죽었다. 그래서 한 곳으로 합쳤다 — 지역을 추가·수정할 때는 이 파일만 고치면 된다.
//
// 필드 구분:
//   - 식별/조회용(계속 유지): region, name, short, regnCd, signguCd
//     regnCd/signguCd는 관광공사 TourAPI의 법정동 코드다. 예전 areaCode
//     방식은 폐기됐고(docs/03-api-check.md §2) ldongCode2로 직접 조회해
//     확인한 값이다. 행정구역 코드라 거의 바뀌지 않는 정적 참조표이며,
//     관광 콘텐츠가 아니므로 "실시간 호출" 규칙과 무관하다.
//   - 추천 목업용(실제 API로 교체되면 사라질 값): places, reason, tags,
//     lat, lng, imageNote — services/regionRecommend.js 상단 주석 참고.
//     lat/lng는 그 지역 관광 목록(areaBasedList2) 좌표의 중앙값을 한 번
//     계산해 적어 둔 값이다. 지도의 시작 중심점을 잡는 데만 쓰는 좌표
//     한 쌍이고 관광 콘텐츠가 아니므로 "실시간 호출" 규칙과 무관하다
//     (regnCd/signguCd와 같은 성격의 정적 참조값). 평균이 아니라
//     중앙값인 이유는 태안처럼 섬이 멀리 있으면 평균이 바다로 끌려가서다.
export const REGIONS = [
  {
    region: "강원",
    name: "강원 양양군",
    short: "양양",
    places: ["바다", "자연"],
    reason: "서핑 마을의 느슨한 리듬과 조용한 산책길이 함께 있습니다.",
    tags: ["서핑 마을", "카페 밀집", "버스 접근"],
    lat: 38.05393,
    lng: 128.64052,
    imageNote: "양양 해변",
    regnCd: "51",
    signguCd: "830",
  },
  {
    region: "강원",
    name: "강원 정선군",
    short: "정선",
    places: ["산", "자연"],
    reason: "산과 폐선로가 이어져 걷는 것만으로 하루가 채워집니다.",
    tags: ["트레킹", "5일장", "지원 프로그램"],
    lat: 37.35976,
    lng: 128.72589,
    imageNote: "정선 산길",
    regnCd: "51",
    signguCd: "770",
  },
  {
    region: "강원",
    name: "강원 고성군",
    short: "고성",
    places: ["바다", "자연"],
    reason: "해변이 길게 이어지고 항구 마을은 조용합니다.",
    tags: ["긴 해변", "항구 마을", "캠핑장"],
    lat: 38.32246,
    lng: 128.50954,
    imageNote: "고성 해변",
    regnCd: "51",
    signguCd: "820",
  },
  {
    region: "강원",
    name: "강원 삼척시",
    short: "삼척",
    places: ["소도시", "바다"],
    reason: "바다와 도심이 붙어 있어 짧은 체류에도 불편이 적습니다.",
    tags: ["도심 인접", "해안 산책", "카페"],
    lat: 37.38266,
    lng: 129.18831,
    imageNote: "삼척 시내",
    regnCd: "51",
    signguCd: "230",
  },
  {
    region: "강원",
    name: "강원 평창군",
    short: "평창",
    places: ["산", "자연"],
    reason: "해발 700m 고원이라 여름에도 선선하고 목장과 숲길이 가깝습니다.",
    tags: ["고원 목장", "숲길", "겨울 스포츠"],
    lat: 37.61659,
    lng: 128.45331,
    imageNote: "평창 고원",
    regnCd: "51",
    signguCd: "760",
  },
  {
    region: "충남",
    name: "충남 태안군",
    short: "태안",
    places: ["바다", "자연"],
    reason: "방문객이 적고 바다와 가까워 한적하게 지낼 수 있습니다.",
    tags: ["해변 도보 10분", "장보기 편리", "저렴한 숙소"],
    lat: 36.67676,
    lng: 126.29579,
    imageNote: "태안 해안",
    regnCd: "44",
    signguCd: "825",
  },
  {
    region: "충남",
    name: "충남 서천군",
    short: "서천",
    places: ["자연", "바다"],
    reason: "갯벌과 습지, 철새가 오가는 넓고 낮은 풍경입니다.",
    tags: ["갯벌", "습지", "느린 속도"],
    lat: 36.08471,
    lng: 126.66887,
    imageNote: "서천 갯벌",
    regnCd: "44",
    signguCd: "770",
  },
  {
    region: "충남",
    name: "충남 보령시",
    short: "보령",
    places: ["소도시", "바다"],
    reason: "생활 인프라가 갖춰진 소도시, 주말엔 해변까지 30분입니다.",
    tags: ["생활 편의", "해변 근접", "온천"],
    lat: 36.33724,
    lng: 126.53258,
    imageNote: "보령 소도시",
    regnCd: "44",
    signguCd: "180",
  },
  {
    region: "충남",
    name: "충남 공주시",
    short: "공주",
    places: ["소도시", "자연"],
    reason: "백제 유적과 금강 산책길이 도심에서 걸어 닿습니다.",
    tags: ["백제 유적", "한옥 숙소", "도심 인접"],
    lat: 36.45587,
    lng: 127.12659,
    imageNote: "공주 성곽",
    regnCd: "44",
    signguCd: "150",
  },
  {
    region: "충남",
    name: "충남 청양군",
    short: "청양",
    places: ["산", "자연"],
    reason: "칠갑산을 두른 내륙, 여름에도 밤이 서늘한 산간 마을입니다.",
    tags: ["산행", "구기자 농가", "조용함"],
    lat: 36.43304,
    lng: 126.84835,
    imageNote: "청양 산자락",
    regnCd: "44",
    signguCd: "790",
  },
  {
    region: "경북",
    name: "경북 영덕군",
    short: "영덕",
    places: ["바다", "자연"],
    reason: "동해 남부의 작은 어촌, 겨울에도 사람이 붐비지 않습니다.",
    tags: ["어촌 생활", "해산물", "온천"],
    lat: 36.42349,
    lng: 129.3984,
    imageNote: "영덕 어항",
    regnCd: "47",
    signguCd: "770",
  },
  {
    region: "경북",
    name: "경북 봉화군",
    short: "봉화",
    places: ["산", "자연"],
    reason: "목재 향이 남은 조용한 내륙, 밤이 깊고 사람이 적습니다.",
    tags: ["숲길", "한옥 숙소", "조용함"],
    lat: 36.912,
    lng: 128.82067,
    imageNote: "봉화 숲",
    regnCd: "47",
    signguCd: "920",
  },
  {
    region: "경북",
    name: "경북 의성군",
    short: "의성",
    places: ["자연", "소도시"],
    reason: "넓은 농지와 과수원 사이에서 계절을 가까이 봅니다.",
    tags: ["농촌 체험", "과수원", "저렴한 물가"],
    lat: 36.35279,
    lng: 128.68505,
    imageNote: "의성 농지",
    regnCd: "47",
    signguCd: "730",
  },
  {
    region: "경북",
    name: "경북 안동시",
    short: "안동",
    places: ["소도시", "자연"],
    reason: "오래된 마을과 시장이 살아 있어 생활이 편합니다.",
    tags: ["전통 마을", "시장", "기차 접근"],
    lat: 36.56611,
    lng: 128.73477,
    imageNote: "안동 골목",
    regnCd: "47",
    signguCd: "170",
  },
  {
    region: "경북",
    name: "경북 영주시",
    short: "영주",
    places: ["산", "소도시"],
    reason: "서원과 산이 함께 있고 기차로 오가기 편한 내륙 도시입니다.",
    tags: ["서원", "기차 접근", "지원 프로그램"],
    lat: 36.85386,
    lng: 128.60529,
    imageNote: "영주 서원",
    regnCd: "47",
    signguCd: "210",
  },
];

// short(지역 slug) → 지역 레코드. 조회가 잦아 미리 만들어 둔다.
export const REGION_BY_SHORT = Object.fromEntries(REGIONS.map((r) => [r.short, r]));
