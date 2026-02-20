import { useAppStore } from "../../stores/app-store";
import { useUIStore } from "../../stores/ui-store";
import { LIFT_ORDER } from "../../constants/program";
import { ASSISTANCE_WEEKS } from "../../constants/exercises";
import { roundToNearest } from "../../lib/calc";
import { getAssistanceForLift } from "../../lib/exercises";
import { WeightInput } from "../../components/weight-input";
import { PrimaryButton } from "../../components/primary-button";
import { SectionLabel } from "../../components/section-label";
import { cn } from "../../lib/cn";
import type { Exercise } from "../../types";

const getAllUsedAccessories = (prog: Parameters<typeof getAssistanceForLift>[1]) => {
  const seen = new Set<string>();
  const result: Exercise[] = [];
  LIFT_ORDER.forEach((liftId) => {
    getAssistanceForLift(liftId, prog).forEach((a) => {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        result.push(a);
      }
    });
  });
  return result;
};

export const AssistanceEditor = () => {
  const editAssistance = useUIStore.editAssistance();
  const { setEditAssistance, updateEditAssistance } = useUIStore.actions();
  const assistanceMaximums = useAppStore.assistanceMaximums();
  const unit = useAppStore.unit();
  const week = useAppStore.week();
  const { assistanceMaximumsSaved } = useAppStore.actions();

  const prog = useAppStore();
  const allUsedAccs = getAllUsedAccessories(prog);
  const weightedAccs = allUsedAccs.filter((a) => !a.isBodyweight);

  if (weightedAccs.length === 0) return null;

  return (
    <>
      <SectionLabel className="mb-2">Assistance</SectionLabel>
      <div className={cn("flex flex-col gap-1.5", editAssistance ? "mb-3" : "mb-5")}>
        {weightedAccs.map((a) => {
          const workingMax = assistanceMaximums?.[a.id] || 0;
          const currentValue = editAssistance
            ? parseFloat(String(editAssistance[a.id])) || 0
            : workingMax;
          const phasePercentage = (ASSISTANCE_WEEKS[week] || ASSISTANCE_WEEKS[0]).percentage;
          const phaseWeight = currentValue > 0 ? roundToNearest(currentValue * phasePercentage) : 0;
          return (
            <div
              key={a.id}
              className="flex justify-between items-center bg-th-s2 rounded-lg px-3 py-2 min-h-11"
            >
              <div>
                <span className="text-sm font-semibold text-th-t">{a.name}</span>
                {phaseWeight > 0 && (
                  <span className="text-xs font-mono text-th-a block">
                    Phase weight: {phaseWeight}
                  </span>
                )}
              </div>
              <WeightInput
                inputId={`assistance-${a.id}`}
                value={
                  editAssistance ? String(editAssistance[a.id] || "") : String(workingMax || "")
                }
                onChange={(val) => {
                  updateEditAssistance((p) => {
                    const base: Record<string, string | number> = {};
                    weightedAccs.forEach((x) => {
                      base[x.id] =
                        p?.[x.id] !== undefined ? p[x.id] : assistanceMaximums?.[x.id] || 0;
                    });
                    return { ...base, [a.id]: val };
                  });
                }}
                unit={unit}
              />
            </div>
          );
        })}
      </div>
      {editAssistance && (
        <PrimaryButton
          onClick={async () => {
            await assistanceMaximumsSaved(editAssistance);
            setEditAssistance(null);
          }}
          size="small"
          className="mb-5"
        >
          Save Assistance
        </PrimaryButton>
      )}
    </>
  );
};
