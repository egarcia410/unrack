import type { Exercise, AssistancePrescription } from "../types";
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
  return EXERCISE_LIB.find((exercise) => exercise.id === id);
}

export function getAssistanceForLift(
  liftId: string,
  assistanceSlots?: Record<string, string[]>,
  customExercises?: Record<string, Exercise>,
): Exercise[] {
  const slots = assistanceSlots?.[liftId] || DEFAULT_ACC[liftId];
  return slots.map((exerciseId, slotIndex) => {
    let exercise: Exercise | undefined = EXERCISE_LIB.find(
      (existing) => existing.id === exerciseId,
    );
    if (!exercise && customExercises?.[exerciseId]) exercise = customExercises[exerciseId];
    if (!exercise) exercise = EXERCISE_LIB[slotIndex]; // fallback
    return { ...exercise, slot: slotIndex };
  });
}

export function getAllAssistanceExercises(customExercises?: Record<string, Exercise>): Exercise[] {
  const all = [...EXERCISE_LIB];
  if (customExercises)
    Object.values(customExercises).forEach((exercise) => {
      if (!all.find((existing) => existing.id === exercise.id)) all.push(exercise);
    });
  return all;
}

export function isAssistanceDiscovered(
  exercise: Exercise,
  assistanceMaximums: Record<string, number>,
): boolean {
  return exercise.isBodyweight || (assistanceMaximums?.[exercise.id] || 0) > 0;
}

export function getAssistancePrescription(
  exercise: Exercise,
  phaseIndex: number,
  assistanceMaximums: Record<string, number>,
  bodyweightBaselines: Record<string, number>,
  liftId?: string,
): AssistancePrescription {
  if (exercise.isBodyweight) {
    const base = bodyweightBaselines?.[exercise.id] || BW_BASE;
    const isDeload = phaseIndex === 3;
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
  const week = ASSISTANCE_WEEKS[phaseIndex] || ASSISTANCE_WEEKS[0];
  const maximum = assistanceMaximums?.[exercise.id] || 0;
  const category = exercise.category;
  const isFatigued = !!(liftId && FATIGUE[liftId] && FATIGUE[liftId].includes(category));
  const fatigueMultiplier = isFatigued ? 0.9 : 1;
  return {
    type: "wt",
    sets: week.sets,
    reps: week.reps,
    percentage: week.percentage,
    weight: maximum > 0 ? roundToNearest(maximum * week.percentage * fatigueMultiplier) : 0,
    label: week.label + (isFatigued ? " *" : ""),
    maximum,
    fatigued: isFatigued,
  };
}
