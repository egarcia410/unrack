export type ThemeMode = "dark" | "light";

export type TemplateId = "classic" | "bbb" | "bbbC" | "fsl" | "ssl";

export type Unit = "lb" | "kg";

export type SetType = "warmup" | "main" | "supp" | "acc_bodyweight" | "acc_weighted";

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

export type Supplemental =
  | { source: "fixedPercentage"; numSets: number; reps: number; percentage: number }
  | {
      source: "weeklyPercentage";
      numSets: number;
      reps: number;
      percentages: [number, number, number, number];
    }
  | { source: "firstSetLast"; numSets: number; reps: number }
  | { source: "secondSetLast"; numSets: number; reps: number };

export type Template = {
  name: string;
  description: string;
  phases: Phase[];
  supplemental?: Supplemental;
};

export type Exercise = {
  id: string;
  name: string;
  category: string;
  isBodyweight: boolean;
  weightIncrement?: number;
  slot?: number;
};

export type AssistancePhaseLabel = "Volume" | "Moderate" | "Intensity" | "Deload";

export type WeightedAssistanceWeek = {
  type: "weighted";
  sets: number;
  reps: number;
  percentage: number;
  label: AssistancePhaseLabel;
};

export type BodyweightAssistanceWeek = {
  type: "bodyweight";
  sets: number;
  multiplier: number;
  label: AssistancePhaseLabel;
};

export type AssistanceWeek = WeightedAssistanceWeek | BodyweightAssistanceWeek;

export type WeightedAssistancePrescription = {
  type: "weighted";
  sets: number;
  reps: number;
  percentage: number;
  weight: number;
  label: string;
  maximum: number;
  fatigued: boolean;
};

export type BodyweightAssistancePrescription = {
  type: "bodyweight";
  sets: number;
  reps: number;
  total: number;
  label: AssistancePhaseLabel;
  base: number;
};

export type AssistancePrescription =
  | WeightedAssistancePrescription
  | BodyweightAssistancePrescription;

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
