import { create } from "zustand";
import type { ProgramData, ThemeMode } from "../types";
import { LIFTS, LIFT_ORDER, VARS } from "../constants/program";
import { AW } from "../constants/exercises";
import { rnd, epley, calcWeight } from "../lib/calc";
import { getAccForLift, getAllAccs } from "../lib/exercises";
import { loadData, saveData, clearData } from "../lib/storage";
import { useUIStore } from "./ui-store";

interface ProgramState {
  prog: ProgramData | null;
  loading: boolean;

  loadProgram: () => Promise<void>;
  createProgram: (params: {
    variant: string;
    unit: "lb" | "kg";
    tmPct: number;
    orms: Record<string, string>;
    mode: ThemeMode;
  }) => Promise<void>;
  resetAll: () => Promise<void>;
  swapVariant: (newVar: string) => Promise<void>;
  swapExercise: (liftId: string, slotIdx: number, newExId: string) => Promise<void>;
  toggleUnit: () => Promise<void>;
  toggleMode: () => Promise<void>;
  changeTmPct: (newPct: number) => Promise<void>;
  saveE1Edits: (editE1: Record<string, string>) => Promise<void>;
  saveAccEdits: (editAcc: Record<string, string | number>) => Promise<void>;
  finishWorkout: (params: {
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
    _lid?: string;
    _sugE1?: number;
    _sugTM?: number;
  }>;
  advanceWeek: () => Promise<{
    type: "cycle" | "advance";
    msg?: string;
    sub?: string;
  }>;
  adjustTmAfterWarn: (lid: string, sugE1: number, sugTM: number) => Promise<void>;
}

export const useProgramStore = create<ProgramState>((set, get) => ({
  prog: null,
  loading: true,

  loadProgram: async () => {
    const saved = await loadData();
    if (saved) {
      set({ prog: saved });
      if (saved.mode) useUIStore.getState().setMode(saved.mode);
    }
    set({ loading: false });
  },

  createProgram: async ({ variant, unit, tmPct, orms, mode }) => {
    const tms: Record<string, number> = {};
    const e1: Record<string, number> = {};
    LIFTS.forEach((l) => {
      const orm = parseFloat(orms[l.id]) || 0;
      tms[l.id] = rnd(orm * (tmPct / 100));
      e1[l.id] = orm;
    });
    const p: ProgramData = {
      variant,
      unit,
      tmPct,
      tms,
      e1,
      cycle: 1,
      week: 0,
      wk: [],
      aH: {},
      accMax: {},
      bwBase: {},
      mode,
      ts: Date.now(),
    };
    await saveData(p);
    set({ prog: p });
  },

  resetAll: async () => {
    await clearData();
    set({ prog: null });
  },

  swapVariant: async (newVar) => {
    const { prog } = get();
    if (!prog) return;
    const u = { ...prog, variant: newVar };
    set({ prog: u });
    await saveData(u);
  },

  swapExercise: async (liftId, slotIdx, newExId) => {
    const { prog } = get();
    if (!prog) return;
    const current = prog.accSlots || {};
    const defaults = (await import("../constants/exercises")).DEFAULT_ACC;
    const liftSlots = [...(current[liftId] || defaults[liftId])];
    liftSlots[slotIdx] = newExId;
    const u = { ...prog, accSlots: { ...current, [liftId]: liftSlots } };
    set({ prog: u });
    await saveData(u);
  },

  toggleUnit: async () => {
    const { prog } = get();
    if (!prog) return;
    const newUnit: "lb" | "kg" = prog.unit === "lb" ? "kg" : "lb";
    const factor = newUnit === "kg" ? 0.453592 : 2.20462;
    const newE1: Record<string, number> = {};
    const newTMs: Record<string, number> = {};
    const newAccMax: Record<string, number> = {};
    LIFTS.forEach((l) => {
      newE1[l.id] = rnd(prog.e1[l.id] * factor);
      newTMs[l.id] = rnd(newE1[l.id] * (prog.tmPct / 100));
    });
    Object.entries(prog.accMax || {}).forEach(([k, v]) => {
      newAccMax[k] = rnd(v * factor);
    });
    const u = {
      ...prog,
      unit: newUnit,
      e1: newE1,
      tms: newTMs,
      accMax: newAccMax,
    };
    set({ prog: u });
    await saveData(u);
  },

  toggleMode: async () => {
    const { prog } = get();
    const uiStore = useUIStore.getState();
    const next: ThemeMode = uiStore.mode === "dark" ? "light" : "dark";
    uiStore.setMode(next);
    if (prog) {
      const u = { ...prog, mode: next };
      set({ prog: u });
      await saveData(u);
    }
  },

  changeTmPct: async (newPct) => {
    const { prog } = get();
    if (!prog) return;
    const clamped = Math.max(80, Math.min(95, newPct));
    const newTMs: Record<string, number> = {};
    LIFTS.forEach((l) => {
      newTMs[l.id] = rnd(prog.e1[l.id] * (clamped / 100));
    });
    const u = { ...prog, tmPct: clamped, tms: newTMs };
    set({ prog: u });
    await saveData(u);
  },

  saveE1Edits: async (editE1) => {
    const { prog } = get();
    if (!prog) return;
    const newE1: Record<string, number> = {};
    const newTMs: Record<string, number> = {};
    LIFTS.forEach((l) => {
      const v = parseFloat(editE1[l.id]) || prog.e1[l.id] || 0;
      newE1[l.id] = v;
      newTMs[l.id] = rnd(v * (prog.tmPct / 100));
    });
    const u = { ...prog, e1: newE1, tms: newTMs };
    set({ prog: u });
    await saveData(u);
  },

  saveAccEdits: async (editAcc) => {
    const { prog } = get();
    if (!prog) return;
    const nMax = { ...prog.accMax };
    Object.entries(editAcc).forEach(([id, val]) => {
      nMax[id] = parseInt(String(val)) || 0;
    });
    const u = { ...prog, accMax: nMax };
    set({ prog: u });
    await saveData(u);
  },

  finishWorkout: async ({ activeWeek, activeDay, amrapReps, accLog, workoutStart }) => {
    const { prog } = get();
    if (!prog)
      return {
        celebType: "done" as const,
        celebMsg: "Error",
        celebSub: "No program",
      };
    const v = VARS[prog.variant];
    const wd = v.wk[activeWeek];
    const lid = LIFT_ORDER[activeDay % LIFT_ORDER.length];
    const lift = LIFTS.find((l) => l.id === lid)!;
    const tm = prog.tms[lid];
    const accs = getAccForLift(lid, prog);

    const amrapSet = wd.s.find((s) => String(s.r).includes("+"));
    const amrapIdx = amrapSet ? wd.s.indexOf(amrapSet) : -1;
    const repsHit = parseInt(amrapReps[`m${amrapIdx}`]);
    let newE1RM: {
      lift: string;
      old: number;
      nw: number;
      reps: number;
      w: number;
    } | null = null;
    if (amrapSet && repsHit > 0) {
      const w = calcWeight(tm, amrapSet.p);
      const est = epley(w, repsHit);
      if (est > prog.e1[lid]) newE1RM = { lift: lid, old: prog.e1[lid], nw: est, reps: repsHit, w };
    }

    const aH = { ...prog.aH };
    const accMax = { ...prog.accMax };
    const bwBase = { ...prog.bwBase };
    accs.forEach((a) => {
      if (!aH[a.id]) aH[a.id] = [];
      if (a.bw) {
        aH[a.id].push({ dt: Date.now(), cy: prog.cycle, wk: activeWeek, bw: true });
      } else {
        const log = accLog[a.id];
        if (log && parseFloat(log.w || "0") > 0) {
          aH[a.id].push({
            w: parseFloat(log.w || "0"),
            dt: Date.now(),
            cy: prog.cycle,
            wk: activeWeek,
          });
          if (!accMax[a.id] || accMax[a.id] === 0) {
            accMax[a.id] = rnd(parseFloat(log.w || "0") / (AW[activeWeek] || AW[0]).pct);
          }
        }
      }
    });

    const durSec = workoutStart ? Math.floor((Date.now() - workoutStart) / 1000) : 0;
    const entry = {
      cy: prog.cycle,
      wk: activeWeek,
      dy: activeDay,
      lf: lid,
      dt: Date.now(),
      dur: durSec,
      am: { ...amrapReps },
      al: { ...accLog },
      ne1: newE1RM,
    };
    const allWorkouts = [...prog.wk, entry];
    const updates: Partial<ProgramData> = { wk: allWorkouts, aH, accMax, bwBase };
    if (newE1RM) updates.e1 = { ...prog.e1, [lid]: newE1RM.nw };
    const next = { ...prog, ...updates } as ProgramData;
    set({ prog: next });
    await saveData(next);

    const durMin = Math.floor(durSec / 60);
    const durFmt = durMin > 0 ? durMin + " min" : "< 1 min";
    const isDeload = activeWeek === 3;

    if (amrapSet && !isDeload) {
      const minR = parseInt(String(amrapSet.r).replace("+", "")) || 1;
      const amrapWt = calcWeight(tm, amrapSet.p);
      if (repsHit <= 0) {
        const sugE1 = rnd((tm * 0.9) / (next.tmPct / 100));
        const sugTM = rnd(sugE1 * (next.tmPct / 100));
        return {
          celebType: "warn" as const,
          celebMsg: "Missed AMRAP",
          celebSub: `0 reps at ${amrapWt} ${next.unit}`,
          actionLabel: `Adjust TM to ${sugTM}`,
          actionSub: `1RM: ${next.e1[lid]} \u2192 ${sugE1} ${next.unit}`,
          _lid: lid,
          _sugE1: sugE1,
          _sugTM: sugTM,
        };
      } else if (repsHit < minR) {
        const realE1 = rnd(epley(amrapWt, repsHit));
        const sugTM = rnd(realE1 * (next.tmPct / 100));
        return {
          celebType: "warn" as const,
          celebMsg: "Below Target",
          celebSub: `${repsHit} rep${repsHit > 1 ? "s" : ""} at ${amrapWt} ${next.unit} (needed ${minR}+)`,
          actionLabel: `Adjust TM to ${sugTM}`,
          actionSub: `1RM: ${next.e1[lid]} \u2192 ${realE1} ${next.unit}`,
          _lid: lid,
          _sugE1: realE1,
          _sugTM: sugTM,
        };
      } else if (newE1RM) {
        return {
          celebType: "pr" as const,
          celebMsg: "New 1RM!",
          celebSub: `${lift.nm}: ${newE1RM.old} to ${newE1RM.nw} ${next.unit} \u00B7 ${durFmt}`,
        };
      }
    }
    return {
      celebType: "done" as const,
      celebMsg: "Workout Logged",
      celebSub: `${lift.nm} \u00B7 ${durFmt}`,
    };
  },

  advanceWeek: async () => {
    const { prog } = get();
    if (!prog) return { type: "advance" as const };
    const v = VARS[prog.variant];
    const nextWeek = prog.week + 1;
    let updates: Partial<ProgramData>;

    if (nextWeek >= v.wk.length) {
      const newTMs = { ...prog.tms };
      LIFTS.forEach((l) => {
        if (prog.e1[l.id] > 0) {
          const tmFromE1 = rnd(prog.e1[l.id] * (prog.tmPct / 100));
          newTMs[l.id] = Math.max(tmFromE1, prog.tms[l.id] + l.inc);
        } else {
          newTMs[l.id] = prog.tms[l.id] + l.inc;
        }
      });
      const nAccMax = { ...prog.accMax };
      getAllAccs(prog)
        .filter((a) => !a.bw)
        .forEach((a) => {
          if (nAccMax[a.id]) nAccMax[a.id] = nAccMax[a.id] + (a.inc || 5);
        });
      const nBwBase = { ...prog.bwBase };
      getAllAccs(prog)
        .filter((a) => a.bw)
        .forEach((a) => {
          nBwBase[a.id] = (nBwBase[a.id] || 8) + 1;
        });
      updates = {
        cycle: prog.cycle + 1,
        week: 0,
        tms: newTMs,
        accMax: nAccMax,
        bwBase: nBwBase,
      };
      const next = { ...prog, ...updates } as ProgramData;
      set({ prog: next });
      await saveData(next);
      return {
        type: "cycle" as const,
        msg: "Cycle Complete!",
        sub: "TMs updated. Assistance progressed.",
      };
    } else {
      updates = { week: nextWeek };
      const next = { ...prog, ...updates } as ProgramData;
      set({ prog: next });
      await saveData(next);
      return { type: "advance" as const };
    }
  },

  adjustTmAfterWarn: async (lid, sugE1, sugTM) => {
    const { prog } = get();
    if (!prog) return;
    const u = {
      ...prog,
      e1: { ...prog.e1, [lid]: sugE1 },
      tms: { ...prog.tms, [lid]: sugTM },
    };
    set({ prog: u });
    await saveData(u);
  },
}));
