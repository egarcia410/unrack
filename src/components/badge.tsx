import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "text-xs font-mono font-bold px-3 py-1 rounded-full tracking-wide uppercase",
  {
    variants: {
      variant: {
        accent: "text-th-a bg-th-ad",
        muted: "text-th-t3 bg-th-s2",
      },
    },
    defaultVariants: {
      variant: "accent",
    },
  },
);

type BadgeProps = {
  children: ReactNode;
  className?: string;
} & VariantProps<typeof badgeVariants>;

export const Badge = ({ variant, className, children }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)}>{children}</span>
);
