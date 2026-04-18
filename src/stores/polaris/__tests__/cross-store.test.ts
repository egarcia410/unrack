import { beforeEach, describe, expect, it } from "vitest";
import { useProgramStore } from "../program/program.store";
import { useWorkoutStore } from "../workout/workout.store";
import { useOverlayStore } from "../overlay/overlay.store";
import {
  exerciseSwapped,
  workoutFinished,
  phaseAdvanced,
  trainingMaxAdjusted,
  programCreated,
} from "../program/program.actions";
import { startWorkout, onSetCheck, activateAmrap } from "../workout/workout.actions";
import { setActiveSwapSlot } from "../overlay/overlay.actions";
import { roundToNearest, epley, calcWeight } from "../../../lib/calc";
import { resetStores, seedProgram, seedWorkout, mockDateNow } from "./setup";

beforeEach(() => {
  resetStores();
});

// ---------------------------------------------------------------------------
// exerciseSwapped: overlay → program + overlay
// ---------------------------------------------------------------------------
describe("exerciseSwapped cross-store", () => {
  it("reads swap slot from overlay, updates program, clears overlay", () => {
    seedProgram();
    setActiveSwapSlot({ liftId: "squat", slot: 1, currentId: "chinup" });
    expect(useOverlayStore.getState().activeSwapSlot).not.toBeNull();

    exerciseSwapped("pullup");

    // Program updated
    expect(useProgramStore.getState().assistanceSlots.squat[1]).toBe("pullup");
    // Overlay cleared
    expect(useOverlayStore.getState().activeSwapSlot).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// startWorkout: program → workout
// ---------------------------------------------------------------------------
describe("startWorkout cross-store", () => {
  it("syncs phase from program store to workout store", () => {
    seedProgram({ phase: 2 });
    startWorkout(1);
    expect(useWorkoutStore.getState().activePhase).toBe(2);
    expect(useWorkoutStore.getState().activeDay).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// workoutFinished: workout + program → program + overlay
// ---------------------------------------------------------------------------
describe("workoutFinished cross-store", () => {
  it("updates all three stores on workout finish", () => {
    const now = 1700003600000;
    const spy = mockDateNow(now);
    seedProgram();
    seedWorkout({
      activePhase: 0,
      activeDay: 0,
      amrapReps: { m2: "5" },
      assistanceLog: {},
      workoutStart: now - 2700000,
    });

    workoutFinished();

    // Program: new workout entry
    const programState = useProgramStore.getState();
    expect(programState.workouts).toHaveLength(1);
    expect(programState.workouts[0].lift).toBe("squat");
    expect(programState.workouts[0].duration).toBe(2700);

    // Overlay: celebration set
    const overlayState = useOverlayStore.getState();
    expect(overlayState.activeCelebration).not.toBeNull();

    spy.mockRestore();
  });

  it("PR updates program ORM and sets PR celebration in overlay", () => {
    const now = 1700003600000;
    const spy = mockDateNow(now);
    seedProgram();
    seedWorkout({
      activePhase: 0,
      activeDay: 0,
      amrapReps: { m2: "15" }, // High reps → PR
      workoutStart: now - 3600000,
    });

    workoutFinished();

    const programState = useProgramStore.getState();
    const weight = calcWeight(270, 0.85);
    const expectedORM = epley(weight, 15);
    expect(programState.oneRepMaxes.squat).toBe(expectedORM);

    const celebration = useOverlayStore.getState().activeCelebration;
    expect(celebration!.type).toBe("pr");

    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// phaseAdvanced cycle complete: program → program + overlay
// ---------------------------------------------------------------------------
describe("phaseAdvanced cross-store", () => {
  it("cycle complete resets phase, updates TMs, and sets celebration", () => {
    seedProgram({ phase: 3 });

    phaseAdvanced();

    const programState = useProgramStore.getState();
    expect(programState.phase).toBe(0);
    expect(programState.cycle).toBe(2);
    // TMs bumped
    expect(programState.trainingMaxes.squat).toBeGreaterThan(270);

    const celebration = useOverlayStore.getState().activeCelebration;
    expect(celebration!.type).toBe("cycle");
  });
});

// ---------------------------------------------------------------------------
// warn → trainingMaxAdjusted flow: overlay → program
// ---------------------------------------------------------------------------
describe("warn → trainingMaxAdjusted flow", () => {
  it("missed AMRAP produces suggested values, adjustment applies them", () => {
    const now = 1700003600000;
    const spy = mockDateNow(now);
    seedProgram();
    seedWorkout({
      activePhase: 0,
      activeDay: 0,
      amrapReps: { m2: "0" }, // Missed AMRAP
      workoutStart: now - 3600000,
    });

    workoutFinished();

    const celebration = useOverlayStore.getState().activeCelebration;
    expect(celebration!.type).toBe("warn");
    if (celebration!.type === "warn") {
      const { liftId, suggestedOneRepMax, suggestedTrainingMax } = celebration!;

      // Apply the adjustment
      trainingMaxAdjusted(liftId, suggestedOneRepMax, suggestedTrainingMax);

      const state = useProgramStore.getState();
      expect(state.oneRepMaxes[liftId]).toBe(suggestedOneRepMax);
      expect(state.trainingMaxes[liftId]).toBe(suggestedTrainingMax);
      // Verify suggested TM is lower than original
      expect(suggestedTrainingMax).toBeLessThan(270);
    }

    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Full lifecycle smoke test
// ---------------------------------------------------------------------------
describe("full lifecycle", () => {
  it("programCreated → startWorkout → check sets → workoutFinished → phaseAdvanced", () => {
    const now = 1700000000000;
    const spy = mockDateNow(now);

    // 1. Create program
    programCreated({ squat: "300", bench: "200", deadlift: "400", ohp: "150" });
    expect(useProgramStore.getState().createdAt).toBe(now);
    expect(useProgramStore.getState().trainingMaxes.squat).toBe(roundToNearest(300 * 0.9));

    // 2. Start workout (day 0 = squat)
    spy.mockReturnValue(now + 1000);
    startWorkout(0);
    expect(useWorkoutStore.getState().workoutStart).toBe(now + 1000);
    expect(useWorkoutStore.getState().activePhase).toBe(0);

    // 3. Check some sets
    onSetCheck("w0");
    expect(useWorkoutStore.getState().checked.w0).toBe(true);
    onSetCheck("w1");
    onSetCheck("w2");
    onSetCheck("m0");
    onSetCheck("m1");

    // 4. Activate AMRAP
    activateAmrap(2);
    expect(useWorkoutStore.getState().amrapReps.m2).toBe("5");

    // 5. Finish workout
    spy.mockReturnValue(now + 3601000);
    workoutFinished();
    expect(useProgramStore.getState().workouts).toHaveLength(1);
    expect(useOverlayStore.getState().activeCelebration).not.toBeNull();

    // 6. Advance phase
    phaseAdvanced();
    expect(useProgramStore.getState().phase).toBe(1);

    spy.mockRestore();
  });

  it("full cycle through all 4 phases", () => {
    seedProgram({ phase: 0 });

    phaseAdvanced(); // 0 → 1
    expect(useProgramStore.getState().phase).toBe(1);

    phaseAdvanced(); // 1 → 2
    expect(useProgramStore.getState().phase).toBe(2);

    phaseAdvanced(); // 2 → 3
    expect(useProgramStore.getState().phase).toBe(3);

    phaseAdvanced(); // 3 → cycle complete, phase = 0, cycle = 2
    expect(useProgramStore.getState().phase).toBe(0);
    expect(useProgramStore.getState().cycle).toBe(2);
    expect(useOverlayStore.getState().activeCelebration!.type).toBe("cycle");
  });
});
