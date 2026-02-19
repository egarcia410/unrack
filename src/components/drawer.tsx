import type { ReactNode } from "react";
import { DrawerPreview as DrawerPrimitive } from "@base-ui/react/drawer";
import { X } from "lucide-react";
import { IconButton } from "./icon-button";

type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
};

export const Drawer = ({ open, onOpenChange, title, children }: DrawerProps) => (
  <DrawerPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <DrawerPrimitive.Popup className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] max-w-115 flex-col rounded-t-3xl bg-th-s1">
        <header className="flex shrink-0 items-center justify-between border-b border-th-b px-5 pb-3 pt-4">
          <DrawerPrimitive.Title className="text-lg font-bold text-th-t">
            {title}
          </DrawerPrimitive.Title>
          <DrawerPrimitive.Close render={<IconButton className="bg-th-s2 text-th-t4" />}>
            <X size={18} />
          </DrawerPrimitive.Close>
        </header>
        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">{children}</div>
      </DrawerPrimitive.Popup>
    </DrawerPrimitive.Portal>
  </DrawerPrimitive.Root>
);
