import type { Exercise, AssistancePrescription } from "../types";
import {
  EXERCISE_LIB,
  DEFAULT_ACC,
  WEIGHTED_ASSISTANCE_WEEKS,
  BODYWEIGHT_ASSISTANCE_WEEKS,
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
  bodyweightBaselines: Record<string, number>,
): boolean {
  if (exercise.isBodyweight) return (bodyweightBaselines?.[exercise.id] || 0) > 0;
  return (assistanceMaximums?.[exercise.id] || 0) > 0;
}

export function getAssistancePrescription(
  exercise: Exercise,
  phaseIndex: number,
  assistanceMaximums: Record<string, number>,
  bodyweightBaselines: Record<string, number>,
  liftId?: string,
): AssistancePrescription {
  if (exercise.isBodyweight) {
    const base = bodyweightBaselines?.[exercise.id] || 0;
    const week = BODYWEIGHT_ASSISTANCE_WEEKS[phaseIndex] || BODYWEIGHT_ASSISTANCE_WEEKS[0];
    const reps = Math.max(1, Math.round(base * week.multiplier));
    return {
      type: "bodyweight",
      sets: week.sets,
      reps,
      total: reps * week.sets,
      label: week.label,
      base,
    };
  }
  const week = WEIGHTED_ASSISTANCE_WEEKS[phaseIndex] || WEIGHTED_ASSISTANCE_WEEKS[0];
  const maximum = assistanceMaximums?.[exercise.id] || 0;
  const category = exercise.category;
  const isFatigued = !!(liftId && FATIGUE[liftId] && FATIGUE[liftId].includes(category));
  const fatigueMultiplier = isFatigued ? 0.9 : 1;
  return {
    type: "weighted",
    sets: week.sets,
    reps: week.reps,
    percentage: week.percentage,
    weight: maximum > 0 ? roundToNearest(maximum * week.percentage * fatigueMultiplier) : 0,
    label: week.label + (isFatigued ? " *" : ""),
    maximum,
    fatigued: isFatigued,
  };
}
