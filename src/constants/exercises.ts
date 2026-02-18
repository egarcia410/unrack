import type { Exercise, AccWeek } from "../types";

export const EXERCISE_LIB: Exercise[] = [
  { id: "dips", name: "Dips", category: "push", isBodyweight: true },
  { id: "pushup", name: "Push-Ups", category: "push", isBodyweight: true },
  { id: "cgbp", name: "Close-Grip Bench", category: "push", isBodyweight: false, inc: 5 },
  { id: "lmpress", name: "Landmine Press", category: "push", isBodyweight: false, inc: 5 },
  { id: "dbpress", name: "DB Bench Press", category: "push", isBodyweight: false, inc: 5 },
  { id: "dbincline", name: "DB Incline Press", category: "push", isBodyweight: false, inc: 5 },
  { id: "tripush", name: "Tricep Pushdown", category: "push", isBodyweight: false, inc: 5 },
  { id: "chinup", name: "Chin-Ups", category: "pull", isBodyweight: true },
  { id: "pullup", name: "Pull-Ups", category: "pull", isBodyweight: true },
  { id: "bbrow", name: "Barbell Row", category: "pull", isBodyweight: false, inc: 5 },
  { id: "dbrow", name: "Dumbbell Row", category: "pull", isBodyweight: false, inc: 5 },
  { id: "lmrow", name: "Landmine Row", category: "pull", isBodyweight: false, inc: 5 },
  { id: "facepull", name: "Face Pulls", category: "pull", isBodyweight: false, inc: 5 },
  { id: "latpull", name: "Lat Pulldown", category: "pull", isBodyweight: false, inc: 5 },
  { id: "curls", name: "Curls", category: "pull", isBodyweight: false, inc: 5 },
  { id: "rdl", name: "Romanian Deadlift", category: "legs/core", isBodyweight: false, inc: 10 },
  { id: "frontsq", name: "Front Squat", category: "legs/core", isBodyweight: false, inc: 10 },
  { id: "goodam", name: "Good Morning", category: "legs/core", isBodyweight: false, inc: 5 },
  { id: "lunge", name: "Lunges", category: "legs/core", isBodyweight: false, inc: 5 },
  { id: "bss", name: "Bulgarian Split Squat", category: "legs/core", isBodyweight: false, inc: 5 },
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

export const CATS = ["push", "pull", "legs/core"];

export const CAT_LABELS: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  "legs/core": "Legs/Core",
};

export const CAT_COLORS: Record<string, string> = {
  push: "var(--color-th-pr)",
  pull: "var(--color-th-a)",
  "legs/core": "var(--color-th-y)",
};

export const FATIGUE: Record<string, string[]> = {
  squat: ["legs/core"],
  deadlift: ["legs/core"],
  bench: ["push"],
  ohp: ["push"],
};

export const ASSISTANCE_WEEKS: AccWeek[] = [
  { sets: 4, reps: 10, percentage: 0.6, label: "Volume" },
  { sets: 4, reps: 8, percentage: 0.67, label: "Moderate" },
  { sets: 4, reps: 6, percentage: 0.75, label: "Intensity" },
  { sets: 3, reps: 10, percentage: 0.5, label: "Deload" },
];

export const BW_BASE = 8;
export const BW_DELOAD_DROP = 3;
