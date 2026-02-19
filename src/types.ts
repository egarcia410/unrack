export type ThemeMode = "dark" | "light";

export type TemplateId = "classic" | "bbb" | "bbbC" | "fsl" | "ssl";

export type Unit = "lb" | "kg";

export type SetType = "warmup" | "main" | "supp" | "acc_bw" | "acc_wt";

export type WorkoutSection = "warmup" | "main" | "supp" | "acc";

export type Lift = {
  id: string;
  name: string;
  shorthand: string;
  increment: number;
};

export type WeekSet = {
  reps: number | string;
  percentage: number;
};

export type WeekDef = {
  label: string;
  title: string;
  sets: WeekSet[];
};

export type SupplementalDef = {
  numSets: number;
  reps: number;
  percentage: number;
};

export type Template = {
  name: string;
  description: string;
  weeks: WeekDef[];
  supplemental?: SupplementalDef;
  supplementalWeekly?: SupplementalDef[];
  firstSetLast?: { numSets: number; reps: number };
  secondSetLast?: { numSets: number; reps: number };
};

export type Exercise = {
  id: string;
  name: string;
  category: string;
  isBodyweight: boolean;
  inc?: number;
  slot?: number;
};

export type AccWeek = {
  sets: number;
  reps: number;
  percentage: number;
  label: string;
};

export type AccRx = {
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
};

export type WorkoutEntry = {
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
};

export type ProgramData = {
  template: TemplateId;
  unit: Unit;
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
};

export type RestInfo = {
  duration: number;
  reason: string;
};

export type CelebState = {
  type: "done" | "pr" | "cycle" | "warn";
  message: string;
  subtitle: string;
  actionLabel?: string;
  actionSub?: string;
  _liftId?: string;
  _suggestedOneRepMax?: number;
  _suggestedTrainingMax?: number;
};

export type SwapSlot = {
  liftId: string;
  slot: number;
  currentId: string;
};
