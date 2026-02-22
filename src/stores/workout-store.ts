import type { RestInfo, SetType } from "../types";
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
import { createStore } from "./polaris";
import { useProgramStore, extractProgramData } from "./program-store";

type WorkoutState = {
  activeWeek: number;
  activeDay: number;
  checked: Record<string, boolean>;
  amrapReps: Record<string, string>;
  assistanceLog: Record<string, { w?: string }>;
  assistanceSetCounts: Record<string, number>;
  timerKey: number;
  showTimer: boolean;
  timerInfo: RestInfo;
  workoutStart: number | null;
};

const initialState: WorkoutState = {
  activeWeek: 0,
  activeDay: 0,
  checked: {},
  amrapReps: {},
  assistanceLog: {},
  assistanceSetCounts: {},
  timerKey: 0,
  showTimer: false,
  timerInfo: { duration: 90, reason: "" },
  workoutStart: null,
};

const deriveWorkoutSets = (
  workoutState: WorkoutState,
  programState: ReturnType<typeof useProgramStore.getState>,
): WorkoutSet[] => {
  const { activeWeek, activeDay } = workoutState;
  const programData = extractProgramData(programState);
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

export const useWorkoutStore = createStore("workout", {
  state: initialState,

  actions: (set, get) => ({
    startWorkout: (day: number) => {
      const { week } = useProgramStore.getState();
      set({
        ...initialState,
        activeWeek: week,
        activeDay: day,
        workoutStart: Date.now(),
      });
    },

    onSetCheck: (key: string) => {
      const state = get();
      const { checked, timerKey } = state;
      const next = { ...checked, [key]: !checked[key] };
      if (!checked[key]) {
        const programState = useProgramStore.getState();
        const allSets = deriveWorkoutSets(state, programState);
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

    setAmrapReps: (updater: (prev: Record<string, string>) => Record<string, string>) => {
      set((s) => {
        s.amrapReps = updater(s.amrapReps);
      });
    },

    setAssistanceLog: (
      updater: (prev: Record<string, { w?: string }>) => Record<string, { w?: string }>,
    ) => {
      set((s) => {
        s.assistanceLog = updater(s.assistanceLog);
      });
    },

    incrementAssistanceSet: (accId: string) => {
      const state = get();
      const { activeWeek, activeDay, assistanceSetCounts, assistanceLog, timerKey } = state;
      const programState = useProgramStore.getState();
      const programData = extractProgramData(programState);
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

      const setsDone = assistanceSetCounts[accId] || 0;
      if (setsDone < maxSets) {
        const nextSetCount = setsDone + 1;
        const updates: Partial<WorkoutState> = {
          assistanceSetCounts: { ...assistanceSetCounts, [accId]: nextSetCount },
        };
        if (nextSetCount >= maxSets) {
          const weightEntered =
            exercise.isBodyweight || parseFloat(assistanceLog[accId]?.w || "0") > 0;
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
        set(updates);
      }
    },

    decrementAssistanceSet: (accId: string) => {
      const state = get();
      const { activeWeek, activeDay, assistanceSetCounts } = state;
      const programState = useProgramStore.getState();
      const programData = extractProgramData(programState);
      const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
      const accessories = getAssistanceForLift(liftId, programData);
      const exercise = accessories.find((a) => a.id === accId);
      if (!exercise) return;

      const discovered = isAssistanceDiscovered(exercise, programData);
      const weekRx = ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0];
      const maxSets = discovered
        ? getAssistancePrescription(exercise, activeWeek, programData, liftId).sets
        : weekRx.sets;

      const setsDone = assistanceSetCounts[accId] || 0;
      if (setsDone > 0) {
        const nextSetCount = setsDone - 1;
        const nextChecked = { ...state.checked };
        if (nextSetCount < maxSets) {
          delete nextChecked[`a_${accId}`];
        }
        set({
          assistanceSetCounts: { ...assistanceSetCounts, [accId]: nextSetCount },
          checked: nextChecked,
        });
      }
    },

    activateAmrap: (setIndex: number) => {
      const state = get();
      const { checked, amrapReps, timerKey } = state;
      const setKey = `m${setIndex}`;
      if (checked[setKey]) return;

      const programState = useProgramStore.getState();
      const programData = extractProgramData(programState);
      const { activeWeek } = state;
      const variant = TEMPLATES[programData.template];
      const weekDef = variant.weeks[activeWeek];
      const setDef = weekDef.sets[setIndex];
      const minReps = parseInt(String(setDef.reps).replace("+", "")) || 1;

      const allSets = deriveWorkoutSets(state, programState);
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

      set(updates);
    },

    dismissTimer: () => set({ showTimer: false }),

    setChecked: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => {
      set((s) => {
        s.checked = updater(s.checked);
      });
    },

    activateTimer: (setType: SetType, intensity: number, isDeload: boolean) => {
      set({
        timerInfo: smartRest(setType, intensity, isDeload),
        showTimer: true,
        timerKey: get().timerKey + 1,
      });
    },

    reset: () => set({ ...initialState }),
  }),
});

export const hasActiveWorkout = () => !!useWorkoutStore.getState().workoutStart;
