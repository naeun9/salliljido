import { useState } from "react";
import { useAuth } from "./useAuth.js";
import { isGoogleLoginEnabled, signInWithGoogle } from "../services/googleAuth.js";

// 클라이언트 ID가 없는 환경(.env.local 없음, 배포 환경변수 미등록)에서
// 보여주던 안내. services/googleAuth.js의 NO_KEY 문구를 쓰지 않고 화면에
// 이미 있던 이 문장을 그대로 둔다 — /login과 로그인 게이트 둘 다 예전부터
// 이 문구였다.
const NOT_READY_NOTICE = "구글 로그인은 아직 준비 중이에요. 데모로 먼저 둘러보세요.";

// /login 화면과 로그인 게이트 팝업이 같이 쓰는 구글 로그인 흐름.
// 두 곳의 차이는 성공 후 무엇을 하느냐뿐이라(로그인 화면은 원래 있던
// 화면으로 돌아가고, 게이트는 닫히기만 한다) 그 부분만 onSuccess로 받는다.
//
// 실패해도 화면은 그대로 두고 문구만 바꾼다 — 데모 로그인은 계속 쓸 수
// 있어야 한다(취소·팝업 차단·스크립트 로드 실패 등 사유별 문구는
// services/googleAuth.js가 준다).
export function useGoogleLogin(onSuccess) {
  const { login } = useAuth();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    if (busy) return;
    if (!isGoogleLoginEnabled()) {
      setNotice(NOT_READY_NOTICE);
      return;
    }
    setNotice("");
    setBusy(true);
    try {
      const profile = await signInWithGoogle();
      // login()이 게이트를 닫아 준다(store/AuthContext.jsx setGate(null)).
      login("google", profile);
      onSuccess?.();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  }

  return { notice, busy, start };
}
