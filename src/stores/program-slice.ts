import type { ProgramData, TemplateId, Unit, Exercise } from "../types";
import { LIFTS, LIFT_ORDER, TEMPLATES } from "../constants/program";
import { ASSISTANCE_WEEKS } from "../constants/exercises";
import { roundToNearest, epley, calcWeight } from "../lib/calc";
import { getAssistanceForLift, getAllAssistanceExercises } from "../lib/exercises";
import { loadData, saveData, clearData } from "../lib/storage";
import { useUIStore } from "./ui-store";
import type { AppSet, AppGet } from "./app-store";

export type ProgramState = {
  template: TemplateId;
  unit: Unit;
  trainingMaxPercent: number;
  trainingMaxes: Record<string, number>;
  oneRepMaxes: Record<string, number>;
  cycle: number;
  week: number;
  workouts: Array<{
    cycle: number;
    week: number;
    day: number;
    lift: string;
    datetime: number;
    duration: number;
    amrapReps: Record<string, string>;
    assistanceLog: Record<string, { w?: string }>;
    newOneRepMax: {
      lift: string;
      old: number;
      newValue: number;
      reps: number;
      weight: number;
    } | null;
  }>;
  assistanceHistory: Record<
    string,
    Array<{
      datetime?: number;
      cycle?: number;
      week?: number;
      weight?: number;
      isBodyweight?: boolean;
    }>
  >;
  assistanceMaximums: Record<string, number>;
  bodyweightBaselines: Record<string, number>;
  assistanceSlots?: Record<string, string[]>;
  customExercises?: Record<string, Exercise>;
  timestamp: number;
  loading: boolean;
};

export type ProgramActions = {
  loadProgram: () => Promise<void>;
  programCreated: (oneRepMaxes: Record<string, string>) => Promise<void>;
  programReset: () => Promise<void>;
  templateChanged: (templateId: TemplateId) => Promise<void>;
  exerciseSwapped: (newExId: string) => Promise<void>;
  unitToggled: () => Promise<void>;
  modeToggled: () => Promise<void>;
  trainingMaxPercentChanged: (newPct: number) => Promise<void>;
  oneRepMaxesSaved: (editOneRepMax: Record<string, string>) => Promise<void>;
  assistanceMaximumsSaved: (editAssistance: Record<string, string | number>) => Promise<void>;
  workoutFinished: () => Promise<{
    celebType: "done" | "pr" | "warn";
    celebMsg: string;
    celebSub: string;
    actionLabel?: string;
    actionSub?: string;
    _liftId?: string;
    _suggestedOneRepMax?: number;
    _suggestedTrainingMax?: number;
  }>;
  weekAdvanced: () => Promise<{
    type: "cycle" | "advance";
    message?: string;
    subtitle?: string;
  }>;
  trainingMaxAdjusted: (
    liftId: string,
    suggestedOneRepMax: number,
    suggestedTrainingMax: number,
  ) => Promise<void>;
};

const inferUnit = (): Unit =>
  ((typeof navigator !== "undefined" && navigator.language) || "en-US").startsWith("en-US")
    ? "lb"
    : "kg";

export const programInitialState: ProgramState = {
  template: "fsl",
  unit: inferUnit(),
  trainingMaxPercent: 90,
  trainingMaxes: {},
  oneRepMaxes: {},
  cycle: 1,
  week: 0,
  workouts: [],
  assistanceHistory: {},
  assistanceMaximums: {},
  bodyweightBaselines: {},
  timestamp: 0,
  loading: true,
};

export const extractProgramData = (state: ProgramState): ProgramData => ({
  template: state.template,
  unit: state.unit,
  trainingMaxPercent: state.trainingMaxPercent,
  trainingMaxes: state.trainingMaxes,
  oneRepMaxes: state.oneRepMaxes,
  cycle: state.cycle,
  week: state.week,
  workouts: state.workouts,
  assistanceHistory: state.assistanceHistory,
  assistanceMaximums: state.assistanceMaximums,
  bodyweightBaselines: state.bodyweightBaselines,
  assistanceSlots: state.assistanceSlots,
  customExercises: state.customExercises,
  timestamp: state.timestamp,
  mode: useUIStore.getState().mode,
});

const save = async (state: ProgramState, set: AppSet, updates: Partial<ProgramState>) => {
  set(updates);
  await saveData(extractProgramData({ ...state, ...updates } as ProgramState));
};

export const createProgramActions = (set: AppSet, get: AppGet): ProgramActions => ({
  loadProgram: async () => {
    const saved = await loadData();
    if (saved) {
      const { mode, ...programFields } = saved;
      set({ ...programFields });
      if (mode) useUIStore.getState().actions.setMode(mode);
    }
    set({ loading: false });
  },

  programCreated: async (oneRepMaxes) => {
    const state = get();

    const parsedOneRepMaxes: Record<string, number> = {};
    const trainingMaxes: Record<string, number> = {};
    LIFTS.forEach((lift) => {
      const orm = parseFloat(oneRepMaxes[lift.id]) || 0;
      parsedOneRepMaxes[lift.id] = orm;
      trainingMaxes[lift.id] = roundToNearest(orm * (state.trainingMaxPercent / 100));
    });

    await save(state, set, {
      trainingMaxes,
      oneRepMaxes: parsedOneRepMaxes,
      timestamp: Date.now(),
    });
  },

  programReset: async () => {
    await clearData();
    set({ ...programInitialState, loading: false });
  },

  templateChanged: async (templateId) => {
    await save(get(), set, { template: templateId });
  },

  exerciseSwapped: async (newExId) => {
    const state = get();
    const { swapSlot } = state;
    if (!swapSlot) return;
    const { liftId, slot: slotIdx } = swapSlot;
    const current = state.assistanceSlots || {};
    const defaults = (await import("../constants/exercises")).DEFAULT_ACC;
    const liftSlots = [...(current[liftId] || defaults[liftId])];
    liftSlots[slotIdx] = newExId;
    await save(state, set, { assistanceSlots: { ...current, [liftId]: liftSlots } });
  },

  unitToggled: async () => {
    const state = get();
    const newUnit: Unit = state.unit === "lb" ? "kg" : "lb";
    const factor = newUnit === "kg" ? 0.453592 : 2.20462;
    const newOneRepMaxes: Record<string, number> = {};
    const newTrainingMaxes: Record<string, number> = {};
    const newAssistanceMaximums: Record<string, number> = {};
    LIFTS.forEach((lift) => {
      newOneRepMaxes[lift.id] = roundToNearest(state.oneRepMaxes[lift.id] * factor);
      newTrainingMaxes[lift.id] = roundToNearest(
        newOneRepMaxes[lift.id] * (state.trainingMaxPercent / 100),
      );
    });
    Object.entries(state.assistanceMaximums || {}).forEach(([k, v]) => {
      newAssistanceMaximums[k] = roundToNearest(v * factor);
    });
    await save(state, set, {
      unit: newUnit,
      oneRepMaxes: newOneRepMaxes,
      trainingMaxes: newTrainingMaxes,
      assistanceMaximums: newAssistanceMaximums,
    });
  },

  modeToggled: async () => {
    const state = get();
    const uiStore = useUIStore.getState();
    const next = uiStore.mode === "dark" ? ("light" as const) : ("dark" as const);
    uiStore.actions.setMode(next);
    await save(state, set, {});
  },

  trainingMaxPercentChanged: async (newPct) => {
    const state = get();
    const clamped = Math.max(80, Math.min(95, newPct));
    const newTrainingMaxes: Record<string, number> = {};
    LIFTS.forEach((lift) => {
      newTrainingMaxes[lift.id] = roundToNearest(state.oneRepMaxes[lift.id] * (clamped / 100));
    });
    await save(state, set, { trainingMaxPercent: clamped, trainingMaxes: newTrainingMaxes });
  },

  oneRepMaxesSaved: async (editOneRepMax) => {
    const state = get();
    const newOneRepMaxes: Record<string, number> = {};
    const newTrainingMaxes: Record<string, number> = {};
    LIFTS.forEach((lift) => {
      const val = parseFloat(editOneRepMax[lift.id]) || state.oneRepMaxes[lift.id] || 0;
      newOneRepMaxes[lift.id] = val;
      newTrainingMaxes[lift.id] = roundToNearest(val * (state.trainingMaxPercent / 100));
    });
    await save(state, set, { oneRepMaxes: newOneRepMaxes, trainingMaxes: newTrainingMaxes });
  },

  assistanceMaximumsSaved: async (editAssistance) => {
    const state = get();
    const newMaximums = { ...state.assistanceMaximums };
    Object.entries(editAssistance).forEach(([id, val]) => {
      newMaximums[id] = parseInt(String(val)) || 0;
    });
    await save(state, set, { assistanceMaximums: newMaximums });
  },

  workoutFinished: async () => {
    const state = get();
    const { activeWeek, activeDay, amrapReps, accLog, workoutStart } = state;
    const programData = extractProgramData(state);
    const template = TEMPLATES[state.template];
    const weekDef = template.weeks[activeWeek];
    const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
    const lift = LIFTS.find((l) => l.id === liftId)!;
    const tm = state.trainingMaxes[liftId];
    const accs = getAssistanceForLift(liftId, programData);

    const amrapSet = weekDef.sets.find((s) => String(s.reps).includes("+"));
    const amrapIdx = amrapSet ? weekDef.sets.indexOf(amrapSet) : -1;
    const repsHit = parseInt(amrapReps[`m${amrapIdx}`]);
    let newOneRepMax: {
      lift: string;
      old: number;
      newValue: number;
      reps: number;
      weight: number;
    } | null = null;
    if (amrapSet && repsHit > 0) {
      const weight = calcWeight(tm, amrapSet.percentage);
      const est = epley(weight, repsHit);
      if (est > state.oneRepMaxes[liftId])
        newOneRepMax = {
          lift: liftId,
          old: state.oneRepMaxes[liftId],
          newValue: est,
          reps: repsHit,
          weight,
        };
    }

    const assistanceHistory = { ...state.assistanceHistory };
    const assistanceMaximums = { ...state.assistanceMaximums };
    const bodyweightBaselines = { ...state.bodyweightBaselines };
    accs.forEach((a) => {
      if (!assistanceHistory[a.id]) assistanceHistory[a.id] = [];
      if (a.isBodyweight) {
        assistanceHistory[a.id].push({
          datetime: Date.now(),
          cycle: state.cycle,
          week: activeWeek,
          isBodyweight: true,
        });
      } else {
        const log = accLog[a.id];
        if (log && parseFloat(log.w || "0") > 0) {
          assistanceHistory[a.id].push({
            weight: parseFloat(log.w || "0"),
            datetime: Date.now(),
            cycle: state.cycle,
            week: activeWeek,
          });
          if (!assistanceMaximums[a.id] || assistanceMaximums[a.id] === 0) {
            assistanceMaximums[a.id] = roundToNearest(
              parseFloat(log.w || "0") /
                (ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0]).percentage,
            );
          }
        }
      }
    });

    const durationSec = workoutStart ? Math.floor((Date.now() - workoutStart) / 1000) : 0;
    const entry = {
      cycle: state.cycle,
      week: activeWeek,
      day: activeDay,
      lift: liftId,
      datetime: Date.now(),
      duration: durationSec,
      amrapReps: { ...amrapReps },
      assistanceLog: { ...accLog },
      newOneRepMax,
    };
    const updates: Partial<ProgramState> = {
      workouts: [...state.workouts, entry],
      assistanceHistory,
      assistanceMaximums,
      bodyweightBaselines,
    };
    if (newOneRepMax)
      updates.oneRepMaxes = { ...state.oneRepMaxes, [liftId]: newOneRepMax.newValue };
    await save(state, set, updates);
    const next = { ...state, ...updates };

    const durationMin = Math.floor(durationSec / 60);
    const durationFmt = durationMin > 0 ? durationMin + " min" : "< 1 min";
    const isDeload = activeWeek === 3;

    if (amrapSet && !isDeload) {
      const minReps = parseInt(String(amrapSet.reps).replace("+", "")) || 1;
      const amrapWeight = calcWeight(tm, amrapSet.percentage);
      if (repsHit <= 0) {
        const suggestedOneRepMax = roundToNearest((tm * 0.9) / (next.trainingMaxPercent / 100));
        const suggestedTrainingMax = roundToNearest(
          suggestedOneRepMax * (next.trainingMaxPercent / 100),
        );
        return {
          celebType: "warn" as const,
          celebMsg: "Missed AMRAP",
          celebSub: `0 reps at ${amrapWeight} ${next.unit}`,
          actionLabel: `Adjust TM to ${suggestedTrainingMax}`,
          actionSub: `1RM: ${next.oneRepMaxes![liftId]} \u2192 ${suggestedOneRepMax} ${next.unit}`,
          _liftId: liftId,
          _suggestedOneRepMax: suggestedOneRepMax,
          _suggestedTrainingMax: suggestedTrainingMax,
        };
      } else if (repsHit < minReps) {
        const realOneRepMax = roundToNearest(epley(amrapWeight, repsHit));
        const suggestedTrainingMax = roundToNearest(
          realOneRepMax * (next.trainingMaxPercent / 100),
        );
        return {
          celebType: "warn" as const,
          celebMsg: "Below Target",
          celebSub: `${repsHit} rep${repsHit > 1 ? "s" : ""} at ${amrapWeight} ${next.unit} (needed ${minReps}+)`,
          actionLabel: `Adjust TM to ${suggestedTrainingMax}`,
          actionSub: `1RM: ${next.oneRepMaxes![liftId]} \u2192 ${realOneRepMax} ${next.unit}`,
          _liftId: liftId,
          _suggestedOneRepMax: realOneRepMax,
          _suggestedTrainingMax: suggestedTrainingMax,
        };
      } else if (newOneRepMax) {
        return {
          celebType: "pr" as const,
          celebMsg: "New 1RM!",
          celebSub: `${lift.name}: ${newOneRepMax.old} to ${newOneRepMax.newValue} ${next.unit} \u00B7 ${durationFmt}`,
        };
      }
    }
    return {
      celebType: "done" as const,
      celebMsg: "Workout Logged",
      celebSub: `${lift.name} \u00B7 ${durationFmt}`,
    };
  },

  weekAdvanced: async () => {
    const state = get();
    const programData = extractProgramData(state);
    const template = TEMPLATES[state.template];
    const nextWeek = state.week + 1;

    if (nextWeek >= template.weeks.length) {
      const newTrainingMaxes = { ...state.trainingMaxes };
      LIFTS.forEach((lift) => {
        if (state.oneRepMaxes[lift.id] > 0) {
          const tmFromOneRepMax = roundToNearest(
            state.oneRepMaxes[lift.id] * (state.trainingMaxPercent / 100),
          );
          newTrainingMaxes[lift.id] = Math.max(
            tmFromOneRepMax,
            state.trainingMaxes[lift.id] + lift.increment,
          );
        } else {
          newTrainingMaxes[lift.id] = state.trainingMaxes[lift.id] + lift.increment;
        }
      });
      const newAssistanceMaximums = { ...state.assistanceMaximums };
      getAllAssistanceExercises(programData)
        .filter((a) => !a.isBodyweight)
        .forEach((a) => {
          if (newAssistanceMaximums[a.id])
            newAssistanceMaximums[a.id] = newAssistanceMaximums[a.id] + (a.inc || 5);
        });
      const newBodyweightBaselines = { ...state.bodyweightBaselines };
      getAllAssistanceExercises(programData)
        .filter((a) => a.isBodyweight)
        .forEach((a) => {
          newBodyweightBaselines[a.id] = (newBodyweightBaselines[a.id] || 8) + 1;
        });
      await save(state, set, {
        cycle: state.cycle + 1,
        week: 0,
        trainingMaxes: newTrainingMaxes,
        assistanceMaximums: newAssistanceMaximums,
        bodyweightBaselines: newBodyweightBaselines,
      });
      return {
        type: "cycle" as const,
        message: "Cycle Complete!",
        subtitle: "TMs updated. Assistance progressed.",
      };
    } else {
      await save(state, set, { week: nextWeek });
      return { type: "advance" as const };
    }
  },

  trainingMaxAdjusted: async (liftId, suggestedOneRepMax, suggestedTrainingMax) => {
    const state = get();
    await save(state, set, {
      oneRepMaxes: { ...state.oneRepMaxes, [liftId]: suggestedOneRepMax },
      trainingMaxes: { ...state.trainingMaxes, [liftId]: suggestedTrainingMax },
    });
  },
});
