import type { Unit } from "../../../types";
import type { ProgramState } from "./program.types";
import { createStore } from "../createStore";

const inferUnit = (): Unit =>
  ((typeof navigator !== "undefined" && navigator.language) || "en-US").startsWith("en-US")
    ? "lb"
    : "kg";

const initialState: ProgramState = {
  templateId: "fsl",
  unit: inferUnit(),
  trainingMaxPercent: 90,
  trainingMaxes: {},
  oneRepMaxes: {},
  cycle: 1,
  phase: 0,
  workouts: [],
  assistanceHistory: {},
  assistanceMaximums: {},
  bodyweightBaselines: {},
  assistanceSlots: {},
  customExercises: {},
  createdAt: 0,
};

const V1_STORE_KEY = "unrack-v1";

const migrateFromV1 = (): Partial<ProgramState> | null => {
  try {
    const stored = localStorage.getItem(V1_STORE_KEY);
    if (!stored) return null;
    const v1 = JSON.parse(stored) as Record<string, unknown>;
    return {
      ...v1,
      templateId: (v1.templateId ?? v1.template) as ProgramState["templateId"],
      phase: (v1.phase ?? v1.week) as number,
      createdAt: (v1.timestamp as number) || Date.now(),
      workouts: ((v1.workouts as Array<Record<string, unknown>>) || []).map((workout) => ({
        ...workout,
        phase: (workout.phase ?? workout.week) as number,
      })),
    } as Partial<ProgramState>;
  } catch {
    return null;
  }
};

export const useProgramStore = createStore("program", initialState, {
  persist: {
    key: "unrack-v2",
    version: 1,
    partialize: (state) => ({ ...state }),
    migrate: (persisted, version) => {
      if (version === 0) {
        const legacy = persisted as Record<string, unknown>;
        return {
          ...initialState,
          ...legacy,
          templateId: (legacy.templateId ?? legacy.template) as ProgramState["templateId"],
          phase: (legacy.phase ?? legacy.week) as number,
          createdAt: (legacy.timestamp ?? legacy.createdAt ?? 0) as number,
        };
      }
      return persisted as ProgramState;
    },
    onRehydrateStorage: () => (state, error) => {
      if (error || !state) return;
      if (state.createdAt > 0) return;
      const v1Data = migrateFromV1();
      if (v1Data) {
        useProgramStore.setState(v1Data);
      }
    },
  },
});

export const resetProgramStore = () => {
  useProgramStore.setState(useProgramStore.getInitialState(), true);
};
