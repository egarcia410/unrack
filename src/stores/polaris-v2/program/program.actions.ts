import type { TemplateId } from "../../../types";
import { LIFTS, LIFT_ORDER, TEMPLATES } from "../../../constants/program";
import {
  WEIGHTED_ASSISTANCE_WEEKS,
  BODYWEIGHT_ASSISTANCE_WEEKS,
  DEFAULT_ACC,
} from "../../../constants/exercises";
import { roundToNearest, epley, calcWeight } from "../../../lib/calc";
import { getAssistanceForLift, getAllAssistanceExercises } from "../../../lib/exercises";
import { useProgramStore } from "./program.store";
import { useWorkoutStore } from "../workout/workout.store";
import { useOverlayStore } from "../overlay/overlay.store";

export const programCreated = (oneRepMaxes: Record<string, string>) => {
  const state = useProgramStore.getState();
  const parsedOneRepMaxes: Record<string, number> = {};
  const trainingMaxes: Record<string, number> = {};
  LIFTS.forEach((lift) => {
    const orm = parseFloat(oneRepMaxes[lift.id]) || 0;
    parsedOneRepMaxes[lift.id] = orm;
    trainingMaxes[lift.id] = roundToNearest(orm * (state.trainingMaxPercent / 100));
  });
  useProgramStore.setState((draft) => {
    draft.trainingMaxes = trainingMaxes;
    draft.oneRepMaxes = parsedOneRepMaxes;
    draft.createdAt = Date.now();
  });
};

export const programReset = () => {
  useProgramStore.setState(useProgramStore.getInitialState(), true);
};

export const templateChanged = (templateId: TemplateId) => {
  useProgramStore.setState({ templateId });
};

export const exerciseSwapped = (newExerciseId: string) => {
  const state = useProgramStore.getState();
  const { activeSwapSlot } = useOverlayStore.getState();
  if (!activeSwapSlot) return;
  const { liftId, slot: slotIndex } = activeSwapSlot;
  const current = state.assistanceSlots || {};
  const liftSlots = [...(current[liftId] || DEFAULT_ACC[liftId])];
  liftSlots[slotIndex] = newExerciseId;
  useProgramStore.setState({ assistanceSlots: { ...current, [liftId]: liftSlots } });
  useOverlayStore.setState({ activeSwapSlot: null });
};

export const unitToggled = () => {
  const state = useProgramStore.getState();
  const newUnit = state.unit === "lb" ? "kg" : "lb";
  const factor = newUnit === "kg" ? 0.453592 : 2.20462;
  const newOneRepMaxes: Record<string, number> = {};
  const newTrainingMaxes: Record<string, number> = {};
  const newAssistanceMaximums: Record<string, number> = {};
  LIFTS.forEach((lift) => {
    newOneRepMaxes[lift.id] = roundToNearest(state.oneRepMaxes[lift.id] * factor);
    newTrainingMaxes[lift.id] = roundToNearest(
      newOneRepMaxes[lift.id] * (state.trainingMaxPercent / 100),
    );
  });
  Object.entries(state.assistanceMaximums || {}).forEach(([exerciseId, weight]) => {
    newAssistanceMaximums[exerciseId] = roundToNearest(weight * factor);
  });
  useProgramStore.setState({
    unit: newUnit,
    oneRepMaxes: newOneRepMaxes,
    trainingMaxes: newTrainingMaxes,
    assistanceMaximums: newAssistanceMaximums,
  });
};

export const trainingMaxPercentChanged = (newPercent: number) => {
  const state = useProgramStore.getState();
  const clamped = Math.max(80, Math.min(95, newPercent));
  const newTrainingMaxes: Record<string, number> = {};
  LIFTS.forEach((lift) => {
    newTrainingMaxes[lift.id] = roundToNearest(state.oneRepMaxes[lift.id] * (clamped / 100));
  });
  useProgramStore.setState({ trainingMaxPercent: clamped, trainingMaxes: newTrainingMaxes });
};

export const oneRepMaxesSaved = (editOneRepMax: Record<string, string>) => {
  const state = useProgramStore.getState();
  const newOneRepMaxes: Record<string, number> = {};
  const newTrainingMaxes: Record<string, number> = {};
  LIFTS.forEach((lift) => {
    const parsedWeight = parseFloat(editOneRepMax[lift.id]) || state.oneRepMaxes[lift.id] || 0;
    newOneRepMaxes[lift.id] = parsedWeight;
    newTrainingMaxes[lift.id] = roundToNearest(parsedWeight * (state.trainingMaxPercent / 100));
  });
  useProgramStore.setState({ oneRepMaxes: newOneRepMaxes, trainingMaxes: newTrainingMaxes });
};

export const assistanceMaximumsSaved = (editAssistance: Record<string, string | number>) => {
  const state = useProgramStore.getState();
  const newMaximums = { ...state.assistanceMaximums };
  Object.entries(editAssistance).forEach(([exerciseId, value]) => {
    newMaximums[exerciseId] = parseInt(String(value)) || 0;
  });
  useProgramStore.setState({ assistanceMaximums: newMaximums });
};

export const bodyweightBaselinesSaved = (editBaselines: Record<string, string | number>) => {
  const state = useProgramStore.getState();
  const newBaselines = { ...state.bodyweightBaselines };
  Object.entries(editBaselines).forEach(([exerciseId, value]) => {
    newBaselines[exerciseId] = parseInt(String(value)) || 0;
  });
  useProgramStore.setState({ bodyweightBaselines: newBaselines });
};

export const workoutFinished = () => {
  const state = useProgramStore.getState();
  const { activePhase, activeDay, amrapReps, assistanceLog, workoutStart } =
    useWorkoutStore.getState();
  const template = TEMPLATES[state.templateId];
  const phase = template.phases[activePhase];
  const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
  const lift = LIFTS.find((exercise) => exercise.id === liftId)!;
  const trainingMax = state.trainingMaxes[liftId];
  const assistanceExercises = getAssistanceForLift(
    liftId,
    state.assistanceSlots,
    state.customExercises,
  );

  const amrapSet = phase.sets.find((s) => String(s.reps).includes("+"));
  const amrapIndex = amrapSet ? phase.sets.indexOf(amrapSet) : -1;
  const repsHit = parseInt(amrapReps[`m${amrapIndex}`]);
  let newOneRepMax: {
    lift: string;
    old: number;
    newValue: number;
    reps: number;
    weight: number;
  } | null = null;
  if (amrapSet && repsHit > 0) {
    const weight = calcWeight(trainingMax, amrapSet.percentage);
    const estimated = epley(weight, repsHit);
    if (estimated > state.oneRepMaxes[liftId]) {
      newOneRepMax = {
        lift: liftId,
        old: state.oneRepMaxes[liftId],
        newValue: estimated,
        reps: repsHit,
        weight,
      };
    }
  }

  const assistanceHistory: typeof state.assistanceHistory = {};
  for (const [key, entries] of Object.entries(state.assistanceHistory)) {
    assistanceHistory[key] = [...entries];
  }
  const assistanceMaximums = { ...state.assistanceMaximums };
  const bodyweightBaselines = { ...state.bodyweightBaselines };
  assistanceExercises.forEach((exercise) => {
    if (!assistanceHistory[exercise.id]) assistanceHistory[exercise.id] = [];
    const logEntry = assistanceLog[exercise.id];
    if (exercise.isBodyweight) {
      const enteredReps = parseInt(logEntry || "0");
      if (enteredReps > 0 && !bodyweightBaselines[exercise.id]) {
        const currentWeek =
          BODYWEIGHT_ASSISTANCE_WEEKS[activePhase] || BODYWEIGHT_ASSISTANCE_WEEKS[0];
        bodyweightBaselines[exercise.id] = Math.round(enteredReps / currentWeek.multiplier);
      }
      assistanceHistory[exercise.id].push({
        type: "bodyweight",
        datetime: Date.now(),
        cycle: state.cycle,
        phase: activePhase,
      });
    } else {
      if (logEntry && parseFloat(logEntry || "0") > 0) {
        assistanceHistory[exercise.id].push({
          type: "weighted",
          weight: parseFloat(logEntry || "0"),
          datetime: Date.now(),
          cycle: state.cycle,
          phase: activePhase,
        });
        if (!assistanceMaximums[exercise.id] || assistanceMaximums[exercise.id] === 0) {
          const weekPercentage = (
            WEIGHTED_ASSISTANCE_WEEKS[activePhase] || WEIGHTED_ASSISTANCE_WEEKS[0]
          ).percentage;
          assistanceMaximums[exercise.id] = roundToNearest(
            parseFloat(logEntry || "0") / weekPercentage,
          );
        }
      }
    }
  });

  const durationSeconds = workoutStart ? Math.floor((Date.now() - workoutStart) / 1000) : 0;
  const entry = {
    cycle: state.cycle,
    phase: activePhase,
    day: activeDay,
    lift: liftId,
    datetime: Date.now(),
    duration: durationSeconds,
    amrapReps: { ...amrapReps },
    assistanceLog: Object.fromEntries(
      Object.entries(assistanceLog).map(([key, value]) => [key, { w: value }]),
    ),
    newOneRepMax,
  };

  useProgramStore.setState((draft) => {
    draft.workouts.push(entry);
    draft.assistanceHistory = assistanceHistory;
    draft.assistanceMaximums = assistanceMaximums;
    draft.bodyweightBaselines = bodyweightBaselines;
    if (newOneRepMax) {
      draft.oneRepMaxes[liftId] = newOneRepMax.newValue;
    }
  });

  const updatedState = useProgramStore.getState();
  const durationMinutes = Math.floor(durationSeconds / 60);
  const durationFormatted = durationMinutes > 0 ? durationMinutes + " min" : "< 1 min";
  const isDeload = activePhase === 3;

  if (amrapSet && !isDeload) {
    const minReps = parseInt(String(amrapSet.reps).replace("+", "")) || 1;
    const amrapWeight = calcWeight(trainingMax, amrapSet.percentage);
    if (repsHit <= 0) {
      const suggestedOneRepMax = roundToNearest(
        (trainingMax * 0.9) / (updatedState.trainingMaxPercent / 100),
      );
      const suggestedTrainingMax = roundToNearest(
        suggestedOneRepMax * (updatedState.trainingMaxPercent / 100),
      );
      useOverlayStore.setState({
        activeCelebration: {
          type: "warn",
          message: "Missed AMRAP",
          subtitle: `0 reps at ${amrapWeight} ${updatedState.unit}`,
          liftId,
          suggestedOneRepMax,
          suggestedTrainingMax,
          actionLabel: `Adjust TM to ${suggestedTrainingMax}`,
          comparisonFrom: `1RM: ${updatedState.oneRepMaxes[liftId]}`,
          comparisonTo: `${suggestedOneRepMax} ${updatedState.unit}`,
        },
      });
      return;
    } else if (repsHit < minReps) {
      const realOneRepMax = roundToNearest(epley(amrapWeight, repsHit));
      const suggestedTrainingMax = roundToNearest(
        realOneRepMax * (updatedState.trainingMaxPercent / 100),
      );
      useOverlayStore.setState({
        activeCelebration: {
          type: "warn",
          message: "Below Target",
          subtitle: `${repsHit} rep${repsHit > 1 ? "s" : ""} at ${amrapWeight} ${updatedState.unit} (needed ${minReps}+)`,
          liftId,
          suggestedOneRepMax: realOneRepMax,
          suggestedTrainingMax,
          actionLabel: `Adjust TM to ${suggestedTrainingMax}`,
          comparisonFrom: `1RM: ${updatedState.oneRepMaxes[liftId]}`,
          comparisonTo: `${realOneRepMax} ${updatedState.unit}`,
        },
      });
      return;
    } else if (newOneRepMax) {
      useOverlayStore.setState({
        activeCelebration: {
          type: "pr",
          message: "New 1RM!",
          liftName: lift.name,
          oldOneRepMax: newOneRepMax.old,
          newOneRepMax: newOneRepMax.newValue,
          unit: updatedState.unit,
          duration: durationFormatted,
        },
      });
      return;
    }
  }
  useOverlayStore.setState({
    activeCelebration: {
      type: "done",
      message: "Workout Logged",
      liftName: lift.name,
      duration: durationFormatted,
    },
  });
};

export const phaseAdvanced = () => {
  const state = useProgramStore.getState();
  const template = TEMPLATES[state.templateId];
  const nextPhase = state.phase + 1;

  if (nextPhase >= template.phases.length) {
    const newTrainingMaxes = { ...state.trainingMaxes };
    LIFTS.forEach((lift) => {
      if (state.oneRepMaxes[lift.id] > 0) {
        const tmFromOneRepMax = roundToNearest(
          state.oneRepMaxes[lift.id] * (state.trainingMaxPercent / 100),
        );
        newTrainingMaxes[lift.id] = Math.max(
          tmFromOneRepMax,
          state.trainingMaxes[lift.id] + lift.increment,
        );
      } else {
        newTrainingMaxes[lift.id] = state.trainingMaxes[lift.id] + lift.increment;
      }
    });
    const newAssistanceMaximums = { ...state.assistanceMaximums };
    getAllAssistanceExercises(state.customExercises)
      .filter((exercise) => !exercise.isBodyweight)
      .forEach((exercise) => {
        if (newAssistanceMaximums[exercise.id]) {
          newAssistanceMaximums[exercise.id] =
            newAssistanceMaximums[exercise.id] + (exercise.weightIncrement || 5);
        }
      });
    const newBodyweightBaselines = { ...state.bodyweightBaselines };
    getAllAssistanceExercises(state.customExercises)
      .filter((exercise) => exercise.isBodyweight)
      .forEach((exercise) => {
        if (newBodyweightBaselines[exercise.id] > 0) {
          newBodyweightBaselines[exercise.id] += 1;
        }
      });
    useProgramStore.setState({
      cycle: state.cycle + 1,
      phase: 0,
      trainingMaxes: newTrainingMaxes,
      assistanceMaximums: newAssistanceMaximums,
      bodyweightBaselines: newBodyweightBaselines,
    });
    useOverlayStore.setState({
      activeCelebration: {
        type: "cycle",
        message: "Cycle Complete!",
        subtitle: "TMs updated. Assistance progressed.",
      },
    });
  } else {
    useProgramStore.setState({ phase: nextPhase });
  }
};

export const trainingMaxAdjusted = (
  liftId: string,
  suggestedOneRepMax: number,
  suggestedTrainingMax: number,
) => {
  const state = useProgramStore.getState();
  useProgramStore.setState({
    oneRepMaxes: { ...state.oneRepMaxes, [liftId]: suggestedOneRepMax },
    trainingMaxes: { ...state.trainingMaxes, [liftId]: suggestedTrainingMax },
  });
};
