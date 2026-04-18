import { useState } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import {
  useAssistanceMaximums,
  useBodyweightBaselines,
  usePhase,
  assistanceMaximumsSaved,
  bodyweightBaselinesSaved,
} from "../../stores/polaris";
import { WEIGHTED_ASSISTANCE_WEEKS, BODYWEIGHT_ASSISTANCE_WEEKS } from "../../constants/exercises";
import { roundToNearest } from "../../lib/calc";
import { WeightInput } from "../../components/weight-input";
import { PrimaryButton } from "../../components/primary-button";
import { SectionHeader } from "../../components/section-header";
import { useAllUniqueAccessories } from "./use-home-selectors";

type EditAssistanceState = {
  [accId: string]: string | number;
};

export const AssistanceEditor = () => {
  const [expanded, setExpanded] = useState(false);
  const [editState, setEditState] = useState<EditAssistanceState | null>(null);
  const assistanceMaximums = useAssistanceMaximums();
  const bodyweightBaselines = useBodyweightBaselines();
  const phase = usePhase();

  const allAccessories = useAllUniqueAccessories();

  if (allAccessories.length === 0) return null;

  const weightedExercises = allAccessories.filter((exercise) => !exercise.isBodyweight);
  const bodyweightExercises = allAccessories.filter((exercise) => exercise.isBodyweight);

  const handleChange = (exerciseId: string, value: string) => {
    setEditState((previous) => {
      const base: Record<string, string | number> = {};
      allAccessories.forEach((accessory) => {
        const stored = accessory.isBodyweight
          ? bodyweightBaselines?.[accessory.id] || 0
          : assistanceMaximums?.[accessory.id] || 0;
        base[accessory.id] =
          previous?.[accessory.id] !== undefined ? previous[accessory.id] : stored;
      });
      return { ...base, [exerciseId]: value };
    });
  };

  const handleSave = () => {
    if (!editState) return;

    const weightedEdits: Record<string, string | number> = {};
    const bodyweightEdits: Record<string, string | number> = {};

    allAccessories.forEach((exercise) => {
      if (editState[exercise.id] !== undefined) {
        if (exercise.isBodyweight) {
          bodyweightEdits[exercise.id] = editState[exercise.id];
        } else {
          weightedEdits[exercise.id] = editState[exercise.id];
        }
      }
    });

    if (Object.keys(weightedEdits).length > 0) assistanceMaximumsSaved(weightedEdits);
    if (Object.keys(bodyweightEdits).length > 0) bodyweightBaselinesSaved(bodyweightEdits);
    setEditState(null);
  };

  const phasePercentage = (WEIGHTED_ASSISTANCE_WEEKS[phase] || WEIGHTED_ASSISTANCE_WEEKS[0])
    .percentage;
  const phaseMultiplier = (BODYWEIGHT_ASSISTANCE_WEEKS[phase] || BODYWEIGHT_ASSISTANCE_WEEKS[0])
    .multiplier;

  return (
    <Collapsible.Root open={expanded} onOpenChange={setExpanded}>
      <SectionHeader label="Assistance" />
      <Collapsible.Panel className="overflow-hidden h-(--collapsible-panel-height) transition-[height] duration-200 data-starting-style:h-0 data-ending-style:h-0">
        <div className={editState ? "mb-3" : "mb-5"}>
          {weightedExercises.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-widest mb-1.5 text-th-t2">
                Weighted
              </p>
              <div className="flex flex-col gap-1.5">
                {weightedExercises.map((exercise) => {
                  const workingMax = assistanceMaximums?.[exercise.id] || 0;
                  const currentValue = editState
                    ? parseFloat(String(editState[exercise.id])) || 0
                    : workingMax;
                  const phaseWeight =
                    currentValue > 0 ? roundToNearest(currentValue * phasePercentage) : 0;
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
                          editState
                            ? String(editState[exercise.id] || "")
                            : String(workingMax || "")
                        }
                        onChange={(val) => handleChange(exercise.id, val)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {bodyweightExercises.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1.5 text-th-t2">
                Bodyweight
              </p>
              <div className="flex flex-col gap-1.5">
                {bodyweightExercises.map((exercise) => {
                  const baseline = bodyweightBaselines?.[exercise.id] || 0;
                  const currentValue = editState
                    ? parseInt(String(editState[exercise.id])) || 0
                    : baseline;
                  const phaseReps =
                    currentValue > 0 ? Math.max(1, Math.round(currentValue * phaseMultiplier)) : 0;
                  return (
                    <div
                      key={exercise.id}
                      className="flex justify-between items-center bg-th-s2 rounded-lg px-3 py-2 min-h-11"
                    >
                      <div>
                        <span className="text-sm font-semibold text-th-t">{exercise.name}</span>
                        {phaseReps > 0 && (
                          <span className="text-xs font-mono text-th-a block">
                            Phase reps: {phaseReps}
                          </span>
                        )}
                      </div>
                      <WeightInput
                        inputId={`assistance-${exercise.id}`}
                        suffix="reps"
                        value={
                          editState ? String(editState[exercise.id] || "") : String(baseline || "")
                        }
                        onChange={(val) => handleChange(exercise.id, val)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {editState && (
          <PrimaryButton onClick={handleSave} size="small" className="mb-5">
            Save Assistance
          </PrimaryButton>
        )}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
