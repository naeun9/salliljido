import { useEffect, useState } from "react";
import { EMPTY_LISTINGS, fetchRegionListings } from "../services/exploreListings.js";

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
  const [error, setError] = useState(null);
  // "다시 시도"를 누르면 값이 올라가면서 아래 effect가 다시 돈다.
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRegionListings(regionShort)
      .then((data) => {
        if (cancelled) return;
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setListings(EMPTY_LISTINGS);
        setError(err.message || "관광 정보를 불러오지 못했습니다.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [regionShort, retryCount]);

  return { listings, loading, error, retry: () => setRetryCount((n) => n + 1) };
}
