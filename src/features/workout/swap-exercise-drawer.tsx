import { Button } from "@base-ui/react/button";
import {
  useAssistanceMaximums,
  useBodyweightBaselines,
  useAssistanceSlots,
  useCustomExercises,
  useUnit,
  exerciseSwapped,
  useActiveSwapSlot,
  setActiveSwapSlot,
  useActivePhase,
} from "../../stores/polaris";
import { EXERCISE_LIB, EXERCISE_CATEGORIES, CAT_LABELS } from "../../constants/exercises";
import { getAssistanceForLift, getAssistancePrescription } from "../../lib/exercises";
import { cn } from "../../lib/cn";
import { Drawer } from "../../components/drawer";

const CATEGORY_TEXT_CLASSES: Record<string, string> = {
  push: "text-th-pr",
  pull: "text-th-a",
  "legs/core": "text-th-y",
};

export const SwapExerciseDrawer = () => {
  const activeSwapSlot = useActiveSwapSlot();
  const activePhase = useActivePhase();
  const assistanceMaximums = useAssistanceMaximums();
  const bodyweightBaselines = useBodyweightBaselines();
  const assistanceSlots = useAssistanceSlots();
  const customExercises = useCustomExercises();
  const unit = useUnit();

  const usedExerciseIds = activeSwapSlot
    ? new Set(
        getAssistanceForLift(activeSwapSlot.liftId, assistanceSlots, customExercises)
          .filter((exercise) => exercise.id !== activeSwapSlot.currentId)
          .map((exercise) => exercise.id),
      )
    : new Set<string>();

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
                const isUsed = usedExerciseIds.has(exercise.id);
                const hasMax =
                  !exercise.isBodyweight && (assistanceMaximums?.[exercise.id] || 0) > 0;
                const hasBaseline =
                  exercise.isBodyweight && (bodyweightBaselines?.[exercise.id] || 0) > 0;
                const prescription = getAssistancePrescription(
                  exercise,
                  activePhase,
                  assistanceMaximums,
                  bodyweightBaselines,
                  activeSwapSlot.liftId,
                );
                const isNew = exercise.isBodyweight ? !hasBaseline : !hasMax;
                return (
                  <Button
                    key={exercise.id}
                    disabled={isUsed}
                    onClick={() => {
                      if (!isCurrent && !isUsed) exerciseSwapped(exercise.id);
                    }}
                    className={cn(
                      "flex items-center w-full box-border px-3 py-2.5 rounded-xl text-left min-h-12 mb-0.5 gap-2.5",
                      isCurrent
                        ? "bg-th-ad border border-th-am cursor-default"
                        : isUsed
                          ? "bg-transparent border border-transparent cursor-default opacity-35"
                          : "bg-transparent border border-transparent cursor-pointer",
                    )}
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        isCurrent
                          ? "bg-th-a"
                          : isUsed
                            ? "bg-th-t4"
                            : isNew
                              ? "bg-th-t4"
                              : "bg-th-g",
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
                    {isUsed && !isCurrent && (
                      <span className="text-xs font-mono text-th-t4">IN USE</span>
                    )}
                    {!isCurrent && !isUsed && hasMax && prescription.type === "weighted" && (
                      <span className="text-xs font-mono font-bold text-th-pr bg-th-prd px-2.5 py-0.5 rounded-full">
                        {prescription.weight} {unit}
                      </span>
                    )}
                    {!isCurrent && !isUsed && hasBaseline && prescription.type === "bodyweight" && (
                      <span className="text-xs font-mono font-bold text-th-pr bg-th-prd px-2.5 py-0.5 rounded-full">
                        {prescription.reps} reps
                      </span>
                    )}
                    {!isCurrent && !isUsed && isNew && (
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
