import { Button } from "@base-ui/react/button";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";

type SectionHeaderProps = {
  label: string;
  done: boolean;
  collapsed: boolean;
  onToggle: () => void;
  extra?: React.ReactNode;
};

export const SectionHeader = ({ label, done, collapsed, onToggle, extra }: SectionHeaderProps) => {
  return (
    <Button
      onClick={onToggle}
      className="text-xs font-bold uppercase tracking-widest text-th-t2 mb-2.5 flex items-center justify-between w-full box-border bg-none border-none cursor-pointer py-2 px-0 min-h-11"
    >
      <span>
        {label}
        {done ? " \u2713" : ""}
      </span>
      <div className="flex gap-2 items-center">
        {extra}
        <ChevronDown
          size={14}
          className={cn(
            "text-th-t4 transition-transform duration-200",
            collapsed ? "-rotate-90" : "rotate-0",
          )}
        />
      </div>
    </Button>
  );
};
