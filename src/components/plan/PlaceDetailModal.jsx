import { useEffect, useState } from "react";
import Modal from "../common/Modal.jsx";
import Skeleton from "../common/Skeleton.jsx";
import { usePlaceDetail } from "../../hooks/usePlaceDetail.js";
import { kakaoMapUrl } from "../../utils/externalLinks.js";
import { summarize, toParagraphs, splitList } from "../../utils/text.js";
import styles from "./PlaceDetailModal.module.css";

// 일정 항목을 눌렀을 때 뜨는 장소 상세. design의 우하단 카드(ovSel,
// 1684-1694줄)를 대신한다 — 원본 카드는 일차·슬롯·주소밖에 못 보여 줬는데,
// 실제로 궁금한 것(영업시간, 쉬는날, 대표메뉴, 입퇴실 시간)은 목록
// API(areaBasedList2)에 아예 없는 값이라 카드 크기로는 채울 수가 없었다.
// 상세 API(detailCommon2 + detailIntro2)를 열 때만 부르고 중앙 모달로 띄운다.
//
// 배경·카드 모양은 같은 앱의 다른 모달(AddScheduleModal, ConfirmModal)의
// 값을 그대로 쓴다 — 새 톤을 만들지 않는다.
export default function PlaceDetailModal({ selection, contentTypeId, onClose }) {
  const open = !!selection;
  const { detail, loading, error, errorCode } = usePlaceDetail(open, selection?.id, contentTypeId);
  const [expanded, setExpanded] = useState(false);

  // 장소가 바뀌면 개요는 다시 접은 상태로 시작한다.
  useEffect(() => {
    setExpanded(false);
  }, [selection?.id]);

  // Esc로 닫기. 다른 모달과 동작을 맞춘다.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!selection) return null;

  const { day, slot, time, place, tag, desc, addr } = selection;
  // 상세를 못 불러왔을 때 쓰는 값은 이미 목록에 있는 것들이다.
  const address = detail?.addr || addr || "";
  const overview = detail?.overview || "";
  // 개요는 270~440자가 예사라 그대로 넣으면 정보 목록이 스크롤 밖으로
  // 밀린다. 문장 단위로 줄이고, 잘렸을 때만 "더 보기"를 붙인다.
  const summary = summarize(overview);
  // 펼쳤을 때는 2~3문장씩 문단으로 나눠 그린다.
  const paragraphs = toParagraphs(overview);
  const image = detail?.image || "";
  const tel = detail?.tel || "";

  // 메뉴는 음식점(39)에만 있는 값이다. 다른 타입에는 detailIntro2가 아예
  // 내려주지 않지만, 타입으로 한 번 더 막아 둔다.
  const info = detail?.info || [];
  const isRestaurant = String(contentTypeId || detail?.contentTypeId || "") === "39";
  const valueOf = (label) => info.find((row) => row.label === label)?.value || "";
  const firstMenu = isRestaurant ? valueOf("대표메뉴") : "";
  // treatmenu는 "A / B / C 등" 한 줄로 와서 정보 목록에 넣으면 줄이 길어진다.
  // 아래 메뉴 섹션에서 항목별로 세운다.
  const menuItems = isRestaurant ? splitList(valueOf("취급메뉴")) : [];
  const hasMenu = !!firstMenu || menuItems.length > 0;

  // 값이 있는 줄만 그린다. 전화번호는 detailIntro2의 문의처와 겹치는 일이
  // 잦아(같은 번호가 두 줄) 같은 값이면 하나만 남긴다.
  const rows = [
    { label: "주소", value: address },
    { label: "전화", value: tel },
    // 메뉴 두 줄은 정보 목록에서 빼고 아래 메뉴 섹션으로 옮긴다.
    ...info.filter((row) => !(isRestaurant && (row.label === "대표메뉴" || row.label === "취급메뉴"))),
  ].filter((row, i, all) => row.value && all.findIndex((r) => r.value === row.value) === i);

  return (
    <Modal open={open} onBackdropClick={onClose} zIndex={95}>
      <div
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-label={`${place} 상세 정보`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.head}>
          <div className={styles.headText}>
            <h2 className={styles.place}>{place}</h2>
            <div className={styles.tagRow}>
              {tag && <span className={styles.tag}>{tag}</span>}
              {day && (
                <span className={styles.meta}>
                  {day}일차 · {slot} {time || ""}
                </span>
              )}
            </div>
          </div>
          <button type="button" className={styles.closeIcon} aria-label="닫기" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              <line x1="3" y1="3" x2="12" y2="12" stroke="#6E6E68" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="3" x2="3" y2="12" stroke="#6E6E68" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div className={styles.loading}>
              <Skeleton width="100%" height="160px" radius={12} />
              <Skeleton width="88%" height="14px" style={{ marginTop: 16 }} />
              <Skeleton width="94%" height="14px" style={{ marginTop: 10 }} />
              <Skeleton width="62%" height="14px" style={{ marginTop: 10 }} />
            </div>
          ) : (
            <>
              {image && <img className={styles.image} src={image} alt="" loading="lazy" />}
              {overview &&
                (expanded ? (
                  // 펼친 상태: 문단으로 나눠 그리고 "접기"는 마지막 문단 끝에 붙인다.
                  <div className={styles.overviewFull}>
                    {paragraphs.map((para, i) => (
                      <p key={i} className={styles.overview}>
                        {para}
                        {i === paragraphs.length - 1 && (
                          <button type="button" className={styles.moreBtn} onClick={() => setExpanded(false)}>
                            접기
                          </button>
                        )}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className={styles.overview}>
                    {summary.short}
                    {summary.truncated && (
                      <button type="button" className={styles.moreBtn} onClick={() => setExpanded(true)}>
                        더 보기
                      </button>
                    )}
                  </p>
                ))}

              {rows.length > 0 && (
                <dl className={styles.info}>
                  {rows.map((row) => (
                    <div key={row.label} className={styles.infoRow}>
                      <dt className={styles.infoLabel}>{row.label}</dt>
                      <dd className={styles.infoValue}>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {/* 메뉴. 정보 목록 아래에 따로 둔다 — 한 줄로 이어 붙이면
                  "A / B / C 등"이 되어 무엇이 있는지 눈에 안 들어온다.
                  대표메뉴가 있으면 맨 위에 하나만 강조하고, 나머지는
                  라벨 없이 항목만 세운다. 둘 다 없으면 섹션을 그리지 않는다. */}
              {hasMenu && (
                <section className={styles.menu}>
                  <h3 className={styles.menuTitle}>메뉴</h3>
                  {firstMenu && (
                    <p className={styles.menuFirst}>
                      <span className={styles.menuBadge}>대표</span>
                      {firstMenu}
                    </p>
                  )}
                  {menuItems.length > 0 && (
                    <ul className={styles.menuList}>
                      {menuItems.map((item) => (
                        <li key={item} className={styles.menuItem}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {/* 목록에만 있는 설명(대개 주소)은 주소 줄과 겹치면 버린다. */}
              {!overview && desc && desc !== address && <p className={styles.overview}>{desc}</p>}

              {/* 관광공사 서버가 응답하지 않을 때는 그렇게 적는다 —
                  우리 서비스가 고장 난 것으로 읽히지 않게(ListStates.jsx와 같은 이유). */}
              {error && (
                <p className={styles.error}>
                  {errorCode === "TIMEOUT"
                    ? "관광공사 서버가 응답하지 않아 기본 정보만 보여 드려요."
                    : "상세 정보를 불러오지 못해 기본 정보만 보여 드려요."}
                </p>
              )}
            </>
          )}
        </div>

        <div className={styles.actions}>
          {detail?.homepage && (
            <a className={styles.linkBtn} href={detail.homepage} target="_blank" rel="noopener noreferrer">
              홈페이지
            </a>
          )}
          <a
            className={styles.linkBtn}
            href={kakaoMapUrl({
              name: place,
              mapX: detail?.mapX ?? selection.mapX,
              mapY: detail?.mapY ?? selection.mapY,
            })}
            target="_blank"
            rel="noopener noreferrer"
          >
            카카오맵에서 보기
          </a>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
}
