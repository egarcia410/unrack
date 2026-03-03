import type { OverlayState } from "./overlay.types";
import { createStore } from "../createStore";

const initialState: OverlayState = {
  showDeleteConfirm: false,
  showSettings: false,
  showTemplatePicker: false,
  activeCelebration: null,
  activeSwapSlot: null,
};

export const useOverlayStore = createStore("overlay", initialState);

export const resetOverlayStore = () => {
  useOverlayStore.setState(useOverlayStore.getInitialState(), true);
};
