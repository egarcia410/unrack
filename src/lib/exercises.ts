import type { Exercise, AccRx, ProgramData } from "../types";
import {
  EXERCISE_LIB,
  DEFAULT_ACC,
  AW,
  BW_BASE,
  BW_DELOAD_DROP,
  FATIGUE,
} from "../constants/exercises";
import { CAT_MIGRATE } from "../constants/migrations";
import { rnd } from "./calc";

export function findEx(id: string): Exercise | undefined {
  return EXERCISE_LIB.find((e) => e.id === id);
}

export function getAccForLift(liftId: string, prog: ProgramData | null): Exercise[] {
  let slots = prog?.accSlots?.[liftId] || DEFAULT_ACC[liftId];
  // Migrate from old object format {push:"id",pull:"id","legs/core":"id"} to array
  if (slots && !Array.isArray(slots)) {
    const obj = slots as unknown as Record<string, string>;
    slots = [
      obj.push || obj["legs/core"] || DEFAULT_ACC[liftId][0],
      obj.pull || DEFAULT_ACC[liftId][1],
      obj["legs/core"] || obj.push || DEFAULT_ACC[liftId][2],
    ];
  }
  return slots.map((exId, i) => {
    let ex: Exercise | undefined = EXERCISE_LIB.find((e) => e.id === exId);
    if (!ex && prog?.customEx?.[exId]) ex = prog.customEx[exId];
    if (!ex) ex = EXERCISE_LIB[i]; // fallback
    return { ...ex, slot: i };
  });
}

export function getAllAccs(prog: ProgramData | null): Exercise[] {
  const all = [...EXERCISE_LIB];
  if (prog?.customEx)
    Object.values(prog.customEx).forEach((e) => {
      if (!all.find((x) => x.id === e.id)) all.push(e);
    });
  return all;
}

export function accDiscovered(acc: Exercise, prog: ProgramData | null): boolean {
  return acc.bw || (prog?.accMax?.[acc.id] || 0) > 0;
}

export function getRx(acc: Exercise, weekIdx: number, prog: ProgramData, liftId?: string): AccRx {
  if (acc.bw) {
    const base = prog.bwBase?.[acc.id] || BW_BASE;
    const isD = weekIdx === 3;
    const reps = isD ? Math.max(3, base - BW_DELOAD_DROP) : base;
    return {
      type: "bw",
      sets: 4,
      reps,
      total: reps * 4,
      lb: isD ? "Deload" : "Working",
      base,
    };
  }
  const w = AW[weekIdx] || AW[0];
  const mx = prog.accMax?.[acc.id] || 0;
  const cat = CAT_MIGRATE[acc.cat] || acc.cat;
  const fatigued = !!(liftId && FATIGUE[liftId] && FATIGUE[liftId].includes(cat));
  const fatPct = fatigued ? 0.9 : 1;
  return {
    type: "wt",
    sets: w.s,
    reps: w.r,
    pct: w.pct,
    wt: mx > 0 ? rnd(mx * w.pct * fatPct) : 0,
    lb: w.lb + (fatigued ? " *" : ""),
    mx,
    fatigued,
  };
}
