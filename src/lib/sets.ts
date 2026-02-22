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
  const supplemental = template.supplemental;
  if (!supplemental) return [];

  let percentage: number;
  switch (supplemental.source) {
    case "fixedPercentage":
      percentage = supplemental.percentage;
      break;
    case "weeklyPercentage":
      percentage = supplemental.percentages[phaseIndex];
      break;
    case "firstSetLast":
      percentage = phase.sets[0].percentage;
      break;
    case "secondSetLast":
      percentage = phase.sets[1].percentage;
      break;
  }

  return Array.from({ length: supplemental.numSets }, (_, setIndex) => ({
    reps: supplemental.reps,
    percentage,
    key: `s${setIndex}`,
  }));
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
