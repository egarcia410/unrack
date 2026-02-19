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
    <button
      onClick={onToggle}
      className="text-[11px] font-bold uppercase tracking-[1px] text-th-t2 mb-2.5 flex items-center justify-between w-full box-border bg-none border-none cursor-pointer py-2 px-0 min-h-[44px]"
    >
      <span>
        {label}
        {done ? " \u2713" : ""}
      </span>
      <div className="flex gap-2 items-center">
        {extra}
        <span
          className={cn(
            "text-[11px] text-th-t4 transition-transform duration-200",
            collapsed ? "-rotate-90" : "rotate-0",
          )}
        >
          {"\u25BC"}
        </span>
      </div>
    </button>
  );
};
