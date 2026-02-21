import { useProgramStore, extractProgramData } from "../../stores/program-store";
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
    getAssistanceForLift(liftId, prog).forEach((exercise) => {
      if (!seen.has(exercise.id)) {
        seen.add(exercise.id);
        result.push(exercise);
      }
    });
  });
  return result;
};

export const AssistanceEditor = () => {
  const { editAssistance, setEditAssistance, updateEditAssistance } = useUIStore();
  const programState = useProgramStore();
  const { assistanceMaximums, week, assistanceMaximumsSaved } = programState;

  const programData = extractProgramData(programState);
  const allUsedAccs = getAllUsedAccessories(programData);
  const weightedAccs = allUsedAccs.filter((exercise) => !exercise.isBodyweight);

  if (weightedAccs.length === 0) return null;

  return (
    <>
      <SectionLabel className="mb-2">Assistance</SectionLabel>
      <div className={cn("flex flex-col gap-1.5", editAssistance ? "mb-3" : "mb-5")}>
        {weightedAccs.map((exercise) => {
          const workingMax = assistanceMaximums?.[exercise.id] || 0;
          const currentValue = editAssistance
            ? parseFloat(String(editAssistance[exercise.id])) || 0
            : workingMax;
          const phasePercentage = (ASSISTANCE_WEEKS[week] || ASSISTANCE_WEEKS[0]).percentage;
          const phaseWeight = currentValue > 0 ? roundToNearest(currentValue * phasePercentage) : 0;
          return (
            <div
              key={exercise.id}
              className="flex justify-between items-center bg-th-s2 rounded-lg px-3 py-2 min-h-11"
            >
              <div>
                <span className="text-sm font-semibold text-th-t">{exercise.name}</span>
                {phaseWeight > 0 && (
                  <span className="text-xs font-mono text-th-a block">
                    Phase weight: {phaseWeight}
                  </span>
                )}
              </div>
              <WeightInput
                inputId={`assistance-${exercise.id}`}
                value={
                  editAssistance
                    ? String(editAssistance[exercise.id] || "")
                    : String(workingMax || "")
                }
                onChange={(val) => {
                  updateEditAssistance((previousValues) => {
                    const base: Record<string, string | number> = {};
                    weightedAccs.forEach((accessory) => {
                      base[accessory.id] =
                        previousValues?.[accessory.id] !== undefined
                          ? previousValues[accessory.id]
                          : assistanceMaximums?.[accessory.id] || 0;
                    });
                    return { ...base, [exercise.id]: val };
                  });
                }}
              />
            </div>
          );
        })}
      </div>
      {editAssistance && (
        <PrimaryButton
          onClick={() => {
            assistanceMaximumsSaved(editAssistance);
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
