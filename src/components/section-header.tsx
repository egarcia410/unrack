import type { ReactNode } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { Check, ChevronDown } from "lucide-react";

type SectionHeaderProps = {
  label: string;
  done?: boolean;
  extra?: ReactNode;
};

export const SectionHeader = ({ label, done = false, extra }: SectionHeaderProps) => (
  <Collapsible.Trigger className="group text-xs font-bold uppercase tracking-widest text-th-t2 mb-2.5 flex items-center justify-between w-full box-border bg-none border-none cursor-pointer py-2 px-0 min-h-11">
    <span className="flex items-center gap-1">
      {label}
      {done && <Check size={12} />}
    </span>
    <div className="flex gap-2 items-center">
      {extra}
      <ChevronDown
        size={14}
        className="text-th-t4 transition-transform duration-200 -rotate-90 group-data-panel-open:rotate-0"
      />
    </div>
  </Collapsible.Trigger>
);
