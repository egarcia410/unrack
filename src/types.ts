export type ThemeMode = "dark" | "light";

export interface Lift {
  id: string;
  nm: string;
  sh: string;
  inc: number;
}

export interface WeekSet {
  r: number | string;
  p: number;
}

export interface WeekDef {
  l: string;
  t: string;
  s: WeekSet[];
}

export interface SupplementalDef {
  n: number;
  r: number;
  p: number;
}

export interface Variant {
  n: string;
  d: string;
  wk: WeekDef[];
  sp?: SupplementalDef;
  spW?: SupplementalDef[];
  fl?: { n: number; r: number };
  sl?: { n: number; r: number };
}

export interface Exercise {
  id: string;
  nm: string;
  cat: string;
  bw: boolean;
  inc?: number;
  slot?: number;
}

export interface AccWeek {
  s: number;
  r: number;
  pct: number;
  lb: string;
}

export interface AccRx {
  type: "bw" | "wt";
  sets: number;
  reps: number;
  total?: number;
  lb: string;
  base?: number;
  pct?: number;
  wt?: number;
  mx?: number;
  fatigued?: boolean;
}

export interface WorkoutEntry {
  cy: number;
  wk: number;
  dy: number;
  lf: string;
  dt: number;
  dur: number;
  am: Record<string, string>;
  al: Record<string, { w?: string }>;
  ne1: { lift: string; old: number; nw: number; reps: number; w: number } | null;
}

export interface ProgramData {
  variant: string;
  unit: "lb" | "kg";
  tmPct: number;
  tms: Record<string, number>;
  e1: Record<string, number>;
  cycle: number;
  week: number;
  wk: WorkoutEntry[];
  aH: Record<string, Array<{ dt?: number; cy?: number; wk?: number; w?: number; bw?: boolean }>>;
  accMax: Record<string, number>;
  bwBase: Record<string, number>;
  accSlots?: Record<string, string[]>;
  customEx?: Record<string, Exercise>;
  mode?: ThemeMode;
  ts: number;
}

export interface RestInfo {
  dur: number;
  why: string;
}

export interface CelebState {
  type: "done" | "pr" | "cycle" | "warn";
  msg: string;
  sub: string;
  actionLabel?: string;
  actionSub?: string;
  _lid?: string;
  _sugE1?: number;
  _sugTM?: number;
}

export interface SwapSlot {
  liftId: string;
  slot: number;
  currentId: string;
}
