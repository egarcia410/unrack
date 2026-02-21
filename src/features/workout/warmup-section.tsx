import { Collapsible } from "@base-ui/react/collapsible";
import { useWorkoutStore } from "../../stores/workout-store";
import { SectionHeader } from "../../components/section-header";
import { SetRow } from "../../components/set-row";
import { WARMUP_SETS } from "./use-workout-selectors";

export const WarmupSection = () => {
  const { checked } = useWorkoutStore();

  const allWarmupDone = WARMUP_SETS.every((_, i) => checked[`w${i}`]);

  return (
    <Collapsible.Root defaultOpen>
      <SectionHeader label="Warm-up" done={allWarmupDone} />
      <Collapsible.Panel>
        <div className="flex flex-col gap-1 mb-6">
          {WARMUP_SETS.map((w, i) => {
            const key = `w${i}`;
            return <SetRow key={key} setKey={key} reps={w.reps} pct={w.percentage} />;
          })}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
