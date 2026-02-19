import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@base-ui/react/button";
import { cn } from "../lib/cn";

const primaryButtonVariants = cva(
  "w-full border-none rounded-xl font-bold font-sans cursor-pointer flex items-center justify-center gap-2 bg-th-a text-th-inv",
  {
    variants: {
      size: {
        default: "px-6 py-4 text-base min-h-13",
        small: "p-3 text-sm min-h-11",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type PrimaryButtonProps = Button.Props & VariantProps<typeof primaryButtonVariants>;

export const PrimaryButton = ({ size, className, ...props }: PrimaryButtonProps) => (
  <Button className={cn(primaryButtonVariants({ size }), className)} {...props} />
);
