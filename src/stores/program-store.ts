import { create } from "zustand";
import type { ProgramData, TemplateId, Unit } from "../types";
import { LIFTS, LIFT_ORDER, TEMPLATES } from "../constants/program";
import { ASSISTANCE_WEEKS } from "../constants/exercises";
import { roundToNearest, epley, calcWeight } from "../lib/calc";
import { getAssistanceForLift, getAllAssistanceExercises } from "../lib/exercises";
import { loadData, saveData, clearData } from "../lib/storage";
import { useUIStore } from "./ui-store";

const inferUnit = (): Unit =>
  ((typeof navigator !== "undefined" && navigator.language) || "en-US").startsWith("en-US")
    ? "lb"
    : "kg";

interface ProgramActions {
  loadProgram: () => Promise<void>;
  programCreated: (oneRepMaxes: Record<string, string>) => Promise<void>;
  programReset: () => Promise<void>;
  templateChanged: (templateId: TemplateId) => Promise<void>;
  exerciseSwapped: (liftId: string, slotIdx: number, newExId: string) => Promise<void>;
  unitToggled: () => Promise<void>;
  modeToggled: () => Promise<void>;
  trainingMaxPercentChanged: (newPct: number) => Promise<void>;
  oneRepMaxesSaved: (editE1: Record<string, string>) => Promise<void>;
  assistanceMaximumsSaved: (editAcc: Record<string, string | number>) => Promise<void>;
  workoutFinished: (params: {
    activeWeek: number;
    activeDay: number;
    amrapReps: Record<string, string>;
    accLog: Record<string, { w?: string }>;
    accSets: Record<string, number>;
    workoutStart: number | null;
  }) => Promise<{
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
}

interface ProgramState {
  prog: ProgramData | null;
  loading: boolean;
  unit: Unit;
  actions: ProgramActions;
}

export const useProgramStore = create<ProgramState>((set, get) => ({
  prog: null,
  loading: true,
  unit: inferUnit(),

  actions: {
    loadProgram: async () => {
      const saved = await loadData();
      if (saved) {
        set({ prog: saved, unit: saved.unit });
        if (saved.mode) useUIStore.getState().setMode(saved.mode);
      }
      set({ loading: false });
    },

    programCreated: async (oneRepMaxes) => {
      const { unit } = get();
      const mode = useUIStore.getState().mode;
      const trainingMaxPercent = 90;
      const template: TemplateId = "fsl";

      const parsedOneRepMaxes: Record<string, number> = {};
      const trainingMaxes: Record<string, number> = {};
      LIFTS.forEach((lift) => {
        const orm = parseFloat(oneRepMaxes[lift.id]) || 0;
        parsedOneRepMaxes[lift.id] = orm;
        trainingMaxes[lift.id] = roundToNearest(orm * (trainingMaxPercent / 100));
      });

      const program: ProgramData = {
        template,
        unit,
        trainingMaxPercent,
        trainingMaxes,
        oneRepMaxes: parsedOneRepMaxes,
        cycle: 1,
        week: 0,
        workouts: [],
        assistanceHistory: {},
        assistanceMaximums: {},
        bodyweightBaselines: {},
        mode,
        timestamp: Date.now(),
      };
      await saveData(program);
      set({ prog: program });
    },

    programReset: async () => {
      await clearData();
      set({ prog: null });
    },

    templateChanged: async (templateId) => {
      const { prog } = get();
      if (!prog) return;
      const updated = { ...prog, template: templateId };
      set({ prog: updated });
      await saveData(updated);
    },

    exerciseSwapped: async (liftId, slotIdx, newExId) => {
      const { prog } = get();
      if (!prog) return;
      const current = prog.assistanceSlots || {};
      const defaults = (await import("../constants/exercises")).DEFAULT_ACC;
      const liftSlots = [...(current[liftId] || defaults[liftId])];
      liftSlots[slotIdx] = newExId;
      const updated = { ...prog, assistanceSlots: { ...current, [liftId]: liftSlots } };
      set({ prog: updated });
      await saveData(updated);
    },

    unitToggled: async () => {
      const { prog } = get();
      if (!prog) return;
      const newUnit: Unit = prog.unit === "lb" ? "kg" : "lb";
      const factor = newUnit === "kg" ? 0.453592 : 2.20462;
      const newOneRepMaxes: Record<string, number> = {};
      const newTrainingMaxes: Record<string, number> = {};
      const newAssistanceMaximums: Record<string, number> = {};
      LIFTS.forEach((lift) => {
        newOneRepMaxes[lift.id] = roundToNearest(prog.oneRepMaxes[lift.id] * factor);
        newTrainingMaxes[lift.id] = roundToNearest(
          newOneRepMaxes[lift.id] * (prog.trainingMaxPercent / 100),
        );
      });
      Object.entries(prog.assistanceMaximums || {}).forEach(([k, v]) => {
        newAssistanceMaximums[k] = roundToNearest(v * factor);
      });
      const updated = {
        ...prog,
        unit: newUnit,
        oneRepMaxes: newOneRepMaxes,
        trainingMaxes: newTrainingMaxes,
        assistanceMaximums: newAssistanceMaximums,
      };
      set({ prog: updated, unit: newUnit });
      await saveData(updated);
    },

    modeToggled: async () => {
      const { prog } = get();
      const uiStore = useUIStore.getState();
      const next = uiStore.mode === "dark" ? ("light" as const) : ("dark" as const);
      uiStore.setMode(next);
      if (prog) {
        const updated = { ...prog, mode: next };
        set({ prog: updated });
        await saveData(updated);
      }
    },

    trainingMaxPercentChanged: async (newPct) => {
      const { prog } = get();
      if (!prog) return;
      const clamped = Math.max(80, Math.min(95, newPct));
      const newTrainingMaxes: Record<string, number> = {};
      LIFTS.forEach((lift) => {
        newTrainingMaxes[lift.id] = roundToNearest(prog.oneRepMaxes[lift.id] * (clamped / 100));
      });
      const updated = { ...prog, trainingMaxPercent: clamped, trainingMaxes: newTrainingMaxes };
      set({ prog: updated });
      await saveData(updated);
    },

    oneRepMaxesSaved: async (editE1) => {
      const { prog } = get();
      if (!prog) return;
      const newOneRepMaxes: Record<string, number> = {};
      const newTrainingMaxes: Record<string, number> = {};
      LIFTS.forEach((lift) => {
        const val = parseFloat(editE1[lift.id]) || prog.oneRepMaxes[lift.id] || 0;
        newOneRepMaxes[lift.id] = val;
        newTrainingMaxes[lift.id] = roundToNearest(val * (prog.trainingMaxPercent / 100));
      });
      const updated = { ...prog, oneRepMaxes: newOneRepMaxes, trainingMaxes: newTrainingMaxes };
      set({ prog: updated });
      await saveData(updated);
    },

    assistanceMaximumsSaved: async (editAcc) => {
      const { prog } = get();
      if (!prog) return;
      const newMaximums = { ...prog.assistanceMaximums };
      Object.entries(editAcc).forEach(([id, val]) => {
        newMaximums[id] = parseInt(String(val)) || 0;
      });
      const updated = { ...prog, assistanceMaximums: newMaximums };
      set({ prog: updated });
      await saveData(updated);
    },

    workoutFinished: async ({ activeWeek, activeDay, amrapReps, accLog, workoutStart }) => {
      const { prog } = get();
      if (!prog)
        return {
          celebType: "done" as const,
          celebMsg: "Error",
          celebSub: "No program",
        };
      const template = TEMPLATES[prog.template];
      const weekDef = template.weeks[activeWeek];
      const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
      const lift = LIFTS.find((l) => l.id === liftId)!;
      const tm = prog.trainingMaxes[liftId];
      const accs = getAssistanceForLift(liftId, prog);

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
        if (est > prog.oneRepMaxes[liftId])
          newOneRepMax = {
            lift: liftId,
            old: prog.oneRepMaxes[liftId],
            newValue: est,
            reps: repsHit,
            weight,
          };
      }

      const assistanceHistory = { ...prog.assistanceHistory };
      const assistanceMaximums = { ...prog.assistanceMaximums };
      const bodyweightBaselines = { ...prog.bodyweightBaselines };
      accs.forEach((a) => {
        if (!assistanceHistory[a.id]) assistanceHistory[a.id] = [];
        if (a.isBodyweight) {
          assistanceHistory[a.id].push({
            datetime: Date.now(),
            cycle: prog.cycle,
            week: activeWeek,
            isBodyweight: true,
          });
        } else {
          const log = accLog[a.id];
          if (log && parseFloat(log.w || "0") > 0) {
            assistanceHistory[a.id].push({
              weight: parseFloat(log.w || "0"),
              datetime: Date.now(),
              cycle: prog.cycle,
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
        cycle: prog.cycle,
        week: activeWeek,
        day: activeDay,
        lift: liftId,
        datetime: Date.now(),
        duration: durationSec,
        amrapReps: { ...amrapReps },
        assistanceLog: { ...accLog },
        newOneRepMax,
      };
      const allWorkouts = [...prog.workouts, entry];
      const updates: Partial<ProgramData> = {
        workouts: allWorkouts,
        assistanceHistory,
        assistanceMaximums,
        bodyweightBaselines,
      };
      if (newOneRepMax)
        updates.oneRepMaxes = { ...prog.oneRepMaxes, [liftId]: newOneRepMax.newValue };
      const next = { ...prog, ...updates } as ProgramData;
      set({ prog: next });
      await saveData(next);

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
            actionSub: `1RM: ${next.oneRepMaxes[liftId]} \u2192 ${suggestedOneRepMax} ${next.unit}`,
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
            actionSub: `1RM: ${next.oneRepMaxes[liftId]} \u2192 ${realOneRepMax} ${next.unit}`,
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
      const { prog } = get();
      if (!prog) return { type: "advance" as const };
      const template = TEMPLATES[prog.template];
      const nextWeek = prog.week + 1;
      let updates: Partial<ProgramData>;

      if (nextWeek >= template.weeks.length) {
        const newTrainingMaxes = { ...prog.trainingMaxes };
        LIFTS.forEach((lift) => {
          if (prog.oneRepMaxes[lift.id] > 0) {
            const tmFromOneRepMax = roundToNearest(
              prog.oneRepMaxes[lift.id] * (prog.trainingMaxPercent / 100),
            );
            newTrainingMaxes[lift.id] = Math.max(
              tmFromOneRepMax,
              prog.trainingMaxes[lift.id] + lift.increment,
            );
          } else {
            newTrainingMaxes[lift.id] = prog.trainingMaxes[lift.id] + lift.increment;
          }
        });
        const newAssistanceMaximums = { ...prog.assistanceMaximums };
        getAllAssistanceExercises(prog)
          .filter((a) => !a.isBodyweight)
          .forEach((a) => {
            if (newAssistanceMaximums[a.id])
              newAssistanceMaximums[a.id] = newAssistanceMaximums[a.id] + (a.inc || 5);
          });
        const newBodyweightBaselines = { ...prog.bodyweightBaselines };
        getAllAssistanceExercises(prog)
          .filter((a) => a.isBodyweight)
          .forEach((a) => {
            newBodyweightBaselines[a.id] = (newBodyweightBaselines[a.id] || 8) + 1;
          });
        updates = {
          cycle: prog.cycle + 1,
          week: 0,
          trainingMaxes: newTrainingMaxes,
          assistanceMaximums: newAssistanceMaximums,
          bodyweightBaselines: newBodyweightBaselines,
        };
        const next = { ...prog, ...updates } as ProgramData;
        set({ prog: next });
        await saveData(next);
        return {
          type: "cycle" as const,
          message: "Cycle Complete!",
          subtitle: "TMs updated. Assistance progressed.",
        };
      } else {
        updates = { week: nextWeek };
        const next = { ...prog, ...updates } as ProgramData;
        set({ prog: next });
        await saveData(next);
        return { type: "advance" as const };
      }
    },

    trainingMaxAdjusted: async (liftId, suggestedOneRepMax, suggestedTrainingMax) => {
      const { prog } = get();
      if (!prog) return;
      const updated = {
        ...prog,
        oneRepMaxes: { ...prog.oneRepMaxes, [liftId]: suggestedOneRepMax },
        trainingMaxes: { ...prog.trainingMaxes, [liftId]: suggestedTrainingMax },
      };
      set({ prog: updated });
      await saveData(updated);
    },
  },
}));

// Exported selectors
export const useProg = () => useProgramStore((s) => s.prog);
export const useUnit = () => useProgramStore((s) => s.unit);
export const useLoading = () => useProgramStore((s) => s.loading);
export const useProgramActions = () => useProgramStore((s) => s.actions);
