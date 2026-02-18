import type { Template, TemplateId, Lift } from "../types";

export const TEMPLATES: Record<TemplateId, Template> = {
  classic: {
    name: "5/3/1 Classic",
    description: "Original 3 working sets",
    weeks: [
      {
        label: "5s",
        title: "5s",
        sets: [
          { reps: 5, percentage: 0.65 },
          { reps: 5, percentage: 0.75 },
          { reps: "5+", percentage: 0.85 },
        ],
      },
      {
        label: "3s",
        title: "3s",
        sets: [
          { reps: 3, percentage: 0.7 },
          { reps: 3, percentage: 0.8 },
          { reps: "3+", percentage: 0.9 },
        ],
      },
      {
        label: "5/3/1",
        title: "5/3/1",
        sets: [
          { reps: 5, percentage: 0.75 },
          { reps: 3, percentage: 0.85 },
          { reps: "1+", percentage: 0.95 },
        ],
      },
      {
        label: "Deload",
        title: "Deload",
        sets: [
          { reps: 5, percentage: 0.4 },
          { reps: 5, percentage: 0.5 },
          { reps: 5, percentage: 0.6 },
        ],
      },
    ],
  },
  bbb: {
    name: "Boring But Big",
    description: "5x10 supplemental at 50%",
    weeks: [
      {
        label: "5s",
        title: "5s",
        sets: [
          { reps: 5, percentage: 0.65 },
          { reps: 5, percentage: 0.75 },
          { reps: "5+", percentage: 0.85 },
        ],
      },
      {
        label: "3s",
        title: "3s",
        sets: [
          { reps: 3, percentage: 0.7 },
          { reps: 3, percentage: 0.8 },
          { reps: "3+", percentage: 0.9 },
        ],
      },
      {
        label: "5/3/1",
        title: "5/3/1",
        sets: [
          { reps: 5, percentage: 0.75 },
          { reps: 3, percentage: 0.85 },
          { reps: "1+", percentage: 0.95 },
        ],
      },
      {
        label: "Deload",
        title: "Deload",
        sets: [
          { reps: 5, percentage: 0.4 },
          { reps: 5, percentage: 0.5 },
          { reps: 5, percentage: 0.6 },
        ],
      },
    ],
    supplemental: { numSets: 5, reps: 10, percentage: 0.5 },
  },
  bbbC: {
    name: "BBB Challenge",
    description: "Escalating 50/60/70%",
    weeks: [
      {
        label: "5s",
        title: "5s",
        sets: [
          { reps: 5, percentage: 0.65 },
          { reps: 5, percentage: 0.75 },
          { reps: "5+", percentage: 0.85 },
        ],
      },
      {
        label: "3s",
        title: "3s",
        sets: [
          { reps: 3, percentage: 0.7 },
          { reps: 3, percentage: 0.8 },
          { reps: "3+", percentage: 0.9 },
        ],
      },
      {
        label: "5/3/1",
        title: "5/3/1",
        sets: [
          { reps: 5, percentage: 0.75 },
          { reps: 3, percentage: 0.85 },
          { reps: "1+", percentage: 0.95 },
        ],
      },
      {
        label: "Deload",
        title: "Deload",
        sets: [
          { reps: 5, percentage: 0.4 },
          { reps: 5, percentage: 0.5 },
          { reps: 5, percentage: 0.6 },
        ],
      },
    ],
    supplementalWeekly: [
      { numSets: 5, reps: 10, percentage: 0.5 },
      { numSets: 5, reps: 10, percentage: 0.6 },
      { numSets: 5, reps: 10, percentage: 0.7 },
      { numSets: 5, reps: 10, percentage: 0.6 },
    ],
  },
  fsl: {
    name: "First Set Last",
    description: "5x5 at first set weight",
    weeks: [
      {
        label: "5s",
        title: "5s",
        sets: [
          { reps: 5, percentage: 0.65 },
          { reps: 5, percentage: 0.75 },
          { reps: "5+", percentage: 0.85 },
        ],
      },
      {
        label: "3s",
        title: "3s",
        sets: [
          { reps: 3, percentage: 0.7 },
          { reps: 3, percentage: 0.8 },
          { reps: "3+", percentage: 0.9 },
        ],
      },
      {
        label: "5/3/1",
        title: "5/3/1",
        sets: [
          { reps: 5, percentage: 0.75 },
          { reps: 3, percentage: 0.85 },
          { reps: "1+", percentage: 0.95 },
        ],
      },
      {
        label: "Deload",
        title: "Deload",
        sets: [
          { reps: 5, percentage: 0.4 },
          { reps: 5, percentage: 0.5 },
          { reps: 5, percentage: 0.6 },
        ],
      },
    ],
    firstSetLast: { numSets: 5, reps: 5 },
  },
  ssl: {
    name: "Second Set Last",
    description: "5x5 at second set weight",
    weeks: [
      {
        label: "5s",
        title: "5s",
        sets: [
          { reps: 5, percentage: 0.65 },
          { reps: 5, percentage: 0.75 },
          { reps: "5+", percentage: 0.85 },
        ],
      },
      {
        label: "3s",
        title: "3s",
        sets: [
          { reps: 3, percentage: 0.7 },
          { reps: 3, percentage: 0.8 },
          { reps: "3+", percentage: 0.9 },
        ],
      },
      {
        label: "5/3/1",
        title: "5/3/1",
        sets: [
          { reps: 5, percentage: 0.75 },
          { reps: 3, percentage: 0.85 },
          { reps: "1+", percentage: 0.95 },
        ],
      },
      {
        label: "Deload",
        title: "Deload",
        sets: [
          { reps: 5, percentage: 0.4 },
          { reps: 5, percentage: 0.5 },
          { reps: 5, percentage: 0.6 },
        ],
      },
    ],
    secondSetLast: { numSets: 5, reps: 5 },
  },
};

export const LIFTS: Lift[] = [
  { id: "ohp", name: "Overhead Press", shorthand: "OHP", increment: 5 },
  { id: "deadlift", name: "Deadlift", shorthand: "DL", increment: 10 },
  { id: "bench", name: "Bench Press", shorthand: "BP", increment: 5 },
  { id: "squat", name: "Squat", shorthand: "SQ", increment: 10 },
];

export const LIFT_ORDER = ["squat", "bench", "deadlift", "ohp"];
