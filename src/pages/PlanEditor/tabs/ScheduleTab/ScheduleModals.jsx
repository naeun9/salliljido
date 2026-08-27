import PickerModal from "../../../../components/plan/PickerModal.jsx";
import AddScheduleModal from "../../../../components/plan/AddScheduleModal.jsx";
import RegenAskModal from "../../../../components/plan/RegenAskModal.jsx";

// 체류 계획 탭이 띄우는 모달 3종을 한데 모았다. ScheduleTab.jsx가 300줄
// 규칙을 넘겨서(CLAUDE.md) 떼어낸 것이고, 마크업·동작은 옮기기 전 그대로다.
export default function ScheduleModals({
  day,
  rtPicker,
  setRtPicker,
  pickerMine,
  pickerPlaces,
  setPick,
  openCustomForm,
  cf,
  setCf,
  editingCustom,
  submitCustom,
  regenAsk,
  setRegenAsk,
  regenKeep,
  regenAll,
}) {
  return (
    <>
      <PickerModal
        open={!!rtPicker}
        slot={rtPicker?.slot}
        mine={pickerMine}
        places={pickerPlaces}
        onPickMine={(o) => {
          // 이름(관광공사 응답)을 저장하면 localStorage에 API 콘텐츠가 남는다.
          // id만 담고 이름은 타임라인을 만들 때 목록에서 찾는다.
          setPick(day, rtPicker.slot, { utilId: o.id, tag: "담은 곳" });
          setRtPicker(null);
        }}
        onPickPlace={(p) => {
          // 추천 장소가 관광공사 실데이터가 되면서 "담은 곳"과 같은 이유로
          // id만 저장한다(이름·설명이 localStorage에 남지 않게).
          setPick(day, rtPicker.slot, { listingId: p.id, tag: p.tag });
          setRtPicker(null);
        }}
        onPickRest={(r) => {
          setPick(day, rtPicker.slot, { id: r.id, name: r.name });
          setRtPicker(null);
        }}
        onCustom={() => {
          const slot = rtPicker?.slot || "오전";
          setRtPicker(null);
          openCustomForm(slot, null);
        }}
        onClose={() => setRtPicker(null)}
      />

      <AddScheduleModal
        open={!!cf}
        editing={editingCustom}
        onSubmit={submitCustom}
        onCancel={() => setCf(null)}
      />

      <RegenAskModal open={regenAsk} onKeep={regenKeep} onAll={regenAll} onCancel={() => setRegenAsk(false)} />
    </>
  );
}
