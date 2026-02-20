import { Button } from "@base-ui/react/button";
import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { EXERCISE_LIB, CATS, CAT_LABELS, CAT_COLORS } from "../../constants/exercises";
import { getAssistancePrescription } from "../../lib/exercises";
import { cn } from "../../lib/cn";
import { Drawer } from "../../components/drawer";

export const SwapExerciseDrawer = () => {
  const swapSlot = useWorkoutStore.swapSlot();
  const activeWeek = useWorkoutStore.activeWeek();
  const { setSwapSlot } = useWorkoutStore.actions();

  const assistanceMaximums = useProgramStore.assistanceMaximums();
  const unit = useProgramStore.unit();
  const { exerciseSwapped } = useProgramStore.actions();

  return (
    <Drawer
      open={!!swapSlot}
      onOpenChange={(open) => {
        if (!open) setSwapSlot(null);
      }}
      title="Swap Exercise"
    >
      {swapSlot &&
        CATS.map((cat) => {
          const catColor = CAT_COLORS[cat as keyof typeof CAT_COLORS];
          const exercises = EXERCISE_LIB.filter((e) => e.category === cat);
          return (
            <div key={cat} className="mb-3">
              <div
                className="text-xs font-bold uppercase tracking-wide px-1 pt-2 pb-1"
                style={{ color: catColor }}
              >
                {CAT_LABELS[cat]}
              </div>
              {exercises.map((e) => {
                const isCurrent = e.id === swapSlot.currentId;
                const hasMax = !e.isBodyweight && (assistanceMaximums?.[e.id] || 0) > 0;
                const prog = useProgramStore.getState();
                const rx = getAssistancePrescription(e, activeWeek, prog, swapSlot.liftId);
                const isNew = !e.isBodyweight && !hasMax;
                return (
                  <Button
                    key={e.id}
                    onClick={() => {
                      if (!isCurrent)
                        exerciseSwapped(swapSlot.liftId, swapSlot.slot, e.id).then(() =>
                          setSwapSlot(null),
                        );
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
                      {e.name}
                    </span>
                    {isCurrent && (
                      <span className="text-xs font-mono font-bold text-th-a">CURRENT</span>
                    )}
                    {!isCurrent && hasMax && (
                      <span className="text-xs font-mono font-bold text-th-pr bg-th-prd px-2.5 py-0.5 rounded-full">
                        {rx.weight} {unit}
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
