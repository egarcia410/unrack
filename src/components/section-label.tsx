import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type SectionLabelProps = {
  children: ReactNode;
  className?: string;
};

export const SectionLabel = ({ children, className }: SectionLabelProps) => (
  <span className={cn("text-xs font-bold text-th-t3 uppercase tracking-wide", className)}>
    {children}
  </span>
);
