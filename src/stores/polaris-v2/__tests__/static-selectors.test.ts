import { beforeEach, describe, expect, it } from "vitest";
import { useProgramStore } from "../program/program.store";
import { useWorkoutStore } from "../workout/workout.store";
import { hasProgramData } from "../program/program.selectors";
import { hasActiveWorkout } from "../workout/workout.selectors";
import { resetStores } from "./setup";

beforeEach(() => {
  resetStores();
});

describe("hasProgramData", () => {
  it("returns false when createdAt is 0", () => {
    expect(hasProgramData()).toBe(false);
  });

  it("returns true when createdAt > 0", () => {
    useProgramStore.setState({ createdAt: 1700000000000 });
    expect(hasProgramData()).toBe(true);
  });
});

describe("hasActiveWorkout", () => {
  it("returns false when workoutStart is null", () => {
    expect(hasActiveWorkout()).toBe(false);
  });

  it("returns true when workoutStart is set", () => {
    useWorkoutStore.setState({ workoutStart: Date.now() });
    expect(hasActiveWorkout()).toBe(true);
  });
});
