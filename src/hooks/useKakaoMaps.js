import { useEffect, useState } from "react";
import { loadKakaoMaps } from "../services/kakaoMap.js";

// 카카오맵 SDK 준비 상태. 실제 로드는 services/kakaoMap.js가 Promise
// 하나로 공유하므로, 이 훅을 여러 화면에서 불러도 스크립트는 한 번만 붙는다.
//
// status: "loading" | "ready" | "error"
// 실패해도 던지지 않고 status로만 알린다 — 지도 없이도 화면이 그대로
// 서 있어야 하기 때문(각 화면이 목업 지도로 폴백한다).
export function useKakaoMaps() {
  const [state, setState] = useState({ maps: null, status: "loading", error: null });

  useEffect(() => {
    let cancelled = false;
    loadKakaoMaps()
      .then((maps) => {
        if (!cancelled) setState({ maps, status: "ready", error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ maps: null, status: "error", error: err });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
