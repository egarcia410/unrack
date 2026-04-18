type RestTimer = {
  visible: boolean;
  key: number;
  duration: number;
  reason: string;
};

type WorkoutState = {
  activePhase: number;
  activeDay: number;
  checked: Record<string, boolean>;
  amrapReps: Record<string, string>;
  assistanceLog: Record<string, string>;
  assistanceSetCounts: Record<string, number>;
  restTimer: RestTimer;
  workoutStart: number | null;
};

export type { WorkoutState, RestTimer };
