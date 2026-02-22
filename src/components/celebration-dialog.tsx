import { useEffect } from "react";
import { ArrowRight, Dot, Dumbbell, Star, TriangleAlert, Trophy, Zap } from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { useOverlayStore } from "../stores/overlay-store";
import { useProgramStore } from "../stores/program-store";

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
  const { activeCelebration, setActiveCelebration } = useOverlayStore();
  const { trainingMaxAdjusted } = useProgramStore();

  useEffect(() => {
    if (activeCelebration && activeCelebration.type !== "warn") {
      const timeoutId = setTimeout(() => setActiveCelebration(null), 3500);
      return () => clearTimeout(timeoutId);
    }
  }, [activeCelebration, setActiveCelebration]);

  const onAction = activeCelebration?._liftId
    ? () => {
        trainingMaxAdjusted(
          activeCelebration._liftId!,
          activeCelebration._suggestedOneRepMax!,
          activeCelebration._suggestedTrainingMax!,
        );
        setActiveCelebration(null);
      }
    : undefined;

  const Icon =
    activeCelebration?.type === "cycle"
      ? Trophy
      : activeCelebration?.type === "pr"
        ? Zap
        : activeCelebration?.type === "warn"
          ? TriangleAlert
          : Dumbbell;

  const variantType = activeCelebration?.type === "warn" ? "warn" : "default";

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
              {activeCelebration?.subtitle}
              {activeCelebration?.subtitleDetail && (
                <>
                  <Dot size={16} />
                  {activeCelebration.subtitleDetail}
                </>
              )}
            </p>
            {activeCelebration?.type === "warn" && (
              <>
                {activeCelebration.actionSubFrom && activeCelebration.actionSubTo && (
                  <p className="text-xs font-mono text-th-t3 mt-3 flex items-center justify-center gap-1">
                    {activeCelebration.actionSubFrom} <ArrowRight size={12} />{" "}
                    {activeCelebration.actionSubTo}
                  </p>
                )}
                {activeCelebration.actionSub && !activeCelebration.actionSubFrom && (
                  <p className="text-xs font-mono text-th-t3 mt-3">{activeCelebration.actionSub}</p>
                )}
              </>
            )}
          </Dialog.Description>
          {activeCelebration?.type === "warn" && onAction && (
            <div className="flex gap-2">
              <Dialog.Close
                onClick={onAction}
                className="flex-1 py-3.5 rounded-xl border-none bg-th-r text-white text-sm font-bold min-h-12"
              >
                {activeCelebration.actionLabel || "Adjust"}
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
