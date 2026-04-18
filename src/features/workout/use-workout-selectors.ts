import {
  useActivePhase as useActivePhaseNumber,
  useActiveLiftId,
  useAssistanceSetCounts,
  useAssistanceLog,
  useTemplate,
  useTrainingMaxes,
  useAssistanceSlots,
  useCustomExercises,
  useAssistanceMaximums,
  useBodyweightBaselines,
} from "../../stores/polaris";
import { WEIGHTED_ASSISTANCE_WEEKS, BODYWEIGHT_ASSISTANCE_WEEKS } from "../../constants/exercises";
import {
  getAssistanceForLift,
  isAssistanceDiscovered,
  getAssistancePrescription,
} from "../../lib/exercises";
import { deriveSupplementalSets } from "../../lib/sets";
export { WARMUP_SETS } from "../../lib/sets";

export const useActivePhase = () => {
  const template = useTemplate();
  const activePhase = useActivePhaseNumber();
  return template.phases[activePhase];
};

export const useActiveTrainingMax = () => {
  const trainingMaxes = useTrainingMaxes();
  const activeLiftId = useActiveLiftId();
  return trainingMaxes[activeLiftId];
};

export const useAccessories = () => {
  const activeLiftId = useActiveLiftId();
  const assistanceSlots = useAssistanceSlots();
  const customExercises = useCustomExercises();
  return getAssistanceForLift(activeLiftId, assistanceSlots, customExercises);
};

export const useAccessoryExercise = (exerciseIndex: number) => {
  const accessories = useAccessories();
  return accessories[exerciseIndex];
};

export const useAssistancePrescription = (exerciseIndex: number) => {
  const activePhase = useActivePhaseNumber();
  const activeLiftId = useActiveLiftId();
  const assistanceMaximums = useAssistanceMaximums();
  const bodyweightBaselines = useBodyweightBaselines();
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
  const assistanceMaximums = useAssistanceMaximums();
  const bodyweightBaselines = useBodyweightBaselines();
  const exercise = useAccessoryExercise(exerciseIndex);
  return isAssistanceDiscovered(exercise, assistanceMaximums, bodyweightBaselines);
};

export const useSupplementalSets = () => {
  const template = useTemplate();
  const phase = useActivePhase();
  const activePhase = useActivePhaseNumber();
  return deriveSupplementalSets(template, phase, activePhase);
};

export const useAllAccessoriesDone = () => {
  const accessories = useAccessories();
  const activePhase = useActivePhaseNumber();
  const activeLiftId = useActiveLiftId();
  const assistanceSetCounts = useAssistanceSetCounts();
  const assistanceLog = useAssistanceLog();
  const assistanceMaximums = useAssistanceMaximums();
  const bodyweightBaselines = useBodyweightBaselines();

  return accessories.every((exercise) => {
    if (!isAssistanceDiscovered(exercise, assistanceMaximums, bodyweightBaselines)) {
      const assistanceLogEntry = assistanceLog[exercise.id];
      const undiscoveredSets = exercise.isBodyweight
        ? (BODYWEIGHT_ASSISTANCE_WEEKS[activePhase] || BODYWEIGHT_ASSISTANCE_WEEKS[0]).sets
        : (WEIGHTED_ASSISTANCE_WEEKS[activePhase] || WEIGHTED_ASSISTANCE_WEEKS[0]).sets;
      return (
        (assistanceSetCounts[exercise.id] || 0) >= undiscoveredSets &&
        assistanceLogEntry &&
        parseFloat(assistanceLogEntry || "0") > 0
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
  const activePhase = useActivePhaseNumber();
  const activeLiftId = useActiveLiftId();
  const assistanceSetCounts = useAssistanceSetCounts();
  const assistanceMaximums = useAssistanceMaximums();
  const bodyweightBaselines = useBodyweightBaselines();

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
