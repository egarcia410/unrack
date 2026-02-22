import { Collapsible } from "@base-ui/react/collapsible";
import { useWorkoutStore } from "../../stores/workout-store";
import { SectionHeader } from "../../components/section-header";
import { SetRow } from "../../components/set-row";
import { AmrapCard } from "./amrap-card";
import { useActiveWeekDef } from "./use-workout-selectors";

export const WorkingSetsSection = () => {
  const weekDef = useActiveWeekDef();
  const { checked } = useWorkoutStore();

  const allMainDone = weekDef.sets.every((_, setIndex) => checked[`m${setIndex}`]);

  return (
    <Collapsible.Root defaultOpen>
      <SectionHeader label="Working Sets" done={allMainDone} />
      <Collapsible.Panel className="overflow-hidden h-(--collapsible-panel-height) transition-[height] duration-200 data-starting-style:h-0 data-ending-style:h-0">
        <div className="flex flex-col gap-1 mb-6">
          {weekDef.sets.map((set, i) => {
            const key = `m${i}`;
            const isAmrap = String(set.reps).includes("+");

            if (isAmrap) {
              return <AmrapCard key={key} setIndex={i} />;
            }

            return <SetRow key={key} setKey={key} reps={set.reps} percentage={set.percentage} />;
          })}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
