import type { RestInfo, SwapSlot, SetType } from "../types";
import { TEMPLATES, LIFT_ORDER } from "../constants/program";
import { ASSISTANCE_WEEKS } from "../constants/exercises";
import { smartRest } from "../lib/calc";
import {
  getAssistanceForLift,
  isAssistanceDiscovered,
  getAssistancePrescription,
} from "../lib/exercises";
import { deriveSupplementalSets, deriveAllSets } from "../lib/sets";
import type { WorkoutSet } from "../lib/sets";
import { extractProgramData } from "./program-slice";
import type { AppStore, AppSet, AppGet } from "./app-store";

export type WorkoutState = {
  activeWeek: number;
  activeDay: number;
  checked: Record<string, boolean>;
  amrapReps: Record<string, string>;
  accLog: Record<string, { w?: string }>;
  accSets: Record<string, number>;
  timerKey: number;
  showTimer: boolean;
  timerInfo: RestInfo;
  swapSlot: SwapSlot | null;
  workoutStart: number | null;
};

export type WorkoutActions = {
  startWorkout: (day: number) => void;
  onSetCheck: (key: string) => void;
  setAmrapReps: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  setAccLog: (
    updater: (prev: Record<string, { w?: string }>) => Record<string, { w?: string }>,
  ) => void;
  tapAccSet: (accId: string) => void;
  untapAccSet: (accId: string) => void;
  activateAmrap: (setIndex: number) => void;
  dismissTimer: () => void;
  setSwapSlot: (slot: SwapSlot | null) => void;
  setChecked: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  activateTimer: (setType: SetType, intensity: number, isDeload: boolean) => void;
  reset: () => void;
};

export const workoutInitialState: WorkoutState = {
  activeWeek: 0,
  activeDay: 0,
  checked: {},
  amrapReps: {},
  accLog: {},
  accSets: {},
  timerKey: 0,
  showTimer: false,
  timerInfo: { duration: 90, reason: "" },
  swapSlot: null,
  workoutStart: null,
};

const deriveWorkoutSets = (state: AppStore): WorkoutSet[] => {
  const { activeWeek, activeDay } = state;
  const programData = extractProgramData(state);
  const variant = TEMPLATES[programData.template];
  const weekDef = variant.weeks[activeWeek];
  const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
  const isDeload = activeWeek === 3;
  const accessories = getAssistanceForLift(liftId, programData);
  const supplementalSets = deriveSupplementalSets(variant, weekDef, activeWeek);
  return deriveAllSets(activeWeek, weekDef, supplementalSets, accessories, isDeload);
};

const findNextUncheckedSet = (
  allSets: WorkoutSet[],
  afterKey: string,
  checked: Record<string, boolean>,
): WorkoutSet | null => {
  const idx = allSets.findIndex((s) => s.key === afterKey);
  for (let i = idx + 1; i < allSets.length; i++) {
    if (!checked[allSets[i].key]) return allSets[i];
  }
  return null;
};

export const createWorkoutActions = (set: AppSet, get: AppGet): WorkoutActions => ({
  startWorkout: (day) => {
    const { week } = get();
    set({
      ...workoutInitialState,
      activeWeek: week,
      activeDay: day,
      workoutStart: Date.now(),
    });
  },

  onSetCheck: (key) => {
    const state = get();
    const { checked, timerKey } = state;
    const next = { ...checked, [key]: !checked[key] };
    if (!checked[key]) {
      const allSets = deriveWorkoutSets(state);
      const nextSet = findNextUncheckedSet(allSets, key, next);
      if (nextSet) {
        set({
          checked: next,
          timerInfo: smartRest(nextSet.type, nextSet.intensity || 0, nextSet.isDeload),
          showTimer: true,
          timerKey: timerKey + 1,
        });
      } else {
        set({ checked: next, showTimer: false });
      }
    } else {
      set({ checked: next });
    }
  },

  setAmrapReps: (updater) => set((state) => ({ amrapReps: updater(state.amrapReps) })),

  setAccLog: (updater) => set((state) => ({ accLog: updater(state.accLog) })),

  tapAccSet: (accId) => {
    const state = get();
    const { activeWeek, activeDay, accSets, accLog, timerKey } = state;
    const programData = extractProgramData(state);
    const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
    const accessories = getAssistanceForLift(liftId, programData);
    const exercise = accessories.find((a) => a.id === accId);
    if (!exercise) return;

    const discovered = isAssistanceDiscovered(exercise, programData);
    const weekRx = ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0];
    const maxSets = discovered
      ? getAssistancePrescription(exercise, activeWeek, programData, liftId).sets
      : weekRx.sets;
    const setType: SetType = exercise.isBodyweight ? "acc_bw" : "acc_wt";
    const isDeload = activeWeek === 3;

    const setsDone = accSets[accId] || 0;
    if (setsDone < maxSets) {
      const nextSetCount = setsDone + 1;
      const updates: Partial<WorkoutState> = {
        accSets: { ...accSets, [accId]: nextSetCount },
      };
      if (nextSetCount >= maxSets) {
        const weightEntered = exercise.isBodyweight || parseFloat(accLog[accId]?.w || "0") > 0;
        if (discovered || weightEntered) {
          updates.checked = {
            ...state.checked,
            [`a_${accId}`]: true,
          };
        }
      }
      if (nextSetCount < maxSets) {
        updates.timerInfo = smartRest(setType, weekRx.percentage, isDeload);
        updates.showTimer = true;
        updates.timerKey = timerKey + 1;
      }
      set(updates as WorkoutState);
    }
  },

  untapAccSet: (accId) => {
    const state = get();
    const { activeWeek, activeDay, accSets } = state;
    const programData = extractProgramData(state);
    const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
    const accessories = getAssistanceForLift(liftId, programData);
    const exercise = accessories.find((a) => a.id === accId);
    if (!exercise) return;

    const discovered = isAssistanceDiscovered(exercise, programData);
    const weekRx = ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0];
    const maxSets = discovered
      ? getAssistancePrescription(exercise, activeWeek, programData, liftId).sets
      : weekRx.sets;

    const setsDone = accSets[accId] || 0;
    if (setsDone > 0) {
      const nextSetCount = setsDone - 1;
      const nextChecked = { ...state.checked };
      if (nextSetCount < maxSets) {
        delete nextChecked[`a_${accId}`];
      }
      set({
        accSets: { ...accSets, [accId]: nextSetCount },
        checked: nextChecked,
      });
    }
  },

  activateAmrap: (setIndex) => {
    const state = get();
    const { checked, amrapReps, timerKey } = state;
    const setKey = `m${setIndex}`;
    if (checked[setKey]) return;

    const programData = extractProgramData(state);
    const { activeWeek } = state;
    const variant = TEMPLATES[programData.template];
    const weekDef = variant.weeks[activeWeek];
    const setDef = weekDef.sets[setIndex];
    const minReps = parseInt(String(setDef.reps).replace("+", "")) || 1;

    const allSets = deriveWorkoutSets(state);
    const nextChecked = { ...checked, [setKey]: true };
    const nextSet = findNextUncheckedSet(allSets, setKey, nextChecked);

    const updates: Partial<WorkoutState> = {
      checked: nextChecked,
      amrapReps: { ...amrapReps, [setKey]: String(minReps) },
    };

    if (nextSet) {
      updates.timerInfo = smartRest(nextSet.type, nextSet.intensity || 0, nextSet.isDeload);
      updates.showTimer = true;
      updates.timerKey = timerKey + 1;
    }

    set(updates as WorkoutState);
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

  reset: () => set(workoutInitialState),
});
