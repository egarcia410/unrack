import { beforeEach, describe, expect, it } from "vitest";
import { useProgramStore } from "../program/program.store";
import { useOverlayStore } from "../overlay/overlay.store";
import {
  programCreated,
  programReset,
  templateChanged,
  exerciseSwapped,
  unitToggled,
  trainingMaxPercentChanged,
  oneRepMaxesSaved,
  assistanceMaximumsSaved,
  bodyweightBaselinesSaved,
  workoutFinished,
  phaseAdvanced,
  trainingMaxAdjusted,
} from "../program/program.actions";
import { roundToNearest, epley, calcWeight } from "../../../lib/calc";
import { LIFTS } from "../../../constants/program";
import { DEFAULT_ACC, BODYWEIGHT_ASSISTANCE_WEEKS } from "../../../constants/exercises";
import { resetStores, seedProgram, seedWorkout, mockDateNow } from "./setup";

beforeEach(() => {
  resetStores();
});

// ---------------------------------------------------------------------------
// programCreated
// ---------------------------------------------------------------------------
describe("programCreated", () => {
  it("parses string ORMs to floats and calculates TMs", () => {
    programCreated({ squat: "300", bench: "200", deadlift: "400", ohp: "150" });
    const state = useProgramStore.getState();
    expect(state.oneRepMaxes).toEqual({ squat: 300, bench: 200, deadlift: 400, ohp: 150 });
    LIFTS.forEach((lift) => {
      expect(state.trainingMaxes[lift.id]).toBe(
        roundToNearest(state.oneRepMaxes[lift.id] * (90 / 100)),
      );
    });
  });

  it("handles non-numeric strings as 0", () => {
    programCreated({ squat: "abc", bench: "", deadlift: "not-a-number", ohp: "150" });
    const state = useProgramStore.getState();
    expect(state.oneRepMaxes.squat).toBe(0);
    expect(state.oneRepMaxes.bench).toBe(0);
    expect(state.oneRepMaxes.deadlift).toBe(0);
    expect(state.oneRepMaxes.ohp).toBe(150);
    expect(state.trainingMaxes.squat).toBe(0);
  });

  it("sets createdAt to current timestamp", () => {
    const now = 1700000000000;
    const spy = mockDateNow(now);
    programCreated({ squat: "300", bench: "200", deadlift: "400", ohp: "150" });
    expect(useProgramStore.getState().createdAt).toBe(now);
    spy.mockRestore();
  });

  it("respects non-default trainingMaxPercent", () => {
    useProgramStore.setState({ trainingMaxPercent: 85 });
    programCreated({ squat: "300", bench: "200", deadlift: "400", ohp: "150" });
    const state = useProgramStore.getState();
    LIFTS.forEach((lift) => {
      expect(state.trainingMaxes[lift.id]).toBe(
        roundToNearest(state.oneRepMaxes[lift.id] * (85 / 100)),
      );
    });
  });

  it("handles decimal string ORMs", () => {
    programCreated({ squat: "315.5", bench: "200", deadlift: "400", ohp: "150" });
    expect(useProgramStore.getState().oneRepMaxes.squat).toBe(315.5);
  });
});

// ---------------------------------------------------------------------------
// programReset
// ---------------------------------------------------------------------------
describe("programReset", () => {
  it("resets all state to initial values", () => {
    seedProgram();
    programReset();
    const state = useProgramStore.getState();
    const initial = useProgramStore.getInitialState();
    expect(state.createdAt).toBe(initial.createdAt);
    expect(state.oneRepMaxes).toEqual(initial.oneRepMaxes);
    expect(state.trainingMaxes).toEqual(initial.trainingMaxes);
    expect(state.workouts).toEqual(initial.workouts);
    expect(state.cycle).toBe(initial.cycle);
  });

  it("clears workouts array", () => {
    seedProgram({
      workouts: [
        {
          cycle: 1,
          phase: 0,
          day: 0,
          lift: "squat",
          datetime: Date.now(),
          duration: 3600,
          amrapReps: {},
          assistanceLog: {},
          newOneRepMax: null,
        },
      ],
    });
    programReset();
    expect(useProgramStore.getState().workouts).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// templateChanged
// ---------------------------------------------------------------------------
describe("templateChanged", () => {
  it("sets templateId", () => {
    seedProgram();
    templateChanged("bbb");
    expect(useProgramStore.getState().templateId).toBe("bbb");
  });

  it("does not affect other state", () => {
    seedProgram();
    const before = { ...useProgramStore.getState() };
    templateChanged("ssl");
    const after = useProgramStore.getState();
    expect(after.oneRepMaxes).toEqual(before.oneRepMaxes);
    expect(after.trainingMaxes).toEqual(before.trainingMaxes);
    expect(after.cycle).toBe(before.cycle);
  });
});

// ---------------------------------------------------------------------------
// exerciseSwapped
// ---------------------------------------------------------------------------
describe("exerciseSwapped", () => {
  it("replaces exercise at swap slot and clears overlay", () => {
    seedProgram();
    useOverlayStore.setState({
      activeSwapSlot: { liftId: "squat", slot: 0, currentId: "dips" },
    });
    exerciseSwapped("pushup");
    const state = useProgramStore.getState();
    expect(state.assistanceSlots.squat[0]).toBe("pushup");
    expect(useOverlayStore.getState().activeSwapSlot).toBeNull();
  });

  it("no-op when swap slot is null", () => {
    seedProgram();
    const before = { ...useProgramStore.getState() };
    exerciseSwapped("pushup");
    expect(useProgramStore.getState().assistanceSlots).toEqual(before.assistanceSlots);
  });

  it("uses DEFAULT_ACC when no custom slots exist", () => {
    seedProgram({ assistanceSlots: {} });
    useOverlayStore.setState({
      activeSwapSlot: { liftId: "bench", slot: 1, currentId: "dbrow" },
    });
    exerciseSwapped("bbrow");
    const state = useProgramStore.getState();
    expect(state.assistanceSlots.bench).toEqual([
      DEFAULT_ACC.bench[0],
      "bbrow",
      DEFAULT_ACC.bench[2],
    ]);
  });

  it("preserves other lifts slots", () => {
    seedProgram({
      assistanceSlots: {
        squat: ["pushup", "chinup", "hangleg"],
        bench: ["dips", "pullup", "lunge"],
      },
    });
    useOverlayStore.setState({
      activeSwapSlot: { liftId: "squat", slot: 2, currentId: "hangleg" },
    });
    exerciseSwapped("abwheel");
    const state = useProgramStore.getState();
    expect(state.assistanceSlots.squat[2]).toBe("abwheel");
    expect(state.assistanceSlots.bench).toEqual(["dips", "pullup", "lunge"]);
  });
});

// ---------------------------------------------------------------------------
// unitToggled
// ---------------------------------------------------------------------------
describe("unitToggled", () => {
  it("toggles lb to kg with correct conversion", () => {
    seedProgram({ unit: "lb" });
    unitToggled();
    const state = useProgramStore.getState();
    expect(state.unit).toBe("kg");
    expect(state.oneRepMaxes.squat).toBe(roundToNearest(300 * 0.453592));
  });

  it("toggles kg to lb with correct conversion", () => {
    seedProgram({ unit: "kg", oneRepMaxes: { squat: 136, bench: 91, deadlift: 181, ohp: 68 } });
    // TMs will be recalculated from converted ORMs
    unitToggled();
    const state = useProgramStore.getState();
    expect(state.unit).toBe("lb");
    expect(state.oneRepMaxes.squat).toBe(roundToNearest(136 * 2.20462));
  });

  it("converts assistance maximums", () => {
    seedProgram({ unit: "lb", assistanceMaximums: { dbrow: 50, bbrow: 100 } });
    unitToggled();
    const state = useProgramStore.getState();
    expect(state.assistanceMaximums.dbrow).toBe(roundToNearest(50 * 0.453592));
    expect(state.assistanceMaximums.bbrow).toBe(roundToNearest(100 * 0.453592));
  });

  it("recalculates TMs from converted ORMs", () => {
    seedProgram({ unit: "lb" });
    unitToggled();
    const state = useProgramStore.getState();
    LIFTS.forEach((lift) => {
      expect(state.trainingMaxes[lift.id]).toBe(
        roundToNearest(state.oneRepMaxes[lift.id] * (state.trainingMaxPercent / 100)),
      );
    });
  });
});

// ---------------------------------------------------------------------------
// trainingMaxPercentChanged
// ---------------------------------------------------------------------------
describe("trainingMaxPercentChanged", () => {
  it("clamps to minimum 80", () => {
    seedProgram();
    trainingMaxPercentChanged(70);
    expect(useProgramStore.getState().trainingMaxPercent).toBe(80);
  });

  it("clamps to maximum 95", () => {
    seedProgram();
    trainingMaxPercentChanged(100);
    expect(useProgramStore.getState().trainingMaxPercent).toBe(95);
  });

  it("recalculates TMs at new percentage", () => {
    seedProgram();
    trainingMaxPercentChanged(85);
    const state = useProgramStore.getState();
    LIFTS.forEach((lift) => {
      expect(state.trainingMaxes[lift.id]).toBe(
        roundToNearest(state.oneRepMaxes[lift.id] * (85 / 100)),
      );
    });
  });

  it("accepts valid boundary value 80", () => {
    seedProgram();
    trainingMaxPercentChanged(80);
    expect(useProgramStore.getState().trainingMaxPercent).toBe(80);
  });

  it("accepts valid boundary value 95", () => {
    seedProgram();
    trainingMaxPercentChanged(95);
    expect(useProgramStore.getState().trainingMaxPercent).toBe(95);
  });
});

// ---------------------------------------------------------------------------
// oneRepMaxesSaved
// ---------------------------------------------------------------------------
describe("oneRepMaxesSaved", () => {
  it("parses strings and recalculates TMs", () => {
    seedProgram();
    oneRepMaxesSaved({ squat: "315", bench: "225", deadlift: "405", ohp: "155" });
    const state = useProgramStore.getState();
    expect(state.oneRepMaxes.squat).toBe(315);
    LIFTS.forEach((lift) => {
      expect(state.trainingMaxes[lift.id]).toBe(
        roundToNearest(state.oneRepMaxes[lift.id] * (90 / 100)),
      );
    });
  });

  it("falls back to existing value on invalid input", () => {
    seedProgram();
    oneRepMaxesSaved({ squat: "abc", bench: "225", deadlift: "405", ohp: "155" });
    expect(useProgramStore.getState().oneRepMaxes.squat).toBe(300);
  });

  it("falls back to 0 when no existing value", () => {
    seedProgram({ oneRepMaxes: { squat: 0, bench: 200, deadlift: 400, ohp: 150 } });
    oneRepMaxesSaved({ squat: "abc", bench: "225", deadlift: "405", ohp: "155" });
    expect(useProgramStore.getState().oneRepMaxes.squat).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// assistanceMaximumsSaved
// ---------------------------------------------------------------------------
describe("assistanceMaximumsSaved", () => {
  it("merges parsed ints into existing maximums", () => {
    seedProgram({ assistanceMaximums: { dbrow: 50 } });
    assistanceMaximumsSaved({ dbrow: "60", bbrow: "100" });
    const state = useProgramStore.getState();
    expect(state.assistanceMaximums.dbrow).toBe(60);
    expect(state.assistanceMaximums.bbrow).toBe(100);
  });

  it("handles non-numeric values as 0", () => {
    assistanceMaximumsSaved({ dbrow: "abc" });
    expect(useProgramStore.getState().assistanceMaximums.dbrow).toBe(0);
  });

  it("accepts number values directly", () => {
    assistanceMaximumsSaved({ dbrow: 75 });
    expect(useProgramStore.getState().assistanceMaximums.dbrow).toBe(75);
  });
});

// ---------------------------------------------------------------------------
// bodyweightBaselinesSaved
// ---------------------------------------------------------------------------
describe("bodyweightBaselinesSaved", () => {
  it("merges parsed ints into existing baselines", () => {
    seedProgram({ bodyweightBaselines: { chinup: 10 } });
    bodyweightBaselinesSaved({ chinup: "12", dips: "15" });
    const state = useProgramStore.getState();
    expect(state.bodyweightBaselines.chinup).toBe(12);
    expect(state.bodyweightBaselines.dips).toBe(15);
  });

  it("handles non-numeric values as 0", () => {
    bodyweightBaselinesSaved({ chinup: "abc" });
    expect(useProgramStore.getState().bodyweightBaselines.chinup).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// workoutFinished
// ---------------------------------------------------------------------------
describe("workoutFinished", () => {
  const setupForFinish = (
    opts: {
      phase?: number;
      day?: number;
      amrapReps?: Record<string, string>;
      assistanceLog?: Record<string, string>;
      workoutStartOffset?: number;
      oneRepMaxOverrides?: Record<string, number>;
      assistanceMaximums?: Record<string, number>;
      bodyweightBaselines?: Record<string, number>;
    } = {},
  ) => {
    const now = 1700003600000;
    const spy = mockDateNow(now);
    const phase = opts.phase ?? 0;
    const day = opts.day ?? 0;
    seedProgram({
      phase,
      ...(opts.oneRepMaxOverrides && {
        oneRepMaxes: {
          squat: 300,
          bench: 200,
          deadlift: 400,
          ohp: 150,
          ...opts.oneRepMaxOverrides,
        },
      }),
      ...(opts.assistanceMaximums && { assistanceMaximums: opts.assistanceMaximums }),
      ...(opts.bodyweightBaselines && { bodyweightBaselines: opts.bodyweightBaselines }),
    });
    seedWorkout({
      activePhase: phase,
      activeDay: day,
      amrapReps: opts.amrapReps ?? {},
      assistanceLog: opts.assistanceLog ?? {},
      workoutStart: now - (opts.workoutStartOffset ?? 3600000),
    });
    return spy;
  };

  it("normal done — reps >= minReps, no PR", () => {
    // Phase 0 AMRAP = "5+" at 85% of TM. squat TM=270, weight=230, 5 reps → epley(230,5) = 268
    // 268 < 300 (existing ORM) so no PR
    const spy = setupForFinish({ amrapReps: { m2: "5" } });
    workoutFinished();
    const celebration = useOverlayStore.getState().activeCelebration;
    expect(celebration).not.toBeNull();
    expect(celebration!.type).toBe("done");
    spy.mockRestore();
  });

  it("new PR — estimated 1RM exceeds existing ORM", () => {
    // Phase 0 AMRAP = "5+" at 85% of squat TM=270, weight=calcWeight(270, 0.85)=230
    // 15 reps → epley(230,15) = 230*(1+15/30) = 230*1.5 = 345 > 300
    const spy = setupForFinish({ amrapReps: { m2: "15" } });
    workoutFinished();
    const state = useProgramStore.getState();
    const celebration = useOverlayStore.getState().activeCelebration;
    expect(celebration!.type).toBe("pr");
    expect(state.oneRepMaxes.squat).toBe(epley(calcWeight(270, 0.85), 15));
    spy.mockRestore();
  });

  it("missed AMRAP — reps <= 0 produces warn with suggested TM", () => {
    const spy = setupForFinish({ amrapReps: { m2: "0" } });
    workoutFinished();
    const celebration = useOverlayStore.getState().activeCelebration;
    expect(celebration!.type).toBe("warn");
    if (celebration!.type === "warn") {
      expect(celebration!.message).toBe("Missed AMRAP");
      expect(celebration!.suggestedTrainingMax).toBeGreaterThan(0);
    }
    spy.mockRestore();
  });

  it("below target — 0 < reps < minReps produces warn", () => {
    // Phase 0 AMRAP "5+" requires 5 reps. 2 reps is below target.
    const spy = setupForFinish({ amrapReps: { m2: "2" } });
    workoutFinished();
    const celebration = useOverlayStore.getState().activeCelebration;
    expect(celebration!.type).toBe("warn");
    if (celebration!.type === "warn") {
      expect(celebration!.message).toBe("Below Target");
    }
    spy.mockRestore();
  });

  it("deload phase — skips AMRAP logic, returns done", () => {
    const spy = setupForFinish({ phase: 3 });
    workoutFinished();
    const celebration = useOverlayStore.getState().activeCelebration;
    expect(celebration!.type).toBe("done");
    spy.mockRestore();
  });

  it("pushes workout entry with correct shape", () => {
    const spy = setupForFinish({ amrapReps: { m2: "5" } });
    workoutFinished();
    const state = useProgramStore.getState();
    expect(state.workouts).toHaveLength(1);
    const entry = state.workouts[0];
    expect(entry.cycle).toBe(1);
    expect(entry.phase).toBe(0);
    expect(entry.day).toBe(0);
    expect(entry.lift).toBe("squat");
    expect(entry.amrapReps).toEqual({ m2: "5" });
    spy.mockRestore();
  });

  it("calculates duration from workoutStart", () => {
    // workoutStart = now - 3600000 (1 hour)
    const spy = setupForFinish({ workoutStartOffset: 3600000 });
    workoutFinished();
    const entry = useProgramStore.getState().workouts[0];
    expect(entry.duration).toBe(3600);
    spy.mockRestore();
  });

  it("logs bodyweight assistance history", () => {
    // Day 0 = squat, default accessories: dips (bodyweight), chinup (bodyweight), hangleg (bodyweight)
    const spy = setupForFinish({ assistanceLog: {} });
    workoutFinished();
    const state = useProgramStore.getState();
    // Default squat accessories are dips, chinup, hangleg — all bodyweight
    expect(state.assistanceHistory.dips).toBeDefined();
    expect(state.assistanceHistory.dips[0].type).toBe("bodyweight");
    spy.mockRestore();
  });

  it("logs weighted assistance history with weight", () => {
    // Day 1 = bench, default: pushup, dbrow (weighted), lunge (weighted)
    const spy = setupForFinish({ day: 1, assistanceLog: { dbrow: "50" } });
    workoutFinished();
    const state = useProgramStore.getState();
    expect(state.assistanceHistory.dbrow).toBeDefined();
    const entry = state.assistanceHistory.dbrow[0];
    expect(entry.type).toBe("weighted");
    if (entry.type === "weighted") {
      expect(entry.weight).toBe(50);
    }
    spy.mockRestore();
  });

  it("discovers baselines on first bodyweight entry", () => {
    // dips is bodyweight. Enter 10 reps in phase 0 (multiplier 1.25). Baseline = round(10 / 1.25) = 8
    const spy = setupForFinish({ assistanceLog: { dips: "10" } });
    workoutFinished();
    const state = useProgramStore.getState();
    const multiplier = BODYWEIGHT_ASSISTANCE_WEEKS[0].multiplier;
    expect(state.bodyweightBaselines.dips).toBe(Math.round(10 / multiplier));
    spy.mockRestore();
  });

  it("does not overwrite existing baselines", () => {
    const spy = setupForFinish({
      bodyweightBaselines: { dips: 15 },
      assistanceLog: { dips: "10" },
    });
    workoutFinished();
    expect(useProgramStore.getState().bodyweightBaselines.dips).toBe(15);
    spy.mockRestore();
  });

  it("discovers maximums on first weighted entry", () => {
    // dbrow weighted, phase 0 percentage = 0.6. Log 30 → maximum = roundToNearest(30 / 0.6) = 50
    const spy = setupForFinish({ day: 1, assistanceLog: { dbrow: "30" } });
    workoutFinished();
    expect(useProgramStore.getState().assistanceMaximums.dbrow).toBe(roundToNearest(30 / 0.6));
    spy.mockRestore();
  });

  it("does not overwrite existing maximums", () => {
    const spy = setupForFinish({
      day: 1,
      assistanceMaximums: { dbrow: 100 },
      assistanceLog: { dbrow: "30" },
    });
    workoutFinished();
    expect(useProgramStore.getState().assistanceMaximums.dbrow).toBe(100);
    spy.mockRestore();
  });

  it("different day maps to different lift", () => {
    // Day 1 = bench
    const spy = setupForFinish({ day: 1, amrapReps: { m2: "5" } });
    workoutFinished();
    expect(useProgramStore.getState().workouts[0].lift).toBe("bench");
    spy.mockRestore();
  });

  it("phase 1 uses 3+ AMRAP correctly", () => {
    // Phase 1 AMRAP = "3+" at 90%. squat TM=270, weight = calcWeight(270,0.9) = 245
    // 3 reps → epley(245,3) = 245*(1+3/30) = 245*1.1 = 270 (rounded) < 300, no PR
    const spy = setupForFinish({ phase: 1, amrapReps: { m2: "3" } });
    workoutFinished();
    const celebration = useOverlayStore.getState().activeCelebration;
    expect(celebration!.type).toBe("done");
    spy.mockRestore();
  });

  it("phase 2 uses 1+ AMRAP correctly with big rep count → PR", () => {
    // Phase 2 AMRAP = "1+" at 95%. squat TM=270, weight = calcWeight(270,0.95) = 255
    // 10 reps → epley(255,10) = 255*(1+10/30) = 255*1.333 = 340 > 300, PR!
    const spy = setupForFinish({ phase: 2, amrapReps: { m2: "10" } });
    workoutFinished();
    const celebration = useOverlayStore.getState().activeCelebration;
    expect(celebration!.type).toBe("pr");
    spy.mockRestore();
  });

  it("formats duration as minutes in celebration", () => {
    const spy = setupForFinish({ workoutStartOffset: 2700000, amrapReps: { m2: "5" } });
    workoutFinished();
    const celebration = useOverlayStore.getState().activeCelebration;
    if (celebration!.type === "done") {
      expect(celebration!.duration).toBe("45 min");
    }
    spy.mockRestore();
  });

  it("formats sub-minute duration correctly", () => {
    const spy = setupForFinish({ workoutStartOffset: 30000, amrapReps: { m2: "5" } });
    workoutFinished();
    const celebration = useOverlayStore.getState().activeCelebration;
    if (celebration!.type === "done") {
      expect(celebration!.duration).toBe("< 1 min");
    }
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// phaseAdvanced
// ---------------------------------------------------------------------------
describe("phaseAdvanced", () => {
  it("mid-cycle: increments phase", () => {
    seedProgram({ phase: 0 });
    phaseAdvanced();
    expect(useProgramStore.getState().phase).toBe(1);
  });

  it("mid-cycle: increments from 1 to 2", () => {
    seedProgram({ phase: 1 });
    phaseAdvanced();
    expect(useProgramStore.getState().phase).toBe(2);
  });

  it("cycle complete: resets phase to 0 and increments cycle", () => {
    seedProgram({ phase: 3 }); // FSL has 4 phases (0-3), so phase 3 → next = 4 >= length
    phaseAdvanced();
    const state = useProgramStore.getState();
    expect(state.phase).toBe(0);
    expect(state.cycle).toBe(2);
  });

  it("cycle complete: bumps TMs with max(ORM-based, current+increment)", () => {
    seedProgram({ phase: 3 });
    phaseAdvanced();
    const state = useProgramStore.getState();
    // squat: max(roundToNearest(300*0.9), 270+10) = max(270, 280) = 280
    expect(state.trainingMaxes.squat).toBe(Math.max(roundToNearest(300 * (90 / 100)), 270 + 10));
    // bench: max(roundToNearest(200*0.9), 180+5) = max(180, 185) = 185
    expect(state.trainingMaxes.bench).toBe(Math.max(roundToNearest(200 * (90 / 100)), 180 + 5));
  });

  it("cycle complete: falls back to increment-only when ORM=0", () => {
    seedProgram({
      phase: 3,
      oneRepMaxes: { squat: 0, bench: 0, deadlift: 0, ohp: 0 },
    });
    phaseAdvanced();
    const state = useProgramStore.getState();
    expect(state.trainingMaxes.squat).toBe(270 + 10);
    expect(state.trainingMaxes.bench).toBe(180 + 5);
    expect(state.trainingMaxes.deadlift).toBe(360 + 10);
    expect(state.trainingMaxes.ohp).toBe(135 + 5);
  });

  it("cycle complete: correct per-lift increments", () => {
    // squat +10, bench +5, deadlift +10, ohp +5
    seedProgram({
      phase: 3,
      oneRepMaxes: { squat: 0, bench: 0, deadlift: 0, ohp: 0 },
    });
    phaseAdvanced();
    const state = useProgramStore.getState();
    expect(state.trainingMaxes.squat - 270).toBe(10);
    expect(state.trainingMaxes.bench - 180).toBe(5);
    expect(state.trainingMaxes.deadlift - 360).toBe(10);
    expect(state.trainingMaxes.ohp - 135).toBe(5);
  });

  it("cycle complete: bumps weighted assistance by weightIncrement", () => {
    seedProgram({
      phase: 3,
      assistanceMaximums: { dbrow: 50, bbrow: 100 },
    });
    phaseAdvanced();
    const state = useProgramStore.getState();
    // dbrow increment = 5, bbrow increment = 5
    expect(state.assistanceMaximums.dbrow).toBe(55);
    expect(state.assistanceMaximums.bbrow).toBe(105);
  });

  it("cycle complete: bumps bodyweight baselines by +1 only if > 0", () => {
    seedProgram({
      phase: 3,
      bodyweightBaselines: { chinup: 10, dips: 0 },
    });
    phaseAdvanced();
    const state = useProgramStore.getState();
    expect(state.bodyweightBaselines.chinup).toBe(11);
    expect(state.bodyweightBaselines.dips).toBe(0);
  });

  it("cycle complete: sets cycle celebration", () => {
    seedProgram({ phase: 3 });
    phaseAdvanced();
    const celebration = useOverlayStore.getState().activeCelebration;
    expect(celebration).not.toBeNull();
    expect(celebration!.type).toBe("cycle");
    if (celebration!.type === "cycle") {
      expect(celebration!.message).toBe("Cycle Complete!");
    }
  });
});

// ---------------------------------------------------------------------------
// trainingMaxAdjusted
// ---------------------------------------------------------------------------
describe("trainingMaxAdjusted", () => {
  it("directly sets ORM and TM for one lift", () => {
    seedProgram();
    trainingMaxAdjusted("squat", 280, 250);
    const state = useProgramStore.getState();
    expect(state.oneRepMaxes.squat).toBe(280);
    expect(state.trainingMaxes.squat).toBe(250);
  });

  it("does not affect other lifts", () => {
    seedProgram();
    trainingMaxAdjusted("squat", 280, 250);
    const state = useProgramStore.getState();
    expect(state.oneRepMaxes.bench).toBe(200);
    expect(state.trainingMaxes.bench).toBe(180);
  });
});
