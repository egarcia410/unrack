import { CelebrationDialog } from "./celebration-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { SettingsDrawer } from "../features/home/settings-drawer";
import { TemplatePickerDrawer } from "../features/home/template-picker-drawer";
import { SwapExerciseDrawer } from "../features/workout/swap-exercise-drawer";

export const AppOverlays = () => (
  <>
    <CelebrationDialog />
    <DeleteConfirmDialog />
    <SettingsDrawer />
    <TemplatePickerDrawer />
    <SwapExerciseDrawer />
  </>
);
