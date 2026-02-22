import type { Template, Phase, SetType, Exercise } from "../types";
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
  template: Template,
  phase: Phase,
  phaseIndex: number,
): SupplementalSet[] => {
  const supplementalSets: SupplementalSet[] = [];
  if (template.supplemental) {
    for (let setIndex = 0; setIndex < template.supplemental.numSets; setIndex++)
      supplementalSets.push({
        reps: template.supplemental.reps,
        percentage: template.supplemental.percentage,
        key: `s${setIndex}`,
      });
  } else if (template.supplementalWeekly) {
    const weeklySupp = template.supplementalWeekly[phaseIndex];
    for (let setIndex = 0; setIndex < weeklySupp.numSets; setIndex++)
      supplementalSets.push({
        reps: weeklySupp.reps,
        percentage: weeklySupp.percentage,
        key: `s${setIndex}`,
      });
  } else if (template.firstSetLast) {
    for (let setIndex = 0; setIndex < template.firstSetLast.numSets; setIndex++)
      supplementalSets.push({
        reps: template.firstSetLast.reps,
        percentage: phase.sets[0].percentage,
        key: `s${setIndex}`,
      });
  } else if (template.secondSetLast) {
    for (let setIndex = 0; setIndex < template.secondSetLast.numSets; setIndex++)
      supplementalSets.push({
        reps: template.secondSetLast.reps,
        percentage: phase.sets[1].percentage,
        key: `s${setIndex}`,
      });
  }
  return supplementalSets;
};

export const deriveAllSets = (
  phaseIndex: number,
  phase: Phase,
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
  ...phase.sets.map((mainSet, setIndex) => ({
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
    intensity: (ASSISTANCE_WEEKS[phaseIndex] || ASSISTANCE_WEEKS[0]).percentage,
    isDeload,
  })),
];
