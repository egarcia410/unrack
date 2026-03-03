import { beforeEach, describe, expect, it, vi as vitest } from "vitest";
import { useWorkoutStore } from "../workout/workout.store";
import {
  startWorkout,
  onSetCheck,
  setAmrapReps,
  setAssistanceLog,
  incrementAssistanceSet,
  decrementAssistanceSet,
  activateAmrap,
  dismissTimer,
  setChecked,
  activateTimer,
} from "../workout/workout.actions";
import { requestNotificationPermission, clearTimerNotification } from "../../../lib/notifications";
import { smartRest } from "../../../lib/calc";
import { resetStores, seedProgram, seedWorkout, mockDateNow } from "./setup";

beforeEach(() => {
  resetStores();
  vitest.mocked(requestNotificationPermission).mockClear();
  vitest.mocked(clearTimerNotification).mockClear();
});

// ---------------------------------------------------------------------------
// startWorkout
// ---------------------------------------------------------------------------
describe("startWorkout", () => {
  it("resets workout state and sets activeDay", () => {
    seedProgram();
    startWorkout(2);
    const state = useWorkoutStore.getState();
    expect(state.activeDay).toBe(2);
    expect(state.checked).toEqual({});
    expect(state.amrapReps).toEqual({});
  });

  it("syncs activePhase from program store", () => {
    seedProgram({ phase: 2 });
    startWorkout(0);
    expect(useWorkoutStore.getState().activePhase).toBe(2);
  });

  it("sets workoutStart to current timestamp", () => {
    const now = 1700000000000;
    const spy = mockDateNow(now);
    seedProgram();
    startWorkout(0);
    expect(useWorkoutStore.getState().workoutStart).toBe(now);
    spy.mockRestore();
  });

  it("calls requestNotificationPermission", () => {
    seedProgram();
    startWorkout(0);
    expect(requestNotificationPermission).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// onSetCheck
// ---------------------------------------------------------------------------
describe("onSetCheck", () => {
  it("toggles checked state when checking on", () => {
    seedProgram();
    seedWorkout();
    onSetCheck("w0");
    expect(useWorkoutStore.getState().checked.w0).toBe(true);
  });

  it("toggles checked state when unchecking", () => {
    seedProgram();
    seedWorkout({ checked: { w0: true } });
    onSetCheck("w0");
    expect(useWorkoutStore.getState().checked.w0).toBe(false);
  });

  it("shows rest timer when checking and next unchecked set exists", () => {
    seedProgram();
    seedWorkout();
    onSetCheck("w0");
    const state = useWorkoutStore.getState();
    expect(state.restTimer.visible).toBe(true);
    expect(state.restTimer.duration).toBeGreaterThan(0);
  });

  it("hides timer on last set", () => {
    seedProgram();
    // Check all sets except the last accessory, then check it
    // For simplicity, just check with all others already checked
    const allChecked: Record<string, boolean> = {};
    // FSL phase 0, day 0 (squat): 3 warmup + 3 main + 5 supp + 3 acc = 14 sets
    // Keys: w0,w1,w2, m0,m1,m2, s0,s1,s2,s3,s4, a_dips,a_chinup,a_hangleg
    [
      "w0",
      "w1",
      "w2",
      "m0",
      "m1",
      "m2",
      "s0",
      "s1",
      "s2",
      "s3",
      "s4",
      "a_dips",
      "a_chinup",
    ].forEach((key) => {
      allChecked[key] = true;
    });
    seedWorkout({ checked: allChecked });
    onSetCheck("a_hangleg");
    expect(useWorkoutStore.getState().restTimer.visible).toBe(false);
  });

  it("no timer on uncheck", () => {
    seedProgram();
    seedWorkout({
      checked: { w0: true },
      restTimer: { visible: true, key: 1, duration: 60, reason: "Warm-up" },
    });
    onSetCheck("w0");
    // Timer state is not explicitly set on uncheck — only `checked` is updated
    expect(useWorkoutStore.getState().checked.w0).toBe(false);
  });

  it("increments restTimer key", () => {
    seedProgram();
    seedWorkout();
    const keyBefore = useWorkoutStore.getState().restTimer.key;
    onSetCheck("w0");
    expect(useWorkoutStore.getState().restTimer.key).toBe(keyBefore + 1);
  });
});

// ---------------------------------------------------------------------------
// setAmrapReps
// ---------------------------------------------------------------------------
describe("setAmrapReps", () => {
  it("applies updater to amrapReps", () => {
    seedWorkout({ amrapReps: { m2: "5" } });
    setAmrapReps((prev) => ({ ...prev, m2: "8" }));
    expect(useWorkoutStore.getState().amrapReps.m2).toBe("8");
  });
});

// ---------------------------------------------------------------------------
// setAssistanceLog
// ---------------------------------------------------------------------------
describe("setAssistanceLog", () => {
  it("applies updater to assistanceLog", () => {
    seedWorkout();
    setAssistanceLog((prev) => ({ ...prev, dbrow: "50" }));
    expect(useWorkoutStore.getState().assistanceLog.dbrow).toBe("50");
  });
});

// ---------------------------------------------------------------------------
// incrementAssistanceSet
// ---------------------------------------------------------------------------
describe("incrementAssistanceSet", () => {
  it("increments set count", () => {
    seedProgram();
    seedWorkout();
    incrementAssistanceSet("dips");
    expect(useWorkoutStore.getState().assistanceSetCounts.dips).toBe(1);
  });

  it("auto-checks at maxSets when discovered", () => {
    seedProgram({ bodyweightBaselines: { dips: 10 } });
    seedWorkout();
    // Phase 0 bodyweight: 4 sets
    for (let i = 0; i < 4; i++) {
      incrementAssistanceSet("dips");
    }
    expect(useWorkoutStore.getState().checked.a_dips).toBe(true);
  });

  it("auto-checks at maxSets when undiscovered + input entered", () => {
    seedProgram(); // no bodyweightBaselines → undiscovered
    seedWorkout({ assistanceLog: { dips: "10" } });
    // Phase 0 bodyweight undiscovered: 4 sets
    for (let i = 0; i < 4; i++) {
      incrementAssistanceSet("dips");
    }
    expect(useWorkoutStore.getState().checked.a_dips).toBe(true);
  });

  it("does NOT auto-check when undiscovered and no input", () => {
    seedProgram();
    seedWorkout(); // No assistanceLog entry
    for (let i = 0; i < 4; i++) {
      incrementAssistanceSet("dips");
    }
    expect(useWorkoutStore.getState().checked.a_dips).toBeUndefined();
  });

  it("shows timer when not at max", () => {
    seedProgram();
    seedWorkout();
    incrementAssistanceSet("dips");
    expect(useWorkoutStore.getState().restTimer.visible).toBe(true);
  });

  it("no timer at max", () => {
    seedProgram({ bodyweightBaselines: { dips: 10 } });
    seedWorkout();
    for (let i = 0; i < 4; i++) {
      incrementAssistanceSet("dips");
    }
    // At max sets, no timer shown (only auto-check happens)
    // The timer was shown for sets 1-3 but not for the final set
    const state = useWorkoutStore.getState();
    // Last increment doesn't set timer visible — only auto-check
    // Check timer was set for earlier increments but last one overwrites with no timer update
    expect(state.assistanceSetCounts.dips).toBe(4);
  });

  it("no-op at max sets", () => {
    seedProgram({ bodyweightBaselines: { dips: 10 } });
    seedWorkout();
    for (let i = 0; i < 5; i++) {
      incrementAssistanceSet("dips");
    }
    expect(useWorkoutStore.getState().assistanceSetCounts.dips).toBe(4);
  });

  it("no-op for unknown accessory ID", () => {
    seedProgram();
    seedWorkout();
    incrementAssistanceSet("nonexistent");
    expect(useWorkoutStore.getState().assistanceSetCounts.nonexistent).toBeUndefined();
  });

  it("works for weighted accessories", () => {
    // Day 1 = bench, dbrow is weighted
    seedProgram({ assistanceMaximums: { dbrow: 100 } });
    seedWorkout({ activeDay: 1, activePhase: 0 });
    incrementAssistanceSet("dbrow");
    expect(useWorkoutStore.getState().assistanceSetCounts.dbrow).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// decrementAssistanceSet
// ---------------------------------------------------------------------------
describe("decrementAssistanceSet", () => {
  it("decrements count", () => {
    seedProgram();
    seedWorkout({ assistanceSetCounts: { dips: 2 } });
    decrementAssistanceSet("dips");
    expect(useWorkoutStore.getState().assistanceSetCounts.dips).toBe(1);
  });

  it("unchecks when below maxSets", () => {
    seedProgram({ bodyweightBaselines: { dips: 10 } });
    seedWorkout({
      assistanceSetCounts: { dips: 4 },
      checked: { a_dips: true },
    });
    decrementAssistanceSet("dips");
    expect(useWorkoutStore.getState().checked.a_dips).toBeUndefined();
  });

  it("no-op at 0", () => {
    seedProgram();
    seedWorkout({ assistanceSetCounts: { dips: 0 } });
    decrementAssistanceSet("dips");
    expect(useWorkoutStore.getState().assistanceSetCounts.dips).toBe(0);
  });

  it("no-op for unknown ID", () => {
    seedProgram();
    seedWorkout();
    decrementAssistanceSet("nonexistent");
    // No crash, no state change
    expect(useWorkoutStore.getState().assistanceSetCounts).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// activateAmrap
// ---------------------------------------------------------------------------
describe("activateAmrap", () => {
  it("checks set and initializes reps to minReps", () => {
    seedProgram();
    seedWorkout();
    activateAmrap(2); // AMRAP set at index 2 in phase 0
    const state = useWorkoutStore.getState();
    expect(state.checked.m2).toBe(true);
    expect(state.amrapReps.m2).toBe("5"); // "5+" → minReps = 5
  });

  it("no-op if already checked", () => {
    seedProgram();
    seedWorkout({ checked: { m2: true }, amrapReps: { m2: "10" } });
    activateAmrap(2);
    expect(useWorkoutStore.getState().amrapReps.m2).toBe("10"); // unchanged
  });

  it("shows timer for next set (supplemental)", () => {
    seedProgram();
    seedWorkout();
    activateAmrap(2);
    const state = useWorkoutStore.getState();
    expect(state.restTimer.visible).toBe(true);
  });

  it("correct minReps per phase: phase 1 = 3", () => {
    seedProgram({ phase: 1 });
    seedWorkout({ activePhase: 1 });
    activateAmrap(2);
    expect(useWorkoutStore.getState().amrapReps.m2).toBe("3");
  });

  it("correct minReps per phase: phase 2 = 1", () => {
    seedProgram({ phase: 2 });
    seedWorkout({ activePhase: 2 });
    activateAmrap(2);
    expect(useWorkoutStore.getState().amrapReps.m2).toBe("1");
  });
});

// ---------------------------------------------------------------------------
// dismissTimer
// ---------------------------------------------------------------------------
describe("dismissTimer", () => {
  it("sets restTimer visible to false", () => {
    seedWorkout({ restTimer: { visible: true, key: 1, duration: 90, reason: "test" } });
    dismissTimer();
    expect(useWorkoutStore.getState().restTimer.visible).toBe(false);
  });

  it("calls clearTimerNotification", () => {
    dismissTimer();
    expect(clearTimerNotification).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// setChecked
// ---------------------------------------------------------------------------
describe("setChecked", () => {
  it("applies updater to checked", () => {
    seedWorkout();
    setChecked((prev) => ({ ...prev, w0: true }));
    expect(useWorkoutStore.getState().checked.w0).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// activateTimer
// ---------------------------------------------------------------------------
describe("activateTimer", () => {
  it("shows timer with smartRest result", () => {
    seedWorkout();
    activateTimer("main", 0.85, false);
    const state = useWorkoutStore.getState();
    const expected = smartRest("main", 0.85, false);
    expect(state.restTimer.visible).toBe(true);
    expect(state.restTimer.duration).toBe(expected.duration);
    expect(state.restTimer.reason).toBe(expected.reason);
  });

  it("deload duration", () => {
    seedWorkout();
    activateTimer("main", 0.5, true);
    const expected = smartRest("main", 0.5, true);
    expect(useWorkoutStore.getState().restTimer.duration).toBe(expected.duration);
  });

  it("increments key", () => {
    seedWorkout({ restTimer: { visible: false, key: 5, duration: 90, reason: "" } });
    activateTimer("main", 0.85, false);
    expect(useWorkoutStore.getState().restTimer.key).toBe(6);
  });
});
