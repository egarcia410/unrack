import type { WorkoutState } from "./workout.types";
import { createStore } from "../createStore";

const initialState: WorkoutState = {
  activePhase: 0,
  activeDay: 0,
  checked: {},
  amrapReps: {},
  assistanceLog: {},
  assistanceSetCounts: {},
  restTimer: { visible: false, key: 0, duration: 90, reason: "" },
  workoutStart: null,
};

export const useWorkoutStore = createStore("workout", initialState);

export const resetWorkoutStore = () => {
  useWorkoutStore.setState(useWorkoutStore.getInitialState(), true);
};
