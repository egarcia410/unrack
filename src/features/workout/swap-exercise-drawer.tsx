import { Button } from "@base-ui/react/button";
import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { useOverlayStore } from "../../stores/overlay-store";
import { EXERCISE_LIB, EXERCISE_CATEGORIES, CAT_LABELS } from "../../constants/exercises";
import { getAssistancePrescription } from "../../lib/exercises";
import { cn } from "../../lib/cn";
import { Drawer } from "../../components/drawer";

const CATEGORY_TEXT_CLASSES: Record<string, string> = {
  push: "text-th-pr",
  pull: "text-th-a",
  "legs/core": "text-th-y",
};

export const SwapExerciseDrawer = () => {
  const { activeSwapSlot, setActiveSwapSlot } = useOverlayStore();
  const { activePhase } = useWorkoutStore();
  const { assistanceMaximums, bodyweightBaselines, unit, exerciseSwapped } = useProgramStore();

  return (
    <Drawer
      open={!!activeSwapSlot}
      onOpenChange={(open) => {
        if (!open) setActiveSwapSlot(null);
      }}
      title="Swap Exercise"
    >
      {activeSwapSlot &&
        EXERCISE_CATEGORIES.map((category) => {
          const exercises = EXERCISE_LIB.filter((exercise) => exercise.category === category);
          return (
            <div key={category} className="mb-3">
              <div
                className={cn(
                  "text-xs font-bold uppercase tracking-wide px-1 pt-2 pb-1",
                  CATEGORY_TEXT_CLASSES[category],
                )}
              >
                {CAT_LABELS[category]}
              </div>
              {exercises.map((exercise) => {
                const isCurrent = exercise.id === activeSwapSlot.currentId;
                const hasMax =
                  !exercise.isBodyweight && (assistanceMaximums?.[exercise.id] || 0) > 0;
                const prescription = getAssistancePrescription(
                  exercise,
                  activePhase,
                  assistanceMaximums,
                  bodyweightBaselines,
                  activeSwapSlot.liftId,
                );
                const isNew = !exercise.isBodyweight && !hasMax;
                return (
                  <Button
                    key={exercise.id}
                    onClick={() => {
                      if (!isCurrent) exerciseSwapped(exercise.id);
                    }}
                    className={cn(
                      "flex items-center w-full box-border px-3 py-2.5 rounded-xl text-left min-h-12 mb-0.5 gap-2.5",
                      isCurrent
                        ? "bg-th-ad border border-th-am cursor-default"
                        : "bg-transparent border border-transparent cursor-pointer",
                    )}
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        isCurrent ? "bg-th-a" : isNew ? "bg-th-t4" : "bg-th-g",
                      )}
                    />
                    <span
                      className={cn(
                        "flex-1 text-sm text-th-t",
                        isCurrent ? "font-bold" : "font-medium",
                      )}
                    >
                      {exercise.name}
                    </span>
                    {isCurrent && (
                      <span className="text-xs font-mono font-bold text-th-a">CURRENT</span>
                    )}
                    {!isCurrent && hasMax && (
                      <span className="text-xs font-mono font-bold text-th-pr bg-th-prd px-2.5 py-0.5 rounded-full">
                        {prescription.weight} {unit}
                      </span>
                    )}
                    {!isCurrent && isNew && (
                      <span className="text-xs font-mono text-th-y bg-th-yd px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          );
        })}
    </Drawer>
  );
};
