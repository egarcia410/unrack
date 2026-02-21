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
  const { accSets, accLog } = useWorkoutStore();
  const programState = useProgramStore();
  const programData = extractProgramData(programState);

  return accessories.every((a) => {
    if (!isAssistanceDiscovered(a, programData)) {
      const log = accLog[a.id];
      const weekRx = ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0];
      return (accSets[a.id] || 0) >= weekRx.sets && log && parseFloat(log.w || "0") > 0;
    }
    const rx = getAssistancePrescription(a, activeWeek, programData, liftId);
    return (accSets[a.id] || 0) >= rx.sets;
  });
};

export const useAccessoryProgress = () => {
  const accessories = useAccessories();
  const { activeWeek } = useWorkoutStore();
  const liftId = useActiveLiftId();
  const { accSets } = useWorkoutStore();
  const programState = useProgramStore();
  const programData = extractProgramData(programState);

  let done = 0;
  let total = 0;
  accessories.forEach((a) => {
    const disc = isAssistanceDiscovered(a, programData);
    const rx = disc
      ? getAssistancePrescription(a, activeWeek, programData, liftId)
      : { sets: (ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0]).sets };
    total += rx.sets;
    done += accSets[a.id] || 0;
  });
  return { done, total };
};
