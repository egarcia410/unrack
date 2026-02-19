import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { Form } from "@base-ui/react/form";
import { NumberField } from "@base-ui/react/number-field";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LIFTS } from "../constants/program";
import { calcTM } from "../lib/calc";
import { useProgramActions, useProgramStore, useUnit } from "../stores/program-store";

export const Route = createFileRoute("/setup")({
  beforeLoad: () => {
    const prog = useProgramStore.getState().prog;
    if (prog) throw redirect({ to: "/" });
  },
  component: SetupPage,
});

function validateOneRepMax(value: unknown) {
  if (typeof value === "number" && (!Number.isInteger(value) || value < 1))
    return "Enter a whole number above zero";
  return null;
}

function SetupPage() {
  const { programCreated } = useProgramActions();
  const unit = useUnit();
  const navigate = useNavigate();
  const [oneRepMaxes, setOneRepMaxes] = useState<Record<string, string>>({
    ohp: "",
    deadlift: "",
    bench: "",
    squat: "",
  });

  return (
    <div className="max-w-115 mx-auto px-4 py-3 pb-20">
      <div className="flex flex-col items-center pt-12 pb-8 gap-1.5">
        <div className="text-4xl font-extrabold font-mono text-th-a tracking-wide">unrack</div>
        <p className="text-th-t3 text-sm tracking-wide uppercase m-0">Strength Program</p>
      </div>
      <div className="text-xs font-bold uppercase tracking-widest text-th-t2 mb-2.5">
        Enter Your 1 Rep Maxes
      </div>
      <Form
        onSubmit={async (event) => {
          event.preventDefault();
          await programCreated(oneRepMaxes);
          navigate({ to: "/" });
        }}
      >
        <div className="flex flex-col gap-1.5 mb-6">
          {LIFTS.map((lift) => {
            const inputValue = oneRepMaxes[lift.id];
            const parsed = Number(inputValue);
            const trainingMax = parsed >= 1 ? calcTM(parsed, 90) : 0;
            return (
              <Field.Root key={lift.id} name={lift.id} validate={validateOneRepMax}>
                <div className="flex justify-between items-center bg-th-s1 border border-th-b has-[output]:border-th-r transition-colors rounded-xl px-4 py-3 min-h-14">
                  <div>
                    <Field.Label className="text-sm font-semibold text-th-t">
                      {lift.name}
                    </Field.Label>
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
                  <div className="flex items-center gap-1">
                    <NumberField.Root id={lift.id} min={1} allowOutOfRange required>
                      <NumberField.Input
                        inputMode="numeric"
                        placeholder="0"
                        value={inputValue}
                        onChange={(e) => {
                          if (!/^\d*$/.test(e.target.value)) return;
                          const val = String(parseInt(e.target.value, 10) || "");
                          setOneRepMaxes((prev) => ({
                            ...prev,
                            [lift.id]: val,
                          }));
                        }}
                        className="w-20 px-2 py-2.5 text-lg font-bold text-right bg-th-s2 border border-th-bm rounded-lg text-th-t font-mono outline-none box-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </NumberField.Root>
                    <span className="text-sm text-th-t4 font-mono">{unit}</span>
                  </div>
                </div>
              </Field.Root>
            );
          })}
        </div>
        <Button
          type="submit"
          className="w-full border-none rounded-xl px-6 py-4 text-base font-bold font-sans cursor-pointer flex items-center justify-center gap-2 min-h-13 bg-th-a text-th-inv"
        >
          Start Program
        </Button>
      </Form>
    </div>
  );
}
