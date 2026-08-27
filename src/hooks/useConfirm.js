import { useCallback, useState } from "react";

// design askConfirm()/doConfirm()/cancelConfirm() 패턴. ConfirmModal을 쓰는
// 화면(RegionIntro, PlanEditor, SupportPrograms, MyPage)에서 반복되는
// "확인 대기 중인 요청 하나" 상태를 훅으로 뺐다.
export function useConfirm() {
  const [confirm, setConfirm] = useState(null); // { title, target, onOk } | null

  const ask = useCallback((title, target, onOk) => setConfirm({ title, target, onOk }), []);
  const cancel = useCallback(() => setConfirm(null), []);
  const doConfirm = useCallback(() => {
    if (confirm && confirm.onOk) confirm.onOk();
    setConfirm(null);
  }, [confirm]);

  return { confirm, ask, cancel, doConfirm };
}
