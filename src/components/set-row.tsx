import { Button } from "@base-ui/react/button";
import { Check } from "lucide-react";
import { cva } from "class-variance-authority";
import { useUnit, useChecked, onSetCheck } from "../stores/polaris";
import { useActiveTrainingMax } from "../features/workout/use-workout-selectors";
import { calcWeight } from "../lib/calc";
import { cn } from "../lib/cn";

const setRowVariants = cva(
  "grid grid-cols-[28px_1fr_auto_42px] items-center gap-2 px-3.5 py-3 rounded-xl cursor-pointer font-sans text-left w-full box-border transition-all duration-150 min-h-13 border",
  {
    variants: {
      done: {
        true: "bg-th-gd border-th-gb",
        false: "bg-th-s1 border-th-b",
      },
    },
    defaultVariants: { done: false },
  },
);

const checkboxVariants = cva("w-6 h-6 rounded-md border-2 flex items-center justify-center", {
  variants: {
    done: {
      true: "border-th-g bg-th-g text-th-inv",
      false: "border-th-t4 bg-transparent text-transparent",
    },
  },
  defaultVariants: { done: false },
});

type SetRowProps = {
  setKey: string;
  reps: number | string;
  percentage: number;
};

export const SetRow = ({ setKey, reps, percentage }: SetRowProps) => {
  const unit = useUnit();
  const trainingMax = useActiveTrainingMax();
  const checked = useChecked();

  const done = !!checked[setKey];
  const weight = calcWeight(trainingMax, percentage);

  return (
    <Button onClick={() => onSetCheck(setKey)} className={cn(setRowVariants({ done }))}>
      <div className={cn(checkboxVariants({ done }))}>
        {done && <Check size={13} strokeWidth={3} />}
      </div>
      <span className="text-base font-bold font-mono text-th-t">
        {weight} <span className="text-xs text-th-t4">{unit}</span>
      </span>
      <span className="text-sm font-mono text-th-t3">x{reps}</span>
      <span className="text-xs font-mono text-th-t4 text-right">
        {Math.round(percentage * 100)}%
      </span>
    </Button>
  );
};
