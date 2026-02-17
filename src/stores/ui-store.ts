import { create } from "zustand";
import type { ThemeMode, ThemeColors, CelebState } from "../types";
import { TK } from "../constants/theme";

interface EditE1State {
  [liftId: string]: string;
}

interface EditAccState {
  [accId: string]: string | number;
}

interface UIState {
  mode: ThemeMode;
  showConfirm: boolean;
  showSettings: boolean;
  settingsExpanded: boolean;
  showTemplPicker: boolean;
  celeb: CelebState | null;
  editE1: EditE1State | null;
  editAcc: EditAccState | null;

  setMode: (mode: ThemeMode) => void;
  setShowConfirm: (v: boolean) => void;
  setShowSettings: (v: boolean) => void;
  setSettingsExpanded: (v: boolean) => void;
  toggleSettingsExpanded: () => void;
  setShowTemplPicker: (v: boolean) => void;
  setCeleb: (v: CelebState | null) => void;
  setEditE1: (v: EditE1State | null) => void;
  updateEditE1: (updater: (prev: EditE1State | null) => EditE1State | null) => void;
  setEditAcc: (v: EditAccState | null) => void;
  updateEditAcc: (updater: (prev: EditAccState | null) => EditAccState | null) => void;
  closeSettings: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  mode: "dark",
  showConfirm: false,
  showSettings: false,
  settingsExpanded: false,
  showTemplPicker: false,
  celeb: null,
  editE1: null,
  editAcc: null,

  setMode: (mode) => set({ mode }),
  setShowConfirm: (v) => set({ showConfirm: v }),
  setShowSettings: (v) => set({ showSettings: v }),
  setSettingsExpanded: (v) => set({ settingsExpanded: v }),
  toggleSettingsExpanded: () => set((s) => ({ settingsExpanded: !s.settingsExpanded })),
  setShowTemplPicker: (v) => set({ showTemplPicker: v }),
  setCeleb: (v) => set({ celeb: v }),
  setEditE1: (v) => set({ editE1: v }),
  updateEditE1: (updater) => set((s) => ({ editE1: updater(s.editE1) })),
  setEditAcc: (v) => set({ editAcc: v }),
  updateEditAcc: (updater) => set((s) => ({ editAcc: updater(s.editAcc) })),
  closeSettings: () =>
    set({
      showSettings: false,
      editAcc: null,
      editE1: null,
      settingsExpanded: false,
    }),
}));

export function useTheme(): { mode: ThemeMode; c: ThemeColors } {
  const mode = useUIStore((s) => s.mode);
  return { mode, c: TK[mode] };
}
