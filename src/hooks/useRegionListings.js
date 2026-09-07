import { useEffect, useRef, useState } from "react";
import { EMPTY_LISTINGS, fetchRegionListings } from "../services/exploreListings.js";
import { useToast } from "./useToast.js";

// 지역 한 곳의 둘러보기 목록을 가져오는 훅. 둘러보기·체류 계획·예상 비용
// 세 탭이 같이 쓴다.
//
// 세 탭이 각자 호출해도 실제 API 호출은 지역당 1번이다 —
// fetchRegionListings가 지역별 Promise를 메모리에 캐싱하기 때문
// (docs/03-api-check.md §12). 그래서 "담은 체험"을 PlanContext에 통째로
// 복사해 두지 않고, id만 저장한 뒤 필요할 때 이 목록에서 찾아 쓴다.
// 관광공사 응답을 localStorage에 저장하지 않게 되는 이점도 있다.
export function useRegionListings(regionShort) {
  const [listings, setListings] = useState(EMPTY_LISTINGS);
  const [loading, setLoading] = useState(true);
  // { message, code }. code가 "TIMEOUT"이면 관광공사 서버가 응답하지 않은
  // 경우라 화면 안내를 다르게 한다(ExploreTab/ListStates.jsx).
  const [failure, setFailure] = useState(null);
  // "다시 시도"를 누르면 값이 올라가면서 아래 effect가 다시 돈다.
  const [retryCount, setRetryCount] = useState(0);
  const { showToast } = useToast();
  // 처음 들어와서 실패한 것은 화면 안내(ListStates)로 충분하다. 사용자가
  // "다시 시도"를 눌렀는데 또 실패한 경우에만 토스트로 한 번 더 알린다 —
  // 버튼을 눌렀는데 화면이 그대로면 눌린 건지조차 알 수 없다.
  const retried = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailure(null);

    fetchRegionListings(regionShort)
      .then((data) => {
        if (cancelled) return;
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setListings(EMPTY_LISTINGS);
        setFailure({
          message: err.message || "관광 정보를 불러오지 못했습니다.",
          code: err.code || null,
        });
        setLoading(false);
        if (retried.current) {
          showToast(
            err.code === "TIMEOUT" ? "관광공사 서버가 아직 응답하지 않아요" : "다시 불러오지 못했어요",
            { kind: "fail" }
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [regionShort, retryCount]);

  return {
    listings,
    loading,
    error: failure ? failure.message : null,
    errorCode: failure ? failure.code : null,
    retry: () => {
      retried.current = true;
      setRetryCount((n) => n + 1);
    },
  };
}
