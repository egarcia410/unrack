import type { ThemeMode, CelebState } from "../types";
import { createStore } from "./polaris";

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
  showTemplPicker: boolean;
  celeb: CelebState | null;
  editOneRepMax: EditOneRepMaxState | null;
  editAssistance: EditAssistanceState | null;
};

const initialState: UIState = {
  mode: "dark",
  showConfirm: false,
  showSettings: false,
  settingsExpanded: false,
  showTemplPicker: false,
  celeb: null,
  editOneRepMax: null,
  editAssistance: null,
};

export const useUIStore = createStore("ui", {
  state: initialState,
  actions: (set) => ({
    setMode: (mode: ThemeMode) => {
      document.documentElement.classList.toggle("dark", mode === "dark");
      set({ mode });
    },
    setShowConfirm: (show: boolean) => set({ showConfirm: show }),
    setShowSettings: (show: boolean) => set({ showSettings: show }),
    setSettingsExpanded: (expanded: boolean) => set({ settingsExpanded: expanded }),
    toggleSettingsExpanded: () =>
      set((s) => {
        s.settingsExpanded = !s.settingsExpanded;
      }),
    setShowTemplPicker: (show: boolean) => set({ showTemplPicker: show }),
    setCeleb: (celeb: CelebState | null) => set({ celeb }),
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
