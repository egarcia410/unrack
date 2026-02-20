import { Button } from "@base-ui/react/button";
import { Check } from "lucide-react";
import { useWorkoutStore } from "../../stores/workout-store";
import { cn } from "../../lib/cn";

type AssistanceSetButtonsProps = {
  exerciseId: string;
  totalSets: number;
  onTapSet: () => void;
  onUntapSet: () => void;
};

export const AssistanceSetButtons = ({
  exerciseId,
  totalSets,
  onTapSet,
  onUntapSet,
}: AssistanceSetButtonsProps) => {
  const accSets = useWorkoutStore.accSets();
  const setsDone = accSets[exerciseId] || 0;

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSets }, (_, setIndex) => {
        const filled = setIndex < setsDone;
        const isNext = setIndex === setsDone;
        const isLast = setIndex === setsDone - 1;
        return (
          <Button
            key={setIndex}
            onClick={isNext ? onTapSet : isLast ? onUntapSet : undefined}
            className={cn(
              "w-11 h-11 rounded-lg border-2 flex items-center justify-center transition-all duration-150",
              filled
                ? "border-th-g bg-th-g text-th-inv"
                : isNext
                  ? "border-th-t3 bg-th-s2 text-th-t4"
                  : "border-th-t4 bg-th-s2 text-th-t4",
              isNext || isLast ? "cursor-pointer" : "cursor-default",
              isNext || filled ? "opacity-100" : "opacity-35",
            )}
          >
            {filled && <Check size={13} strokeWidth={3} />}
            {!filled && isNext && (
              <span className="text-sm font-bold font-mono text-th-t3">{setIndex + 1}</span>
            )}
          </Button>
        );
      })}
      <span className="text-xs font-mono text-th-t3 ml-1">
        {setsDone}/{totalSets}
      </span>
    </div>
  );
};
