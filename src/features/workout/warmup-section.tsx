import { Collapsible } from "@base-ui/react/collapsible";
import { useAppStore } from "../../stores/app-store";
import { calcWeight } from "../../lib/calc";
import { SectionHeader } from "../../components/section-header";
import { SetRow } from "../../components/set-row";
import { WARMUP_SETS, useActiveTrainingMax } from "./use-workout-selectors";

export const WarmupSection = () => {
  const unit = useAppStore.unit();
  const trainingMax = useActiveTrainingMax();
  const checked = useAppStore.checked();
  const { onSetCheck } = useAppStore.actions();

  const allWarmupDone = WARMUP_SETS.every((_, i) => checked[`w${i}`]);

  return (
    <Collapsible.Root defaultOpen>
      <SectionHeader label="Warm-up" done={allWarmupDone} />
      <Collapsible.Panel>
        <div className="flex flex-col gap-1 mb-6">
          {WARMUP_SETS.map((w, i) => {
            const key = `w${i}`;
            return (
              <SetRow
                key={key}
                done={!!checked[key]}
                weight={calcWeight(trainingMax, w.percentage)}
                unit={unit}
                reps={w.reps}
                pct={w.percentage}
                onClick={() => onSetCheck(key)}
              />
            );
          })}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
