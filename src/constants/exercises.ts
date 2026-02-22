import type { Exercise, WeightedAssistanceWeek, BodyweightAssistanceWeek } from "../types";

export const EXERCISE_LIB: Exercise[] = [
  { id: "dips", name: "Dips", category: "push", isBodyweight: true },
  { id: "pushup", name: "Push-Ups", category: "push", isBodyweight: true },
  {
    id: "cgbp",
    name: "Close-Grip Bench",
    category: "push",
    isBodyweight: false,
    weightIncrement: 5,
  },
  {
    id: "lmpress",
    name: "Landmine Press",
    category: "push",
    isBodyweight: false,
    weightIncrement: 5,
  },
  {
    id: "dbpress",
    name: "DB Bench Press",
    category: "push",
    isBodyweight: false,
    weightIncrement: 5,
  },
  {
    id: "dbincline",
    name: "DB Incline Press",
    category: "push",
    isBodyweight: false,
    weightIncrement: 5,
  },
  {
    id: "tripush",
    name: "Tricep Pushdown",
    category: "push",
    isBodyweight: false,
    weightIncrement: 5,
  },
  { id: "chinup", name: "Chin-Ups", category: "pull", isBodyweight: true },
  { id: "pullup", name: "Pull-Ups", category: "pull", isBodyweight: true },
  { id: "bbrow", name: "Barbell Row", category: "pull", isBodyweight: false, weightIncrement: 5 },
  { id: "dbrow", name: "Dumbbell Row", category: "pull", isBodyweight: false, weightIncrement: 5 },
  { id: "lmrow", name: "Landmine Row", category: "pull", isBodyweight: false, weightIncrement: 5 },
  { id: "facepull", name: "Face Pulls", category: "pull", isBodyweight: false, weightIncrement: 5 },
  {
    id: "latpull",
    name: "Lat Pulldown",
    category: "pull",
    isBodyweight: false,
    weightIncrement: 5,
  },
  { id: "curls", name: "Curls", category: "pull", isBodyweight: false, weightIncrement: 5 },
  {
    id: "rdl",
    name: "Romanian Deadlift",
    category: "legs/core",
    isBodyweight: false,
    weightIncrement: 10,
  },
  {
    id: "frontsq",
    name: "Front Squat",
    category: "legs/core",
    isBodyweight: false,
    weightIncrement: 10,
  },
  {
    id: "goodam",
    name: "Good Morning",
    category: "legs/core",
    isBodyweight: false,
    weightIncrement: 5,
  },
  { id: "lunge", name: "Lunges", category: "legs/core", isBodyweight: false, weightIncrement: 5 },
  {
    id: "bss",
    name: "Bulgarian Split Squat",
    category: "legs/core",
    isBodyweight: false,
    weightIncrement: 5,
  },
  { id: "hangleg", name: "Hanging Leg Raise", category: "legs/core", isBodyweight: true },
  { id: "abwheel", name: "Ab Wheel", category: "legs/core", isBodyweight: true },
  { id: "backraise", name: "Back Raise", category: "legs/core", isBodyweight: true },
];

export const DEFAULT_ACC: Record<string, string[]> = {
  squat: ["dips", "chinup", "hangleg"],
  bench: ["pushup", "dbrow", "lunge"],
  deadlift: ["dips", "chinup", "abwheel"],
  ohp: ["pushup", "dbrow", "backraise"],
};

export const EXERCISE_CATEGORIES = ["push", "pull", "legs/core"];

export const CAT_LABELS: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  "legs/core": "Legs/Core",
};

export const FATIGUE: Record<string, string[]> = {
  squat: ["legs/core"],
  deadlift: ["legs/core"],
  bench: ["push"],
  ohp: ["push"],
};

export const WEIGHTED_ASSISTANCE_WEEKS: WeightedAssistanceWeek[] = [
  { type: "weighted", sets: 4, reps: 10, percentage: 0.6, label: "Volume" },
  { type: "weighted", sets: 4, reps: 8, percentage: 0.67, label: "Moderate" },
  { type: "weighted", sets: 4, reps: 6, percentage: 0.75, label: "Intensity" },
  { type: "weighted", sets: 3, reps: 10, percentage: 0.5, label: "Deload" },
];

export const BODYWEIGHT_ASSISTANCE_WEEKS: BodyweightAssistanceWeek[] = [
  { type: "bodyweight", sets: 4, multiplier: 1.25, label: "Volume" },
  { type: "bodyweight", sets: 4, multiplier: 1.0, label: "Moderate" },
  { type: "bodyweight", sets: 4, multiplier: 0.75, label: "Intensity" },
  { type: "bodyweight", sets: 3, multiplier: 0.6, label: "Deload" },
];
