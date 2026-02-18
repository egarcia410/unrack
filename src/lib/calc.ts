import type { RestInfo } from "../types";

export const roundToNearest = (w: number, n = 5) => Math.round(w / n) * n;

export const epley = (w: number, r: number) => Math.round(w * (1 + r / 30));

export const calcTM = (orm: number, tmPct: number) => roundToNearest(orm * (tmPct / 100));

export const calcWeight = (tm: number, pct: number) => roundToNearest(tm * pct);

export function smartRest(setType: string, intensity: number, isDeload: boolean): RestInfo {
  if (isDeload) return { duration: 60, reason: "Deload phase" };
  if (setType === "warmup") return { duration: 60, reason: "Warm-up" };
  if (setType === "acc_bw") return { duration: 60, reason: "Bodyweight" };
  if (setType === "acc_wt") return { duration: 90, reason: "Assistance" };
  if (setType === "supp")
    return intensity <= 0.55
      ? { duration: 90, reason: "Volume — metabolic stress" }
      : { duration: 120, reason: "Supplemental recovery" };
  if (intensity >= 0.9) return { duration: 180, reason: "Heavy — full recovery" };
  if (intensity >= 0.8) return { duration: 150, reason: "Hard set — CNS recovery" };
  if (intensity >= 0.7) return { duration: 120, reason: "Working weight" };
  return { duration: 90, reason: "Moderate intensity" };
}
