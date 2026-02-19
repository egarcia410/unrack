import { Progress } from "@base-ui/react/progress";
import { useProgramStore } from "../../stores/program-store";
import { LIFT_ORDER } from "../../constants/program";

export const WeekProgressBar = () => {
  const workouts = useProgramStore.workouts();
  const cycle = useProgramStore.cycle();
  const week = useProgramStore.week();

  const weekDone = workouts.filter((w) => w.cycle === cycle && w.week === week);
  const progress = weekDone.length;
  const total = LIFT_ORDER.length;

  return (
    <div>
      <Progress.Root value={progress} max={total}>
        <Progress.Track className="h-1 bg-th-s2 rounded-sm overflow-hidden mb-1">
          <Progress.Indicator className="h-full bg-th-a rounded-sm transition-[width] duration-400" />
        </Progress.Track>
      </Progress.Root>
      <div className="text-xs text-th-t4 mb-4">
        {progress} of {total}
      </div>
    </div>
  );
};
