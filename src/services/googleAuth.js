// 구글 로그인(Google Identity Services). 패키지를 설치하지 않고 구글이
// 제공하는 스크립트 하나만 붙인다 — 번들 크기가 늘지 않는다.
// 로더 구조는 카카오맵(services/kakaoMap.js)과 같은 방식이다.
//
// 어떤 흐름을 쓰는가: 토큰 흐름(oauth2.initTokenClient)이다.
// 구글이 주는 기본 버튼(google.accounts.id.renderButton)을 쓰면 design의
// "구글 계정으로 계속하기" 버튼을 구글 버튼으로 갈아 끼워야 해서 화면이
// 바뀐다. 토큰 흐름은 우리 버튼의 클릭으로 팝업을 띄울 수 있어 design을
// 그대로 두고 붙일 수 있고, 사용자 동작(클릭)에서 시작하므로 팝업 차단도
// 잘 걸리지 않는다.
//
// 받은 액세스 토큰은 이 파일 안 지역 변수로만 쓰고 곧바로 버린다.
// 프로필을 한 번 읽는 데만 쓰고 저장하지 않는다(개인정보처리방침 §3).

const SCRIPT_ID = "google-identity-services";
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const LOAD_TIMEOUT_MS = 10000;
// 이름·이메일·프로필 이미지만 받는다. 그 밖의 권한은 요청하지 않는다.
const SCOPE = "email profile";

export const GOOGLE_ERROR = {
  NO_KEY: "NO_KEY",
  SCRIPT: "SCRIPT",
  TIMEOUT: "TIMEOUT",
  CANCELLED: "CANCELLED",
  POPUP_BLOCKED: "POPUP_BLOCKED",
  PROFILE: "PROFILE",
  UNKNOWN: "UNKNOWN",
};

const MESSAGES = {
  [GOOGLE_ERROR.NO_KEY]: "구글 로그인이 아직 설정되지 않았어요. 데모로 먼저 둘러보세요.",
  [GOOGLE_ERROR.SCRIPT]: "구글 로그인을 불러오지 못했어요. 네트워크를 확인해 주세요.",
  [GOOGLE_ERROR.TIMEOUT]: "구글 로그인을 불러오는 데 시간이 너무 오래 걸려요.",
  [GOOGLE_ERROR.CANCELLED]: "구글 로그인을 취소했어요.",
  [GOOGLE_ERROR.POPUP_BLOCKED]: "팝업이 차단됐어요. 브라우저에서 팝업을 허용한 뒤 다시 시도해 주세요.",
  [GOOGLE_ERROR.PROFILE]: "구글 계정 정보를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.",
  [GOOGLE_ERROR.UNKNOWN]: "구글 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.",
};

function fail(code) {
  const err = new Error(MESSAGES[code] || MESSAGES[GOOGLE_ERROR.UNKNOWN]);
  err.code = code;
  return err;
}

export function googleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
}

// 클라이언트 ID가 없는 환경(로컬에 .env.local이 없거나 배포에 환경변수를
// 안 넣은 경우)에서는 화면이 예전처럼 "준비 중" 안내로 돌아간다.
export function isGoogleLoginEnabled() {
  return !!googleClientId();
}

let loadPromise = null;

function loadGoogleIdentity() {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google.accounts.oauth2);
      return;
    }
    if (!isGoogleLoginEnabled()) {
      reject(fail(GOOGLE_ERROR.NO_KEY));
      return;
    }

    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      loadPromise = null; // 다시 시도할 수 있게 비운다
      reject(fail(GOOGLE_ERROR.TIMEOUT));
    }, LOAD_TIMEOUT_MS);

    const done = (err, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) {
        loadPromise = null;
        reject(err);
      } else {
        resolve(value);
      }
    };

    const onReady = () => {
      if (window.google?.accounts?.oauth2) done(null, window.google.accounts.oauth2);
      else done(fail(GOOGLE_ERROR.SCRIPT));
    };

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", onReady);
      existing.addEventListener("error", () => done(fail(GOOGLE_ERROR.SCRIPT)));
      if (window.google?.accounts?.oauth2) onReady();
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", onReady);
    script.addEventListener("error", () => done(fail(GOOGLE_ERROR.SCRIPT)));
    document.head.appendChild(script);
  });

  return loadPromise;
}

// 구글이 error_callback으로 알려 주는 사유를 우리 코드로 옮긴다.
function toErrorCode(type) {
  if (type === "popup_closed") return GOOGLE_ERROR.CANCELLED;
  if (type === "popup_failed_to_open") return GOOGLE_ERROR.POPUP_BLOCKED;
  return GOOGLE_ERROR.UNKNOWN;
}

function requestAccessToken(oauth2) {
  return new Promise((resolve, reject) => {
    let client;
    try {
      client = oauth2.initTokenClient({
        client_id: googleClientId(),
        scope: SCOPE,
        callback: (res) => {
          if (res?.access_token) resolve(res.access_token);
          // 사용자가 동의 화면에서 취소하면 error가 담겨 온다.
          else reject(fail(res?.error === "access_denied" ? GOOGLE_ERROR.CANCELLED : GOOGLE_ERROR.UNKNOWN));
        },
        error_callback: (err) => reject(fail(toErrorCode(err?.type))),
      });
    } catch {
      reject(fail(GOOGLE_ERROR.UNKNOWN));
      return;
    }
    try {
      client.requestAccessToken();
    } catch {
      reject(fail(GOOGLE_ERROR.POPUP_BLOCKED));
    }
  });
}

// 프로필을 한 번 읽고 토큰은 버린다. 화면·localStorage 어디에도 넘기지 않는다.
async function fetchProfile(accessToken) {
  let data;
  try {
    const res = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
  } catch {
    throw fail(GOOGLE_ERROR.PROFILE);
  }
  return {
    // 이름이 비어 있는 계정도 있어서 이메일 앞부분으로 채운다.
    name: data.name || (data.email ? data.email.split("@")[0] : "이용자"),
    email: data.email || "",
    picture: data.picture || "",
  };
}

// 성공하면 { name, email, picture }를 돌려준다. 실패하면 code가 붙은 Error.
export async function signInWithGoogle() {
  if (!isGoogleLoginEnabled()) throw fail(GOOGLE_ERROR.NO_KEY);
  const oauth2 = await loadGoogleIdentity();
  const accessToken = await requestAccessToken(oauth2);
  return fetchProfile(accessToken);
}
