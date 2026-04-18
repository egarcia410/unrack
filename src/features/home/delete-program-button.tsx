import { Button } from "@base-ui/react/button";
import { setShowSettings, setShowDeleteConfirm } from "../../stores/polaris";

export const DeleteProgramButton = () => {
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
