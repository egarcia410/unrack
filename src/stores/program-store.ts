import type { ProgramData, TemplateId, Unit, Exercise } from "../types";
import { LIFTS, LIFT_ORDER, TEMPLATES } from "../constants/program";
import { ASSISTANCE_WEEKS } from "../constants/exercises";
import { roundToNearest, epley, calcWeight } from "../lib/calc";
import { getAssistanceForLift, getAllAssistanceExercises } from "../lib/exercises";
import { loadData, saveData, clearData } from "../lib/storage";
import { createStore } from "./polaris";
import { useWorkoutStore } from "./workout-store";
import { useOverlayStore } from "./overlay-store";

type ProgramState = {
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
};

const inferUnit = (): Unit =>
  ((typeof navigator !== "undefined" && navigator.language) || "en-US").startsWith("en-US")
    ? "lb"
    : "kg";

const initialState: ProgramState = {
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
};

const loadInitialState = (): ProgramState => {
  const saved = loadData();
  return saved ? { ...initialState, ...(saved as Partial<ProgramState>) } : initialState;
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
});

export const useProgramStore = createStore("program", {
  state: loadInitialState(),

  actions: (set, get) => {
    const save = (updates: Partial<ProgramState>) => {
      set(updates);
      saveData(extractProgramData({ ...get(), ...updates }));
    };

    return {
      programCreated: (oneRepMaxes: Record<string, string>) => {
        const state = get();
        const parsedOneRepMaxes: Record<string, number> = {};
        const trainingMaxes: Record<string, number> = {};
        LIFTS.forEach((lift) => {
          const orm = parseFloat(oneRepMaxes[lift.id]) || 0;
          parsedOneRepMaxes[lift.id] = orm;
          trainingMaxes[lift.id] = roundToNearest(orm * (state.trainingMaxPercent / 100));
        });
        save({
          trainingMaxes,
          oneRepMaxes: parsedOneRepMaxes,
          timestamp: Date.now(),
        });
      },

      programReset: () => {
        clearData();
        set({ ...initialState });
      },

      templateChanged: (templateId: TemplateId) => {
        save({ template: templateId });
      },

      exerciseSwapped: async (newExId: string) => {
        const state = get();
        const { activeSwapSlot } = useOverlayStore.getState();
        if (!activeSwapSlot) return;
        const { liftId, slot: slotIdx } = activeSwapSlot;
        const current = state.assistanceSlots || {};
        const defaults = (await import("../constants/exercises")).DEFAULT_ACC;
        const liftSlots = [...(current[liftId] || defaults[liftId])];
        liftSlots[slotIdx] = newExId;
        save({ assistanceSlots: { ...current, [liftId]: liftSlots } });
      },

      unitToggled: () => {
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
        Object.entries(state.assistanceMaximums || {}).forEach(([exerciseId, weight]) => {
          newAssistanceMaximums[exerciseId] = roundToNearest(weight * factor);
        });
        save({
          unit: newUnit,
          oneRepMaxes: newOneRepMaxes,
          trainingMaxes: newTrainingMaxes,
          assistanceMaximums: newAssistanceMaximums,
        });
      },

      trainingMaxPercentChanged: (newPct: number) => {
        const state = get();
        const clamped = Math.max(80, Math.min(95, newPct));
        const newTrainingMaxes: Record<string, number> = {};
        LIFTS.forEach((lift) => {
          newTrainingMaxes[lift.id] = roundToNearest(state.oneRepMaxes[lift.id] * (clamped / 100));
        });
        save({ trainingMaxPercent: clamped, trainingMaxes: newTrainingMaxes });
      },

      oneRepMaxesSaved: (editOneRepMax: Record<string, string>) => {
        const state = get();
        const newOneRepMaxes: Record<string, number> = {};
        const newTrainingMaxes: Record<string, number> = {};
        LIFTS.forEach((lift) => {
          const parsedWeight =
            parseFloat(editOneRepMax[lift.id]) || state.oneRepMaxes[lift.id] || 0;
          newOneRepMaxes[lift.id] = parsedWeight;
          newTrainingMaxes[lift.id] = roundToNearest(
            parsedWeight * (state.trainingMaxPercent / 100),
          );
        });
        save({ oneRepMaxes: newOneRepMaxes, trainingMaxes: newTrainingMaxes });
      },

      assistanceMaximumsSaved: (editAssistance: Record<string, string | number>) => {
        const state = get();
        const newMaximums = { ...state.assistanceMaximums };
        Object.entries(editAssistance).forEach(([exerciseId, value]) => {
          newMaximums[exerciseId] = parseInt(String(value)) || 0;
        });
        save({ assistanceMaximums: newMaximums });
      },

      workoutFinished: (): {
        type: "done" | "pr" | "warn";
        message: string;
        subtitle: string;
        subtitleDetail?: string;
        actionLabel?: string;
        actionSubFrom?: string;
        actionSubTo?: string;
        _liftId?: string;
        _suggestedOneRepMax?: number;
        _suggestedTrainingMax?: number;
      } => {
        const state = get();
        const { activeWeek, activeDay, amrapReps, assistanceLog, workoutStart } =
          useWorkoutStore.getState();
        const programData = extractProgramData(state);
        const template = TEMPLATES[state.template];
        const weekDef = template.weeks[activeWeek];
        const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
        const lift = LIFTS.find((exercise) => exercise.id === liftId)!;
        const trainingMax = state.trainingMaxes[liftId];
        const assistanceExercises = getAssistanceForLift(liftId, programData);

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
          const weight = calcWeight(trainingMax, amrapSet.percentage);
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
        assistanceExercises.forEach((exercise) => {
          if (!assistanceHistory[exercise.id]) assistanceHistory[exercise.id] = [];
          if (exercise.isBodyweight) {
            assistanceHistory[exercise.id].push({
              datetime: Date.now(),
              cycle: state.cycle,
              week: activeWeek,
              isBodyweight: true,
            });
          } else {
            const log = assistanceLog[exercise.id];
            if (log && parseFloat(log.w || "0") > 0) {
              assistanceHistory[exercise.id].push({
                weight: parseFloat(log.w || "0"),
                datetime: Date.now(),
                cycle: state.cycle,
                week: activeWeek,
              });
              if (!assistanceMaximums[exercise.id] || assistanceMaximums[exercise.id] === 0) {
                assistanceMaximums[exercise.id] = roundToNearest(
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
          assistanceLog: { ...assistanceLog },
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
        save(updates);
        const next = { ...state, ...updates };

        const durationMin = Math.floor(durationSec / 60);
        const durationFmt = durationMin > 0 ? durationMin + " min" : "< 1 min";
        const isDeload = activeWeek === 3;

        if (amrapSet && !isDeload) {
          const minReps = parseInt(String(amrapSet.reps).replace("+", "")) || 1;
          const amrapWeight = calcWeight(trainingMax, amrapSet.percentage);
          if (repsHit <= 0) {
            const suggestedOneRepMax = roundToNearest(
              (trainingMax * 0.9) / (next.trainingMaxPercent / 100),
            );
            const suggestedTrainingMax = roundToNearest(
              suggestedOneRepMax * (next.trainingMaxPercent / 100),
            );
            return {
              type: "warn" as const,
              message: "Missed AMRAP",
              subtitle: `0 reps at ${amrapWeight} ${next.unit}`,
              actionLabel: `Adjust TM to ${suggestedTrainingMax}`,
              actionSubFrom: `1RM: ${next.oneRepMaxes![liftId]}`,
              actionSubTo: `${suggestedOneRepMax} ${next.unit}`,
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
              type: "warn" as const,
              message: "Below Target",
              subtitle: `${repsHit} rep${repsHit > 1 ? "s" : ""} at ${amrapWeight} ${next.unit} (needed ${minReps}+)`,
              actionLabel: `Adjust TM to ${suggestedTrainingMax}`,
              actionSubFrom: `1RM: ${next.oneRepMaxes![liftId]}`,
              actionSubTo: `${realOneRepMax} ${next.unit}`,
              _liftId: liftId,
              _suggestedOneRepMax: realOneRepMax,
              _suggestedTrainingMax: suggestedTrainingMax,
            };
          } else if (newOneRepMax) {
            return {
              type: "pr" as const,
              message: "New 1RM!",
              subtitle: `${lift.name}: ${newOneRepMax.old} to ${newOneRepMax.newValue} ${next.unit}`,
              subtitleDetail: durationFmt,
            };
          }
        }
        return {
          type: "done" as const,
          message: "Workout Logged",
          subtitle: lift.name,
          subtitleDetail: durationFmt,
        };
      },

      weekAdvanced: (): {
        type: "cycle" | "advance";
        message?: string;
        subtitle?: string;
      } => {
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
            .filter((exercise) => !exercise.isBodyweight)
            .forEach((exercise) => {
              if (newAssistanceMaximums[exercise.id])
                newAssistanceMaximums[exercise.id] =
                  newAssistanceMaximums[exercise.id] + (exercise.weightIncrement || 5);
            });
          const newBodyweightBaselines = { ...state.bodyweightBaselines };
          getAllAssistanceExercises(programData)
            .filter((exercise) => exercise.isBodyweight)
            .forEach((exercise) => {
              newBodyweightBaselines[exercise.id] = (newBodyweightBaselines[exercise.id] || 8) + 1;
            });
          save({
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
          save({ week: nextWeek });
          return { type: "advance" as const };
        }
      },

      trainingMaxAdjusted: (
        liftId: string,
        suggestedOneRepMax: number,
        suggestedTrainingMax: number,
      ) => {
        const state = get();
        save({
          oneRepMaxes: { ...state.oneRepMaxes, [liftId]: suggestedOneRepMax },
          trainingMaxes: { ...state.trainingMaxes, [liftId]: suggestedTrainingMax },
        });
      },
    };
  },
});

export const hasProgramData = () => {
  return useProgramStore.getState().timestamp > 0;
};
