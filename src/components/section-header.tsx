import type { ReactNode } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDown } from "lucide-react";

type SectionHeaderProps = {
  label: string;
  done: boolean;
  extra?: ReactNode;
};

export const SectionHeader = ({ label, done, extra }: SectionHeaderProps) => (
  <Collapsible.Trigger className="group text-xs font-bold uppercase tracking-widest text-th-t2 mb-2.5 flex items-center justify-between w-full box-border bg-none border-none cursor-pointer py-2 px-0 min-h-11">
    <span>
      {label}
      {done ? " \u2713" : ""}
    </span>
    <div className="flex gap-2 items-center">
      {extra}
      <ChevronDown
        size={14}
        className="text-th-t4 transition-transform duration-200 -rotate-90 group-data-[panel-open]:rotate-0"
      />
    </div>
  </Collapsible.Trigger>
);
