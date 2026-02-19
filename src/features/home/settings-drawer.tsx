import { Sun, Moon } from "lucide-react";
import { Button } from "@base-ui/react/button";
import { useProgramStore } from "../../stores/program-store";
import { useUIStore } from "../../stores/ui-store";
import { Drawer } from "../../components/drawer";
import { SectionLabel } from "../../components/section-label";
import { OneRepMaxEditor } from "./one-rep-max-editor";
import { AssistanceEditor } from "./assistance-editor";
import { ProgramSettings } from "./program-settings";

export const SettingsDrawer = () => {
  const showSettings = useUIStore.showSettings();
  const mode = useUIStore.mode();
  const { closeSettings, setShowConfirm } = useUIStore.actions();
  const { modeToggled } = useProgramStore.actions();

  return (
    <Drawer
      open={showSettings}
      onOpenChange={(open) => {
        if (!open) closeSettings();
      }}
      title="Settings"
    >
      <div className="flex justify-between items-center mb-5">
        <SectionLabel>Theme</SectionLabel>
        <Button
          onClick={modeToggled}
          className="flex items-center gap-2 bg-th-s2 border border-th-b rounded-xl px-3.5 py-2 cursor-pointer min-h-11"
        >
          <span className="text-th-t3 flex">
            {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </span>
          <span className="text-sm font-semibold text-th-t3 font-sans">
            {mode === "dark" ? "Light" : "Dark"}
          </span>
        </Button>
      </div>

      <OneRepMaxEditor />
      <AssistanceEditor />
      <ProgramSettings />

      <div className="border-t border-th-b pt-4 mt-2">
        <Button
          onClick={() => {
            closeSettings();
            setShowConfirm(true);
          }}
          className="w-full p-3.5 rounded-xl border border-th-r/[0.19] bg-th-rd text-th-r text-sm font-semibold font-sans cursor-pointer min-h-12"
        >
          Delete Program
        </Button>
      </div>
    </Drawer>
  );
};
