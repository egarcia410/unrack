export type ThemeMode = "dark" | "light";

export type TemplateId = "classic" | "bbb" | "bbbC" | "fsl" | "ssl";

export type Unit = "lb" | "kg";

export type SetType = "warmup" | "main" | "supp" | "acc_bw" | "acc_wt";

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

export type Phase = {
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
  phases: Phase[];
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
  weightIncrement?: number;
  slot?: number;
};

export type AssistanceWeek = {
  sets: number;
  reps: number;
  percentage: number;
  label: string;
};

export type AssistancePrescription = {
  type: "bw" | "wt";
  sets: number;
  reps: number;
  total?: number;
  label: string;
  base?: number;
  percentage?: number;
  weight?: number;
  maximum?: number;
  fatigued?: boolean;
};

export type WorkoutEntry = {
  cycle: number;
  phase: number;
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
  templateId: TemplateId;
  unit: Unit;
  trainingMaxPercent: number;
  trainingMaxes: Record<string, number>;
  oneRepMaxes: Record<string, number>;
  cycle: number;
  phase: number;
  workouts: WorkoutEntry[];
  assistanceHistory: Record<
    string,
    Array<{
      datetime?: number;
      cycle?: number;
      phase?: number;
      weight?: number;
      isBodyweight?: boolean;
    }>
  >;
  assistanceMaximums: Record<string, number>;
  bodyweightBaselines: Record<string, number>;
  assistanceSlots: Record<string, string[]>;
  customExercises: Record<string, Exercise>;
  timestamp: number;
};

export type RestInfo = {
  duration: number;
  reason: string;
};

export type CelebrationState = {
  type: "done" | "pr" | "cycle" | "warn";
  message: string;
  subtitle: string;
  subtitleDetail?: string;
  actionLabel?: string;
  actionSub?: string;
  actionSubFrom?: string;
  actionSubTo?: string;
  _liftId?: string;
  _suggestedOneRepMax?: number;
  _suggestedTrainingMax?: number;
};

export type SwapSlot = {
  liftId: string;
  slot: number;
  currentId: string;
};
