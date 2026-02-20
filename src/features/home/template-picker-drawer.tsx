import { Button } from "@base-ui/react/button";
import { useAppStore } from "../../stores/app-store";
import { useUIStore } from "../../stores/ui-store";
import { TEMPLATES } from "../../constants/program";
import { Drawer } from "../../components/drawer";
import { cn } from "../../lib/cn";
import type { TemplateId } from "../../types";

export const TemplatePickerDrawer = () => {
  const showTemplPicker = useUIStore.showTemplPicker();
  const { setShowTemplPicker } = useUIStore.actions();
  const template = useAppStore.template();
  const { templateChanged } = useAppStore.actions();

  return (
    <Drawer
      open={showTemplPicker}
      onOpenChange={(open) => {
        if (!open) setShowTemplPicker(false);
      }}
      title="Template"
    >
      <ul className="p-0 m-0 list-none">
        {Object.entries(TEMPLATES).map(([k, vr]) => {
          const isCurrent = k === template;
          return (
            <li key={k}>
              <Button
                onClick={() => templateChanged(k as TemplateId)}
                className={cn(
                  "flex items-center w-full box-border px-3.5 py-3 rounded-xl text-left min-h-13 mb-1 gap-3",
                  isCurrent
                    ? "bg-th-ad border border-th-am cursor-default"
                    : "bg-transparent border border-transparent cursor-pointer",
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    isCurrent ? "bg-th-a" : "bg-th-t4",
                  )}
                />
                <div className="flex-1">
                  <strong
                    className={cn(
                      "text-base text-th-t block",
                      isCurrent ? "font-bold" : "font-medium",
                    )}
                  >
                    {vr.name}
                  </strong>
                  <span className="text-xs font-mono text-th-t3">{vr.description}</span>
                </div>
                {isCurrent && (
                  <span className="text-xs font-mono font-bold text-th-a">CURRENT</span>
                )}
              </Button>
            </li>
          );
        })}
      </ul>
    </Drawer>
  );
};
