// 카카오맵 JavaScript SDK 로더.
//
// 키에 대하여: VITE_KAKAO_MAP_KEY는 관광공사 인증키와 성격이 다르다.
// 지도 SDK는 브라우저가 직접 불러야 하므로 키가 번들에 들어가는 것이
// 정상이고, 보호는 키를 숨기는 방식이 아니라 Kakao Developers의
// "플랫폼 > Web 사이트 도메인" 등록으로 이뤄진다. CLAUDE.md의 "번들에
// 키가 들어가면 안 됨"은 서버에서만 써야 하는 관광공사 키 이야기다.
// 그래서 이 값만 VITE_ 접두사를 쓴다(서버리스로 우회할 수 없는 구조).
//
// autoload=false를 쓰는 이유: 기본값(autoload=true)이면 스크립트가 붙는
// 즉시 kakao.maps를 초기화하는데, 그 시점이 우리 컴포넌트가 마운트되는
// 시점과 맞지 않아 "kakao is not defined"가 나기 쉽다. false로 두고
// kakao.maps.load(콜백)으로 준비 완료 시점을 직접 받는다.

const SDK_ORIGIN = "https://dapi.kakao.com";
const SDK_PATH = "/v2/maps/sdk.js";
const SCRIPT_ID = "kakao-maps-sdk";
const LOAD_TIMEOUT_MS = 10000;

// 실패 원인 구분. 화면에서 안내 문구를 고르는 데 쓴다.
export const MAP_ERROR = {
  NO_KEY: "NO_KEY",
  SCRIPT: "SCRIPT",
  TIMEOUT: "TIMEOUT",
  INIT: "INIT",
};

const MESSAGES = {
  [MAP_ERROR.NO_KEY]: "지도 키가 설정되지 않았습니다.",
  [MAP_ERROR.SCRIPT]: "지도를 불러오지 못했습니다. 네트워크 또는 도메인 등록을 확인해주세요.",
  [MAP_ERROR.TIMEOUT]: "지도를 불러오는 데 시간이 너무 오래 걸립니다.",
  [MAP_ERROR.INIT]: "지도를 초기화하지 못했습니다.",
};

function mapErrorMessage(code) {
  return MESSAGES[code] || MESSAGES[MAP_ERROR.SCRIPT];
}

function fail(code) {
  const err = new Error(mapErrorMessage(code));
  err.code = code;
  return err;
}

// 모듈 스코프에 Promise 하나만 둔다. 여러 화면이 동시에 지도를 띄워도
// <script>는 한 번만 붙고, 이미 로드된 뒤에 부르면 즉시 resolve된다.
let loadPromise = null;

export function loadKakaoMaps() {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // 이미 준비된 경우(HMR로 모듈만 다시 평가된 상황 포함)
    if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
      resolve(window.kakao.maps);
      return;
    }

    const key = import.meta.env.VITE_KAKAO_MAP_KEY;
    if (!key) {
      reject(fail(MAP_ERROR.NO_KEY));
      return;
    }

    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(fail(MAP_ERROR.TIMEOUT));
    }, LOAD_TIMEOUT_MS);

    const done = (err, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) reject(err);
      else resolve(value);
    };

    const onScriptReady = () => {
      // autoload=false라 여기서 직접 초기화를 시작한다.
      if (!window.kakao || !window.kakao.maps) {
        done(fail(MAP_ERROR.INIT));
        return;
      }
      try {
        window.kakao.maps.load(() => {
          if (window.kakao.maps.Map) done(null, window.kakao.maps);
          else done(fail(MAP_ERROR.INIT));
        });
      } catch {
        done(fail(MAP_ERROR.INIT));
      }
    };

    // 중복 로드 방지: 같은 id의 스크립트가 이미 있으면 거기에 붙는다.
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", onScriptReady);
      existing.addEventListener("error", () => done(fail(MAP_ERROR.SCRIPT)));
      if (window.kakao && window.kakao.maps) onScriptReady();
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `${SDK_ORIGIN}${SDK_PATH}?appkey=${encodeURIComponent(key)}&autoload=false`;
    script.addEventListener("load", onScriptReady);
    // 키가 틀렸거나 도메인이 등록되지 않으면 대부분 여기로 온다.
    script.addEventListener("error", () => done(fail(MAP_ERROR.SCRIPT)));
    document.head.appendChild(script);
  });

  // 실패한 로드는 캐시에 남기지 않아야 다시 시도할 수 있다.
  // 화면은 목업으로 조용히 폴백하므로, 개발자가 원인을 알 수 있게
  // 콘솔에 한 줄 남긴다(키 값은 절대 찍지 않는다).
  loadPromise.catch((err) => {
    loadPromise = null;
    console.warn(
      `[카카오맵] ${err.message} (code: ${err.code})` +
        (err.code === MAP_ERROR.SCRIPT
          ? " — Kakao Developers > 내 애플리케이션 > 플랫폼 > Web 에 현재 주소가 등록돼 있는지 확인해주세요."
          : "")
    );
  });

  return loadPromise;
}
