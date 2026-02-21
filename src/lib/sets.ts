import type { Template, WeekDef, SetType, Exercise } from "../types";
import { ASSISTANCE_WEEKS } from "../constants/exercises";

export const WARMUP_SETS = [
  { reps: 5, percentage: 0.4 },
  { reps: 5, percentage: 0.5 },
  { reps: 3, percentage: 0.6 },
] as const;

export type SupplementalSet = {
  reps: number;
  percentage: number;
  key: string;
};

export type WorkoutSet = {
  key: string;
  type: SetType;
  intensity: number;
  isDeload: boolean;
};

export const deriveSupplementalSets = (
  variant: Template,
  weekDef: WeekDef,
  activeWeek: number,
): SupplementalSet[] => {
  const supplementalSets: SupplementalSet[] = [];
  if (variant.supplemental) {
    for (let setIndex = 0; setIndex < variant.supplemental.numSets; setIndex++)
      supplementalSets.push({
        reps: variant.supplemental.reps,
        percentage: variant.supplemental.percentage,
        key: `s${setIndex}`,
      });
  } else if (variant.supplementalWeekly) {
    const weeklySupp = variant.supplementalWeekly[activeWeek];
    for (let setIndex = 0; setIndex < weeklySupp.numSets; setIndex++)
      supplementalSets.push({
        reps: weeklySupp.reps,
        percentage: weeklySupp.percentage,
        key: `s${setIndex}`,
      });
  } else if (variant.firstSetLast) {
    for (let setIndex = 0; setIndex < variant.firstSetLast.numSets; setIndex++)
      supplementalSets.push({
        reps: variant.firstSetLast.reps,
        percentage: weekDef.sets[0].percentage,
        key: `s${setIndex}`,
      });
  } else if (variant.secondSetLast) {
    for (let setIndex = 0; setIndex < variant.secondSetLast.numSets; setIndex++)
      supplementalSets.push({
        reps: variant.secondSetLast.reps,
        percentage: weekDef.sets[1].percentage,
        key: `s${setIndex}`,
      });
  }
  return supplementalSets;
};

export const deriveAllSets = (
  activeWeek: number,
  weekDef: WeekDef,
  supplementalSets: SupplementalSet[],
  accessories: Exercise[],
  isDeload: boolean,
): WorkoutSet[] => [
  ...WARMUP_SETS.map((warmupSet, setIndex) => ({
    key: `w${setIndex}`,
    type: "warmup" as SetType,
    intensity: warmupSet.percentage,
    isDeload,
  })),
  ...weekDef.sets.map((mainSet, setIndex) => ({
    key: `m${setIndex}`,
    type: "main" as SetType,
    intensity: mainSet.percentage,
    isDeload,
  })),
  ...supplementalSets.map((supplementalSet) => ({
    key: supplementalSet.key,
    type: "supp" as SetType,
    intensity: supplementalSet.percentage,
    isDeload,
  })),
  ...accessories.map((accessory) => ({
    key: `a_${accessory.id}`,
    type: (accessory.isBodyweight ? "acc_bw" : "acc_wt") as SetType,
    intensity: (ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0]).percentage,
    isDeload,
  })),
];
