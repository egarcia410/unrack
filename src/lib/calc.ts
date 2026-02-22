import type { RestInfo, SetType } from "../types";

export const roundToNearest = (weight: number, roundingInterval = 5) =>
  Math.round(weight / roundingInterval) * roundingInterval;

export const epley = (weight: number, reps: number) => Math.round(weight * (1 + reps / 30));

export const calcTM = (oneRepMax: number, trainingMaxPercentage: number) =>
  roundToNearest(oneRepMax * (trainingMaxPercentage / 100));

export const calcWeight = (trainingMax: number, percentage: number) =>
  roundToNearest(trainingMax * percentage);

export const smartRest = (setType: SetType, intensity: number, isDeload: boolean): RestInfo => {
  if (isDeload) return { duration: 60, reason: "Deload phase" };
  if (setType === "warmup") return { duration: 60, reason: "Warm-up" };
  if (setType === "acc_bodyweight") return { duration: 60, reason: "Bodyweight" };
  if (setType === "acc_weighted") return { duration: 90, reason: "Assistance" };
  if (setType === "supp")
    return intensity <= 0.55
      ? { duration: 90, reason: "Volume — metabolic stress" }
      : { duration: 120, reason: "Supplemental recovery" };
  if (intensity >= 0.9) return { duration: 180, reason: "Heavy — full recovery" };
  if (intensity >= 0.8) return { duration: 150, reason: "Hard set — CNS recovery" };
  if (intensity >= 0.7) return { duration: 120, reason: "Working weight" };
  return { duration: 90, reason: "Moderate intensity" };
};
