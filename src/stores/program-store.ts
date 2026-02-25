import type {
  ProgramData,
  TemplateId,
  Unit,
  Exercise,
  Template,
  Phase,
  WorkoutEntry,
} from "../types";
import { LIFTS, LIFT_ORDER, TEMPLATES } from "../constants/program";
import { WEIGHTED_ASSISTANCE_WEEKS, BODYWEIGHT_ASSISTANCE_WEEKS } from "../constants/exercises";
import { roundToNearest, epley, calcWeight } from "../lib/calc";
import { getAssistanceForLift, getAllAssistanceExercises } from "../lib/exercises";
import { loadData, saveData, clearData } from "../lib/storage";
import { createStore } from "./polaris";
import { useWorkoutStore } from "./workout-store";
import { useOverlayStore } from "./overlay-store";

type ProgramState = {
  templateId: TemplateId;
  unit: Unit;
  trainingMaxPercent: number;
  trainingMaxes: Record<string, number>;
  oneRepMaxes: Record<string, number>;
  cycle: number;
  phase: number;
  workouts: WorkoutEntry[];
  assistanceHistory: Record<
    string,
    Array<{
      datetime?: number;
      cycle?: number;
      phase?: number;
      weight?: number;
      isBodyweight?: boolean;
    }>
  >;
  assistanceMaximums: Record<string, number>;
  bodyweightBaselines: Record<string, number>;
  assistanceSlots: Record<string, string[]>;
  customExercises: Record<string, Exercise>;
  timestamp: number;
};

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
  timestamp: 0,
};

const loadInitialState = (): ProgramState => {
  const saved = loadData();
  if (!saved) return initialState;
  // Map legacy field names from storage
  const mapped: Partial<ProgramState> = {
    ...saved,
    templateId: (saved as any).templateId ?? (saved as any).template,
    phase: (saved as any).phase ?? (saved as any).week,
    workouts: ((saved as any).workouts || []).map((w: any) => ({
      ...w,
      phase: w.phase ?? w.week,
    })),
  };
  delete (mapped as any).template;
  delete (mapped as any).week;
  return { ...initialState, ...mapped };
};

const extractProgramData = (state: ProgramState): ProgramData => ({
  templateId: state.templateId,
  unit: state.unit,
  trainingMaxPercent: state.trainingMaxPercent,
  trainingMaxes: state.trainingMaxes,
  oneRepMaxes: state.oneRepMaxes,
  cycle: state.cycle,
  phase: state.phase,
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

  computed: {
    template: (state: ProgramState): Template => TEMPLATES[state.templateId],
    currentPhase: (state: ProgramState): Phase => TEMPLATES[state.templateId].phases[state.phase],
    currentPhaseWorkouts: (state: ProgramState): WorkoutEntry[] =>
      state.workouts.filter((w) => w.cycle === state.cycle && w.phase === state.phase),
  },

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
        save({ templateId });
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
        useOverlayStore.actions.setActiveSwapSlot(null);
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

      bodyweightBaselinesSaved: (editBaselines: Record<string, string | number>) => {
        const state = get();
        const newBaselines = { ...state.bodyweightBaselines };
        Object.entries(editBaselines).forEach(([exerciseId, value]) => {
          newBaselines[exerciseId] = parseInt(String(value)) || 0;
        });
        save({ bodyweightBaselines: newBaselines });
      },

      workoutFinished: () => {
        const state = get();
        const { activePhase, activeDay, amrapReps, assistanceLog, workoutStart } =
          useWorkoutStore.getState();
        const template = TEMPLATES[state.templateId];
        const phase = template.phases[activePhase];
        const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
        const lift = LIFTS.find((exercise) => exercise.id === liftId)!;
        const trainingMax = state.trainingMaxes[liftId];
        const assistanceExercises = getAssistanceForLift(
          liftId,
          state.assistanceSlots,
          state.customExercises,
        );

        const amrapSet = phase.sets.find((s) => String(s.reps).includes("+"));
        const amrapIdx = amrapSet ? phase.sets.indexOf(amrapSet) : -1;
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

        const assistanceHistory: typeof state.assistanceHistory = {};
        for (const [key, entries] of Object.entries(state.assistanceHistory)) {
          assistanceHistory[key] = [...entries];
        }
        const assistanceMaximums = { ...state.assistanceMaximums };
        const bodyweightBaselines = { ...state.bodyweightBaselines };
        assistanceExercises.forEach((exercise) => {
          if (!assistanceHistory[exercise.id]) assistanceHistory[exercise.id] = [];
          const logEntry = assistanceLog[exercise.id];
          if (exercise.isBodyweight) {
            const enteredReps = parseInt(logEntry?.w || "0");
            if (enteredReps > 0 && !bodyweightBaselines[exercise.id]) {
              const currentWeek =
                BODYWEIGHT_ASSISTANCE_WEEKS[activePhase] || BODYWEIGHT_ASSISTANCE_WEEKS[0];
              bodyweightBaselines[exercise.id] = Math.round(enteredReps / currentWeek.multiplier);
            }
            assistanceHistory[exercise.id].push({
              datetime: Date.now(),
              cycle: state.cycle,
              phase: activePhase,
              isBodyweight: true,
            });
          } else {
            if (logEntry && parseFloat(logEntry.w || "0") > 0) {
              assistanceHistory[exercise.id].push({
                weight: parseFloat(logEntry.w || "0"),
                datetime: Date.now(),
                cycle: state.cycle,
                phase: activePhase,
              });
              if (!assistanceMaximums[exercise.id] || assistanceMaximums[exercise.id] === 0) {
                const weekPercentage = (
                  WEIGHTED_ASSISTANCE_WEEKS[activePhase] || WEIGHTED_ASSISTANCE_WEEKS[0]
                ).percentage;
                assistanceMaximums[exercise.id] = roundToNearest(
                  parseFloat(logEntry.w || "0") / weekPercentage,
                );
              }
            }
          }
        });

        const durationSec = workoutStart ? Math.floor((Date.now() - workoutStart) / 1000) : 0;
        const entry = {
          cycle: state.cycle,
          phase: activePhase,
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
        const isDeload = activePhase === 3;

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
            useOverlayStore.actions.setActiveCelebration({
              type: "warn",
              message: "Missed AMRAP",
              subtitle: `0 reps at ${amrapWeight} ${next.unit}`,
              actionLabel: `Adjust TM to ${suggestedTrainingMax}`,
              actionSubFrom: `1RM: ${next.oneRepMaxes![liftId]}`,
              actionSubTo: `${suggestedOneRepMax} ${next.unit}`,
              _liftId: liftId,
              _suggestedOneRepMax: suggestedOneRepMax,
              _suggestedTrainingMax: suggestedTrainingMax,
            });
            return;
          } else if (repsHit < minReps) {
            const realOneRepMax = roundToNearest(epley(amrapWeight, repsHit));
            const suggestedTrainingMax = roundToNearest(
              realOneRepMax * (next.trainingMaxPercent / 100),
            );
            useOverlayStore.actions.setActiveCelebration({
              type: "warn",
              message: "Below Target",
              subtitle: `${repsHit} rep${repsHit > 1 ? "s" : ""} at ${amrapWeight} ${next.unit} (needed ${minReps}+)`,
              actionLabel: `Adjust TM to ${suggestedTrainingMax}`,
              actionSubFrom: `1RM: ${next.oneRepMaxes![liftId]}`,
              actionSubTo: `${realOneRepMax} ${next.unit}`,
              _liftId: liftId,
              _suggestedOneRepMax: realOneRepMax,
              _suggestedTrainingMax: suggestedTrainingMax,
            });
            return;
          } else if (newOneRepMax) {
            useOverlayStore.actions.setActiveCelebration({
              type: "pr",
              message: "New 1RM!",
              subtitle: `${lift.name}: ${newOneRepMax.old} to ${newOneRepMax.newValue} ${next.unit}`,
              subtitleDetail: durationFmt,
            });
            return;
          }
        }
        useOverlayStore.actions.setActiveCelebration({
          type: "done",
          message: "Workout Logged",
          subtitle: lift.name,
          subtitleDetail: durationFmt,
        });
      },

      phaseAdvanced: () => {
        const state = get();
        const template = TEMPLATES[state.templateId];
        const nextPhase = state.phase + 1;

        if (nextPhase >= template.phases.length) {
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
          getAllAssistanceExercises(state.customExercises)
            .filter((exercise) => !exercise.isBodyweight)
            .forEach((exercise) => {
              if (newAssistanceMaximums[exercise.id])
                newAssistanceMaximums[exercise.id] =
                  newAssistanceMaximums[exercise.id] + (exercise.weightIncrement || 5);
            });
          const newBodyweightBaselines = { ...state.bodyweightBaselines };
          getAllAssistanceExercises(state.customExercises)
            .filter((exercise) => exercise.isBodyweight)
            .forEach((exercise) => {
              if (newBodyweightBaselines[exercise.id] > 0) {
                newBodyweightBaselines[exercise.id] += 1;
              }
            });
          save({
            cycle: state.cycle + 1,
            phase: 0,
            trainingMaxes: newTrainingMaxes,
            assistanceMaximums: newAssistanceMaximums,
            bodyweightBaselines: newBodyweightBaselines,
          });
          useOverlayStore.actions.setActiveCelebration({
            type: "cycle",
            message: "Cycle Complete!",
            subtitle: "TMs updated. Assistance progressed.",
          });
        } else {
          save({ phase: nextPhase });
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
