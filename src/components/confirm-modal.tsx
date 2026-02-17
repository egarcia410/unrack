interface ConfirmModalProps {
  msg: string;
  sub: string;
  onYes: () => void;
  onNo: () => void;
  yesLabel?: string;
}

export function ConfirmModal({ msg, sub, onYes, onNo, yesLabel }: ConfirmModalProps) {
  return (
    <div
      onClick={onNo}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-th-s1 border border-th-b rounded-2xl p-6 max-w-[320px] w-[85%]"
      >
        <div className="text-[17px] font-bold text-th-t mb-1.5">{msg}</div>
        <div className="text-[13px] text-th-t3 mb-5 leading-normal">{sub}</div>
        <div className="flex gap-2">
          <button
            onClick={onNo}
            className="flex-1 py-3.5 rounded-[10px] border border-th-b bg-th-s2 text-th-t text-[15px] font-semibold font-sans cursor-pointer min-h-[48px]"
          >
            Cancel
          </button>
          <button
            onClick={onYes}
            className="flex-1 py-3.5 rounded-[10px] border-none bg-th-r text-th-inv text-[15px] font-semibold font-sans cursor-pointer min-h-[48px]"
          >
            {yesLabel || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
