import type { SetType, Template, WeekDef } from "../../types";
import { ASSISTANCE_WEEKS } from "../../constants/exercises";
import type { Exercise } from "../../types";

export const WARMUP_SETS = [
  { reps: 5, percentage: 0.4 },
  { reps: 5, percentage: 0.5 },
  { reps: 3, percentage: 0.6 },
] as const;

export const buildSupplementalSets = (
  variant: Template,
  weekDef: WeekDef,
  activeWeek: number,
): Array<{ reps: number; percentage: number; key: string }> => {
  const supp: Array<{ reps: number; percentage: number; key: string }> = [];

  if (variant.supplemental) {
    for (let i = 0; i < variant.supplemental.numSets; i++)
      supp.push({
        reps: variant.supplemental.reps,
        percentage: variant.supplemental.percentage,
        key: `s${i}`,
      });
  } else if (variant.supplementalWeekly) {
    const weeklySupp = variant.supplementalWeekly[activeWeek];
    for (let i = 0; i < weeklySupp.numSets; i++)
      supp.push({ reps: weeklySupp.reps, percentage: weeklySupp.percentage, key: `s${i}` });
  } else if (variant.firstSetLast) {
    for (let i = 0; i < variant.firstSetLast.numSets; i++)
      supp.push({
        reps: variant.firstSetLast.reps,
        percentage: weekDef.sets[0].percentage,
        key: `s${i}`,
      });
  } else if (variant.secondSetLast) {
    for (let i = 0; i < variant.secondSetLast.numSets; i++)
      supp.push({
        reps: variant.secondSetLast.reps,
        percentage: weekDef.sets[1].percentage,
        key: `s${i}`,
      });
  }

  return supp;
};

export const buildAllSets = (
  activeWeek: number,
  weekDef: WeekDef,
  supplementalSets: Array<{ percentage: number; key: string }>,
  accessories: Exercise[],
  isDeload: boolean,
): Array<{ key: string; type: SetType; intensity: number; isDeload: boolean }> => [
  ...WARMUP_SETS.map((w, i) => ({
    key: `w${i}`,
    type: "warmup" as SetType,
    intensity: w.percentage,
    isDeload,
  })),
  ...weekDef.sets.map((s, i) => ({
    key: `m${i}`,
    type: "main" as SetType,
    intensity: s.percentage,
    isDeload,
  })),
  ...supplementalSets.map((s) => ({
    key: s.key,
    type: "supp" as SetType,
    intensity: s.percentage,
    isDeload,
  })),
  ...accessories.map((a) => ({
    key: `a_${a.id}`,
    type: (a.isBodyweight ? "acc_bw" : "acc_wt") as SetType,
    intensity: (ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0]).percentage,
    isDeload,
  })),
];
