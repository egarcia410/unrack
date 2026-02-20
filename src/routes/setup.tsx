import { Form } from "@base-ui/react/form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LIFTS } from "../constants/program";
import { LiftInputRow } from "../components/lift-input-row";
import { PrimaryButton } from "../components/primary-button";
import { useAppStore, hasProgramData } from "../stores/app-store";

const SetupPage = () => {
  const { programCreated } = useAppStore.actions();
  const unit = useAppStore.unit();
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
        onSubmit={(event) => {
          event.preventDefault();
          programCreated(oneRepMaxes);
          navigate({ to: "/" });
        }}
      >
        <div className="flex flex-col gap-1.5 mb-6">
          {LIFTS.map((lift) => (
            <LiftInputRow
              key={lift.id}
              liftId={lift.id}
              liftName={lift.name}
              value={oneRepMaxes[lift.id]}
              onChange={(val) => setOneRepMaxes((prev) => ({ ...prev, [lift.id]: val }))}
              unit={unit}
            />
          ))}
        </div>
        <PrimaryButton type="submit">Start Program</PrimaryButton>
      </Form>
    </div>
  );
};

export const Route = createFileRoute("/setup")({
  beforeLoad: () => {
    if (hasProgramData()) throw redirect({ to: "/" });
  },
  component: SetupPage,
});
