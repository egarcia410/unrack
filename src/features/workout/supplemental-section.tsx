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

  const allSuppDone = supplementalSets.every((s) => checked[s.key]);

  if (supplementalSets.length === 0) return null;

  const suppLabel =
    template === "bbb" || template === "bbbC" ? "BBB" : template === "fsl" ? "FSL" : "SSL";

  return (
    <Collapsible.Root defaultOpen>
      <SectionHeader
        label="Supplemental"
        done={allSuppDone}
        extra={<span className="text-th-t4">{suppLabel}</span>}
      />
      <Collapsible.Panel>
        <div className="flex flex-col gap-1 mb-6">
          {supplementalSets.map((s) => (
            <SetRow key={s.key} setKey={s.key} reps={s.reps} pct={s.percentage} />
          ))}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
