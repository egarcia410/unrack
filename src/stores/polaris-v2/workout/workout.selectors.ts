import { LIFT_ORDER } from "../../../constants/program";
import { useWorkoutStore } from "./workout.store";

// Atomic field hooks
export const useActivePhase = () => useWorkoutStore((state) => state.activePhase);
export const useActiveDay = () => useWorkoutStore((state) => state.activeDay);
export const useChecked = () => useWorkoutStore((state) => state.checked);
export const useAmrapReps = () => useWorkoutStore((state) => state.amrapReps);
export const useAssistanceLog = () => useWorkoutStore((state) => state.assistanceLog);
export const useAssistanceSetCounts = () => useWorkoutStore((state) => state.assistanceSetCounts);
export const useRestTimer = () => useWorkoutStore((state) => state.restTimer);
export const useWorkoutStart = () => useWorkoutStore((state) => state.workoutStart);

// Derived hooks
export const useActiveLiftId = () => {
  const activeDay = useActiveDay();
  return LIFT_ORDER[activeDay % LIFT_ORDER.length];
};

export const useIsDeload = () => {
  const activePhase = useActivePhase();
  return activePhase === 3;
};

// Static selector
export const hasActiveWorkout = () => !!useWorkoutStore.getState().workoutStart;
