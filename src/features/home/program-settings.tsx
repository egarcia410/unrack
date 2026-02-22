import { Collapsible } from "@base-ui/react/collapsible";
import { Button } from "@base-ui/react/button";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { useProgramStore } from "../../stores/program-store";
import { useUIStore } from "../../stores/ui-store";
import { SectionLabel } from "../../components/section-label";
import { IconButton } from "../../components/icon-button";
import { cn } from "../../lib/cn";

export const ProgramSettings = () => {
  const { settingsExpanded, setSettingsExpanded } = useUIStore();
  const { unit, trainingMaxPercent, unitToggled, trainingMaxPercentChanged } = useProgramStore();

  return (
    <Collapsible.Root open={settingsExpanded} onOpenChange={setSettingsExpanded}>
      <Collapsible.Trigger className="flex items-center justify-between w-full box-border bg-none border-none py-2 px-0 cursor-pointer min-h-11">
        <SectionLabel>Program Settings</SectionLabel>
        <ChevronDown
          size={14}
          className={cn(
            "text-th-t4 transition-transform duration-200",
            settingsExpanded ? "rotate-0" : "-rotate-90",
          )}
        />
      </Collapsible.Trigger>
      <Collapsible.Panel className="overflow-hidden h-(--collapsible-panel-height) transition-[height] duration-200 data-starting-style:h-0 data-ending-style:h-0">
        <div className="mb-4">
          <p className="text-xs font-bold text-th-t3 tracking-wide mb-2 mt-1">Units</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(["lb", "kg"] as const).map((unitOption) => (
              <Button
                key={unitOption}
                onClick={() => {
                  if (unit !== unitOption) unitToggled();
                }}
                className={cn(
                  "rounded-xl p-3 text-sm font-sans cursor-pointer text-center min-h-11",
                  unit === unitOption
                    ? "bg-th-ad border border-th-am text-th-a font-bold"
                    : "bg-th-s2 border border-th-b text-th-t3 font-medium",
                )}
              >
                {unitOption === "lb" ? "Pounds (lb)" : "Kilograms (kg)"}
              </Button>
            ))}
          </div>
          <p className="text-xs font-bold text-th-t3 tracking-wide mb-2">Training Max %</p>
          <div className="flex items-center gap-4">
            <IconButton
              size="large"
              onClick={() => trainingMaxPercentChanged(trainingMaxPercent - 5)}
            >
              <Minus size={18} />
            </IconButton>
            <div className="flex-1 text-center">
              <span className="text-4xl font-extrabold font-mono text-th-a leading-none">
                {trainingMaxPercent}
              </span>
              <span className="text-base font-semibold text-th-t3">%</span>
            </div>
            <IconButton
              size="large"
              onClick={() => trainingMaxPercentChanged(trainingMaxPercent + 5)}
            >
              <Plus size={18} />
            </IconButton>
          </div>
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
