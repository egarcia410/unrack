import { Button } from "@base-ui/react/button";
import { ChevronDown } from "lucide-react";
import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { LIFT_ORDER } from "../../constants/program";
import { ASSISTANCE_WEEKS } from "../../constants/exercises";
import { getAssistanceForLift } from "../../lib/exercises";
import { cn } from "../../lib/cn";
import { WeightInput } from "../../components/weight-input";
import { AssistanceSetButtons } from "./assistance-set-buttons";
import type { Exercise } from "../../types";

type UndiscoveredAssistanceCardProps = {
  exerciseIndex: number;
};

export const UndiscoveredAssistanceCard = ({ exerciseIndex }: UndiscoveredAssistanceCardProps) => {
  const activeWeek = useWorkoutStore.activeWeek();
  const activeDay = useWorkoutStore.activeDay();
  const accSets = useWorkoutStore.accSets();
  const accLog = useWorkoutStore.accLog();
  const { tapAccSet, untapAccSet, setSwapSlot, setAccLog, setChecked } = useWorkoutStore.actions();

  const unit = useProgramStore.unit();

  const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
  const prog = useProgramStore.getState();
  const accessories = getAssistanceForLift(liftId, prog);
  const exercise = accessories[exerciseIndex] as Exercise;
  const isDeload = activeWeek === 3;

  const weekRx = ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0];
  const log = accLog[exercise.id] || {};
  const hasWeight = parseFloat(log.w || "0") > 0;
  const setsDone = accSets[exercise.id] || 0;
  const allSetsDone = setsDone >= weekRx.sets;
  const isComplete = allSetsDone && (exercise.isBodyweight || hasWeight);

  const handleWeightChange = (value: string) => {
    setAccLog((prev) => ({
      ...prev,
      [exercise.id]: { w: value },
    }));
    const hasValue = parseFloat(value) > 0;
    if (hasValue && allSetsDone)
      setChecked((prev) => ({
        ...prev,
        [`a_${exercise.id}`]: true,
      }));
    else
      setChecked((prev) => {
        const next = { ...prev };
        delete next[`a_${exercise.id}`];
        return next;
      });
  };

  const handleTapSet = () => {
    tapAccSet(
      exercise.id,
      weekRx.sets,
      exercise.isBodyweight ? "acc_bw" : "acc_wt",
      weekRx.percentage,
      isDeload,
    );
    if (setsDone + 1 >= weekRx.sets && (exercise.isBodyweight || hasWeight)) {
      setChecked((prev) => ({
        ...prev,
        [`a_${exercise.id}`]: true,
      }));
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl px-3.5 py-3 transition-all duration-150",
        isComplete ? "bg-th-gd border border-th-gb" : "bg-th-s1 border border-th-yb",
      )}
    >
      <Button
        onClick={() =>
          setSwapSlot({
            liftId,
            slot: exercise.slot!,
            currentId: exercise.id,
          })
        }
        className="flex items-center justify-between w-full box-border bg-none border-none p-0 cursor-pointer mb-1 min-h-11"
      >
        <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
          <span className="text-base font-semibold text-th-t">{exercise.name}</span>
          <ChevronDown size={12} className="shrink-0 text-th-t4" />
        </div>
        <span className="text-sm font-mono font-semibold text-th-y shrink-0 ml-2">
          {weekRx.sets}
          {"\u00D7"}
          {weekRx.reps}
        </span>
      </Button>
      <div className="text-xs text-th-t3 mb-2.5">
        {exercise.isBodyweight
          ? "Max reps with good form each set."
          : "Same weight all " + weekRx.sets + " sets. Leave 1\u20132 reps in the tank."}
      </div>
      {!exercise.isBodyweight && (
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-sm font-semibold text-th-t">Weight:</span>
          <WeightInput
            inputId={`acc-weight-${exercise.id}`}
            value={log.w || ""}
            onChange={handleWeightChange}
            unit={unit}
            align="center"
          />
        </div>
      )}
      <AssistanceSetButtons
        exerciseId={exercise.id}
        totalSets={weekRx.sets}
        onTapSet={handleTapSet}
        onUntapSet={() => untapAccSet(exercise.id, weekRx.sets)}
      />
    </div>
  );
};
