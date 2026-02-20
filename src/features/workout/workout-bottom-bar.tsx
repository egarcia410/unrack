import { useNavigate } from "@tanstack/react-router";
import { Button } from "@base-ui/react/button";
import { Check } from "lucide-react";
import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { useUIStore } from "../../stores/ui-store";
import { TEMPLATES, LIFT_ORDER } from "../../constants/program";
import { ASSISTANCE_WEEKS } from "../../constants/exercises";
import {
  getAssistanceForLift,
  isAssistanceDiscovered,
  getAssistancePrescription,
} from "../../lib/exercises";
import { cn } from "../../lib/cn";
import { LiveClock } from "../../components/live-clock";
import { buildSupplementalSets, WARMUP_SETS } from "./workout-utils";

export const WorkoutBottomBar = () => {
  const navigate = useNavigate();

  const template = useProgramStore.template();
  const { workoutFinished } = useProgramStore.actions();
  const { setCeleb } = useUIStore.actions();

  const activeWeek = useWorkoutStore.activeWeek();
  const activeDay = useWorkoutStore.activeDay();
  const checked = useWorkoutStore.checked();
  const amrapReps = useWorkoutStore.amrapReps();
  const accLog = useWorkoutStore.accLog();
  const accSets = useWorkoutStore.accSets();
  const workoutStart = useWorkoutStore.workoutStart();

  const variant = TEMPLATES[template];
  const weekDef = variant.weeks[activeWeek];
  const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];

  const prog = useProgramStore.getState();
  const accessories = getAssistanceForLift(liftId, prog);
  const supplementalSets = buildSupplementalSets(variant, weekDef, activeWeek);

  const allWarmup = WARMUP_SETS.every((_, i) => checked[`w${i}`]);
  const allMain = weekDef.sets.every((_, i) => checked[`m${i}`]);
  const allSupp = supplementalSets.every((s) => checked[s.key]);
  const allAcc = accessories.every((a) => {
    if (!isAssistanceDiscovered(a, prog)) {
      const log = accLog[a.id];
      const weekRx = ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0];
      return (accSets[a.id] || 0) >= weekRx.sets && log && parseFloat(log.w || "0") > 0;
    }
    const rx = getAssistancePrescription(a, activeWeek, prog, liftId);
    return (accSets[a.id] || 0) >= rx.sets;
  });
  const canFinish = allWarmup && allMain && allSupp && allAcc;

  // Progress counts
  let accSetsDone = 0;
  let accSetsTotal = 0;
  accessories.forEach((a) => {
    const disc = isAssistanceDiscovered(a, prog);
    const rx = disc
      ? getAssistancePrescription(a, activeWeek, prog, liftId)
      : { sets: (ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0]).sets };
    accSetsTotal += rx.sets;
    accSetsDone += accSets[a.id] || 0;
  });
  const warmupDone = WARMUP_SETS.filter((_, i) => checked[`w${i}`]).length;
  const mainDone = weekDef.sets.filter((_, i) => checked[`m${i}`]).length;
  const suppDone = supplementalSets.filter((s) => checked[s.key]).length;
  const done = warmupDone + mainDone + suppDone + accSetsDone;
  const total = WARMUP_SETS.length + weekDef.sets.length + supplementalSets.length + accSetsTotal;

  const handleFinish = async () => {
    const result = await workoutFinished({
      activeWeek,
      activeDay,
      amrapReps,
      accLog,
      accSets,
      workoutStart,
    });
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
