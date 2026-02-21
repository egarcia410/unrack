import { Minus, Plus, ArrowRight } from "lucide-react";
import { cva } from "class-variance-authority";
import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { calcWeight, epley } from "../../lib/calc";
import { cn } from "../../lib/cn";
import { PRRing } from "../../components/pr-ring";
import { IconButton } from "../../components/icon-button";
import { Button } from "@base-ui/react/button";
import { useActiveLiftId, useActiveTrainingMax, useActiveWeekDef } from "./use-workout-selectors";

type AmrapStatus =
  | "inactive"
  | "zeroReps"
  | "belowMinimum"
  | "atMinimum"
  | "aboveMinimum"
  | "personalRecord";

const amrapCardVariants = cva("rounded-2xl p-4 transition-all duration-250 border-2", {
  variants: {
    status: {
      inactive: "bg-th-s1 border-th-t4",
      zeroReps: "bg-th-s1 border-th-r",
      belowMinimum: "bg-th-s1 border-th-r",
      atMinimum: "bg-th-s1 border-th-g",
      aboveMinimum: "bg-th-s1 border-th-pr",
      personalRecord: "bg-th-god border-th-go animate-gold-glow",
    },
  },
  defaultVariants: { status: "inactive" },
});

type AmrapCardProps = {
  setIndex: number;
};

export const AmrapCard = ({ setIndex }: AmrapCardProps) => {
  const { unit, oneRepMaxes } = useProgramStore();
  const trainingMax = useActiveTrainingMax();
  const liftId = useActiveLiftId();
  const weekDef = useActiveWeekDef();

  const { checked, amrapReps, activateAmrap, setAmrapReps } = useWorkoutStore();

  const set = weekDef.sets[setIndex];
  const setKey = `m${setIndex}`;
  const amrapWeight = calcWeight(trainingMax, set.percentage);
  const minReps = parseInt(String(set.reps).replace("+", "")) || 1;

  const goalReps = oneRepMaxes[liftId]
    ? Math.max(1, Math.ceil((oneRepMaxes[liftId] / amrapWeight - 1) * 30) + 1)
    : null;

  const amrapDone = !!checked[setKey];
  const entered = parseInt(amrapReps[setKey]) || 0;
  const currentEstimate = entered > 0 ? epley(amrapWeight, entered) : 0;
  const previousEstimate = oneRepMaxes[liftId] || 0;
  const isPR = amrapDone && entered > 0 && goalReps && entered >= goalReps;

  const stepDown = () => {
    if (!amrapDone) return;
    const newValue = Math.max(0, (parseInt(amrapReps[setKey]) || 0) - 1);
    setAmrapReps((prev) => ({ ...prev, [setKey]: String(newValue) }));
  };

  const stepUp = () => {
    if (!amrapDone) {
      activateAmrap(setIndex);
      return;
    }
    setAmrapReps((prev) => ({ ...prev, [setKey]: String((parseInt(prev[setKey]) || 0) + 1) }));
  };

  const amrapStatus: AmrapStatus = !amrapDone
    ? "inactive"
    : entered <= 0
      ? "zeroReps"
      : isPR
        ? "personalRecord"
        : entered > minReps
          ? "aboveMinimum"
          : entered === minReps
            ? "atMinimum"
            : "belowMinimum";

  return (
    <div className={cn(amrapCardVariants({ status: amrapStatus }))}>
      {!amrapDone ? (
        <Button
          onClick={() => activateAmrap(setIndex)}
          className="flex items-center justify-between w-full box-border bg-none border-none p-0 cursor-pointer min-h-14"
        >
          <div>
            <span className="text-xl font-extrabold font-mono text-th-t">{amrapWeight}</span>
            <span className="text-sm text-th-t4 font-mono font-semibold"> {unit}</span>
            {goalReps && (
              <div className="text-xs text-th-t4 font-mono mt-1">
                PR at <span className="text-th-go font-bold">{goalReps}+</span>
              </div>
            )}
          </div>
          <PRRing
            size={58}
            min={minReps}
            prGoal={goalReps}
            value={0}
            active={true}
            activated={false}
          />
        </Button>
      ) : (
        <div>
          <div className="text-sm text-th-t4 font-mono mb-2 text-center">
            {amrapWeight} {unit}
            {goalReps ? ` \u00B7 PR at ${goalReps}+` : ""}
          </div>
          <div className="flex items-center justify-center gap-3">
            <IconButton size="large" onClick={stepDown}>
              <Minus size={20} />
            </IconButton>
            <PRRing
              size={80}
              min={minReps}
              prGoal={goalReps}
              value={entered}
              active={true}
              activated={true}
            />
            <IconButton size="large" onClick={stepUp}>
              <Plus size={20} />
            </IconButton>
          </div>
          {isPR && currentEstimate > 0 && (
            <div className="text-sm font-mono font-extrabold mt-2.5 text-th-go text-center flex items-center justify-center gap-1">
              PR {previousEstimate} <ArrowRight size={14} /> {currentEstimate} {unit}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
