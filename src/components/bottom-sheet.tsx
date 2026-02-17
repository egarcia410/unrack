import type { ReactNode } from "react";

interface BottomSheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: string;
}

export function BottomSheet({ title, onClose, children, maxHeight = "85vh" }: BottomSheetProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/50 flex items-end justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-th-s1 rounded-t-[20px] w-full max-w-[460px] flex flex-col animate-sheet-up"
        style={{ maxHeight }}
      >
        <div className="px-5 pt-4 pb-3 border-b border-th-b flex justify-between items-center shrink-0">
          <span className="text-[17px] font-bold text-th-t">{title}</span>
          <button
            onClick={onClose}
            className="w-[44px] h-[44px] rounded-[10px] border border-th-b bg-th-s2 text-th-t4 cursor-pointer flex items-center justify-center text-[20px]"
          >
            {"\u00D7"}
          </button>
        </div>
        <div className="px-5 pt-4 pb-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
