import { useEffect, useState } from "react";
import { fetchPlaceDetail, getCachedDetail } from "../services/placeDetail.js";

// 상세 모달이 열릴 때만 관광공사 상세를 부른다(services/placeDetail.js 주석).
// 닫혀 있으면 아무것도 하지 않고, 이미 부른 장소는 캐시에서 바로 나온다.
export function usePlaceDetail(open, contentId, contentTypeId) {
  const cached =
    open && contentId ? getCachedDetail(contentId, contentTypeId) : null;
  const [detail, setDetail] = useState(cached);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !contentId) return undefined;

    const hit = getCachedDetail(contentId, contentTypeId);
    if (hit) {
      setDetail(hit);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setDetail(null);
    setLoading(true);
    setError(null);

    fetchPlaceDetail(contentId, contentTypeId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        // 조회에 실패해도 모달은 목록에 이미 있는 기본 정보로 그린다.
        setError(err.message || "상세 정보를 불러오지 못했습니다.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, contentId, contentTypeId]);

  return { detail, loading, error };
}
