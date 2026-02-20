import { Collapsible } from "@base-ui/react/collapsible";
import { useAppStore } from "../../stores/app-store";
import { calcWeight } from "../../lib/calc";
import { SectionHeader } from "../../components/section-header";
import { SetRow } from "../../components/set-row";
import { useActiveTrainingMax, useSupplementalSets } from "./use-workout-selectors";

export const SupplementalSection = () => {
  const template = useAppStore.template();
  const unit = useAppStore.unit();
  const trainingMax = useActiveTrainingMax();
  const checked = useAppStore.checked();
  const { onSetCheck } = useAppStore.actions();
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
            <SetRow
              key={s.key}
              done={!!checked[s.key]}
              weight={calcWeight(trainingMax, s.percentage)}
              unit={unit}
              reps={s.reps}
              pct={s.percentage}
              onClick={() => onSetCheck(s.key)}
            />
          ))}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
