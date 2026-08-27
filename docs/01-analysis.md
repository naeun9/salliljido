# 01. design/salliljido.html 분석

## 0. 핵심 발견 사항 (반드시 먼저 읽을 것)

`design/salliljido.html`(4.3MB, 386줄)은 **일반 정적 HTML+CSS 파일이 아니다.**
디자인 캔버스 도구가 내보낸 "번들 파일"로, 실제 마크업이 JSON 문자열 + gzip
압축 상태로 `<script type="__bundler/template">` 안에 통째로 인코딩되어 있다.

- 실제 마크업은 line 384의 JSON 문자열 하나에 이스케이프되어 들어있음
- 폰트(Pretendard Variable, woff2 subset 90여 개), React/ReactDOM UMD 번들도
  같은 방식으로 `<script type="__bundler/manifest">` 안에 base64/gzip으로 동봉됨
- 스타일은 **CSS 변수(`:root { --x }`)가 단 하나도 없다.** 색상·크기·그림자
  등 모든 값이 매 엘리먼트의 `style="..."` 속성에 리터럴로 하드코딩되어 있음
- 로직도 별도 JS 파일이 아니라, 마크업 하단(line 1985~4123)의
  `<script type="text/x-dc">` 블록 안에 하나의 클래스 컴포넌트로 통째로 들어있음
  (`state = {...}`, `goScreen()`, `mypageVals()` 등). 템플릿 쪽 `{{ expr }}`,
  `sc-camel-on-click="{{ handler }}"`, `<sc-for list="{{ arr }}">` 는 이 캔버스
  도구 고유의 바인딩 문법이며 React 문법이 아니다 (`.map()` → `sc-for`,
  `onClick` → `sc-camel-on-click`, `viewBox` → `sc-camel-view-box` 로 치환되어
  있었을 뿐).

작업을 위해 원본을 건드리지 않고, **디코딩한 읽기용 사본을 새로 만들어 두었다:**

```
design/salliljido.extracted.html   ← 실제 마크업 + 로직 (4125줄, 사람이 읽을 수 있는 형태)
```

**이 문서의 모든 줄 번호는 원본 `salliljido.html`이 아니라
`design/salliljido.extracted.html` 기준이다.** 값(색상 hex, px, 텍스트 등)은
원본에서 단 하나도 바꾸지 않고 그대로 옮겨 적었다.

이 발견이 이후 단계에 미치는 영향(3단계 진행 전 확인 필요):

1. **CSS 변수명을 "그대로" 쓸 수 없다** — 원본에 변수 자체가 없기 때문. 값은
   100% 그대로 유지하되, 토큰 이름은 이 문서에서 새로 제안한다(§2 참고). 이름이
   마음에 안 들면 3단계 시작 전에 알려달라.
2. 요청받은 페이지 구조 중 `PlanDetail.jsx(최종 계획)`에 대응하는 별도 화면이
   design에는 없다 — "체류 계획" 화면(`detailDisplay`) 하나가 작성 중/완성 후
   열람을 겸한다(§1 참고, `openedPlanId` 유무로 분기). 4단계 폴더 구조에서
   조정 여부를 논의해야 함.
3. 지도는 현재 **완전히 목업(mock)** 이다. 실제 Kakao Map SDK 연동 이력이
   design에 없다(§5 참고). "카드 셸"(테두리, 줌 버튼, 핀 스타일, 라벨)만 유지하고
   내부만 실제 지도로 교체하는 방식을 권장한다.

---

## 1. 전체 구조와 화면 목록

라우팅 라이브러리가 없다. **SPA 한 페이지 안에 모든 화면 DOM이 동시에
존재**하고, `this.state.screen` 값에 따라 각 화면 컨테이너의
`style="display: {{ xDisplay }}"` 를 `none ↔ flex/block` 으로 토글하는
방식이다 (`goScreen(screen)` 함수, line 3805). 새로고침 시 히스토리 복원은
`window.history.pushState({ slj: { screen, dtTab } })` 로 구현되어 있다
(line 3816, 2158).

| 화면(스크린 state 값) | 위치(줄) | 요청 구조 대응 | 비고 |
|---|---|---|---|
| 랜딩 `landing` | 83–308 | `Home.jsx` | Hero(#top, 84–112) · Service(#service, 113–194) · Regions 캐러셀(#regions, 195–239) · Support 티저(#support, 240–268) · Closing CTA(269–277) · **Footer(279–307, 랜딩 전용)** |
| 조건 선택 `find` | 309–393 | `RegionSearch.jsx` | #find, 3단계 폼(지역/기간/테마) |
| 추천 결과 `result` | 395–495 | `RegionResult.jsx` | 스켈레톤 → 카드+미니맵 |
| 로그인 `login` | 496–521 | `Login.jsx` | 구글 로그인 + 데모 로그인 |
| 지역 소개 `intro` | 678–750 | `RegionIntro.jsx` | 배너, ABOUT, 통계+이미지 크로스페이드 |
| 체류 계획 `detail` | 751–1445 | `PlanEditor.jsx`(3탭) | 아래 §1-1 참고 |
| 지도 확대 선택 `overview` | 1446–1696 | 요청 구조에 없음 | `detail`의 하위 전체화면 뷰(§0-2) |
| 지원 프로그램 `support` | 1697–1809 | `SupportPrograms.jsx` | 필터+정렬+카드 |
| 마이페이지 (state명은 `plan`이지만 표시 플래그는 `appDisplay`) | 1810–1984 | `MyPage.jsx` | 저장 지역/계획 목록 |
| 전역 오버레이 | 41–82, 522–677 | `components/common/*` | 아래 §3 참고, 화면이 아니라 항상 DOM에 떠있는 레이어 |

### 1-1. `detail` 화면 = PlanEditor 3탭 (요청 구조와 이름 매칭)

탭 버튼(line 793–796)과 실제 콘텐츠 section의 `display` 바인딩 이름이
서로 어긋나 있으니 이식할 때 주의:

| 탭 버튼 라벨/순서 | 클릭 핸들러 | 콘텐츠 section (줄) | 요청 구조 대응 |
|---|---|---|---|
| ① 둘러보기 | `dtTab2` | `dtTab2Display` (1012–1227) | `ExploreTab.jsx` — 숙소/체험/생활정보 리스트 + 사이드 지도 |
| ② 체류 계획 | `dtTab1` | `dtTab1Display` (799–1011) | `ScheduleTab.jsx` — 요일 탭 + 아침/점심/저녁 슬롯 + 사이드 지도 |
| ③ 예상 비용 | `dtTab3` | `dtTabRestDisplay` (1228–1445) | `CostTab.jsx` — 숙박/식비/이동/체험비 입력 및 합계 |

`detail` 화면은 `state.openedPlanId` 유무로 "새로 만드는 중" / "마이페이지에서
연 기존 계획"을 겸한다(`dtBackLabel`, line 3046 참고) — 즉 design에는
`PlanEditor`와 `PlanDetail`이 분리되어 있지 않다.

---

## 2. 공통 스타일 (CSS 변수가 없어 값 빈도 기준으로 직접 추출)

### 2-1. 색상 — 상위 빈도 + 제안 토큰명

값은 원본 그대로, **토큰 이름은 이번에 새로 제안**하는 것이다 (원본에 이름 없음).

| Hex | 사용 횟수 | 역할(관찰) | 제안 변수명 |
|---|---|---|---|
| `#2F5D50` | 241 | 브랜드 그린(헤더 로고, 강조 텍스트, 버튼 아웃라인) | `--color-primary` |
| `#6E6E68` | 210 | 보조 텍스트(설명문, 캡션) | `--color-text-muted` |
| `#FFFDFA` | 164 | 카드/서피스 배경(오프화이트) | `--color-surface` |
| `#2B2B29` | 136 | 본문 텍스트(거의 검정) | `--color-text` |
| `#DCE8E2` | 134 | 연그린 틴트(칩 배경, hover 배경) | `--color-primary-tint` |
| `#E7E2D8` | 100 | 기본 보더(웜그레이) | `--color-border` |
| `#4A7C6F` | 75 | 보조 그린(아이콘, 링크, 스텝 넘버) | `--color-primary-alt` |
| `#FAF8F4` | 72 | 페이지 배경(웜 오프화이트) | `--color-bg` |
| `#D9784E` | 59 | 액센트 오렌지(주요 CTA 배경) | `--color-accent` |
| `#EDE9E2` | 43 | 스켈레톤 로딩 베이스 | `--color-skeleton-base` |
| `#C05F33` | 29 | 액센트 오렌지 진한 톤(뱃지 텍스트) | `--color-accent-dark` |
| `#FFFFFF` | 25 | 순백(로그인 카드, 모달 배경) | `--color-white` |
| `#F5F2EC` | 20 | 스켈레톤 하이라이트 | `--color-skeleton-highlight` |
| `#F5EDE4` | 15 | 섹션 배경(웜 샌드, Regions/Support 섹션·마이페이지 안내박스) | `--color-bg-alt` |
| `#F1ECE3` | 13 | 옅은 구분선 | `--color-divider` |
| `#C96A41` | 12 | 액센트 오렌지 hover(더 진한 톤) | `--color-accent-hover` |
| `#F5E1D5` | 10 | 데모 뱃지 / "내가 추가함" 뱃지 배경 | `--color-accent-tint` |

전체 목록은 `#` + 6자리 hex 기준 60여 종이며(대부분 카드 스와치용 저채도
그라디언트 색), 3단계에서 `grep -oE '#[0-9A-Fa-f]{6}'`로 전수 추출해
`tokens.css`에 옮길 예정이다. **CSS 변수는 이번에 전혀 없었으므로, 값은
그대로 두고 이름만 새로 부여한다는 점을 다시 한번 명확히 확인 요청.**

박스섀도우는 전부 `rgba(43,43,41, .4~.6)` 계열의 소프트 섀도우이며
`0 Ypx Zpx -Wpx rgba(...)` 패턴(예: `0 20px 44px -24px rgba(43,43,41,.55)`)이 반복된다.

### 2-2. 타이포그래피

- 폰트: `'Pretendard Variable', Pretendard, -apple-system, sans-serif` (본문 전체)
- 보조: `ui-monospace, Menlo, monospace` — "screen ·", "image ·", "map ·" 라벨
  전용(디자인 목업 표시용 태그로 보임, 실제 서비스 노출 여부 확인 필요)
- 폰트 크기: 고정 px 스케일 12 / 12.5 / 13 / 13.5 / 14 / 14.5 / 15 / 15.5 /
  16 / 16.5 / 17 / 17.5 / 18 / 18.5 / 19 / 19.5 / 20.5 / 21.5px (0.5px 단위의
  세밀한 스케일) + 헤딩은 `clamp(28px, 2.8vw, 36px)` 류의 반응형 clamp
- font-weight: 500(본문 강조) / 600(라벨·버튼) / 700(제목) / 800(지역명 h1) 위주
- letter-spacing: `-.01em ~ -.035em` (제목일수록 더 좁게), 라벨류는 `.02em~.16em` 양수

### 2-3. 간격·모서리·기타

- border-radius: `6 / 8 / 9 / 10 / 12px`(카드·버튼), `50%`(원형 아이콘/핀),
  `999px`(칩·필 배지) — 이 6종 외 값 거의 없음
- 여백: `clamp(20px, 5vw, 64px)`(섹션 좌우 패딩), `clamp(72~104px, ...vh, 120~140px)`류
  (섹션 상하 패딩)로 반응형 clamp를 광범위하게 사용, 카드 내부 padding은
  `18px 18px 20px`, `12px 14px`, `20px 22px` 등 4px 그리드에 가까운 조합
- transition: `.2s ease`가 압도적(167회), 카드 hover류는 `.25s ease`,
  헤더 배경/보더 전환은 `.3s ease`
- 애니메이션 키프레임(전역, line 23–36): `slj-fade`(opacity+translateY 4px),
  `slj-rise`, `slj-shimmer`(스켈레톤 로딩), `slj-spin`, `slj-bob`,
  `slj-in-rise`(스크롤 진입 리빌) — 전부 `@media (prefers-reduced-motion: reduce)`
  가드 있음(line 36)

---

## 3. 반복되는 컴포넌트

| 컴포넌트 | 근거 위치(줄) | 설명 |
|---|---|---|
| **Header/Nav** | 41–68 | 상단 fixed 헤더. 스크롤 여부에 따라 배경/보더/blur가 `{{ headerBg }}` 등으로 전환(랜딩에서 투명→불투명). 로그인 상태별 우측 영역(로그인 버튼 / 데모뱃지 / 계정 드롭다운) 분기 |
| **모바일 메뉴 오버레이** | 61–82 | 햄버거 클릭 시 전체화면 오버레이 메뉴(`overlayDisplay`) |
| **Footer** | 279–307 | **랜딩 화면에만 존재**, 다른 화면엔 없음 |
| **Toast/ToastStack** | 522–533 | 우하단 스택형 토스트, 액션 버튼 옵션(`t.action`), 다건 동시 표시 |
| **ConfirmModal** | 534–545 | 범용 확인창. `sc-camel-on-key-down="{{ confirmKey }}"`로 Enter/Esc 키보드 지원 |
| **AddScheduleModal** | 546–595 | 일정 커스텀 추가 모달(`customDisplay`) |
| **PickerModal** | 596–636 | 마이페이지 등에서 지역/루틴 선택 모달 |
| **RegenAskModal** | 637–650 | 일정 재생성 여부 확인 모달 |
| **NameDialog** | 651–662 | 계획 이름 짓기 모달 |
| **LoginGate 팝업** | 663–677 | 비로그인 상태로 저장 시도 시 우하단에 뜨는 로그인 유도 팝업(`requireAuth()` 헬퍼가 트리거) |
| **Skeleton** | 예: 407–424, 1725–1733 | `slj-shimmer` 애니메이션의 카드/텍스트 placeholder, 여러 화면에서 동일 패턴 재사용 |
| **EmptyState** | 예: 1791–1799 | 원형 아이콘 + 제목 + 설명 + CTA 버튼 (필터 결과 없음 등) |
| **RegionCard** | 425–466 | 결과 화면 추천 카드: 스와치, 이름, "가장 잘 맞아요"/"인구감소지역" 뱃지, 지표 dot, 태그 칩, hover 시 `transform: translateY` 리프트 |
| **ProgramCard** | 1740–1780 | 지원 프로그램 카드: 상태 뱃지, 마감일, 혜택 리스트, 신청기간/대상/인원 그리드, "신청 페이지로 이동" + "저장" 버튼 |
| **Chip/FilterChip** | 예: 399–401(선택 조건 표시), 1709–1717(지역/상태 필터 토글) | 필 형태(`border-radius:999px`) 뱃지, 선택 여부에 따라 배경/보더/글자색 전환 |
| **MapPlaceholder(목업)** | 971–990, 483–491, 1191–1206 | §5 참고 — 3곳에서 반복되는 동일 셸 구조 |
| **AuthMenu(계정 드롭다운)** | 53–60 | 헤더 우측, 로그인 후 마이페이지/로그아웃 메뉴 |

---

## 4. 화면 전환 구현 방식

- **라우터 없음.** `react-router-dom` 없이 하나의 클래스 컴포넌트가
  `this.state.screen`(landing/find/result/login/intro/detail/overview/support/plan)을
  들고, 모든 화면 DOM을 동시에 렌더링한 뒤 `display:none`으로 숨긴다
  (`goScreen()`, line 3805–3827).
- 화면 전환 시: 이전 화면의 스크롤 위치를 `scrollMemo`에 저장 → 새 화면
  전환 후 스크롤 top 초기화 → `window.history.pushState`로 브라우저
  히스토리에 기록 → `popstate` 이벤트로 뒤로가기 복원(line 2158–2164).
- 랜딩 화면에서만 섹션 스냅 스크롤(`data-snap`, `setSnap(true)`)이
  걸려있고, 다른 화면으로 가면 스냅을 해제한다.
- 화면 진입 시 로딩 스피너를 잠깐 보여주는 패턴(`startLoad("li", 900)` 등,
  약 900ms) — 실제 비동기 호출이 아니라 연출용 타이머.
- 스크롤 진입 리빌: `data-in-reveal` 속성이 붙은 섹션은 `slj-in-rise`
  애니메이션으로 나타남(`animation-delay`로 순차 등장 연출).

→ React 이식 시: `react-router-dom`으로 각 화면을 실제 라우트/페이지로
분리하는 것이 CLAUDE.md의 기술 스택 지침과 맞다. 다만 헤더의 활성 탭
표시, 스크롤 스냅, 모달/토스트 전역 상태 등은 화면이 나뉘어도 동일하게
동작하도록 Context로 옮겨야 한다.

---

## 5. 지도가 들어가는 위치와 동작 방식

**결론: 실제 Kakao Map(또는 어떤 지도 SDK도) 연동이 design에 없다. 100%
CSS/SVG로 만든 목업이다.** (`kakao` 문자열이 파일 전체에 0건.)

목업 셸의 구조(3곳에서 거의 동일하게 반복, §3의 MapPlaceholder):

1. 컨테이너: `border-radius:12px; border:1px solid #DCE8E2;` +
   `repeating-linear-gradient(135deg, #EAF0EB 0 14px, #E1EAE3 14px 28px)`
   대각선 줄무늬 배경으로 "지도 텍스처"를 흉내
2. 경로선: `<svg><polyline points="{{ rtPath }}" stroke-dasharray="2 2">`로
   점선 경로 표시
3. 마커: 데이터 배열(`rtPins`, `recs`)의 `x`/`y`(퍼센트 좌표)에
   `position:absolute`로 배치된 원형 핀. hover/click 시 정보 카드 팝업
   (`p.infoDisplay`)
4. 줌 버튼(+/−): 마크업만 있고 실제 동작 없음(장식)
5. 좌하단 `map · {{ label }}` 모노스페이스 라벨 — 디자인 목업 표시용 주석으로 보임
6. 상태: 로딩("지도를 불러오는 중", 결과화면 421), 에러("지도를 불러오지
   못했어요", 1208), 빈 상태(`rtEmptyMapDisplay`), 접기/펼치기
   (`mapCollapsed`/`mapShrunk`, `liToggleMap`)

등장 위치 3곳:

| 위치 | 줄 | 용도 |
|---|---|---|
| RegionResult 카드 옆 미니맵 | 483–491 | 추천 지역 3곳 핀 표시, 카드 hover 시 해당 마커 강조 |
| PlanEditor › ScheduleTab 사이드맵 | 971–990 | 일정에 추가된 장소 핀 + 경로선, sticky로 스크롤 따라옴, 접기 토글 있음 |
| Overview(`ovDisplay`) 전체화면 지도 | 1446–1696 | 지도를 크게 확대해 프로그램/장소를 고르는 별도 뷰(사실상 ScheduleTab의 지도 확대 모드) |

→ 실제 Kakao Map SDK 연동 시, 위 "카드 셸"(테두리/모서리/줌버튼 위치/라벨
배지 스타일)은 그대로 유지하고 내부 렌더링(배경 텍스처+SVG polyline+절대
위치 핀)만 실제 지도 인스턴스로 교체하는 방식을 제안한다. 이 부분은
CLAUDE.md 지침상 "기능상 불가피한 최소 수정"에 해당하므로, `KakaoMap.jsx`
구현 단계(다음 작업)에서 무엇을 바꿨는지 별도로 명시하겠다.

---

## 6. JS로 구현된 인터랙션

로직은 전부 `design/salliljido.extracted.html` line 1985–4123의 단일
클래스 컴포넌트 안에 있다. 주요 상태(`state`, line 2102)는 60개 이상의
필드를 가진 단일 객체 — React 이식 시 이 전체를 하나의 Context로 옮기면
비대해지므로, `store/`에서 화면 단위(PlanContext / SavedContext 등)로
쪼개는 4단계 폴더 구조 제안이 타당하다.

| 인터랙션 | 구현 방식 |
|---|---|
| **탭 전환**(헤더 nav, PlanEditor 3탭, 마이페이지 등) | `state.screen`/`state.dtTab` 값 변경 + 대응 section `display` 토글. 실제 컴포넌트 마운트/언마운트가 아니라 CSS display 전환 |
| **랜딩 지역 캐러셀** | `setInterval(... idx = (idx+1)%3 ..., secs*1000)` (line 2189), `halt()`로 상호작용 시 정지, `goTo(i)`로 수동 이동 |
| **지역소개 이미지 크로스페이드** | `setInterval(... inSlide = (inSlide+1)%4 ..., 3600)` (line 2182), opacity transition 1.1s |
| **필터(지역/상태 칩)** | `regionFilter`/`statusFilter` 배열에 토글, 칩 클릭 시 배열에서 추가/제거 → 리스트 재계산 |
| **정렬** | `sort` state("deadline"/"recent") 전환, 버튼 활성 스타일 바인딩 |
| **모달류** | 각 모달은 독립된 boolean/객체 state(`confirm`, `nameDialog`, `pickerDisplay` 등)로 열림/닫힘 제어. `ConfirmModal`만 키보드(Enter/Esc) 지원 |
| **토스트** | `showToast(msg, ok)` → `toasts` 배열에 push, 일정 시간 후 `fading` 처리 후 제거 |
| **로그인 게이트** | `requireAuth(title, desc)` 헬퍼 — 비로그인 시 액션을 막고 `gate`(팝업) 또는 로그인 화면으로 유도, 로그인 후 `pendingAction`으로 원래 액션 재실행 |
| **일정 편집(체류 계획 탭)** | 요일별(`day`, `week`) 슬롯(아침/점심/저녁)에 항목 추가/삭제/음식종류 변경(`s.removeCustom`, `s.cuisineMenu` 등), 드래그 없이 버튼/드롭다운 기반 |
| **비용 계산(예상 비용 탭)** | 입력값(`nightly`, `foodStyle`, `moveStyle`, 숙박 분할 `staySplit/staySegs` 등)을 조합해 `renderVals()`류 계산 함수에서 합계 산출(순수 JS 연산, 별도 라이브러리 없음) |
| **스크롤 리빌 애니메이션** | `data-in-reveal` 요소에 `IntersectionObserver` 추정(직접 코드는 못 봤으나 CSS는 `animation-delay`로 순차 등장 연출) + `prefers-reduced-motion` 가드 |
| **지도 확대/축소·접기** | 앞서 §5 설명대로 mapCollapsed/mapShrunk state 토글, 실제 지도 zoom 로직은 없음(연동 시 신규 구현 필요) |
| **저장(하트/북마크) 토글** | `p.toggleSave`, `dtToggleSave` 등 — `saved`/`savedRegions` 배열에 id 추가/제거, 로그인 게이트 통과 필요 |
| **인증** | `loginGoogle`(구글 로그인 버튼, 실제 OAuth 연동 없음 — 목업), `loginDemo`(데모 계정, `auth` state만 세팅) |

---

## 다음 단계 진행 전 확인 요청

1. §2-1의 CSS 변수 이름 제안(`--color-primary` 등)으로 3단계를 진행해도 되는지
2. §1-1에서 언급한 대로, `PlanDetail.jsx`를 별도로 만들지 않고
   `PlanEditor.jsx` 하나가 작성 중/열람을 겸하도록 4단계 폴더 구조를 조정해도 되는지
   (요청안에 있던 `PlanDetail.jsx`는 제외하거나, `PlanEditor`의 읽기 전용 모드로 흡수)
3. `overview`(지도 전체화면 선택) 화면을 `PlanEditor` 하위 컴포넌트/모달로 넣을지,
   별도 라우트로 뺄지

특별한 이견이 없으면 이 문서의 제안대로 2~4단계를 이어서 진행하겠습니다.
