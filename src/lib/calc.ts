import type { RestInfo } from "../types";

export const rnd = (w: number, n = 5) => Math.round(w / n) * n;

export const epley = (w: number, r: number) => Math.round(w * (1 + r / 30));

export const calcTM = (orm: number, tmPct: number) => rnd(orm * (tmPct / 100));

export const calcWeight = (tm: number, pct: number) => rnd(tm * pct);

export function smartRest(setType: string, intensity: number, isDeload: boolean): RestInfo {
  if (isDeload) return { dur: 60, why: "Deload phase" };
  if (setType === "warmup") return { dur: 60, why: "Warm-up" };
  if (setType === "acc_bw") return { dur: 60, why: "Bodyweight" };
  if (setType === "acc_wt") return { dur: 90, why: "Assistance" };
  if (setType === "supp")
    return intensity <= 0.55
      ? { dur: 90, why: "Volume — metabolic stress" }
      : { dur: 120, why: "Supplemental recovery" };
  if (intensity >= 0.9) return { dur: 180, why: "Heavy — full recovery" };
  if (intensity >= 0.8) return { dur: 150, why: "Hard set — CNS recovery" };
  if (intensity >= 0.7) return { dur: 120, why: "Working weight" };
  return { dur: 90, why: "Moderate intensity" };
}
