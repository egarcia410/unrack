import { Button } from "@base-ui/react/button";
import { useOverlayStore } from "../../stores/overlay-store";

export const DeleteProgramButton = () => {
  const { setShowSettings, setShowDeleteConfirm } = useOverlayStore();

  return (
    <div className="border-t border-th-b pt-4 mt-2">
      <Button
        onClick={() => {
          setShowSettings(false);
          setShowDeleteConfirm(true);
        }}
        className="w-full p-3.5 rounded-xl border border-th-r/19 bg-th-rd text-th-r text-sm font-semibold font-sans cursor-pointer min-h-12"
      >
        Delete Program
      </Button>
    </div>
  );
};
