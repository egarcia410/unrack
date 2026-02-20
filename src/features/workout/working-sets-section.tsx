import { Collapsible } from "@base-ui/react/collapsible";
import { useAppStore } from "../../stores/app-store";
import { calcWeight } from "../../lib/calc";
import { SectionHeader } from "../../components/section-header";
import { SetRow } from "../../components/set-row";
import { AmrapCard } from "./amrap-card";
import { useActiveTrainingMax, useActiveWeekDef } from "./use-workout-selectors";

export const WorkingSetsSection = () => {
  const unit = useAppStore.unit();
  const trainingMax = useActiveTrainingMax();
  const weekDef = useActiveWeekDef();
  const checked = useAppStore.checked();
  const { onSetCheck } = useAppStore.actions();

  const allMainDone = weekDef.sets.every((_, i) => checked[`m${i}`]);

  return (
    <Collapsible.Root defaultOpen>
      <SectionHeader label="Working Sets" done={allMainDone} />
      <Collapsible.Panel>
        <div className="flex flex-col gap-1 mb-6">
          {weekDef.sets.map((set, i) => {
            const key = `m${i}`;
            const isAmrap = String(set.reps).includes("+");

            if (isAmrap) {
              return <AmrapCard key={key} setIndex={i} />;
            }

            return (
              <SetRow
                key={key}
                done={!!checked[key]}
                weight={calcWeight(trainingMax, set.percentage)}
                unit={unit}
                reps={set.reps}
                pct={set.percentage}
                onClick={() => onSetCheck(key)}
              />
            );
          })}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
