import { useNavigate } from "@tanstack/react-router";
import { Button } from "@base-ui/react/button";
import { Check } from "lucide-react";
import { useAppStore } from "../../stores/app-store";
import { TEMPLATES, LIFTS, LIFT_ORDER } from "../../constants/program";
import { calcWeight } from "../../lib/calc";
import { PRRing } from "../../components/pr-ring";
import { cn } from "../../lib/cn";

type LiftCardProps = {
  liftIndex: number;
};

export const LiftCard = ({ liftIndex }: LiftCardProps) => {
  const navigate = useNavigate();
  const week = useAppStore.week();
  const cycle = useAppStore.cycle();
  const workouts = useAppStore.workouts();
  const template = useAppStore.template();
  const trainingMaxes = useAppStore.trainingMaxes();
  const oneRepMaxes = useAppStore.oneRepMaxes();
  const { startWorkout } = useAppStore.actions();

  const liftId = LIFT_ORDER[liftIndex];
  const lift = LIFTS.find((x) => x.id === liftId)!;
  const variant = TEMPLATES[template];
  const weekDef = variant.weeks[week];
  const weekDone = workouts.filter((w) => w.cycle === cycle && w.week === week);
  const isDone = weekDone.some((w) => w.lift === liftId);
  const doneEntry = weekDone.find((w) => w.lift === liftId);

  const amrapSet = weekDef.sets.find((x) => String(x.reps).includes("+"));
  const amrapWeight = amrapSet ? calcWeight(trainingMaxes[liftId], amrapSet.percentage) : 0;

  let doneReps = 0;
  if (doneEntry?.amrapReps) {
    Object.values(doneEntry.amrapReps).forEach((v) => {
      const n = parseInt(v);
      if (n > 0) doneReps = n;
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
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3.5 font-sans text-left w-full box-border min-h-14",
        isDone
          ? "bg-th-gd border border-th-gb cursor-default"
          : "bg-th-s1 border border-th-b cursor-pointer",
      )}
    >
      <div
        className={cn(
          "w-6 h-6 rounded-md border-2 flex items-center justify-center",
          isDone
            ? "border-th-g bg-th-g text-th-inv"
            : "border-th-t4 bg-transparent text-transparent",
        )}
      >
        {isDone && <Check size={13} strokeWidth={3} />}
      </div>
      <div className="flex-1">
        <strong className="text-base font-semibold text-th-t">{lift.name}</strong>
        {isDone && doneEntry && (
          <p className="text-xs text-th-t3 font-mono mt-0.5 m-0">
            {new Date(doneEntry.datetime).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
            {doneEntry.duration ? ` \u00B7 ${Math.floor(doneEntry.duration / 60)} min` : ""}
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
