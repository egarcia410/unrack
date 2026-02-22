import { useNavigate } from "@tanstack/react-router";
import { DrawerPreview as DrawerPrimitive } from "@base-ui/react/drawer";
import { Button } from "@base-ui/react/button";
import { Check } from "lucide-react";
import { cva } from "class-variance-authority";
import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { useUIStore } from "../../stores/ui-store";
import { cn } from "../../lib/cn";
import { LiveClock } from "../../components/live-clock";
import {
  WARMUP_SETS,
  useActiveWeekDef,
  useSupplementalSets,
  useAllAccessoriesDone,
  useAccessoryProgress,
} from "./use-workout-selectors";

const bottomBarVariants = cva("max-w-115 mx-auto shadow-[0_-4px_12px_rgba(0,0,0,0.1)]", {
  variants: {
    status: {
      progress: "px-5 py-4 bg-th-s1 border-t border-th-b",
      complete: "p-0 bg-th-g border-t border-th-gb",
    },
  },
});

export const WorkoutBottomBar = () => {
  const navigate = useNavigate();

  const { workoutFinished } = useProgramStore();
  const { setCelebration } = useUIStore();

  const { checked, workoutStart } = useWorkoutStore();

  const weekDef = useActiveWeekDef();
  const supplementalSets = useSupplementalSets();
  const allAssistanceDone = useAllAccessoriesDone();
  const { done: assistanceSetsDone, total: assistanceSetsTotal } = useAccessoryProgress();

  const allWarmup = WARMUP_SETS.every((_, setIndex) => checked[`w${setIndex}`]);
  const allMain = weekDef.sets.every((_, setIndex) => checked[`m${setIndex}`]);
  const allSupp = supplementalSets.every((supplementalSet) => checked[supplementalSet.key]);
  const canFinish = allWarmup && allMain && allSupp && allAssistanceDone;

  const warmupDone = WARMUP_SETS.filter((_, setIndex) => checked[`w${setIndex}`]).length;
  const mainDone = weekDef.sets.filter((_, setIndex) => checked[`m${setIndex}`]).length;
  const suppDone = supplementalSets.filter(
    (supplementalSet) => checked[supplementalSet.key],
  ).length;
  const done = warmupDone + mainDone + suppDone + assistanceSetsDone;
  const total =
    WARMUP_SETS.length + weekDef.sets.length + supplementalSets.length + assistanceSetsTotal;

  const handleFinish = () => {
    setCelebration(workoutFinished());
    navigate({ to: "/" });
  };

  return (
    <DrawerPrimitive.Root open={true} modal={false}>
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Popup className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-115 [transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-200 data-starting-style:[transform:translateY(100%)]">
          <div
            className={cn(
              bottomBarVariants({ status: canFinish ? "complete" : "progress" }),
              "transition-colors duration-300",
            )}
          >
            {canFinish ? (
              <Button
                onClick={handleFinish}
                className="w-full px-5 py-4.5 bg-none border-none flex items-center justify-center gap-2"
              >
                <Check size={13} strokeWidth={3} />
                <span className="text-lg font-bold text-th-inv">Complete Workout</span>
              </Button>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-base font-mono font-bold text-th-t shrink-0">
                    {done}/{total}
                  </span>
                  <div className="flex-1 h-1.5 bg-th-s3 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-th-a rounded-sm transition-[width] duration-300"
                      style={{ width: `${(done / total) * 100}%` }}
                    />
                  </div>
                </div>
                {workoutStart && <LiveClock start={workoutStart} />}
              </div>
            )}
          </div>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
};
