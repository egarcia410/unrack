import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@base-ui/react/button";
import { cn } from "../lib/cn";

const iconButtonVariants = cva(
  "flex items-center justify-center bg-th-s1 border border-th-b rounded-xl text-th-t3 cursor-pointer",
  {
    variants: {
      size: {
        default: "w-11 h-11",
        large: "w-12 h-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type IconButtonProps = Button.Props & VariantProps<typeof iconButtonVariants>;

export const IconButton = ({ size, className, ...props }: IconButtonProps) => (
  <Button className={cn(iconButtonVariants({ size }), className)} {...props} />
);
