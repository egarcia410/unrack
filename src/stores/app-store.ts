import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import type { ProgramData } from "../types";
import { createSelectors } from "../lib/create-selectors";
import {
  type ProgramState,
  type ProgramActions,
  programInitialState,
  createProgramActions,
  extractProgramData,
} from "./program-slice";
import {
  type WorkoutState,
  type WorkoutActions,
  workoutInitialState,
  createWorkoutActions,
} from "./workout-slice";

type AppState = ProgramState & WorkoutState;
type AppActions = ProgramActions & WorkoutActions;
export type AppStore = AppState & { actions: AppActions };

export type AppSet = {
  (partial: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>)): void;
};
export type AppGet = () => AppStore;

export const useAppStore = createSelectors(
  create<AppStore>((set, get) => ({
    ...programInitialState,
    ...workoutInitialState,
    actions: {
      ...createProgramActions(set, get),
      ...createWorkoutActions(set, get),
    },
  })),
);

export const getProgramData = (): ProgramData => extractProgramData(useAppStore.getState());

export const useProgramData = (): ProgramData =>
  useAppStore(useShallow((state): ProgramData => extractProgramData(state)));

export const hasProgramData = () => {
  const { timestamp, loading } = useAppStore.getState();
  return !loading && timestamp > 0;
};

export const hasActiveWorkout = () => !!useAppStore.getState().workoutStart;
