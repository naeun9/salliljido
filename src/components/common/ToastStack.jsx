import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast.js";
import Toast from "./Toast.jsx";
import styles from "./Toast.module.css";

// design/salliljido.extracted.html 522-532줄. 화면 오른쪽 아래에 고정으로
// 쌓이고, 3초 뒤 각자 사라진다(ToastContext).
export default function ToastStack() {
  const { toasts, dismiss } = useToast();
  const navigate = useNavigate();

  if (!toasts.length) return null;

  // design 4088-4094줄: 액션을 누르면 그 토스트를 먼저 지우고,
  // 되돌리기면 되돌리고, 아니면 "보러가기"로 마이페이지에 간다
  // (design의 goScreen("plan")이 지금의 /mypage다).
  function handleAction(toast) {
    dismiss(toast.id);
    if (toast.undo) {
      toast.undo();
      return;
    }
    navigate("/mypage");
  }

  return (
    <div className={styles.stack}>
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onAction={() => handleAction(t)} />
      ))}
    </div>
  );
}
