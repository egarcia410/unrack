import { Collapsible } from "@base-ui/react/collapsible";
import { useChecked } from "../../stores/polaris";
import { SectionHeader } from "../../components/section-header";
import { SetRow } from "../../components/set-row";
import { WARMUP_SETS } from "./use-workout-selectors";

export const WarmupSection = () => {
  const checked = useChecked();

  const allWarmupDone = WARMUP_SETS.every((_, setIndex) => checked[`w${setIndex}`]);

  return (
    <Collapsible.Root defaultOpen>
      <SectionHeader label="Warm-up" done={allWarmupDone} />
      <Collapsible.Panel className="overflow-hidden h-(--collapsible-panel-height) transition-[height] duration-200 data-starting-style:h-0 data-ending-style:h-0">
        <div className="flex flex-col gap-1 mb-6">
          {WARMUP_SETS.map((warmupSet, setIndex) => {
            const key = `w${setIndex}`;
            return (
              <SetRow
                key={key}
                setKey={key}
                reps={warmupSet.reps}
                percentage={warmupSet.percentage}
              />
            );
          })}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
