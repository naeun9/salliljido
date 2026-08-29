import EmptyState from "../../../../components/common/EmptyState.jsx";
import StayCard from "./StayCard.jsx";
import ExperienceCard from "./ExperienceCard.jsx";
import SpotCard from "./SpotCard.jsx";
import UtilCard from "./UtilCard.jsx";
import styles from "../ExploreTab.module.css";

// 둘러보기 탭의 카테고리별 목록 영역. design 1040-1180줄.
// ExploreTab.jsx가 300줄을 넘어서(CLAUDE.md 코드 원칙) 목록 렌더링만
// 떼어냈다 — 상태·호출은 그대로 ExploreTab이 들고 있고 여기는 받은 값을
// 그리기만 한다. 마크업·클래스는 옮기기 전과 완전히 동일하다.
export default function CategoryList({
  category,
  filteredList,
  visibleList,
  hoverId,
  setHoverId,
  addedExperiences,
  experienceDays,
  experiencePrices,
  setExperienceDay,
  removeExperience,
  savedUtilities,
  utilityDays,
  onConfirmUtility,
  savedSpots,
  spotDays,
  onConfirmSpot,
  stayPicks,
  stayPickerId,
  setStayPickerId,
  onStayConfirm,
  onStayRemove,
  durDays,
  dayPickerId,
  setDayPickerId,
  readOnly = false,
  subChips = null,
}) {
  return (
    <>
      {category === "숙박" && (
        <div className={`${styles.categorySection} slj-anim-fade`}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>숙박</h2>
            <span className={styles.sectionNote}>예약은 외부 서비스로 연결됩니다</span>
          </div>
          {subChips}
          {/* design은 숙박·주변 관광지에는 빈 상태를 두지 않았다(목업이
                  항상 5개씩 있었기 때문). 실데이터에서는 하위 필터를 걸면
                  0건이 실제로 나올 수 있어(예: 태안에 호텔 0건) 체험·식당에
                  쓰던 EmptyState를 같은 형식으로 재사용했다(§ 완료 보고 참고). */}
          {filteredList.length === 0 ? (
            <EmptyState
              icon={
                <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
                  <path
                    d="M3.5 20V9.5L13 4l9.5 5.5V20"
                    stroke="#2F5D50"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="3.5"
                    y1="20"
                    x2="22.5"
                    y2="20"
                    stroke="#2F5D50"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              }
              title="이 유형의 숙소는 아직 없어요"
              description="다른 유형을 골라보시겠어요?"
            />
          ) : (
            <div className={styles.cardGrid}>
              {visibleList.map((s) => {
                const pick = stayPicks.find((g) => g.stayId === s.id);
                return (
                  <StayCard
                    key={s.id}
                    stay={s}
                    hovered={hoverId === s.id}
                    onMouseEnter={() => setHoverId(s.id)}
                    onMouseLeave={() => setHoverId(null)}
                    added={!!pick}
                    currentRange={pick ? { from: pick.from, to: pick.to } : null}
                    durDays={durDays}
                    pickerOpen={stayPickerId === s.id}
                    onTogglePicker={() => setStayPickerId(stayPickerId === s.id ? null : s.id)}
                    onConfirm={(from, to) => onStayConfirm(s.id, from, to)}
                    onRemove={() => onStayRemove(s.id)}
                    readOnly={readOnly}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {category === "체험 프로그램" && (
        <div className={`${styles.categorySection} slj-anim-fade`}>
          <div className={styles.sectionHeadPlain}>
            <h2 className={styles.sectionTitle}>체험 프로그램</h2>
          </div>
          {subChips}
          {filteredList.length === 0 ? (
            <EmptyState
              icon={
                <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
                  <circle cx="13" cy="13" r="9.5" stroke="#2F5D50" strokeWidth="1.5" />
                  <line
                    x1="13"
                    y1="8"
                    x2="13"
                    y2="14"
                    stroke="#2F5D50"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="13" cy="17.5" r="1" fill="#2F5D50" />
                </svg>
              }
              title="이 유형의 체험 프로그램은 아직 없어요"
              description="다른 유형을 골라보시겠어요?"
            />
          ) : (
            <div className={styles.cardGrid}>
              {visibleList.map((x) => (
                <ExperienceCard
                  key={x.id}
                  experience={x}
                  hovered={hoverId === x.id}
                  onMouseEnter={() => setHoverId(x.id)}
                  onMouseLeave={() => setHoverId(null)}
                  added={addedExperiences.includes(x.id)}
                  currentDay={experienceDays[x.id]}
                  currentPrice={experiencePrices[x.id]}
                  durDays={durDays}
                  pickerOpen={dayPickerId === x.id}
                  onTogglePicker={() => setDayPickerId(dayPickerId === x.id ? null : x.id)}
                  onConfirm={(day, price) => {
                    const isOn = addedExperiences.includes(x.id);
                    if (isOn && day === experienceDays[x.id] && price === experiencePrices[x.id]) {
                      removeExperience(x.id);
                    } else {
                      setExperienceDay(x.id, day, price);
                    }
                    setDayPickerId(null);
                  }}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {category === "주변 관광지" && (
        <div className={`${styles.categorySection} slj-anim-fade`}>
          <div className={styles.sectionHeadPlain}>
            <h2 className={styles.sectionTitle}>주변 관광지</h2>
          </div>
          {subChips}
          {filteredList.length === 0 ? (
            <EmptyState
              icon={
                <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
                  <circle cx="13" cy="11" r="7.5" stroke="#2F5D50" strokeWidth="1.4" />
                  <circle cx="13" cy="11" r="2.6" fill="#DCE8E2" />
                  <line x1="13" y1="19" x2="13" y2="24" stroke="#2F5D50" strokeWidth="1.4" />
                </svg>
              }
              title="이 유형의 관광지는 아직 없어요"
              description="다른 유형을 골라보시겠어요?"
            />
          ) : (
            <div className={styles.cardGrid}>
              {visibleList.map((s) => (
                <SpotCard
                  key={s.id}
                  spot={s}
                  hovered={hoverId === s.id}
                  onMouseEnter={() => setHoverId(s.id)}
                  onMouseLeave={() => setHoverId(null)}
                  saved={savedSpots.includes(s.id)}
                  currentDay={spotDays[s.id]}
                  durDays={durDays}
                  pickerOpen={dayPickerId === s.id}
                  onTogglePicker={() => setDayPickerId(dayPickerId === s.id ? null : s.id)}
                  onConfirm={(day) => onConfirmSpot(s.id, day)}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {category === "식당·카페" && (
        <div className={`${styles.categorySection} slj-anim-fade`}>
          <div className={styles.sectionHeadPlain}>
            <h2 className={styles.sectionTitle}>식당·카페</h2>
          </div>
          {subChips}
          {filteredList.length === 0 ? (
            <EmptyState
              icon={
                <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
                  <rect x="3.5" y="7" width="19" height="13" rx="2.6" stroke="#2F5D50" strokeWidth="1.5" />
                  <line x1="3.5" y1="11.4" x2="22.5" y2="11.4" stroke="#2F5D50" strokeWidth="1.5" />
                </svg>
              }
              title="이 지역의 식당·카페 정보는 아직 준비 중이에요"
              description="그동안 숙박이나 주변 관광지를 먼저 살펴보시겠어요?"
            />
          ) : (
            <div className={styles.cardGrid}>
              {visibleList.map((u) => (
                <UtilCard
                  key={u.id}
                  util={u}
                  saved={savedUtilities.includes(u.id)}
                  currentDay={utilityDays[u.id]}
                  durDays={durDays}
                  hovered={hoverId === u.id}
                  onMouseEnter={() => setHoverId(u.id)}
                  onMouseLeave={() => setHoverId(null)}
                  pickerOpen={dayPickerId === u.id}
                  onTogglePicker={() => setDayPickerId(dayPickerId === u.id ? null : u.id)}
                  onConfirm={(day) => onConfirmUtility(u.id, day)}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
