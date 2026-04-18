import { useMemo } from "react";
import { TEMPLATES } from "../../../constants/program";
import { useProgramStore } from "./program.store";

// Atomic field hooks
export const useTemplateId = () => useProgramStore((state) => state.templateId);
export const useUnit = () => useProgramStore((state) => state.unit);
export const useTrainingMaxPercent = () => useProgramStore((state) => state.trainingMaxPercent);
export const useTrainingMaxes = () => useProgramStore((state) => state.trainingMaxes);
export const useOneRepMaxes = () => useProgramStore((state) => state.oneRepMaxes);
export const useCycle = () => useProgramStore((state) => state.cycle);
export const usePhase = () => useProgramStore((state) => state.phase);
export const useWorkouts = () => useProgramStore((state) => state.workouts);
export const useAssistanceHistory = () => useProgramStore((state) => state.assistanceHistory);
export const useAssistanceMaximums = () => useProgramStore((state) => state.assistanceMaximums);
export const useBodyweightBaselines = () => useProgramStore((state) => state.bodyweightBaselines);
export const useAssistanceSlots = () => useProgramStore((state) => state.assistanceSlots);
export const useCustomExercises = () => useProgramStore((state) => state.customExercises);
export const useCreatedAt = () => useProgramStore((state) => state.createdAt);

// Derived hooks
export const useTemplate = () => {
  const templateId = useTemplateId();
  return TEMPLATES[templateId];
};

export const useCurrentPhase = () => {
  const templateId = useTemplateId();
  const phase = usePhase();
  return TEMPLATES[templateId].phases[phase];
};

export const useCurrentPhaseWorkouts = () => {
  const workouts = useWorkouts();
  const cycle = useCycle();
  const phase = usePhase();
  return useMemo(
    () => workouts.filter((workout) => workout.cycle === cycle && workout.phase === phase),
    [workouts, cycle, phase],
  );
};

// Static selector
export const hasProgramData = () => useProgramStore.getState().createdAt > 0;
