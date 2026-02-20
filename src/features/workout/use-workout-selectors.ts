import { useAppStore, useProgramData } from "../../stores/app-store";
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
  const activeDay = useAppStore.activeDay();
  return LIFT_ORDER[activeDay % LIFT_ORDER.length];
};

export const useActiveVariant = () => {
  const template = useAppStore.template();
  return TEMPLATES[template];
};

export const useActiveWeekDef = () => {
  const variant = useActiveVariant();
  const activeWeek = useAppStore.activeWeek();
  return variant.weeks[activeWeek];
};

export const useActiveTrainingMax = () => {
  const trainingMaxes = useAppStore.trainingMaxes();
  const liftId = useActiveLiftId();
  return trainingMaxes[liftId];
};

export const useIsDeload = () => {
  const activeWeek = useAppStore.activeWeek();
  return activeWeek === 3;
};

export const useAccessories = () => {
  const liftId = useActiveLiftId();
  const programData = useProgramData();
  return getAssistanceForLift(liftId, programData);
};

export const useAccessoryExercise = (exerciseIndex: number) => {
  const accessories = useAccessories();
  return accessories[exerciseIndex];
};

export const useAssistancePrescription = (exerciseIndex: number) => {
  const activeWeek = useAppStore.activeWeek();
  const liftId = useActiveLiftId();
  const programData = useProgramData();
  const exercise = useAccessoryExercise(exerciseIndex);
  return getAssistancePrescription(exercise, activeWeek, programData, liftId);
};

export const useIsExerciseDiscovered = (exerciseIndex: number) => {
  const programData = useProgramData();
  const exercise = useAccessoryExercise(exerciseIndex);
  return isAssistanceDiscovered(exercise, programData);
};

export const useSupplementalSets = () => {
  const variant = useActiveVariant();
  const weekDef = useActiveWeekDef();
  const activeWeek = useAppStore.activeWeek();
  return deriveSupplementalSets(variant, weekDef, activeWeek);
};

export const useAllAccessoriesDone = () => {
  const accessories = useAccessories();
  const activeWeek = useAppStore.activeWeek();
  const liftId = useActiveLiftId();
  const accSets = useAppStore.accSets();
  const accLog = useAppStore.accLog();
  const programData = useProgramData();

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
  const activeWeek = useAppStore.activeWeek();
  const liftId = useActiveLiftId();
  const accSetsState = useAppStore.accSets();
  const programData = useProgramData();

  let done = 0;
  let total = 0;
  accessories.forEach((a) => {
    const disc = isAssistanceDiscovered(a, programData);
    const rx = disc
      ? getAssistancePrescription(a, activeWeek, programData, liftId)
      : { sets: (ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0]).sets };
    total += rx.sets;
    done += accSetsState[a.id] || 0;
  });
  return { done, total };
};
