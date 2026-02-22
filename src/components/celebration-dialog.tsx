import { useEffect } from "react";
import { ArrowRight, Dot, Dumbbell, Star, TriangleAlert, Trophy, Zap } from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";
import { cn } from "../lib/cn";
import { useUIStore } from "../stores/ui-store";
import { useProgramStore } from "../stores/program-store";

export const CelebrationDialog = () => {
  const { celebration, setCelebration } = useUIStore();
  const { trainingMaxAdjusted } = useProgramStore();

  useEffect(() => {
    if (celebration && celebration.type !== "warn") {
      const timeoutId = setTimeout(() => setCelebration(null), 3500);
      return () => clearTimeout(timeoutId);
    }
  }, [celebration, setCelebration]);

  const onAction = celebration?._liftId
    ? () => {
        trainingMaxAdjusted(
          celebration._liftId!,
          celebration._suggestedOneRepMax!,
          celebration._suggestedTrainingMax!,
        );
        setCelebration(null);
      }
    : undefined;

  const Icon =
    celebration?.type === "cycle"
      ? Trophy
      : celebration?.type === "pr"
        ? Zap
        : celebration?.type === "warn"
          ? TriangleAlert
          : Dumbbell;

  return (
    <Dialog.Root
      open={!!celebration}
      onOpenChange={(open) => {
        if (!open && celebration?.type !== "warn") setCelebration(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/75 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          className={cn(
            "fixed z-50 inset-0 m-auto h-fit text-center px-7 py-9 rounded-3xl bg-th-s1 border max-w-80 w-11/12",
            celebration?.type === "warn" ? "border-th-r/25" : "border-th-b",
          )}
        >
          <div className="mb-3 flex justify-center" aria-hidden="true">
            <Icon size={48} className={celebration?.type === "warn" ? "text-th-r" : "text-th-a"} />
          </div>
          <Dialog.Title
            className={cn(
              "text-xl font-extrabold mb-1.5",
              celebration?.type === "warn" ? "text-th-r" : "text-th-t",
            )}
          >
            {celebration?.message}
          </Dialog.Title>
          <Dialog.Description
            render={<div />}
            className={cn(
              "text-sm text-th-t2 leading-normal",
              celebration?.type === "warn" ? "mb-4" : "mb-0",
            )}
          >
            <p className="flex items-center justify-center">
              {celebration?.subtitle}
              {celebration?.subtitleDetail && (
                <>
                  <Dot size={16} />
                  {celebration.subtitleDetail}
                </>
              )}
            </p>
            {celebration?.type === "warn" && (
              <>
                {celebration.actionSubFrom && celebration.actionSubTo && (
                  <p className="text-xs font-mono text-th-t3 mt-3 flex items-center justify-center gap-1">
                    {celebration.actionSubFrom} <ArrowRight size={12} /> {celebration.actionSubTo}
                  </p>
                )}
                {celebration.actionSub && !celebration.actionSubFrom && (
                  <p className="text-xs font-mono text-th-t3 mt-3">{celebration.actionSub}</p>
                )}
              </>
            )}
          </Dialog.Description>
          {celebration?.type === "warn" && onAction && (
            <div className="flex gap-2">
              <Dialog.Close
                onClick={onAction}
                className="flex-1 py-3.5 rounded-xl border-none bg-th-r text-white text-sm font-bold min-h-12"
              >
                {celebration.actionLabel || "Adjust"}
              </Dialog.Close>
              <Dialog.Close
                onClick={() => setCelebration(null)}
                className="py-3.5 px-4 rounded-xl border border-th-b bg-th-s2 text-th-t3 text-sm font-semibold min-h-12"
              >
                Keep
              </Dialog.Close>
            </div>
          )}
          {celebration?.type === "cycle" && (
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
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
