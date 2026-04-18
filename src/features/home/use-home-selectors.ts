import { useAssistanceSlots, useCustomExercises } from "../../stores/polaris";
import { LIFT_ORDER } from "../../constants/program";
import { getAssistanceForLift } from "../../lib/exercises";
import type { Exercise } from "../../types";

export const useAllUniqueAccessories = (): Exercise[] => {
  const assistanceSlots = useAssistanceSlots();
  const customExercises = useCustomExercises();
  const seen = new Set<string>();
  const result: Exercise[] = [];
  LIFT_ORDER.forEach((liftId) => {
    getAssistanceForLift(liftId, assistanceSlots, customExercises).forEach((exercise) => {
      if (!seen.has(exercise.id)) {
        seen.add(exercise.id);
        result.push(exercise);
      }
    });
  });
  return result;
};
