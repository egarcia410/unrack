import type { Exercise, TemplateId, Unit, WorkoutEntry } from "../../../types";

type AssistanceHistoryEntry =
  | { type: "weighted"; datetime: number; cycle: number; phase: number; weight: number }
  | { type: "bodyweight"; datetime: number; cycle: number; phase: number };

type ProgramState = {
  templateId: TemplateId;
  unit: Unit;
  trainingMaxPercent: number;
  trainingMaxes: Record<string, number>;
  oneRepMaxes: Record<string, number>;
  cycle: number;
  phase: number;
  workouts: WorkoutEntry[];
  assistanceHistory: Record<string, AssistanceHistoryEntry[]>;
  assistanceMaximums: Record<string, number>;
  bodyweightBaselines: Record<string, number>;
  assistanceSlots: Record<string, string[]>;
  customExercises: Record<string, Exercise>;
  createdAt: number;
};

export type { ProgramState, AssistanceHistoryEntry };
