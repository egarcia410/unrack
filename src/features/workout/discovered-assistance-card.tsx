import { Button } from "@base-ui/react/button";
import { ChevronDown } from "lucide-react";
import {
  useUnit,
  useAssistanceSetCounts,
  useActiveLiftId,
  setActiveSwapSlot,
} from "../../stores/polaris";
import { cn } from "../../lib/cn";
import { AssistanceSetButtons } from "./assistance-set-buttons";
import { useAccessoryExercise, useAssistancePrescription } from "./use-workout-selectors";

type DiscoveredAssistanceCardProps = {
  exerciseIndex: number;
};

export const DiscoveredAssistanceCard = ({ exerciseIndex }: DiscoveredAssistanceCardProps) => {
  const assistanceSetCounts = useAssistanceSetCounts();
  const unit = useUnit();
  const activeLiftId = useActiveLiftId();
  const exercise = useAccessoryExercise(exerciseIndex);
  const prescription = useAssistancePrescription(exerciseIndex);
  const setsDone = assistanceSetCounts[exercise.id] || 0;
  const done = setsDone >= prescription.sets;

  const prescriptionText =
    prescription.type === "bodyweight"
      ? `${prescription.sets}x${prescription.reps}`
      : `${prescription.sets}x${prescription.reps}${prescription.weight > 0 ? " @ " + prescription.weight + " " + unit : ""}`;

  return (
    <div
      className={cn(
        "rounded-xl px-3.5 py-3 transition-all duration-150",
        done ? "bg-th-gd border border-th-gb" : "bg-th-s1 border border-th-b",
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
        className="flex items-center justify-between w-full box-border bg-none border-none p-0 cursor-pointer mb-2.5 min-h-11"
      >
        <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
          <span className="text-base font-semibold text-th-t">{exercise.name}</span>
          <ChevronDown size={12} className="shrink-0 text-th-t4" />
        </div>
        <span className="text-sm font-mono font-semibold text-th-t3 shrink-0 ml-2">
          {prescriptionText}
        </span>
      </Button>
      <AssistanceSetButtons exerciseId={exercise.id} totalSets={prescription.sets} />
    </div>
  );
};
