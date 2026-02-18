export type ThemeMode = "dark" | "light";

export interface Lift {
  id: string;
  name: string;
  shorthand: string;
  increment: number;
}

export interface WeekSet {
  reps: number | string;
  percentage: number;
}

export interface WeekDef {
  label: string;
  title: string;
  sets: WeekSet[];
}

export interface SupplementalDef {
  numSets: number;
  reps: number;
  percentage: number;
}

export interface Variant {
  name: string;
  description: string;
  weeks: WeekDef[];
  supplemental?: SupplementalDef;
  supplementalWeekly?: SupplementalDef[];
  firstSetLast?: { numSets: number; reps: number };
  secondSetLast?: { numSets: number; reps: number };
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  isBodyweight: boolean;
  inc?: number;
  slot?: number;
}

export interface AccWeek {
  sets: number;
  reps: number;
  percentage: number;
  label: string;
}

export interface AccRx {
  type: "bw" | "wt";
  sets: number;
  reps: number;
  total?: number;
  label: string;
  base?: number;
  pct?: number;
  weight?: number;
  maximum?: number;
  fatigued?: boolean;
}

export interface WorkoutEntry {
  cycle: number;
  week: number;
  day: number;
  lift: string;
  datetime: number;
  duration: number;
  amrapReps: Record<string, string>;
  assistanceLog: Record<string, { w?: string }>;
  newOneRepMax: {
    lift: string;
    old: number;
    newValue: number;
    reps: number;
    weight: number;
  } | null;
}

export interface ProgramData {
  variant: string;
  unit: "lb" | "kg";
  trainingMaxPercent: number;
  trainingMaxes: Record<string, number>;
  oneRepMaxes: Record<string, number>;
  cycle: number;
  week: number;
  workouts: WorkoutEntry[];
  assistanceHistory: Record<
    string,
    Array<{
      datetime?: number;
      cycle?: number;
      week?: number;
      weight?: number;
      isBodyweight?: boolean;
    }>
  >;
  assistanceMaximums: Record<string, number>;
  bodyweightBaselines: Record<string, number>;
  assistanceSlots?: Record<string, string[]>;
  customExercises?: Record<string, Exercise>;
  mode?: ThemeMode;
  timestamp: number;
}

export interface RestInfo {
  duration: number;
  reason: string;
}

export interface CelebState {
  type: "done" | "pr" | "cycle" | "warn";
  message: string;
  subtitle: string;
  actionLabel?: string;
  actionSub?: string;
  _liftId?: string;
  _suggestedOneRepMax?: number;
  _suggestedTrainingMax?: number;
}

export interface SwapSlot {
  liftId: string;
  slot: number;
  currentId: string;
}
