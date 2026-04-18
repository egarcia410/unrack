import { Button } from "@base-ui/react/button";
import { ChevronDown } from "lucide-react";
import {
  useCycle,
  useCurrentPhase,
  useTemplate,
  setShowTemplatePicker,
} from "../../stores/polaris";
import { Badge } from "../../components/badge";

export const WeekOverview = () => {
  const cycle = useCycle();
  const currentPhase = useCurrentPhase();
  const template = useTemplate();

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
