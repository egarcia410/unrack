import { Collapsible } from "@base-ui/react/collapsible";
import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { TEMPLATES, LIFT_ORDER } from "../../constants/program";
import { calcWeight } from "../../lib/calc";
import { getAssistanceForLift } from "../../lib/exercises";
import { SectionHeader } from "../../components/section-header";
import { SetRow } from "../../components/set-row";
import { AmrapCard } from "./amrap-card";
import { buildSupplementalSets, buildAllSets } from "./workout-utils";

export const WorkingSetsSection = () => {
  const template = useProgramStore.template();
  const trainingMaxes = useProgramStore.trainingMaxes();
  const unit = useProgramStore.unit();

  const activeWeek = useWorkoutStore.activeWeek();
  const activeDay = useWorkoutStore.activeDay();
  const checked = useWorkoutStore.checked();
  const { onSetCheck } = useWorkoutStore.actions();

  const variant = TEMPLATES[template];
  const weekDef = variant.weeks[activeWeek];
  const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
  const trainingMax = trainingMaxes[liftId];
  const isDeload = activeWeek === 3;

  const prog = useProgramStore.getState();
  const accessories = getAssistanceForLift(liftId, prog);
  const supplementalSets = buildSupplementalSets(variant, weekDef, activeWeek);
  const allSets = buildAllSets(activeWeek, weekDef, supplementalSets, accessories, isDeload);

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
                onClick={() => onSetCheck(key, allSets)}
              />
            );
          })}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
