import { create } from "zustand";
import type { ThemeMode, CelebState } from "../types";
import { createSelectors } from "../lib/create-selectors";

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

type UIActions = {
  setMode: (mode: ThemeMode) => void;
  setShowConfirm: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setSettingsExpanded: (expanded: boolean) => void;
  toggleSettingsExpanded: () => void;
  setShowTemplPicker: (show: boolean) => void;
  setCeleb: (celeb: CelebState | null) => void;
  setEditOneRepMax: (edit: EditOneRepMaxState | null) => void;
  updateEditOneRepMax: (
    updater: (prev: EditOneRepMaxState | null) => EditOneRepMaxState | null,
  ) => void;
  setEditAssistance: (edit: EditAssistanceState | null) => void;
  updateEditAssistance: (
    updater: (prev: EditAssistanceState | null) => EditAssistanceState | null,
  ) => void;
  closeSettings: () => void;
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

export const useUIStore = createSelectors(
  create<UIState & { actions: UIActions }>((set) => ({
    ...initialState,

    actions: {
      setMode: (mode) => {
        document.documentElement.classList.toggle("dark", mode === "dark");
        set({ mode });
      },
      setShowConfirm: (show) => set({ showConfirm: show }),
      setShowSettings: (show) => set({ showSettings: show }),
      setSettingsExpanded: (expanded) => set({ settingsExpanded: expanded }),
      toggleSettingsExpanded: () => set((state) => ({ settingsExpanded: !state.settingsExpanded })),
      setShowTemplPicker: (show) => set({ showTemplPicker: show }),
      setCeleb: (celeb) => set({ celeb }),
      setEditOneRepMax: (edit) => set({ editOneRepMax: edit }),
      updateEditOneRepMax: (updater) =>
        set((state) => ({ editOneRepMax: updater(state.editOneRepMax) })),
      setEditAssistance: (edit) => set({ editAssistance: edit }),
      updateEditAssistance: (updater) =>
        set((state) => ({ editAssistance: updater(state.editAssistance) })),
      closeSettings: () =>
        set({
          showSettings: false,
          editAssistance: null,
          editOneRepMax: null,
          settingsExpanded: false,
        }),
    },
  })),
);

export const initTheme = () => {
  const mode = useUIStore.getState().mode;
  document.documentElement.classList.toggle("dark", mode === "dark");
};
