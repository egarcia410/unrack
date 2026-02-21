import { useProgramStore, extractProgramData } from "../../stores/program-store";
import { useWorkoutStore } from "../../stores/workout-store";
import { TEMPLATES, LIFT_ORDER } from "../../constants/program";
import { ASSISTANCE_WEEKS } from "../../constants/exercises";
import {
  getAssistanceForLift,
  isAssistanceDiscovered,
  getAssistancePrescription,
} from "../../lib/exercises";
import { deriveSupplementalSets } from "../../lib/sets";
export { WARMUP_SETS } from "../../lib/sets";

export const useActiveLiftId = () => {
  const { activeDay } = useWorkoutStore();
  return LIFT_ORDER[activeDay % LIFT_ORDER.length];
};

export const useActiveVariant = () => {
  const { template } = useProgramStore();
  return TEMPLATES[template];
};

export const useActiveWeekDef = () => {
  const variant = useActiveVariant();
  const { activeWeek } = useWorkoutStore();
  return variant.weeks[activeWeek];
};

export const useActiveTrainingMax = () => {
  const { trainingMaxes } = useProgramStore();
  const liftId = useActiveLiftId();
  return trainingMaxes[liftId];
};

export const useIsDeload = () => {
  const { activeWeek } = useWorkoutStore();
  return activeWeek === 3;
};

export const useAccessories = () => {
  const liftId = useActiveLiftId();
  const programState = useProgramStore();
  const programData = extractProgramData(programState);
  return getAssistanceForLift(liftId, programData);
};

export const useAccessoryExercise = (exerciseIndex: number) => {
  const accessories = useAccessories();
  return accessories[exerciseIndex];
};

export const useAssistancePrescription = (exerciseIndex: number) => {
  const { activeWeek } = useWorkoutStore();
  const liftId = useActiveLiftId();
  const programState = useProgramStore();
  const programData = extractProgramData(programState);
  const exercise = useAccessoryExercise(exerciseIndex);
  return getAssistancePrescription(exercise, activeWeek, programData, liftId);
};

export const useIsExerciseDiscovered = (exerciseIndex: number) => {
  const programState = useProgramStore();
  const programData = extractProgramData(programState);
  const exercise = useAccessoryExercise(exerciseIndex);
  return isAssistanceDiscovered(exercise, programData);
};

export const useSupplementalSets = () => {
  const variant = useActiveVariant();
  const weekDef = useActiveWeekDef();
  const { activeWeek } = useWorkoutStore();
  return deriveSupplementalSets(variant, weekDef, activeWeek);
};

export const useAllAccessoriesDone = () => {
  const accessories = useAccessories();
  const { activeWeek } = useWorkoutStore();
  const liftId = useActiveLiftId();
  const { assistanceSetCounts, assistanceLog } = useWorkoutStore();
  const programState = useProgramStore();
  const programData = extractProgramData(programState);

  return accessories.every((exercise) => {
    if (!isAssistanceDiscovered(exercise, programData)) {
      const assistanceLogEntry = assistanceLog[exercise.id];
      const assistanceWeek = ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0];
      return (
        (assistanceSetCounts[exercise.id] || 0) >= assistanceWeek.sets &&
        assistanceLogEntry &&
        parseFloat(assistanceLogEntry.w || "0") > 0
      );
    }
    const prescription = getAssistancePrescription(exercise, activeWeek, programData, liftId);
    return (assistanceSetCounts[exercise.id] || 0) >= prescription.sets;
  });
};

export const useAccessoryProgress = () => {
  const accessories = useAccessories();
  const { activeWeek } = useWorkoutStore();
  const liftId = useActiveLiftId();
  const { assistanceSetCounts } = useWorkoutStore();
  const programState = useProgramStore();
  const programData = extractProgramData(programState);

  let done = 0;
  let total = 0;
  accessories.forEach((exercise) => {
    const isDiscovered = isAssistanceDiscovered(exercise, programData);
    const prescription = isDiscovered
      ? getAssistancePrescription(exercise, activeWeek, programData, liftId)
      : { sets: (ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0]).sets };
    total += prescription.sets;
    done += assistanceSetCounts[exercise.id] || 0;
  });
  return { done, total };
};
