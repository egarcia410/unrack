import { Collapsible } from "@base-ui/react/collapsible";
import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { SectionHeader } from "../../components/section-header";
import { SetRow } from "../../components/set-row";
import { useSupplementalSets } from "./use-workout-selectors";

export const SupplementalSection = () => {
  const { template } = useProgramStore();
  const { checked } = useWorkoutStore();
  const supplementalSets = useSupplementalSets();

  const allSuppDone = supplementalSets.every((supplementalSet) => checked[supplementalSet.key]);

  if (supplementalSets.length === 0) return null;

  const supplementalLabel =
    template === "bbb" || template === "bbbC" ? "BBB" : template === "fsl" ? "FSL" : "SSL";

  return (
    <Collapsible.Root defaultOpen>
      <SectionHeader
        label="Supplemental"
        done={allSuppDone}
        extra={<span className="text-th-t4">{supplementalLabel}</span>}
      />
      <Collapsible.Panel className="overflow-hidden h-(--collapsible-panel-height) transition-[height] duration-200 data-starting-style:h-0 data-ending-style:h-0">
        <div className="flex flex-col gap-1 mb-6">
          {supplementalSets.map((supplementalSet) => (
            <SetRow
              key={supplementalSet.key}
              setKey={supplementalSet.key}
              reps={supplementalSet.reps}
              percentage={supplementalSet.percentage}
            />
          ))}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
