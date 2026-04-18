import { useNavigate } from "@tanstack/react-router";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useShowDeleteConfirm, setShowDeleteConfirm, programReset } from "../stores/polaris";

export const DeleteConfirmDialog = () => {
  const showDeleteConfirm = useShowDeleteConfirm();
  const navigate = useNavigate();

  const handleDelete = () => {
    programReset();
    navigate({ to: "/setup" });
  };

  return (
    <AlertDialog.Root
      open={showDeleteConfirm}
      onOpenChange={(open) => !open && setShowDeleteConfirm(false)}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="fixed inset-0 z-50 bg-th-s1 border border-th-b rounded-2xl p-6 max-w-80 w-11/12 m-auto h-fit transition-[opacity,transform] duration-200 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95">
          <AlertDialog.Title className="text-lg font-bold text-th-t mb-1.5">
            Delete Program?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-th-t3 mb-5 leading-normal">
            All progress, history and PRs will be permanently lost.
          </AlertDialog.Description>
          <div className="flex gap-2">
            <AlertDialog.Close className="flex-1 py-3.5 rounded-xl border border-th-b bg-th-s2 text-th-t text-base font-semibold min-h-12">
              Cancel
            </AlertDialog.Close>
            <AlertDialog.Close
              onClick={handleDelete}
              className="flex-1 py-3.5 rounded-xl border-none bg-th-r text-th-inv text-base font-semibold min-h-12"
            >
              Delete
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
