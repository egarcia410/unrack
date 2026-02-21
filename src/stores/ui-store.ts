import type { ThemeMode, CelebrationState } from "../types";
import { createStore } from "./polaris";

const THEME_KEY = "unrack-theme";

const loadMode = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    // Migration: check legacy program data
    const program = localStorage.getItem("unrack-v1");
    if (program) {
      const parsed = JSON.parse(program);
      if (parsed.mode === "light" || parsed.mode === "dark") return parsed.mode;
    }
  } catch {}
  return "dark";
};

type EditOneRepMaxState = {
  [liftId: string]: string;
};

type EditAssistanceState = {
  [accId: string]: string | number;
};

type UIState = {
  mode: ThemeMode;
  showConfirm: boolean;
  showSettings: boolean;
  settingsExpanded: boolean;
  showTemplatePicker: boolean;
  celebration: CelebrationState | null;
  editOneRepMax: EditOneRepMaxState | null;
  editAssistance: EditAssistanceState | null;
};

const initialState: UIState = {
  mode: loadMode(),
  showConfirm: false,
  showSettings: false,
  settingsExpanded: false,
  showTemplatePicker: false,
  celebration: null,
  editOneRepMax: null,
  editAssistance: null,
};

export const useUIStore = createStore("ui", {
  state: initialState,
  actions: (set, get) => ({
    setMode: (mode: ThemeMode) => {
      document.documentElement.classList.toggle("dark", mode === "dark");
      localStorage.setItem(THEME_KEY, mode);
      set({ mode });
    },
    toggleMode: () => {
      const next = get().mode === "dark" ? ("light" as const) : ("dark" as const);
      useUIStore.actions.setMode(next);
    },
    setShowConfirm: (show: boolean) => set({ showConfirm: show }),
    setShowSettings: (show: boolean) => set({ showSettings: show }),
    setSettingsExpanded: (expanded: boolean) => set({ settingsExpanded: expanded }),
    toggleSettingsExpanded: () =>
      set((s) => {
        s.settingsExpanded = !s.settingsExpanded;
      }),
    setShowTemplatePicker: (show: boolean) => set({ showTemplatePicker: show }),
    setCelebration: (celebration: CelebrationState | null) => set({ celebration }),
    setEditOneRepMax: (edit: EditOneRepMaxState | null) => set({ editOneRepMax: edit }),
    updateEditOneRepMax: (
      updater: (prev: EditOneRepMaxState | null) => EditOneRepMaxState | null,
    ) =>
      set((s) => {
        s.editOneRepMax = updater(s.editOneRepMax);
      }),
    setEditAssistance: (edit: EditAssistanceState | null) => set({ editAssistance: edit }),
    updateEditAssistance: (
      updater: (prev: EditAssistanceState | null) => EditAssistanceState | null,
    ) =>
      set((s) => {
        s.editAssistance = updater(s.editAssistance);
      }),
    closeSettings: () =>
      set({
        showSettings: false,
        editAssistance: null,
        editOneRepMax: null,
        settingsExpanded: false,
      }),
  }),
});

export const initTheme = () => {
  const mode = useUIStore.getState().mode;
  document.documentElement.classList.toggle("dark", mode === "dark");
};
