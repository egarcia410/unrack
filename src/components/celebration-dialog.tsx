import { useEffect } from "react";
import { ArrowRight, Dot, Dumbbell, Star, TriangleAlert, Trophy, Zap } from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { useActiveCelebration, setActiveCelebration, trainingMaxAdjusted } from "../stores/polaris";

const celebrationVariants = cva(
  "fixed z-50 inset-0 m-auto h-fit text-center px-7 py-9 rounded-3xl bg-th-s1 border max-w-80 w-11/12 transition-[opacity,transform] duration-200 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95",
  {
    variants: {
      type: {
        default: "border-th-b",
        warn: "border-th-r/25",
      },
    },
    defaultVariants: { type: "default" },
  },
);

const iconColorVariants = cva("", {
  variants: {
    type: {
      default: "text-th-a",
      warn: "text-th-r",
    },
  },
  defaultVariants: { type: "default" },
});

const titleColorVariants = cva("text-xl font-extrabold mb-1.5", {
  variants: {
    type: {
      default: "text-th-t",
      warn: "text-th-r",
    },
  },
  defaultVariants: { type: "default" },
});

export const CelebrationDialog = () => {
  const activeCelebration = useActiveCelebration();

  useEffect(() => {
    if (activeCelebration && activeCelebration.type !== "warn") {
      const timeoutId = setTimeout(() => setActiveCelebration(null), 3500);
      return () => clearTimeout(timeoutId);
    }
  }, [activeCelebration]);

  const Icon =
    activeCelebration?.type === "cycle"
      ? Trophy
      : activeCelebration?.type === "pr"
        ? Zap
        : activeCelebration?.type === "warn"
          ? TriangleAlert
          : Dumbbell;

  const variantType = activeCelebration?.type === "warn" ? "warn" : "default";

  const subtitle =
    activeCelebration?.type === "done"
      ? activeCelebration.liftName
      : activeCelebration?.type === "pr"
        ? `${activeCelebration.liftName}: ${activeCelebration.oldOneRepMax} to ${activeCelebration.newOneRepMax} ${activeCelebration.unit}`
        : activeCelebration?.type === "warn" || activeCelebration?.type === "cycle"
          ? activeCelebration.subtitle
          : undefined;

  const subtitleDetail =
    activeCelebration?.type === "done" || activeCelebration?.type === "pr"
      ? activeCelebration.duration
      : undefined;

  const onAction =
    activeCelebration?.type === "warn"
      ? () => {
          trainingMaxAdjusted(
            activeCelebration.liftId,
            activeCelebration.suggestedOneRepMax,
            activeCelebration.suggestedTrainingMax,
          );
          setActiveCelebration(null);
        }
      : undefined;

  return (
    <Dialog.Root
      open={!!activeCelebration}
      onOpenChange={(open) => {
        if (!open && activeCelebration?.type !== "warn") setActiveCelebration(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/75 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className={cn(celebrationVariants({ type: variantType }))}>
          <div className="mb-3 flex justify-center" aria-hidden="true">
            <Icon size={48} className={iconColorVariants({ type: variantType })} />
          </div>
          <Dialog.Title className={cn(titleColorVariants({ type: variantType }))}>
            {activeCelebration?.message}
          </Dialog.Title>
          <Dialog.Description
            render={<div />}
            className={cn(
              "text-sm text-th-t2 leading-normal",
              activeCelebration?.type === "warn" ? "mb-4" : "mb-0",
            )}
          >
            <p className="flex items-center justify-center">
              {subtitle}
              {subtitleDetail && (
                <>
                  <Dot size={16} />
                  {subtitleDetail}
                </>
              )}
            </p>
            {activeCelebration?.type === "warn" && (
              <p className="text-xs font-mono text-th-t3 mt-3 flex items-center justify-center gap-1">
                {activeCelebration.comparisonFrom} <ArrowRight size={12} />{" "}
                {activeCelebration.comparisonTo}
              </p>
            )}
          </Dialog.Description>
          {activeCelebration?.type === "warn" && onAction && (
            <div className="flex gap-2">
              <Dialog.Close
                onClick={onAction}
                className="flex-1 py-3.5 rounded-xl border-none bg-th-r text-white text-sm font-bold min-h-12"
              >
                {activeCelebration.actionLabel}
              </Dialog.Close>
              <Dialog.Close
                onClick={() => setActiveCelebration(null)}
                className="py-3.5 px-4 rounded-xl border border-th-b bg-th-s2 text-th-t3 text-sm font-semibold min-h-12"
              >
                Keep
              </Dialog.Close>
            </div>
          )}
          {activeCelebration?.type === "cycle" && (
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
