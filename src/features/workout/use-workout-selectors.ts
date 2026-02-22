import { useProgramStore } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { WEIGHTED_ASSISTANCE_WEEKS, BODYWEIGHT_ASSISTANCE_WEEKS } from "../../constants/exercises";
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
  const { assistanceMaximums, bodyweightBaselines } = useProgramStore();
  const exercise = useAccessoryExercise(exerciseIndex);
  return isAssistanceDiscovered(exercise, assistanceMaximums, bodyweightBaselines);
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
    if (!isAssistanceDiscovered(exercise, assistanceMaximums, bodyweightBaselines)) {
      const assistanceLogEntry = assistanceLog[exercise.id];
      const undiscoveredSets = exercise.isBodyweight
        ? (BODYWEIGHT_ASSISTANCE_WEEKS[activePhase] || BODYWEIGHT_ASSISTANCE_WEEKS[0]).sets
        : (WEIGHTED_ASSISTANCE_WEEKS[activePhase] || WEIGHTED_ASSISTANCE_WEEKS[0]).sets;
      return (
        (assistanceSetCounts[exercise.id] || 0) >= undiscoveredSets &&
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
    const discovered = isAssistanceDiscovered(exercise, assistanceMaximums, bodyweightBaselines);
    const prescription = discovered
      ? getAssistancePrescription(
          exercise,
          activePhase,
          assistanceMaximums,
          bodyweightBaselines,
          activeLiftId,
        )
      : {
          sets: exercise.isBodyweight
            ? (BODYWEIGHT_ASSISTANCE_WEEKS[activePhase] || BODYWEIGHT_ASSISTANCE_WEEKS[0]).sets
            : (WEIGHTED_ASSISTANCE_WEEKS[activePhase] || WEIGHTED_ASSISTANCE_WEEKS[0]).sets,
        };
    total += prescription.sets;
    done += assistanceSetCounts[exercise.id] || 0;
  });
  return { done, total };
};
