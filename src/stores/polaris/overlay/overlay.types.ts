import type { Unit } from "../../../types";

type CelebrationDone = {
  type: "done";
  message: string;
  liftName: string;
  duration: string;
};

type CelebrationPersonalRecord = {
  type: "pr";
  message: string;
  liftName: string;
  oldOneRepMax: number;
  newOneRepMax: number;
  unit: Unit;
  duration: string;
};

type CelebrationCycleComplete = {
  type: "cycle";
  message: string;
  subtitle: string;
};

type CelebrationWarning = {
  type: "warn";
  message: string;
  subtitle: string;
  liftId: string;
  suggestedOneRepMax: number;
  suggestedTrainingMax: number;
  actionLabel: string;
  comparisonFrom: string;
  comparisonTo: string;
};

type CelebrationState =
  | CelebrationDone
  | CelebrationPersonalRecord
  | CelebrationCycleComplete
  | CelebrationWarning;

type SwapSlot = {
  liftId: string;
  slot: number;
  currentId: string;
};

type OverlayState = {
  showDeleteConfirm: boolean;
  showSettings: boolean;
  showTemplatePicker: boolean;
  activeCelebration: CelebrationState | null;
  activeSwapSlot: SwapSlot | null;
};

export type {
  CelebrationDone,
  CelebrationPersonalRecord,
  CelebrationCycleComplete,
  CelebrationWarning,
  CelebrationState,
  SwapSlot,
  OverlayState,
};
