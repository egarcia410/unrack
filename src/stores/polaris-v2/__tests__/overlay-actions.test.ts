import { beforeEach, describe, expect, it } from "vitest";
import { useOverlayStore } from "../overlay/overlay.store";
import {
  setShowDeleteConfirm,
  setShowSettings,
  setShowTemplatePicker,
  setActiveCelebration,
  setActiveSwapSlot,
} from "../overlay/overlay.actions";
import { resetStores } from "./setup";

beforeEach(() => {
  resetStores();
});

describe("setShowDeleteConfirm", () => {
  it("sets to true", () => {
    setShowDeleteConfirm(true);
    expect(useOverlayStore.getState().showDeleteConfirm).toBe(true);
  });

  it("sets to false", () => {
    setShowDeleteConfirm(true);
    setShowDeleteConfirm(false);
    expect(useOverlayStore.getState().showDeleteConfirm).toBe(false);
  });
});

describe("setShowSettings", () => {
  it("sets to true", () => {
    setShowSettings(true);
    expect(useOverlayStore.getState().showSettings).toBe(true);
  });

  it("sets to false", () => {
    setShowSettings(true);
    setShowSettings(false);
    expect(useOverlayStore.getState().showSettings).toBe(false);
  });
});

describe("setShowTemplatePicker", () => {
  it("sets to true", () => {
    setShowTemplatePicker(true);
    expect(useOverlayStore.getState().showTemplatePicker).toBe(true);
  });

  it("sets to false", () => {
    setShowTemplatePicker(true);
    setShowTemplatePicker(false);
    expect(useOverlayStore.getState().showTemplatePicker).toBe(false);
  });
});

describe("setActiveCelebration", () => {
  it("sets celebration state", () => {
    setActiveCelebration({ type: "done", message: "Done!", liftName: "Squat", duration: "45 min" });
    const state = useOverlayStore.getState();
    expect(state.activeCelebration).not.toBeNull();
    expect(state.activeCelebration!.type).toBe("done");
  });

  it("clears with null", () => {
    setActiveCelebration({ type: "done", message: "Done!", liftName: "Squat", duration: "45 min" });
    setActiveCelebration(null);
    expect(useOverlayStore.getState().activeCelebration).toBeNull();
  });
});

describe("setActiveSwapSlot", () => {
  it("sets swap slot", () => {
    setActiveSwapSlot({ liftId: "squat", slot: 0, currentId: "dips" });
    const state = useOverlayStore.getState();
    expect(state.activeSwapSlot).toEqual({ liftId: "squat", slot: 0, currentId: "dips" });
  });

  it("clears with null", () => {
    setActiveSwapSlot({ liftId: "squat", slot: 0, currentId: "dips" });
    setActiveSwapSlot(null);
    expect(useOverlayStore.getState().activeSwapSlot).toBeNull();
  });
});
