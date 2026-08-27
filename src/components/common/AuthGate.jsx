import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import styles from "./AuthGate.module.css";

// 로그인 게이트 팝업. design/salliljido.extracted.html 663-676줄.
// requireAuth()가 막은 동작(지역/계획 저장, 관심 등록, 마이페이지 접근)이
// 있을 때 화면 우하단에 뜬다. Layout에 한 번만 두면 모든 라우트에서
// 공유된다.
export default function AuthGate() {
  const { gate, closeGate, login } = useAuth();
  const [googleNotice, setGoogleNotice] = useState(false);

  function handleGoogleClick() {
    setGoogleNotice(true);
  }

  return (
    <div className={`${styles.gate} ${gate ? styles.open : ""}`}>
      {gate && (
        <>
          <div className={styles.head}>
            <div className={styles.title}>{gate.title}</div>
            <button type="button" aria-label="닫기" className={styles.closeBtn} onClick={closeGate}>
              ×
            </button>
          </div>
          <p className={styles.body}>{gate.body}</p>
          <div className={styles.actions}>
            {/* design loginGoogle(4463080줄)은 실제로도 목업이라 클릭하면
                바로 로그인 처리됐지만, 우리는 VITE_GOOGLE_CLIENT_ID가
                비어 있는 동안은 실제 OAuth를 흉내내지 않고 안내만 한다.
                TODO(구글 OAuth 연동): VITE_GOOGLE_CLIENT_ID가 채워지면
                이 버튼을 실제 구글 로그인 흐름(authorization code 교환 등)
                으로 교체할 것 — 자리는 이 onClick 하나뿐이라 여기만
                손대면 된다. */}
            <button type="button" className={styles.googleBtn} onClick={handleGoogleClick}>
              <svg width="16" height="16" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A8.997 8.997 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.11-1.18.29-1.72V4.94H.96A8.997 8.997 0 0 0 0 9c0 1.45.35 2.83.96 4.06l3.01-2.34z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
              </svg>
              구글 로그인
            </button>
            {googleNotice && <p className={styles.googleNotice}>구글 로그인은 아직 준비 중이에요. 데모로 먼저 둘러보세요.</p>}
            <button type="button" className={styles.demoBtn} onClick={() => login("demo")}>
              데모로 계속하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
