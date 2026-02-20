import { Button } from "@base-ui/react/button";
import { ChevronDown } from "lucide-react";
import { useAppStore } from "../../stores/app-store";
import { cn } from "../../lib/cn";
import { AssistanceSetButtons } from "./assistance-set-buttons";
import {
  useActiveLiftId,
  useAccessoryExercise,
  useAssistancePrescription,
} from "./use-workout-selectors";

type DiscoveredAssistanceCardProps = {
  exerciseIndex: number;
};

export const DiscoveredAssistanceCard = ({ exerciseIndex }: DiscoveredAssistanceCardProps) => {
  const accSets = useAppStore.accSets();
  const { tapAccSet, untapAccSet, setSwapSlot } = useAppStore.actions();

  const unit = useAppStore.unit();
  const liftId = useActiveLiftId();
  const exercise = useAccessoryExercise(exerciseIndex);
  const rx = useAssistancePrescription(exerciseIndex);
  const setsDone = accSets[exercise.id] || 0;
  const done = setsDone >= rx.sets;

  const rxText =
    rx.type === "bw"
      ? `${rx.sets}\u00D7${rx.reps}`
      : `${rx.sets}\u00D7${rx.reps}${rx.weight && rx.weight > 0 ? " @ " + rx.weight + " " + unit : ""}`;

  return (
    <div
      className={cn(
        "rounded-xl px-3.5 py-3 transition-all duration-150",
        done ? "bg-th-gd border border-th-gb" : "bg-th-s1 border border-th-b",
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
        className="flex items-center justify-between w-full box-border bg-none border-none p-0 cursor-pointer mb-2.5 min-h-11"
      >
        <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
          <span className="text-base font-semibold text-th-t">{exercise.name}</span>
          <ChevronDown size={12} className="shrink-0 text-th-t4" />
        </div>
        <span className="text-sm font-mono font-semibold text-th-t3 shrink-0 ml-2">{rxText}</span>
      </Button>
      <AssistanceSetButtons
        exerciseId={exercise.id}
        totalSets={rx.sets}
        onTapSet={() => tapAccSet(exercise.id)}
        onUntapSet={() => untapAccSet(exercise.id)}
      />
    </div>
  );
};
