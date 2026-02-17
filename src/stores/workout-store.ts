import { create } from "zustand";
import type { RestInfo, SwapSlot } from "../types";
import { smartRest } from "../lib/calc";

interface WorkoutState {
  activeWeek: number;
  activeDay: number;
  checked: Record<string, boolean>;
  amrapReps: Record<string, string>;
  accLog: Record<string, { w?: string }>;
  accSets: Record<string, number>;
  collapsed: Record<string, boolean>;
  timerKey: number;
  showTimer: boolean;
  timerInfo: RestInfo;
  swapSlot: SwapSlot | null;
  workoutStart: number | null;

  startWorkout: (week: number, day: number) => void;
  onSetCheck: (
    key: string,
    allSets: Array<{
      key: string;
      type: string;
      intensity: number;
      isDeload: boolean;
    }>,
  ) => void;
  setAmrapReps: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  toggleCollapse: (section: string) => void;
  setAccLog: (
    updater: (prev: Record<string, { w?: string }>) => Record<string, { w?: string }>,
  ) => void;
  tapAccSet: (
    accId: string,
    maxSets: number,
    setType: string,
    pct: number,
    isDeload: boolean,
  ) => void;
  untapAccSet: (accId: string, maxSets: number) => void;
  dismissTimer: () => void;
  setSwapSlot: (v: SwapSlot | null) => void;
  setChecked: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeWeek: 0,
  activeDay: 0,
  checked: {},
  amrapReps: {},
  accLog: {},
  accSets: {},
  collapsed: {},
  timerKey: 0,
  showTimer: false,
  timerInfo: { dur: 90, why: "" },
  swapSlot: null,
  workoutStart: null,

  startWorkout: (week, day) =>
    set({
      activeWeek: week,
      activeDay: day,
      checked: {},
      amrapReps: {},
      accLog: {},
      accSets: {},
      collapsed: {},
      showTimer: false,
      swapSlot: null,
      workoutStart: Date.now(),
    }),

  onSetCheck: (key, allSets) => {
    const { checked } = get();
    const next = { ...checked, [key]: !checked[key] };
    if (!checked[key]) {
      const idx = allSets.findIndex((s) => s.key === key);
      let ns: (typeof allSets)[number] | null = null;
      for (let i = idx + 1; i < allSets.length; i++) {
        if (!next[allSets[i].key]) {
          ns = allSets[i];
          break;
        }
      }
      if (ns) {
        set({
          checked: next,
          timerInfo: smartRest(ns.type, ns.intensity || 0, ns.isDeload || false),
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

  setAmrapReps: (updater) => set((s) => ({ amrapReps: updater(s.amrapReps) })),

  toggleCollapse: (section) =>
    set((s) => ({ collapsed: { ...s.collapsed, [section]: !s.collapsed[section] } })),

  setAccLog: (updater) => set((s) => ({ accLog: updater(s.accLog) })),

  tapAccSet: (accId, maxSets, setType, pct, isDeload) => {
    const { accSets, timerKey } = get();
    const setsDone = accSets[accId] || 0;
    if (setsDone < maxSets) {
      const nxt = setsDone + 1;
      const updates: Partial<WorkoutState> = {
        accSets: { ...accSets, [accId]: nxt },
      };
      if (nxt >= maxSets) {
        updates.checked = {
          ...get().checked,
          [`a_${accId}`]: true,
        };
      }
      if (nxt < maxSets) {
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
      const nxt = setsDone - 1;
      const nextChecked = { ...get().checked };
      if (nxt < maxSets) {
        delete nextChecked[`a_${accId}`];
      }
      set({
        accSets: { ...accSets, [accId]: nxt },
        checked: nextChecked,
      });
    }
  },

  dismissTimer: () => set({ showTimer: false }),
  setSwapSlot: (v) => set({ swapSlot: v }),
  setChecked: (updater) => set((s) => ({ checked: updater(s.checked) })),
  reset: () =>
    set({
      activeWeek: 0,
      activeDay: 0,
      checked: {},
      amrapReps: {},
      accLog: {},
      accSets: {},
      collapsed: {},
      showTimer: false,
      timerKey: 0,
      timerInfo: { dur: 90, why: "" },
      swapSlot: null,
      workoutStart: null,
    }),
}));
