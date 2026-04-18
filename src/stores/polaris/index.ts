// Stores (for getState/setState/subscribe in actions and tests)
export { useProgramStore } from "./program/program.store";
export { useWorkoutStore } from "./workout/workout.store";
export { useOverlayStore } from "./overlay/overlay.store";

// Actions — Program
export {
  programCreated,
  programReset,
  templateChanged,
  exerciseSwapped,
  unitToggled,
  trainingMaxPercentChanged,
  oneRepMaxesSaved,
  assistanceMaximumsSaved,
  bodyweightBaselinesSaved,
  workoutFinished,
  phaseAdvanced,
  trainingMaxAdjusted,
} from "./program/program.actions";

// Actions — Workout
export {
  startWorkout,
  onSetCheck,
  setAmrapReps,
  setAssistanceLog,
  incrementAssistanceSet,
  decrementAssistanceSet,
  activateAmrap,
  dismissTimer,
  setChecked,
  activateTimer,
} from "./workout/workout.actions";

// Actions — Overlay
export {
  setShowDeleteConfirm,
  setShowSettings,
  setShowTemplatePicker,
  setActiveCelebration,
  setActiveSwapSlot,
} from "./overlay/overlay.actions";

// Selectors — Program
export {
  useTemplateId,
  useTemplate,
  useUnit,
  useTrainingMaxPercent,
  useTrainingMaxes,
  useOneRepMaxes,
  useCycle,
  usePhase,
  useWorkouts,
  useAssistanceHistory,
  useAssistanceMaximums,
  useBodyweightBaselines,
  useAssistanceSlots,
  useCustomExercises,
  useCreatedAt,
  useCurrentPhase,
  useCurrentPhaseWorkouts,
  hasProgramData,
} from "./program/program.selectors";

// Selectors — Workout
export {
  useActivePhase,
  useActiveDay,
  useChecked,
  useAmrapReps,
  useAssistanceLog,
  useAssistanceSetCounts,
  useRestTimer,
  useWorkoutStart,
  useActiveLiftId,
  useIsDeload,
  hasActiveWorkout,
} from "./workout/workout.selectors";

// Selectors — Overlay
export {
  useShowDeleteConfirm,
  useShowSettings,
  useShowTemplatePicker,
  useActiveCelebration,
  useActiveSwapSlot,
} from "./overlay/overlay.selectors";

// Reset helpers
export { resetProgramStore } from "./program/program.store";
export { resetWorkoutStore } from "./workout/workout.store";
export { resetOverlayStore } from "./overlay/overlay.store";

// Types
export type { ProgramState, AssistanceHistoryEntry } from "./program/program.types";
export type { WorkoutState, RestTimer } from "./workout/workout.types";
export type {
  OverlayState,
  CelebrationState,
  CelebrationDone,
  CelebrationPersonalRecord,
  CelebrationCycleComplete,
  CelebrationWarning,
  SwapSlot,
} from "./overlay/overlay.types";
