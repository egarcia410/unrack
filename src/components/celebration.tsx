import { useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "../lib/cn";

type CelebrationProps = {
  type: "done" | "pr" | "cycle" | "warn";
  message: string;
  subtitle: string;
  onDone: () => void;
  onAction?: () => void;
  actionLabel?: string;
  actionSub?: string;
};

export const Celebration = ({
  type,
  message,
  subtitle,
  onDone,
  onAction,
  actionLabel,
  actionSub,
}: CelebrationProps) => {
  useEffect(() => {
    if (type !== "warn") {
      const t = setTimeout(onDone, 3500);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const icon =
    type === "cycle"
      ? String.fromCodePoint(0x1f3c6)
      : type === "pr"
        ? String.fromCodePoint(0x26a1)
        : type === "warn"
          ? String.fromCodePoint(0x26a0)
          : String.fromCodePoint(0x1f4aa);
  return (
    <div
      onClick={type === "warn" ? undefined : onDone}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 animate-celeb-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "text-center px-7 py-9 rounded-[20px] bg-th-s1 border max-w-[320px] w-[90%] animate-celeb-pop",
          type === "warn" ? "border-th-r/25" : "border-th-b",
        )}
      >
        <div className="text-5xl mb-3">{icon}</div>
        <div
          className={cn(
            "text-[20px] font-extrabold mb-1.5",
            type === "warn" ? "text-th-r" : "text-th-t",
          )}
        >
          {message}
        </div>
        <div
          className={cn("text-[13px] text-th-t2 leading-normal", type === "warn" ? "mb-4" : "mb-0")}
        >
          {subtitle}
        </div>
        {type === "warn" && onAction && (
          <>
            {actionSub && <div className="text-[12px] font-mono text-th-t3 mb-3">{actionSub}</div>}
            <div className="flex gap-2">
              <button
                onClick={onAction}
                className="flex-1 py-3.5 rounded-[10px] border-none bg-th-r text-white text-[14px] font-bold font-sans cursor-pointer min-h-[48px]"
              >
                {actionLabel || "Adjust"}
              </button>
              <button
                onClick={onDone}
                className="py-3.5 px-4 rounded-[10px] border border-th-b bg-th-s2 text-th-t3 text-[14px] font-semibold font-sans cursor-pointer min-h-[48px]"
              >
                Keep
              </button>
            </div>
          </>
        )}
        {type === "cycle" && (
          <div className="mt-3.5 flex gap-[5px] justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="text-th-a animate-celeb-star"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <Star size={18} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
