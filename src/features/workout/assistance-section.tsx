import { Collapsible } from "@base-ui/react/collapsible";
import { useProgramStore } from "../../stores/program-store";
import { SectionHeader } from "../../components/section-header";
import { DiscoveredAssistanceCard } from "./discovered-assistance-card";
import { UndiscoveredAssistanceCard } from "./undiscovered-assistance-card";
import { useAccessories, useAllAccessoriesDone } from "./use-workout-selectors";

export const AssistanceSection = () => {
  const { assistanceMaximums } = useProgramStore();
  const accessories = useAccessories();
  const allAssistanceDone = useAllAccessoriesDone();

  return (
    <Collapsible.Root defaultOpen>
      <SectionHeader label="Assistance" done={allAssistanceDone} />
      <Collapsible.Panel className="overflow-hidden h-(--collapsible-panel-height) transition-[height] duration-200 data-starting-style:h-0 data-ending-style:h-0">
        <div className="flex flex-col gap-1.5 mb-6">
          {accessories.map((exercise, exerciseIndex) => {
            const discovered = exercise.isBodyweight || (assistanceMaximums[exercise.id] || 0) > 0;
            return discovered ? (
              <DiscoveredAssistanceCard key={exercise.id} exerciseIndex={exerciseIndex} />
            ) : (
              <UndiscoveredAssistanceCard key={exercise.id} exerciseIndex={exerciseIndex} />
            );
          })}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
