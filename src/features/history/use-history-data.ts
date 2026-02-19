import { useProgramStore } from "../../stores/program-store";
import { LIFTS } from "../../constants/program";
import type { Lift } from "../../types";

export type LiftProgressEntry = {
  lift: Lift;
  oneRepMax: number;
  gain: number;
  best: number;
  lastPersonalRecord: {
    lift: string;
    old: number;
    newValue: number;
    reps: number;
    weight: number;
    datetime: number;
    cycle: number;
  } | null;
  personalRecordCount: number;
};

export type RecentWorkoutEntry = {
  lift: Lift | undefined;
  dateLabel: string;
  amrapReps: number | null;
  hadPersonalRecord: boolean;
  duration: number;
};

export const useHistoryData = () => {
  const programData = useProgramStore.prog();

  if (!programData) return null;

  const personalRecords = programData.workouts
    .filter((workout) => workout.newOneRepMax)
    .map((workout) => ({
      ...workout.newOneRepMax!,
      datetime: workout.datetime,
      cycle: workout.cycle,
    }));

  const liftProgressEntries: LiftProgressEntry[] = LIFTS.map((lift) => {
    const liftRecords = personalRecords
      .filter((record) => record.lift === lift.id)
      .sort((a, b) => a.datetime - b.datetime);
    const recordValues = liftRecords.map((record) => record.newValue);
    const current = programData.oneRepMaxes[lift.id];
    const first = recordValues.length > 0 ? recordValues[0] : current;
    const best = recordValues.length > 0 ? Math.max(...recordValues) : current;
    const lastPersonalRecord = liftRecords.length > 0 ? liftRecords[liftRecords.length - 1] : null;
    return {
      lift,
      oneRepMax: current,
      gain: current - first,
      best,
      lastPersonalRecord,
      personalRecordCount: liftRecords.length,
    };
  });

  const recentWorkouts: RecentWorkoutEntry[] = programData.workouts
    .slice(-8)
    .reverse()
    .map((workout) => {
      const lift = LIFTS.find((liftItem) => liftItem.id === workout.lift);
      const amrapKey = Object.keys(workout.amrapReps || {}).find(
        (key) => workout.amrapReps[key] !== undefined && workout.amrapReps[key] !== "",
      );
      const date = new Date(workout.datetime);
      return {
        lift,
        dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
        amrapReps: amrapKey != null ? parseInt(workout.amrapReps[amrapKey]) || 0 : null,
        hadPersonalRecord: !!workout.newOneRepMax,
        duration: workout.duration || 0,
      };
    });

  return {
    programData,
    liftProgressEntries,
    recentWorkouts,
  };
};
