import { Button } from "@base-ui/react/button";
import { ChevronDown } from "lucide-react";
import {
  useActivePhase,
  useActiveLiftId,
  useAssistanceSetCounts,
  useAssistanceLog,
  setAssistanceLog,
  setChecked,
  setActiveSwapSlot,
} from "../../stores/polaris";
import { WEIGHTED_ASSISTANCE_WEEKS, BODYWEIGHT_ASSISTANCE_WEEKS } from "../../constants/exercises";
import { cn } from "../../lib/cn";
import { WeightInput } from "../../components/weight-input";
import { AssistanceSetButtons } from "./assistance-set-buttons";
import { useAccessoryExercise } from "./use-workout-selectors";

type UndiscoveredAssistanceCardProps = {
  exerciseIndex: number;
};

export const UndiscoveredAssistanceCard = ({ exerciseIndex }: UndiscoveredAssistanceCardProps) => {
  const activePhase = useActivePhase();
  const activeLiftId = useActiveLiftId();
  const assistanceSetCounts = useAssistanceSetCounts();
  const assistanceLog = useAssistanceLog();
  const exercise = useAccessoryExercise(exerciseIndex);

  const weightedWeek = WEIGHTED_ASSISTANCE_WEEKS[activePhase] || WEIGHTED_ASSISTANCE_WEEKS[0];
  const bodyweightWeek = BODYWEIGHT_ASSISTANCE_WEEKS[activePhase] || BODYWEIGHT_ASSISTANCE_WEEKS[0];
  const totalSets = exercise.isBodyweight ? bodyweightWeek.sets : weightedWeek.sets;
  const prescriptionLabel = exercise.isBodyweight
    ? `${bodyweightWeek.sets} sets`
    : `${weightedWeek.sets}x${weightedWeek.reps}`;
  const log = assistanceLog[exercise.id] || "";
  const hasInput = parseFloat(log || "0") > 0;
  const setsDone = assistanceSetCounts[exercise.id] || 0;
  const allSetsDone = setsDone >= totalSets;
  const isComplete = allSetsDone && hasInput;

  const handleInputChange = (value: string) => {
    setAssistanceLog((prev) => ({
      ...prev,
      [exercise.id]: value,
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

  return (
    <div
      className={cn(
        "rounded-xl px-3.5 py-3 transition-all duration-150",
        isComplete ? "bg-th-gd border border-th-gb" : "bg-th-s1 border border-th-yb",
      )}
    >
      <Button
        onClick={() =>
          setActiveSwapSlot({
            liftId: activeLiftId,
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
          {prescriptionLabel}
        </span>
      </Button>
      <div className="text-xs text-th-t3 mb-2.5">
        {exercise.isBodyweight
          ? "How many reps can you do comfortably for " + totalSets + " sets?"
          : "Same weight all " + totalSets + " sets. Leave 1-2 reps in the tank."}
      </div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-sm font-semibold text-th-t">
          {exercise.isBodyweight ? "Reps:" : "Weight:"}
        </span>
        <WeightInput
          inputId={`acc-${exercise.isBodyweight ? "reps" : "weight"}-${exercise.id}`}
          value={log || ""}
          onChange={handleInputChange}
          align="center"
        />
      </div>
      <AssistanceSetButtons exerciseId={exercise.id} totalSets={totalSets} />
    </div>
  );
};
