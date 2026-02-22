import { Button } from "@base-ui/react/button";
import { ChevronDown } from "lucide-react";
import { useProgramStore } from "../../stores/program-store";
import { useOverlayStore } from "../../stores/overlay-store";
import { Badge } from "../../components/badge";

export const WeekOverview = () => {
  const { cycle, currentPhase, template } = useProgramStore();
  const { setShowTemplatePicker } = useOverlayStore();

  return (
    <section className="mb-4">
      <div className="flex gap-2 mb-1.5">
        <Badge variant="accent">Cycle {cycle}</Badge>
        <Badge variant="muted">{currentPhase.label} Phase</Badge>
      </div>
      <Button
        onClick={() => setShowTemplatePicker(true)}
        className="flex items-center gap-1.5 bg-none border-none p-0 cursor-pointer min-h-11"
      >
        <h2 className="text-2xl font-extrabold m-0 text-th-t">{template.name}</h2>
        <ChevronDown size={14} className="text-th-t4" strokeWidth={2.5} />
      </Button>
    </section>
  );
};
