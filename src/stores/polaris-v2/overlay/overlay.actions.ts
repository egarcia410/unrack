import type { CelebrationState, SwapSlot } from "./overlay.types";
import { useOverlayStore } from "./overlay.store";

export const setShowDeleteConfirm = (show: boolean) => {
  useOverlayStore.setState({ showDeleteConfirm: show });
};

export const setShowSettings = (show: boolean) => {
  useOverlayStore.setState({ showSettings: show });
};

export const setShowTemplatePicker = (show: boolean) => {
  useOverlayStore.setState({ showTemplatePicker: show });
};

export const setActiveCelebration = (celebration: CelebrationState | null) => {
  useOverlayStore.setState({ activeCelebration: celebration });
};

export const setActiveSwapSlot = (slot: SwapSlot | null) => {
  useOverlayStore.setState({ activeSwapSlot: slot });
};
