import { useOverlayStore } from "./overlay.store";

export const useShowDeleteConfirm = () => useOverlayStore((state) => state.showDeleteConfirm);
export const useShowSettings = () => useOverlayStore((state) => state.showSettings);
export const useShowTemplatePicker = () => useOverlayStore((state) => state.showTemplatePicker);
export const useActiveCelebration = () => useOverlayStore((state) => state.activeCelebration);
export const useActiveSwapSlot = () => useOverlayStore((state) => state.activeSwapSlot);
