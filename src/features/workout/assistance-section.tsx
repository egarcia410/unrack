import { Collapsible } from "@base-ui/react/collapsible";
import { useAppStore } from "../../stores/app-store";
import { SectionHeader } from "../../components/section-header";
import { DiscoveredAssistanceCard } from "./discovered-assistance-card";
import { UndiscoveredAssistanceCard } from "./undiscovered-assistance-card";
import { useAccessories, useAllAccessoriesDone } from "./use-workout-selectors";

export const AssistanceSection = () => {
  const assistanceMaximums = useAppStore.assistanceMaximums();
  const accessories = useAccessories();
  const allAccDone = useAllAccessoriesDone();

  return (
    <Collapsible.Root defaultOpen>
      <SectionHeader label="Assistance" done={allAccDone} />
      <Collapsible.Panel>
        <div className="flex flex-col gap-1.5 mb-6">
          {accessories.map((a, index) => {
            const discovered = a.isBodyweight || (assistanceMaximums[a.id] || 0) > 0;
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
