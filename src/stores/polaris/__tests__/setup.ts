import { vi } from "vitest";
import { useProgramStore } from "../program/program.store";
import { useWorkoutStore } from "../workout/workout.store";
import { useOverlayStore } from "../overlay/overlay.store";

// --- Global mocks (runs before each test file via setupFiles) ---

// In-memory localStorage mock
const localStorageMap = new Map<string, string>();
const localStorageMock: Storage = {
  getItem: (key: string) => localStorageMap.get(key) ?? null,
  setItem: (key: string, value: string) => {
    localStorageMap.set(key, value);
  },
  removeItem: (key: string) => {
    localStorageMap.delete(key);
  },
  clear: () => {
    localStorageMap.clear();
  },
  get length() {
    return localStorageMap.size;
  },
  key: (index: number) => [...localStorageMap.keys()][index] ?? null,
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

// Navigator mock for deterministic inferUnit() → "lb"
Object.defineProperty(globalThis, "navigator", {
  value: { language: "en-US" },
  writable: true,
});

// Notification stub
Object.defineProperty(globalThis, "Notification", {
  value: class Notification {
    static permission = "default";
    static requestPermission = vi.fn().mockResolvedValue("default");
    close = vi.fn();
  },
  writable: true,
});

// import.meta.env stub for createStore devtools check
Object.defineProperty(import.meta, "env", {
  value: { DEV: false },
  writable: true,
});

// Module mock: notifications
vi.mock("../../../lib/notifications", () => ({
  requestNotificationPermission: vi.fn(),
  clearTimerNotification: vi.fn(),
  showTimerNotification: vi.fn(),
}));

// --- Seed helpers ---

export const seedProgram = (overrides?: Partial<ReturnType<typeof useProgramStore.getState>>) => {
  useProgramStore.setState(
    {
      templateId: "fsl",
      unit: "lb",
      trainingMaxPercent: 90,
      oneRepMaxes: { squat: 300, bench: 200, deadlift: 400, ohp: 150 },
      trainingMaxes: { squat: 270, bench: 180, deadlift: 360, ohp: 135 },
      cycle: 1,
      phase: 0,
      workouts: [],
      assistanceHistory: {},
      assistanceMaximums: {},
      bodyweightBaselines: {},
      assistanceSlots: {},
      customExercises: {},
      createdAt: 1700000000000,
      ...overrides,
    },
    true,
  );
};

export const seedWorkout = (overrides?: Partial<ReturnType<typeof useWorkoutStore.getState>>) => {
  useWorkoutStore.setState(
    {
      ...useWorkoutStore.getInitialState(),
      activePhase: 0,
      activeDay: 0,
      workoutStart: Date.now(),
      ...overrides,
    },
    true,
  );
};

export const mockDateNow = (timestamp: number) => vi.spyOn(Date, "now").mockReturnValue(timestamp);

export const resetStores = () => {
  useProgramStore.setState(useProgramStore.getInitialState(), true);
  useWorkoutStore.setState(useWorkoutStore.getInitialState(), true);
  useOverlayStore.setState(useOverlayStore.getInitialState(), true);
  localStorageMap.clear();
};
