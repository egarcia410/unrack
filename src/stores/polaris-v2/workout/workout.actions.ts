import type { SetType } from "../../../types";
import type { WorkoutSet } from "../../../lib/sets";
import { TEMPLATES, LIFT_ORDER } from "../../../constants/program";
import {
  WEIGHTED_ASSISTANCE_WEEKS,
  BODYWEIGHT_ASSISTANCE_WEEKS,
} from "../../../constants/exercises";
import { smartRest } from "../../../lib/calc";
import {
  getAssistanceForLift,
  isAssistanceDiscovered,
  getAssistancePrescription,
} from "../../../lib/exercises";
import { deriveSupplementalSets, deriveAllSets } from "../../../lib/sets";
import { requestNotificationPermission, clearTimerNotification } from "../../../lib/notifications";
import { useWorkoutStore } from "./workout.store";
import { useProgramStore } from "../program/program.store";
import type { WorkoutState } from "./workout.types";

const deriveWorkoutSets = (
  workoutState: WorkoutState,
  programState: ReturnType<typeof useProgramStore.getState>,
): WorkoutSet[] => {
  const { activePhase, activeDay } = workoutState;
  const template = TEMPLATES[programState.templateId];
  const phase = template.phases[activePhase];
  const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
  const isDeload = activePhase === 3;
  const accessories = getAssistanceForLift(
    liftId,
    programState.assistanceSlots,
    programState.customExercises,
  );
  const supplementalSets = deriveSupplementalSets(template, phase, activePhase);
  return deriveAllSets(activePhase, phase, supplementalSets, accessories, isDeload);
};

const findNextUncheckedSet = (
  allSets: WorkoutSet[],
  afterKey: string,
  checked: Record<string, boolean>,
): WorkoutSet | null => {
  const index = allSets.findIndex((set) => set.key === afterKey);
  for (let i = index + 1; i < allSets.length; i++) {
    if (!checked[allSets[i].key]) return allSets[i];
  }
  return null;
};

export const startWorkout = (day: number) => {
  const { phase } = useProgramStore.getState();
  requestNotificationPermission();
  useWorkoutStore.setState(
    {
      ...useWorkoutStore.getInitialState(),
      activePhase: phase,
      activeDay: day,
      workoutStart: Date.now(),
    },
    true,
  );
};

export const onSetCheck = (key: string) => {
  const state = useWorkoutStore.getState();
  const { checked, restTimer } = state;
  const next = { ...checked, [key]: !checked[key] };
  if (!checked[key]) {
    const programState = useProgramStore.getState();
    const allSets = deriveWorkoutSets(state, programState);
    const nextSet = findNextUncheckedSet(allSets, key, next);
    if (nextSet) {
      clearTimerNotification();
      const rest = smartRest(nextSet.type, nextSet.intensity || 0, nextSet.isDeload);
      useWorkoutStore.setState({
        checked: next,
        restTimer: {
          visible: true,
          key: restTimer.key + 1,
          duration: rest.duration,
          reason: rest.reason,
        },
      });
    } else {
      useWorkoutStore.setState({ checked: next, restTimer: { ...restTimer, visible: false } });
    }
  } else {
    useWorkoutStore.setState({ checked: next });
  }
};

export const setAmrapReps = (
  updater: (previous: Record<string, string>) => Record<string, string>,
) => {
  useWorkoutStore.setState((draft) => {
    draft.amrapReps = updater(draft.amrapReps);
  });
};

export const setAssistanceLog = (
  updater: (previous: Record<string, string>) => Record<string, string>,
) => {
  useWorkoutStore.setState((draft) => {
    draft.assistanceLog = updater(draft.assistanceLog);
  });
};

export const incrementAssistanceSet = (accessoryId: string) => {
  const state = useWorkoutStore.getState();
  const { activePhase, activeDay, assistanceSetCounts, assistanceLog, restTimer } = state;
  const programState = useProgramStore.getState();
  const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
  const accessories = getAssistanceForLift(
    liftId,
    programState.assistanceSlots,
    programState.customExercises,
  );
  const exercise = accessories.find((accessory) => accessory.id === accessoryId);
  if (!exercise) return;

  const discovered = isAssistanceDiscovered(
    exercise,
    programState.assistanceMaximums,
    programState.bodyweightBaselines,
  );
  const weightedWeek = WEIGHTED_ASSISTANCE_WEEKS[activePhase] || WEIGHTED_ASSISTANCE_WEEKS[0];
  const bodyweightWeek = BODYWEIGHT_ASSISTANCE_WEEKS[activePhase] || BODYWEIGHT_ASSISTANCE_WEEKS[0];
  const undiscoveredSets = exercise.isBodyweight ? bodyweightWeek.sets : weightedWeek.sets;
  const maxSets = discovered
    ? getAssistancePrescription(
        exercise,
        activePhase,
        programState.assistanceMaximums,
        programState.bodyweightBaselines,
        liftId,
      ).sets
    : undiscoveredSets;
  const setType: SetType = exercise.isBodyweight ? "acc_bodyweight" : "acc_weighted";
  const isDeload = activePhase === 3;

  const setsDone = assistanceSetCounts[accessoryId] || 0;
  if (setsDone < maxSets) {
    const nextSetCount = setsDone + 1;
    const updates: Partial<WorkoutState> = {
      assistanceSetCounts: { ...assistanceSetCounts, [accessoryId]: nextSetCount },
    };
    if (nextSetCount >= maxSets) {
      const inputEntered = parseFloat(assistanceLog[accessoryId] || "0") > 0;
      if (discovered || inputEntered) {
        updates.checked = {
          ...state.checked,
          [`a_${accessoryId}`]: true,
        };
      }
    }
    if (nextSetCount < maxSets) {
      clearTimerNotification();
      const rest = smartRest(setType, weightedWeek.percentage, isDeload);
      updates.restTimer = {
        visible: true,
        key: restTimer.key + 1,
        duration: rest.duration,
        reason: rest.reason,
      };
    }
    useWorkoutStore.setState(updates);
  }
};

export const decrementAssistanceSet = (accessoryId: string) => {
  const state = useWorkoutStore.getState();
  const { activePhase, activeDay, assistanceSetCounts } = state;
  const programState = useProgramStore.getState();
  const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
  const accessories = getAssistanceForLift(
    liftId,
    programState.assistanceSlots,
    programState.customExercises,
  );
  const exercise = accessories.find((accessory) => accessory.id === accessoryId);
  if (!exercise) return;

  const discovered = isAssistanceDiscovered(
    exercise,
    programState.assistanceMaximums,
    programState.bodyweightBaselines,
  );
  const weightedWeek = WEIGHTED_ASSISTANCE_WEEKS[activePhase] || WEIGHTED_ASSISTANCE_WEEKS[0];
  const bodyweightWeek = BODYWEIGHT_ASSISTANCE_WEEKS[activePhase] || BODYWEIGHT_ASSISTANCE_WEEKS[0];
  const undiscoveredSets = exercise.isBodyweight ? bodyweightWeek.sets : weightedWeek.sets;
  const maxSets = discovered
    ? getAssistancePrescription(
        exercise,
        activePhase,
        programState.assistanceMaximums,
        programState.bodyweightBaselines,
        liftId,
      ).sets
    : undiscoveredSets;

  const setsDone = assistanceSetCounts[accessoryId] || 0;
  if (setsDone > 0) {
    const nextSetCount = setsDone - 1;
    const nextChecked = { ...state.checked };
    if (nextSetCount < maxSets) {
      delete nextChecked[`a_${accessoryId}`];
    }
    useWorkoutStore.setState({
      assistanceSetCounts: { ...assistanceSetCounts, [accessoryId]: nextSetCount },
      checked: nextChecked,
    });
  }
};

export const activateAmrap = (setIndex: number) => {
  const state = useWorkoutStore.getState();
  const { checked, amrapReps, restTimer } = state;
  const setKey = `m${setIndex}`;
  if (checked[setKey]) return;

  const programState = useProgramStore.getState();
  const { activePhase } = state;
  const template = TEMPLATES[programState.templateId];
  const phase = template.phases[activePhase];
  const setDefinition = phase.sets[setIndex];
  const minReps = parseInt(String(setDefinition.reps).replace("+", "")) || 1;

  const allSets = deriveWorkoutSets(state, programState);
  const nextChecked = { ...checked, [setKey]: true };
  const nextSet = findNextUncheckedSet(allSets, setKey, nextChecked);

  const updates: Partial<WorkoutState> = {
    checked: nextChecked,
    amrapReps: { ...amrapReps, [setKey]: String(minReps) },
  };

  if (nextSet) {
    clearTimerNotification();
    const rest = smartRest(nextSet.type, nextSet.intensity || 0, nextSet.isDeload);
    updates.restTimer = {
      visible: true,
      key: restTimer.key + 1,
      duration: rest.duration,
      reason: rest.reason,
    };
  }

  useWorkoutStore.setState(updates);
};

export const dismissTimer = () => {
  clearTimerNotification();
  useWorkoutStore.setState((draft) => {
    draft.restTimer.visible = false;
  });
};

export const setChecked = (
  updater: (previous: Record<string, boolean>) => Record<string, boolean>,
) => {
  useWorkoutStore.setState((draft) => {
    draft.checked = updater(draft.checked);
  });
};

export const activateTimer = (setType: SetType, intensity: number, isDeload: boolean) => {
  clearTimerNotification();
  const { restTimer } = useWorkoutStore.getState();
  const rest = smartRest(setType, intensity, isDeload);
  useWorkoutStore.setState({
    restTimer: {
      visible: true,
      key: restTimer.key + 1,
      duration: rest.duration,
      reason: rest.reason,
    },
  });
};
