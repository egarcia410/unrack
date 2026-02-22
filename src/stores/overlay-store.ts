import type { CelebrationState, SwapSlot } from "../types";
import { createStore } from "./polaris";

type OverlayState = {
  showDeleteConfirm: boolean;
  showSettings: boolean;
  showTemplatePicker: boolean;
  activeCelebration: CelebrationState | null;
  activeSwapSlot: SwapSlot | null;
};

const initialState: OverlayState = {
  showDeleteConfirm: false,
  showSettings: false,
  showTemplatePicker: false,
  activeCelebration: null,
  activeSwapSlot: null,
};

export const useOverlayStore = createStore("overlay", {
  state: initialState,
  actions: (set) => ({
    setShowDeleteConfirm: (show: boolean) => set({ showDeleteConfirm: show }),
    setShowSettings: (show: boolean) => set({ showSettings: show }),
    setShowTemplatePicker: (show: boolean) => set({ showTemplatePicker: show }),
    setActiveCelebration: (celebration: CelebrationState | null) =>
      set({ activeCelebration: celebration }),
    setActiveSwapSlot: (slot: SwapSlot | null) => set({ activeSwapSlot: slot }),
  }),
});
