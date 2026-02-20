import { Collapsible } from "@base-ui/react/collapsible";
import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { LIFT_ORDER } from "../../constants/program";
import { ASSISTANCE_WEEKS } from "../../constants/exercises";
import {
  getAssistanceForLift,
  isAssistanceDiscovered,
  getAssistancePrescription,
} from "../../lib/exercises";
import { SectionHeader } from "../../components/section-header";
import { DiscoveredAssistanceCard } from "./discovered-assistance-card";
import { UndiscoveredAssistanceCard } from "./undiscovered-assistance-card";

export const AssistanceSection = () => {
  const activeWeek = useWorkoutStore.activeWeek();
  const activeDay = useWorkoutStore.activeDay();
  const accSets = useWorkoutStore.accSets();
  const accLog = useWorkoutStore.accLog();

  const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
  const prog = useProgramStore.getState();
  const accessories = getAssistanceForLift(liftId, prog);

  const allAccDone = accessories.every((a) => {
    if (!isAssistanceDiscovered(a, prog)) {
      const log = accLog[a.id];
      const weekRx = ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0];
      return (accSets[a.id] || 0) >= weekRx.sets && log && parseFloat(log.w || "0") > 0;
    }
    const rx = getAssistancePrescription(a, activeWeek, prog, liftId);
    return (accSets[a.id] || 0) >= rx.sets;
  });

  return (
    <Collapsible.Root defaultOpen>
      <SectionHeader label="Assistance" done={allAccDone} />
      <Collapsible.Panel>
        <div className="flex flex-col gap-1.5 mb-6">
          {accessories.map((a, index) => {
            const discovered = isAssistanceDiscovered(a, prog);
            return discovered ? (
              <DiscoveredAssistanceCard key={a.id} exerciseIndex={index} />
            ) : (
              <UndiscoveredAssistanceCard key={a.id} exerciseIndex={index} />
            );
          })}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
