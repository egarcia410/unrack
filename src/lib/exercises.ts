import type { Exercise, AccRx, ProgramData } from "../types";
import {
  EXERCISE_LIB,
  DEFAULT_ACC,
  ASSISTANCE_WEEKS,
  BW_BASE,
  BW_DELOAD_DROP,
  FATIGUE,
} from "../constants/exercises";
import { roundToNearest } from "./calc";

export function findExercise(id: string): Exercise | undefined {
  return EXERCISE_LIB.find((e) => e.id === id);
}

export function getAssistanceForLift(liftId: string, prog: ProgramData): Exercise[] {
  const slots = prog.assistanceSlots?.[liftId] || DEFAULT_ACC[liftId];
  return slots.map((exId, i) => {
    let exercise: Exercise | undefined = EXERCISE_LIB.find((e) => e.id === exId);
    if (!exercise && prog.customExercises?.[exId]) exercise = prog.customExercises[exId];
    if (!exercise) exercise = EXERCISE_LIB[i]; // fallback
    return { ...exercise, slot: i };
  });
}

export function getAllAssistanceExercises(prog: ProgramData): Exercise[] {
  const all = [...EXERCISE_LIB];
  if (prog.customExercises)
    Object.values(prog.customExercises).forEach((e) => {
      if (!all.find((x) => x.id === e.id)) all.push(e);
    });
  return all;
}

export function isAssistanceDiscovered(acc: Exercise, prog: ProgramData): boolean {
  return acc.isBodyweight || (prog.assistanceMaximums?.[acc.id] || 0) > 0;
}

export function getAssistancePrescription(
  acc: Exercise,
  weekIdx: number,
  prog: ProgramData,
  liftId?: string,
): AccRx {
  if (acc.isBodyweight) {
    const base = prog.bodyweightBaselines?.[acc.id] || BW_BASE;
    const isDeload = weekIdx === 3;
    const reps = isDeload ? Math.max(3, base - BW_DELOAD_DROP) : base;
    return {
      type: "bw",
      sets: 4,
      reps,
      total: reps * 4,
      label: isDeload ? "Deload" : "Working",
      base,
    };
  }
  const week = ASSISTANCE_WEEKS[weekIdx] || ASSISTANCE_WEEKS[0];
  const maximum = prog.assistanceMaximums?.[acc.id] || 0;
  const category = acc.category;
  const fatigued = !!(liftId && FATIGUE[liftId] && FATIGUE[liftId].includes(category));
  const fatiguePct = fatigued ? 0.9 : 1;
  return {
    type: "wt",
    sets: week.sets,
    reps: week.reps,
    pct: week.percentage,
    weight: maximum > 0 ? roundToNearest(maximum * week.percentage * fatiguePct) : 0,
    label: week.label + (fatigued ? " *" : ""),
    maximum,
    fatigued,
  };
}
