import { Collapsible } from "@base-ui/react/collapsible";
import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { TEMPLATES, LIFT_ORDER } from "../../constants/program";
import { calcWeight } from "../../lib/calc";
import { getAssistanceForLift } from "../../lib/exercises";
import { SectionHeader } from "../../components/section-header";
import { SetRow } from "../../components/set-row";
import { buildSupplementalSets, buildAllSets } from "./workout-utils";

export const SupplementalSection = () => {
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
              onClick={() => onSetCheck(s.key, allSets)}
            />
          ))}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
