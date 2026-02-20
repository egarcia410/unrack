import { useNavigate } from "@tanstack/react-router";
import { Button } from "@base-ui/react/button";
import { useUIStore } from "../stores/ui-store";
import { useAppStore } from "../stores/app-store";

export const DeleteConfirmDialog = () => {
  const showConfirm = useUIStore.showConfirm();
  const { setShowConfirm } = useUIStore.actions();
  const { programReset } = useAppStore.actions();
  const navigate = useNavigate();

  if (!showConfirm) return null;

  const handleDelete = async () => {
    await programReset();
    setShowConfirm(false);
    navigate({ to: "/setup" });
  };

  return (
    <div
      onClick={() => setShowConfirm(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-th-s1 border border-th-b rounded-2xl p-6 max-w-80 w-[85%]"
      >
        <h2 className="text-lg font-bold text-th-t mb-1.5">Delete Program?</h2>
        <p className="text-sm text-th-t3 mb-5 leading-normal">
          All progress, history and PRs will be permanently lost.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowConfirm(false)}
            className="flex-1 py-3.5 rounded-xl border border-th-b bg-th-s2 text-th-t text-base font-semibold font-sans cursor-pointer min-h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className="flex-1 py-3.5 rounded-xl border-none bg-th-r text-th-inv text-base font-semibold font-sans cursor-pointer min-h-12"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
