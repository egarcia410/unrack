import { useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@base-ui/react/button";
import { cn } from "../lib/cn";
import { useUIStore } from "../stores/ui-store";
import { useAppStore } from "../stores/app-store";

export const Celebration = () => {
  const celeb = useUIStore.celeb();
  const { setCeleb } = useUIStore.actions();
  const { trainingMaxAdjusted } = useAppStore.actions();

  useEffect(() => {
    if (celeb && celeb.type !== "warn") {
      const t = setTimeout(() => setCeleb(null), 3500);
      return () => clearTimeout(t);
    }
  }, [celeb, setCeleb]);

  if (!celeb) return null;

  const onDone = () => setCeleb(null);
  const onAction = celeb._liftId
    ? async () => {
        await trainingMaxAdjusted(
          celeb._liftId!,
          celeb._suggestedOneRepMax!,
          celeb._suggestedTrainingMax!,
        );
        setCeleb(null);
      }
    : undefined;

  const icon =
    celeb.type === "cycle"
      ? String.fromCodePoint(0x1f3c6)
      : celeb.type === "pr"
        ? String.fromCodePoint(0x26a1)
        : celeb.type === "warn"
          ? String.fromCodePoint(0x26a0)
          : String.fromCodePoint(0x1f4aa);

  return (
    <div
      onClick={celeb.type === "warn" ? undefined : onDone}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 animate-celeb-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "text-center px-7 py-9 rounded-3xl bg-th-s1 border max-w-80 w-[90%] animate-celeb-pop",
          celeb.type === "warn" ? "border-th-r/25" : "border-th-b",
        )}
      >
        <div className="text-5xl mb-3" aria-hidden="true">
          {icon}
        </div>
        <h2
          className={cn(
            "text-xl font-extrabold mb-1.5",
            celeb.type === "warn" ? "text-th-r" : "text-th-t",
          )}
        >
          {celeb.message}
        </h2>
        <p
          className={cn(
            "text-sm text-th-t2 leading-normal",
            celeb.type === "warn" ? "mb-4" : "mb-0",
          )}
        >
          {celeb.subtitle}
        </p>
        {celeb.type === "warn" && onAction && (
          <>
            {celeb.actionSub && (
              <p className="text-xs font-mono text-th-t3 mb-3">{celeb.actionSub}</p>
            )}
            <div className="flex gap-2">
              <Button
                onClick={onAction}
                className="flex-1 py-3.5 rounded-xl border-none bg-th-r text-white text-sm font-bold font-sans cursor-pointer min-h-12"
              >
                {celeb.actionLabel || "Adjust"}
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
        {celeb.type === "cycle" && (
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
