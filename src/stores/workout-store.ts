import { create } from "zustand";
import type { RestInfo, SwapSlot, SetType, WorkoutSection } from "../types";
import { smartRest } from "../lib/calc";
import { createSelectors } from "../lib/create-selectors";

type WorkoutState = {
  activeWeek: number;
  activeDay: number;
  checked: Record<string, boolean>;
  amrapReps: Record<string, string>;
  accLog: Record<string, { w?: string }>;
  accSets: Record<string, number>;
  collapsed: Partial<Record<WorkoutSection, boolean>>;
  timerKey: number;
  showTimer: boolean;
  timerInfo: RestInfo;
  swapSlot: SwapSlot | null;
  workoutStart: number | null;
};

type WorkoutActions = {
  startWorkout: (week: number, day: number) => void;
  onSetCheck: (
    key: string,
    allSets: Array<{
      key: string;
      type: SetType;
      intensity: number;
      isDeload: boolean;
    }>,
  ) => void;
  setAmrapReps: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  toggleCollapse: (section: WorkoutSection) => void;
  setAccLog: (
    updater: (prev: Record<string, { w?: string }>) => Record<string, { w?: string }>,
  ) => void;
  tapAccSet: (
    accId: string,
    maxSets: number,
    setType: SetType,
    pct: number,
    isDeload: boolean,
  ) => void;
  untapAccSet: (accId: string, maxSets: number) => void;
  dismissTimer: () => void;
  setSwapSlot: (slot: SwapSlot | null) => void;
  setChecked: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  activateTimer: (setType: SetType, intensity: number, isDeload: boolean) => void;
  reset: () => void;
};

const initialState: WorkoutState = {
  activeWeek: 0,
  activeDay: 0,
  checked: {},
  amrapReps: {},
  accLog: {},
  accSets: {},
  collapsed: {},
  timerKey: 0,
  showTimer: false,
  timerInfo: { duration: 90, reason: "" },
  swapSlot: null,
  workoutStart: null,
};

export const useWorkoutStore = createSelectors(
  create<WorkoutState & { actions: WorkoutActions }>((set, get) => ({
    ...initialState,

    actions: {
      startWorkout: (week, day) =>
        set({
          ...initialState,
          activeWeek: week,
          activeDay: day,
          workoutStart: Date.now(),
        }),

      onSetCheck: (key, allSets) => {
        const { checked } = get();
        const next = { ...checked, [key]: !checked[key] };
        if (!checked[key]) {
          const idx = allSets.findIndex((s) => s.key === key);
          let nextSet: (typeof allSets)[number] | null = null;
          for (let i = idx + 1; i < allSets.length; i++) {
            if (!next[allSets[i].key]) {
              nextSet = allSets[i];
              break;
            }
          }
          if (nextSet) {
            set({
              checked: next,
              timerInfo: smartRest(nextSet.type, nextSet.intensity || 0, nextSet.isDeload || false),
              showTimer: true,
              timerKey: get().timerKey + 1,
            });
          } else {
            set({ checked: next, showTimer: false });
          }
        } else {
          set({ checked: next });
        }
      },

      setAmrapReps: (updater) => set((state) => ({ amrapReps: updater(state.amrapReps) })),

      toggleCollapse: (section) =>
        set((state) => ({
          collapsed: { ...state.collapsed, [section]: !state.collapsed[section] },
        })),

      setAccLog: (updater) => set((state) => ({ accLog: updater(state.accLog) })),

      tapAccSet: (accId, maxSets, setType, pct, isDeload) => {
        const { accSets, timerKey } = get();
        const setsDone = accSets[accId] || 0;
        if (setsDone < maxSets) {
          const nextSetCount = setsDone + 1;
          const updates: Partial<WorkoutState> = {
            accSets: { ...accSets, [accId]: nextSetCount },
          };
          if (nextSetCount >= maxSets) {
            updates.checked = {
              ...get().checked,
              [`a_${accId}`]: true,
            };
          }
          if (nextSetCount < maxSets) {
            updates.timerInfo = smartRest(setType, pct, isDeload);
            updates.showTimer = true;
            updates.timerKey = timerKey + 1;
          }
          set(updates as WorkoutState);
        }
      },

      untapAccSet: (accId, maxSets) => {
        const { accSets } = get();
        const setsDone = accSets[accId] || 0;
        if (setsDone > 0) {
          const nextSetCount = setsDone - 1;
          const nextChecked = { ...get().checked };
          if (nextSetCount < maxSets) {
            delete nextChecked[`a_${accId}`];
          }
          set({
            accSets: { ...accSets, [accId]: nextSetCount },
            checked: nextChecked,
          });
        }
      },

      dismissTimer: () => set({ showTimer: false }),
      setSwapSlot: (slot) => set({ swapSlot: slot }),
      setChecked: (updater) => set((state) => ({ checked: updater(state.checked) })),

      activateTimer: (setType, intensity, isDeload) => {
        set({
          timerInfo: smartRest(setType, intensity, isDeload),
          showTimer: true,
          timerKey: get().timerKey + 1,
        });
      },

      reset: () => set(initialState),
    },
  })),
);

export const hasActiveWorkout = () => !!useWorkoutStore.getState().workoutStart;
