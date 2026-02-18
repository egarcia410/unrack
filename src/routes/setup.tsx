import { Field } from "@base-ui/react/field";
import { Form } from "@base-ui/react/form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LIFTS } from "../constants/program";
import { calcTM } from "../lib/calc";
import { useProgramActions, useProgramStore, useUnit } from "../stores/program-store";
import { Button } from "@base-ui/react";

export const Route = createFileRoute("/setup")({
  beforeLoad: () => {
    const prog = useProgramStore.getState().prog;
    if (prog) throw redirect({ to: "/" });
  },
  component: SetupPage,
});

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
        <div className="text-4xl font-extrabold font-mono text-th-a tracking-[0.5px]">unrack</div>
        <p className="text-th-t3 text-[13px] tracking-[.5px] uppercase m-0">Strength Program</p>
      </div>
      <div className="text-[11px] font-bold uppercase tracking-[1px] text-th-t2 mb-2.5">
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
            const trainingMax = parseFloat(inputValue) > 0 ? calcTM(parseFloat(inputValue), 90) : 0;
            return (
              <Field.Root key={lift.id} name={lift.id}>
                <div className="flex justify-between items-center bg-th-s1 border border-th-b rounded-xl px-4 py-3 min-h-14">
                  <div>
                    <Field.Label className="text-[14px] font-semibold text-th-t">
                      {lift.name}
                    </Field.Label>
                    {trainingMax > 0 && (
                      <div className="text-[12px] text-th-a font-mono">
                        TM = {trainingMax} {unit}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Field.Control
                      type="number"
                      inputMode="numeric"
                      required
                      min="1"
                      placeholder="0"
                      value={inputValue}
                      onChange={(e) =>
                        setOneRepMaxes((prev) => ({
                          ...prev,
                          [lift.id]: e.target.value,
                        }))
                      }
                      className="w-20 px-2 py-2.5 text-[18px] font-bold text-right bg-th-s2 border border-th-bm rounded-lg text-th-t font-mono outline-none box-border"
                    />
                    <span className="text-[13px] text-th-t4 font-mono">{unit}</span>
                  </div>
                </div>
                <Field.Error className="text-[12px] text-th-r mt-1 ml-1" />
              </Field.Root>
            );
          })}
        </div>
        <Button
          type="submit"
          className="w-full border-none rounded-xl px-6 py-4 text-[16px] font-bold font-sans cursor-pointer flex items-center justify-center gap-2 min-h-13 bg-th-a text-th-inv"
        >
          Start Program
        </Button>
      </Form>
    </div>
  );
}
