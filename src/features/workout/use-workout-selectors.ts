import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { ASSISTANCE_WEEKS } from "../../constants/exercises";
import {
  getAssistanceForLift,
  isAssistanceDiscovered,
  getAssistancePrescription,
} from "../../lib/exercises";
import { deriveSupplementalSets } from "../../lib/sets";
export { WARMUP_SETS } from "../../lib/sets";

export const useActivePhase = () => {
  const { template } = useProgramStore();
  const { activePhase } = useWorkoutStore();
  return template.phases[activePhase];
};

export const useActiveTrainingMax = () => {
  const { trainingMaxes } = useProgramStore();
  const { activeLiftId } = useWorkoutStore();
  return trainingMaxes[activeLiftId];
};

export const useAccessories = () => {
  const { activeLiftId } = useWorkoutStore();
  const { assistanceSlots, customExercises } = useProgramStore();
  return getAssistanceForLift(activeLiftId, assistanceSlots, customExercises);
};

export const useAccessoryExercise = (exerciseIndex: number) => {
  const accessories = useAccessories();
  return accessories[exerciseIndex];
};

export const useAssistancePrescription = (exerciseIndex: number) => {
  const { activePhase, activeLiftId } = useWorkoutStore();
  const { assistanceMaximums, bodyweightBaselines } = useProgramStore();
  const exercise = useAccessoryExercise(exerciseIndex);
  return getAssistancePrescription(
    exercise,
    activePhase,
    assistanceMaximums,
    bodyweightBaselines,
    activeLiftId,
  );
};

export const useIsExerciseDiscovered = (exerciseIndex: number) => {
  const { assistanceMaximums } = useProgramStore();
  const exercise = useAccessoryExercise(exerciseIndex);
  return isAssistanceDiscovered(exercise, assistanceMaximums);
};

export const useSupplementalSets = () => {
  const { template } = useProgramStore();
  const phase = useActivePhase();
  const { activePhase } = useWorkoutStore();
  return deriveSupplementalSets(template, phase, activePhase);
};

export const useAllAccessoriesDone = () => {
  const accessories = useAccessories();
  const { activePhase, activeLiftId } = useWorkoutStore();
  const { assistanceSetCounts, assistanceLog } = useWorkoutStore();
  const { assistanceMaximums, bodyweightBaselines } = useProgramStore();

  return accessories.every((exercise) => {
    if (!isAssistanceDiscovered(exercise, assistanceMaximums)) {
      const assistanceLogEntry = assistanceLog[exercise.id];
      const assistanceWeek = ASSISTANCE_WEEKS[activePhase] || ASSISTANCE_WEEKS[0];
      return (
        (assistanceSetCounts[exercise.id] || 0) >= assistanceWeek.sets &&
        assistanceLogEntry &&
        parseFloat(assistanceLogEntry.w || "0") > 0
      );
    }
    const prescription = getAssistancePrescription(
      exercise,
      activePhase,
      assistanceMaximums,
      bodyweightBaselines,
      activeLiftId,
    );
    return (assistanceSetCounts[exercise.id] || 0) >= prescription.sets;
  });
};

export const useAccessoryProgress = () => {
  const accessories = useAccessories();
  const { activePhase, activeLiftId } = useWorkoutStore();
  const { assistanceSetCounts } = useWorkoutStore();
  const { assistanceMaximums, bodyweightBaselines } = useProgramStore();

  let done = 0;
  let total = 0;
  accessories.forEach((exercise) => {
    const discovered = isAssistanceDiscovered(exercise, assistanceMaximums);
    const prescription = discovered
      ? getAssistancePrescription(
          exercise,
          activePhase,
          assistanceMaximums,
          bodyweightBaselines,
          activeLiftId,
        )
      : { sets: (ASSISTANCE_WEEKS[activePhase] || ASSISTANCE_WEEKS[0]).sets };
    total += prescription.sets;
    done += assistanceSetCounts[exercise.id] || 0;
  });
  return { done, total };
};
