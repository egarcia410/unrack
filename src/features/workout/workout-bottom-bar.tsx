import { useNavigate } from "@tanstack/react-router";
import { Button } from "@base-ui/react/button";
import { Check } from "lucide-react";
import { useAppStore } from "../../stores/app-store";
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

export const WorkoutBottomBar = () => {
  const navigate = useNavigate();

  const { workoutFinished } = useAppStore.actions();
  const { setCeleb } = useUIStore.actions();

  const checked = useAppStore.checked();
  const workoutStart = useAppStore.workoutStart();

  const weekDef = useActiveWeekDef();
  const supplementalSets = useSupplementalSets();
  const allAccDone = useAllAccessoriesDone();
  const { done: accSetsDone, total: accSetsTotal } = useAccessoryProgress();

  const allWarmup = WARMUP_SETS.every((_, i) => checked[`w${i}`]);
  const allMain = weekDef.sets.every((_, i) => checked[`m${i}`]);
  const allSupp = supplementalSets.every((s) => checked[s.key]);
  const canFinish = allWarmup && allMain && allSupp && allAccDone;

  const warmupDone = WARMUP_SETS.filter((_, i) => checked[`w${i}`]).length;
  const mainDone = weekDef.sets.filter((_, i) => checked[`m${i}`]).length;
  const suppDone = supplementalSets.filter((s) => checked[s.key]).length;
  const done = warmupDone + mainDone + suppDone + accSetsDone;
  const total = WARMUP_SETS.length + weekDef.sets.length + supplementalSets.length + accSetsTotal;

  const handleFinish = async () => {
    const result = await workoutFinished();
    setCeleb({
      type: result.celebType,
      message: result.celebMsg,
      subtitle: result.celebSub,
      actionLabel: result.actionLabel,
      actionSub: result.actionSub,
      _liftId: result._liftId,
      _suggestedOneRepMax: result._suggestedOneRepMax,
      _suggestedTrainingMax: result._suggestedTrainingMax,
    });
    navigate({ to: "/" });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 transition-all duration-300">
      <div
        className={cn(
          "max-w-115 mx-auto shadow-[0_-4px_12px_rgba(0,0,0,0.1)]",
          canFinish
            ? "p-0 bg-th-g border-t border-th-gb"
            : "px-5 py-4 bg-th-s1 border-t border-th-b",
        )}
      >
        {canFinish ? (
          <Button
            onClick={handleFinish}
            className="w-full px-5 py-[18px] bg-none border-none cursor-pointer flex items-center justify-center gap-2 font-sans"
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
    </div>
  );
};
