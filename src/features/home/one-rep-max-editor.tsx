import { Form } from "@base-ui/react/form";
import { useProgramStore } from "../../stores/program-store";
import { useUIStore } from "../../stores/ui-store";
import { LIFTS } from "../../constants/program";
import { LiftInputRow } from "../../components/lift-input-row";
import { PrimaryButton } from "../../components/primary-button";
import { SectionLabel } from "../../components/section-label";
import { cn } from "../../lib/cn";

export const OneRepMaxEditor = () => {
  const editOneRepMax = useUIStore.editOneRepMax();
  const { setEditOneRepMax, updateEditOneRepMax } = useUIStore.actions();
  const oneRepMaxes = useProgramStore.oneRepMaxes();
  const unit = useProgramStore.unit();
  const { oneRepMaxesSaved } = useProgramStore.actions();

  return (
    <Form
      onSubmit={async (event) => {
        event.preventDefault();
        if (editOneRepMax) {
          await oneRepMaxesSaved(editOneRepMax);
          setEditOneRepMax(null);
        }
      }}
    >
      <SectionLabel className="mb-2">1 Rep Maxes</SectionLabel>
      <div className={cn("flex flex-col gap-1.5", editOneRepMax ? "mb-3" : "mb-5")}>
        {LIFTS.map((l) => (
          <LiftInputRow
            key={l.id}
            liftId={l.id}
            liftName={l.name}
            value={
              editOneRepMax
                ? (editOneRepMax[l.id] ?? String(oneRepMaxes[l.id]))
                : String(oneRepMaxes[l.id])
            }
            onChange={(val) => {
              updateEditOneRepMax((p) => {
                const prev =
                  p ||
                  Object.fromEntries(Object.entries(oneRepMaxes).map(([k, v]) => [k, String(v)]));
                return { ...prev, [l.id]: val };
              });
            }}
            unit={unit}
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
