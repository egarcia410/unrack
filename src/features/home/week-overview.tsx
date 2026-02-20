import { Button } from "@base-ui/react/button";
import { ChevronDown } from "lucide-react";
import { useAppStore } from "../../stores/app-store";
import { useUIStore } from "../../stores/ui-store";
import { TEMPLATES } from "../../constants/program";
import { Badge } from "../../components/badge";

export const WeekOverview = () => {
  const cycle = useAppStore.cycle();
  const week = useAppStore.week();
  const template = useAppStore.template();
  const { setShowTemplPicker } = useUIStore.actions();

  const variant = TEMPLATES[template];
  const weekDef = variant.weeks[week];

  return (
    <section className="mb-4">
      <div className="flex gap-2 mb-1.5">
        <Badge variant="accent">Cycle {cycle}</Badge>
        <Badge variant="muted">{weekDef.label} Phase</Badge>
      </div>
      <Button
        onClick={() => setShowTemplPicker(true)}
        className="flex items-center gap-1.5 bg-none border-none p-0 cursor-pointer min-h-11"
      >
        <h2 className="text-2xl font-extrabold m-0 text-th-t">{variant.name}</h2>
        <ChevronDown size={14} className="text-th-t4" strokeWidth={2.5} />
      </Button>
    </section>
  );
};
