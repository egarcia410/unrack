import { useNavigate } from "@tanstack/react-router";
import { Button } from "@base-ui/react/button";
import { Check, Dot } from "lucide-react";
import { cva } from "class-variance-authority";
import {
  useCurrentPhase,
  useCurrentPhaseWorkouts,
  useTrainingMaxes,
  useOneRepMaxes,
  startWorkout,
} from "../../stores/polaris";
import { LIFTS, LIFT_ORDER } from "../../constants/program";
import { calcWeight } from "../../lib/calc";
import { PRRing } from "../../components/pr-ring";
import { cn } from "../../lib/cn";

const liftCardVariants = cva(
  "flex items-center gap-3 rounded-xl px-4 py-3.5 font-sans text-left w-full box-border min-h-14",
  {
    variants: {
      done: {
        true: "bg-th-gd border border-th-gb cursor-default",
        false: "bg-th-s1 border border-th-b cursor-pointer",
      },
    },
    defaultVariants: { done: false },
  },
);

const checkboxVariants = cva("w-6 h-6 rounded-md border-2 flex items-center justify-center", {
  variants: {
    done: {
      true: "border-th-g bg-th-g text-th-inv",
      false: "border-th-t4 bg-transparent text-transparent",
    },
  },
  defaultVariants: { done: false },
});

type LiftCardProps = {
  liftIndex: number;
};

export const LiftCard = ({ liftIndex }: LiftCardProps) => {
  const navigate = useNavigate();
  const currentPhase = useCurrentPhase();
  const currentPhaseWorkouts = useCurrentPhaseWorkouts();
  const trainingMaxes = useTrainingMaxes();
  const oneRepMaxes = useOneRepMaxes();

  const liftId = LIFT_ORDER[liftIndex];
  const lift = LIFTS.find((candidate) => candidate.id === liftId)!;
  const isDone = currentPhaseWorkouts.some((workout) => workout.lift === liftId);
  const doneEntry = currentPhaseWorkouts.find((workout) => workout.lift === liftId);

  const amrapSet = currentPhase.sets.find((candidate) => String(candidate.reps).includes("+"));
  const amrapWeight = amrapSet ? calcWeight(trainingMaxes[liftId], amrapSet.percentage) : 0;

  let doneReps = 0;
  if (doneEntry?.amrapReps) {
    Object.values(doneEntry.amrapReps).forEach((repValue) => {
      const parsedReps = parseInt(repValue);
      if (parsedReps > 0) doneReps = parsedReps;
    });
  }

  const prevEstimatedOneRepMax = doneEntry?.newOneRepMax
    ? doneEntry.newOneRepMax.old
    : oneRepMaxes[liftId];
  const goalReps =
    amrapSet && prevEstimatedOneRepMax
      ? Math.max(1, Math.ceil((prevEstimatedOneRepMax / amrapWeight - 1) * 30) + 1)
      : null;
  const minReps = amrapSet ? parseInt(String(amrapSet.reps).replace("+", "")) || 1 : 1;

  return (
    <Button
      onClick={() => {
        if (!isDone) {
          startWorkout(liftIndex);
          navigate({ to: "/workout" });
        }
      }}
      className={cn(liftCardVariants({ done: isDone }))}
    >
      <div className={cn(checkboxVariants({ done: isDone }))}>
        {isDone && <Check size={13} strokeWidth={3} />}
      </div>
      <div className="flex-1">
        <strong className="text-base font-semibold text-th-t">{lift.name}</strong>
        {isDone && doneEntry && (
          <p className="text-xs text-th-t3 font-mono mt-0.5 m-0 flex items-center">
            {new Date(doneEntry.datetime).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
            {doneEntry.duration ? (
              <>
                <Dot size={14} />
                {Math.floor(doneEntry.duration / 60)} min
              </>
            ) : (
              ""
            )}
          </p>
        )}
      </div>
      {amrapSet && (
        <PRRing
          size={36}
          min={minReps}
          prGoal={goalReps}
          value={isDone ? doneReps : 0}
          active={false}
          activated={isDone}
        />
      )}
    </Button>
  );
};
