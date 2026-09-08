import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { isGoogleLoginEnabled, signInWithGoogle } from "../services/googleAuth.js";
import styles from "./Login.module.css";

// design/salliljido.extracted.html 496-521줄(#login).
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // 실패·안내 문구 한 줄. 클라이언트 ID가 없으면 예전처럼 "준비 중" 안내다.
  const [googleNotice, setGoogleNotice] = useState("");
  const [googleBusy, setGoogleBusy] = useState(false);

  // design finishLogin()(4447998줄): 로그인 성공 후 원래 있던 화면으로
  // 돌려보낸다(없으면 홈). Header의 goLogin이 navigate state로 넘긴다.
  const from = location.state?.from || "/";

  function handleDemoLogin() {
    login("demo");
    navigate(from, { replace: true });
  }

  // 구글 로그인. 실패해도 화면은 그대로 두고 문구만 바꾼다 — 데모 로그인은
  // 계속 쓸 수 있어야 한다(services/googleAuth.js가 사유별 문구를 준다).
  async function handleGoogleLogin() {
    if (googleBusy) return;
    if (!isGoogleLoginEnabled()) {
      setGoogleNotice("구글 로그인은 아직 준비 중이에요. 데모로 먼저 둘러보세요.");
      return;
    }
    setGoogleNotice("");
    setGoogleBusy(true);
    try {
      const profile = await signInWithGoogle();
      login("google", profile);
      navigate(from, { replace: true });
    } catch (err) {
      setGoogleNotice(err.message);
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.brand}>살릴지도</div>
          <h1 className={styles.title}>다시 오셨네요</h1>
          <p className={styles.lead}>저장한 지역과 만들어둔 계획을 이어서 보세요</p>

          {/* design 버튼을 그대로 두고 클릭에서 구글 팝업을 띄운다. 구글이 주는
              기본 버튼을 쓰면 이 자리가 구글 버튼으로 바뀌어 화면이 달라진다. */}
          <button
            type="button"
            className={styles.googleBtn}
            onClick={handleGoogleLogin}
            disabled={googleBusy}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A8.997 8.997 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.11-1.18.29-1.72V4.94H.96A8.997 8.997 0 0 0 0 9c0 1.45.35 2.83.96 4.06l3.01-2.34z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"
              />
            </svg>
            {googleBusy ? "구글 계정 확인 중…" : "구글 계정으로 계속하기"}
          </button>
          {googleNotice && <p className={styles.googleNotice}>{googleNotice}</p>}

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>또는</span>
            <span className={styles.dividerLine} />
          </div>

          <button type="button" className={styles.demoBtn} onClick={handleDemoLogin}>
            데모 계정으로 둘러보기
          </button>
          <p className={styles.demoNote}>
            로그인 없이 모든 기능을 체험할 수 있습니다. 저장한 내용은 이 브라우저에만 보관됩니다.
          </p>

          <p className={styles.terms}>
            로그인하면 <Link to="/terms">서비스 이용약관</Link>과 <Link to="/privacy">개인정보처리방침</Link>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
