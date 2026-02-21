import { useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@base-ui/react/button";
import { cn } from "../lib/cn";
import { useUIStore } from "../stores/ui-store";
import { useProgramStore } from "../stores/program-store";

export const Celebration = () => {
  const { celebration, setCelebration } = useUIStore();
  const { trainingMaxAdjusted } = useProgramStore();

  useEffect(() => {
    if (celebration && celebration.type !== "warn") {
      const timeoutId = setTimeout(() => setCelebration(null), 3500);
      return () => clearTimeout(timeoutId);
    }
  }, [celebration, setCelebration]);

  if (!celebration) return null;

  const onDone = () => setCelebration(null);
  const onAction = celebration._liftId
    ? async () => {
        await trainingMaxAdjusted(
          celebration._liftId!,
          celebration._suggestedOneRepMax!,
          celebration._suggestedTrainingMax!,
        );
        setCelebration(null);
      }
    : undefined;

  const icon =
    celebration.type === "cycle"
      ? String.fromCodePoint(0x1f3c6)
      : celebration.type === "pr"
        ? String.fromCodePoint(0x26a1)
        : celebration.type === "warn"
          ? String.fromCodePoint(0x26a0)
          : String.fromCodePoint(0x1f4aa);

  return (
    <div
      onClick={celebration.type === "warn" ? undefined : onDone}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 animate-celeb-fade"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "text-center px-7 py-9 rounded-3xl bg-th-s1 border max-w-80 w-11/12 animate-celeb-pop",
          celebration.type === "warn" ? "border-th-r/25" : "border-th-b",
        )}
      >
        <div className="text-5xl mb-3" aria-hidden="true">
          {icon}
        </div>
        <h2
          className={cn(
            "text-xl font-extrabold mb-1.5",
            celebration.type === "warn" ? "text-th-r" : "text-th-t",
          )}
        >
          {celebration.message}
        </h2>
        <p
          className={cn(
            "text-sm text-th-t2 leading-normal",
            celebration.type === "warn" ? "mb-4" : "mb-0",
          )}
        >
          {celebration.subtitle}
        </p>
        {celebration.type === "warn" && onAction && (
          <>
            {celebration.actionSub && (
              <p className="text-xs font-mono text-th-t3 mb-3">{celebration.actionSub}</p>
            )}
            <div className="flex gap-2">
              <Button
                onClick={onAction}
                className="flex-1 py-3.5 rounded-xl border-none bg-th-r text-white text-sm font-bold font-sans cursor-pointer min-h-12"
              >
                {celebration.actionLabel || "Adjust"}
              </Button>
              <Button
                onClick={onDone}
                className="py-3.5 px-4 rounded-xl border border-th-b bg-th-s2 text-th-t3 text-sm font-semibold font-sans cursor-pointer min-h-12"
              >
                Keep
              </Button>
            </div>
          </>
        )}
        {celebration.type === "cycle" && (
          <div className="mt-3.5 flex gap-1.5 justify-center">
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
