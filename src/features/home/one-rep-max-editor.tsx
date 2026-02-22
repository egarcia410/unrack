import { useState } from "react";
import { Form } from "@base-ui/react/form";
import { useProgramStore } from "../../stores/program-store";
import { LIFTS } from "../../constants/program";
import { LiftInputRow } from "../../components/lift-input-row";
import { PrimaryButton } from "../../components/primary-button";
import { SectionLabel } from "../../components/section-label";
import { cn } from "../../lib/cn";

type EditOneRepMaxState = {
  [liftId: string]: string;
};

export const OneRepMaxEditor = () => {
  const [editOneRepMax, setEditOneRepMax] = useState<EditOneRepMaxState | null>(null);
  const { oneRepMaxes, oneRepMaxesSaved } = useProgramStore();

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        if (editOneRepMax) {
          oneRepMaxesSaved(editOneRepMax);
          setEditOneRepMax(null);
        }
      }}
    >
      <SectionLabel className="mb-2">1 Rep Maxes</SectionLabel>
      <div className={cn("flex flex-col gap-1.5", editOneRepMax ? "mb-3" : "mb-5")}>
        {LIFTS.map((lift) => (
          <LiftInputRow
            key={lift.id}
            liftId={lift.id}
            liftName={lift.name}
            value={
              editOneRepMax
                ? (editOneRepMax[lift.id] ?? String(oneRepMaxes[lift.id]))
                : String(oneRepMaxes[lift.id])
            }
            onChange={(val) => {
              setEditOneRepMax((previousValues) => {
                const prev =
                  previousValues ||
                  Object.fromEntries(Object.entries(oneRepMaxes).map(([k, v]) => [k, String(v)]));
                return { ...prev, [lift.id]: val };
              });
            }}
          />
        ))}
      </div>
      {editOneRepMax && (
        <PrimaryButton type="submit" size="small" className="mb-5">
          Save 1RMs
        </PrimaryButton>
      )}
    </Form>
  );
};
