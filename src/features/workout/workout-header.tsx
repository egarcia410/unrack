import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { TEMPLATES, LIFTS, LIFT_ORDER } from "../../constants/program";
import { BackButton } from "../../components/back-button";
import { Badge } from "../../components/badge";

export const WorkoutHeader = () => {
  const cycle = useProgramStore.cycle();
  const trainingMaxes = useProgramStore.trainingMaxes();
  const oneRepMaxes = useProgramStore.oneRepMaxes();
  const template = useProgramStore.template();

  const activeWeek = useWorkoutStore.activeWeek();
  const activeDay = useWorkoutStore.activeDay();

  const variant = TEMPLATES[template];
  const weekDef = variant.weeks[activeWeek];
  const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
  const lift = LIFTS.find((l) => l.id === liftId)!;
  const trainingMax = trainingMaxes[liftId];

  return (
    <>
      <header className="flex justify-between items-center py-2 pb-4 min-h-11">
        <BackButton />
        <Badge variant="accent">
          C{cycle} {weekDef.title}
        </Badge>
      </header>

      <div className="text-center py-1 pb-5">
        <h1 className="text-3xl font-extrabold my-0.5 tracking-tight">{lift.name}</h1>
        <div className="flex justify-center gap-3.5">
          <span className="text-sm font-mono text-th-a font-semibold">TM {trainingMax}</span>
          <span className="text-sm font-mono text-th-t3">1RM {oneRepMaxes[liftId]}</span>
        </div>
      </div>
    </>
  );
};
