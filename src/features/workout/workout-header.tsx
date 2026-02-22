import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { LIFTS } from "../../constants/program";
import { BackButton } from "../../components/back-button";
import { Badge } from "../../components/badge";

export const WorkoutHeader = () => {
  const { cycle, trainingMaxes, oneRepMaxes, template } = useProgramStore();
  const { activePhase, activeLiftId } = useWorkoutStore();

  const phase = template.phases[activePhase];
  const lift = LIFTS.find((l) => l.id === activeLiftId)!;
  const trainingMax = trainingMaxes[activeLiftId];

  return (
    <>
      <header className="flex justify-between items-center py-2 pb-4 min-h-11">
        <BackButton />
        <Badge variant="accent">
          C{cycle} {phase.title}
        </Badge>
      </header>

      <div className="text-center py-1 pb-5">
        <h1 className="text-3xl font-extrabold my-0.5 tracking-tight">{lift.name}</h1>
        <div className="flex justify-center gap-3.5">
          <span className="text-sm font-mono text-th-a font-semibold">TM {trainingMax}</span>
          <span className="text-sm font-mono text-th-t3">1RM {oneRepMaxes[activeLiftId]}</span>
        </div>
      </div>
    </>
  );
};
