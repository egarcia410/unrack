import { Field } from "@base-ui/react/field";
import { roundToNearest } from "../lib/calc";
import { useProgramStore } from "../stores/program-store";
import { WeightInput } from "./weight-input";

type LiftInputRowProps = {
  liftId: string;
  liftName: string;
  value: string;
  onChange: (filteredValue: string) => void;
  unit: string;
};

const validateOneRepMax = (value: unknown) => {
  if (typeof value === "number" && (!Number.isInteger(value) || value < 1))
    return "Enter a whole number above zero";
  return null;
};

export const LiftInputRow = ({ liftId, liftName, value, onChange, unit }: LiftInputRowProps) => {
  const trainingMaxPercent = useProgramStore.trainingMaxPercent();
  const parsed = Number(value);
  const trainingMax = parsed >= 1 ? roundToNearest(parsed * (trainingMaxPercent / 100)) : 0;

  return (
    <Field.Root name={liftId} validate={validateOneRepMax}>
      <div className="flex justify-between items-center bg-th-s1 border border-th-b has-[output]:border-th-r transition-colors rounded-xl px-4 py-3 min-h-14">
        <div>
          <Field.Label className="text-sm font-semibold text-th-t">{liftName}</Field.Label>
          <div className="h-4 flex items-center">
            {trainingMax > 0 ? (
              <span className="text-xs text-th-a font-mono">
                TM = {trainingMax} {unit}
              </span>
            ) : (
              <>
                <Field.Error match="valueMissing" className="text-xs text-th-r font-mono">
                  Enter your 1 rep max
                </Field.Error>
                <Field.Error match="customError" className="text-xs text-th-r font-mono">
                  Enter a whole number above zero
                </Field.Error>
              </>
            )}
          </div>
        </div>
        <WeightInput inputId={liftId} value={value} onChange={onChange} unit={unit} required />
      </div>
    </Field.Root>
  );
};
