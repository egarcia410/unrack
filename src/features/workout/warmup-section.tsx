import { Collapsible } from "@base-ui/react/collapsible";
import { useWorkoutStore } from "../../stores/workout-store";
import { SectionHeader } from "../../components/section-header";
import { SetRow } from "../../components/set-row";
import { WARMUP_SETS } from "./use-workout-selectors";

export const WarmupSection = () => {
  const { checked } = useWorkoutStore();

  const allWarmupDone = WARMUP_SETS.every((_, setIndex) => checked[`w${setIndex}`]);

  return (
    <Collapsible.Root defaultOpen>
      <SectionHeader label="Warm-up" done={allWarmupDone} />
      <Collapsible.Panel>
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
