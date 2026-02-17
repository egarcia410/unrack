import { Check } from "lucide-react";
import { cn } from "../lib/cn";

interface SetRowProps {
  done: boolean;
  weight: number;
  unit: string;
  reps: number | string;
  pct: number;
  isAmrap?: boolean;
  onClick: () => void;
}

export function SetRow({ done, weight, unit, reps, pct, isAmrap, onClick }: SetRowProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "grid grid-cols-[28px_1fr_auto_42px] items-center gap-2 px-3.5 py-3 rounded-[10px] cursor-pointer font-sans text-left w-full box-border transition-all duration-[120ms] min-h-[52px]",
        done ? "bg-th-gd border border-th-gb" : "bg-th-s1 border",
        !done && isAmrap ? "border-th-yb" : !done ? "border-th-b" : "",
      )}
    >
      <div
        className={cn(
          "w-6 h-6 rounded-md border-2 flex items-center justify-center",
          done ? "border-th-g bg-th-g text-th-inv" : "border-th-t4 bg-transparent text-transparent",
        )}
      >
        {done && <Check size={13} strokeWidth={3} />}
      </div>
      <span className="text-[16px] font-bold font-mono text-th-t">
        {weight} <span className="text-[12px] text-th-t4">{unit}</span>
      </span>
      <span className="text-[14px] font-mono text-th-t3">x{reps}</span>
      <span className="text-[11px] font-mono text-th-t4 text-right">{Math.round(pct * 100)}%</span>
    </button>
  );
}
