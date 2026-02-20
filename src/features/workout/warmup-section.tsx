import { Collapsible } from "@base-ui/react/collapsible";
import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { TEMPLATES, LIFT_ORDER } from "../../constants/program";
import { calcWeight } from "../../lib/calc";
import { getAssistanceForLift } from "../../lib/exercises";
import { SectionHeader } from "../../components/section-header";
import { SetRow } from "../../components/set-row";
import { WARMUP_SETS, buildSupplementalSets, buildAllSets } from "./workout-utils";

export const WarmupSection = () => {
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
                onClick={() => onSetCheck(key, allSets)}
              />
            );
          })}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
