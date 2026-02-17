import type { Exercise, AccWeek } from "../types";

export const EXERCISE_LIB: Exercise[] = [
  { id: "dips", nm: "Dips", cat: "push", bw: true },
  { id: "pushup", nm: "Push-Ups", cat: "push", bw: true },
  { id: "cgbp", nm: "Close-Grip Bench", cat: "push", bw: false, inc: 5 },
  { id: "lmpress", nm: "Landmine Press", cat: "push", bw: false, inc: 5 },
  { id: "dbpress", nm: "DB Bench Press", cat: "push", bw: false, inc: 5 },
  { id: "dbincline", nm: "DB Incline Press", cat: "push", bw: false, inc: 5 },
  { id: "tripush", nm: "Tricep Pushdown", cat: "push", bw: false, inc: 5 },
  { id: "chinup", nm: "Chin-Ups", cat: "pull", bw: true },
  { id: "pullup", nm: "Pull-Ups", cat: "pull", bw: true },
  { id: "bbrow", nm: "Barbell Row", cat: "pull", bw: false, inc: 5 },
  { id: "dbrow", nm: "Dumbbell Row", cat: "pull", bw: false, inc: 5 },
  { id: "lmrow", nm: "Landmine Row", cat: "pull", bw: false, inc: 5 },
  { id: "facepull", nm: "Face Pulls", cat: "pull", bw: false, inc: 5 },
  { id: "latpull", nm: "Lat Pulldown", cat: "pull", bw: false, inc: 5 },
  { id: "curls", nm: "Curls", cat: "pull", bw: false, inc: 5 },
  { id: "rdl", nm: "Romanian Deadlift", cat: "legs/core", bw: false, inc: 10 },
  { id: "frontsq", nm: "Front Squat", cat: "legs/core", bw: false, inc: 10 },
  { id: "goodam", nm: "Good Morning", cat: "legs/core", bw: false, inc: 5 },
  { id: "lunge", nm: "Lunges", cat: "legs/core", bw: false, inc: 5 },
  { id: "bss", nm: "Bulgarian Split Squat", cat: "legs/core", bw: false, inc: 5 },
  { id: "hangleg", nm: "Hanging Leg Raise", cat: "legs/core", bw: true },
  { id: "abwheel", nm: "Ab Wheel", cat: "legs/core", bw: true },
  { id: "backraise", nm: "Back Raise", cat: "legs/core", bw: true },
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

export const CAT_COLORS = (c: { pr: string; a: string; y: string }) => ({
  push: c.pr,
  pull: c.a,
  "legs/core": c.y,
});

export const FATIGUE: Record<string, string[]> = {
  squat: ["legs/core"],
  deadlift: ["legs/core"],
  bench: ["push"],
  ohp: ["push"],
};

export const AW: AccWeek[] = [
  { s: 4, r: 10, pct: 0.6, lb: "Volume" },
  { s: 4, r: 8, pct: 0.67, lb: "Moderate" },
  { s: 4, r: 6, pct: 0.75, lb: "Intensity" },
  { s: 3, r: 10, pct: 0.5, lb: "Deload" },
];

export const BW_BASE = 8;
export const BW_DELOAD_DROP = 3;
