import { Minus, Plus, ArrowRight } from "lucide-react";
import { useAppStore } from "../../stores/app-store";
import { calcWeight, epley } from "../../lib/calc";
import { cn } from "../../lib/cn";
import { PRRing } from "../../components/pr-ring";
import { IconButton } from "../../components/icon-button";
import { Button } from "@base-ui/react/button";
import { useActiveLiftId, useActiveTrainingMax, useActiveWeekDef } from "./use-workout-selectors";

type AmrapCardProps = {
  setIndex: number;
};

export const AmrapCard = ({ setIndex }: AmrapCardProps) => {
  const unit = useAppStore.unit();
  const oneRepMaxes = useAppStore.oneRepMaxes();
  const trainingMax = useActiveTrainingMax();
  const liftId = useActiveLiftId();
  const weekDef = useActiveWeekDef();

  const checked = useAppStore.checked();
  const amrapReps = useAppStore.amrapReps();
  const { activateAmrap, setAmrapReps } = useAppStore.actions();

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

  const borderColor = !amrapDone
    ? "var(--color-th-t4)"
    : entered <= 0
      ? "var(--color-th-r)"
      : isPR
        ? "var(--color-th-go)"
        : entered > minReps
          ? "var(--color-th-pr)"
          : entered === minReps
            ? "var(--color-th-g)"
            : entered < minReps
              ? "var(--color-th-r)"
              : "var(--color-th-g)";

  return (
    <div
      className={cn(
        "rounded-2xl p-4 transition-all duration-250",
        isPR ? "bg-th-god animate-gold-glow" : "bg-th-s1",
      )}
      style={{ border: `2px solid ${borderColor}` }}
    >
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
