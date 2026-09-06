import { Dialog } from "radix-ui";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  title?: string;
  description?: string;
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  title = "Delete this item?",
  description = "This action cannot be undone.",
}: DeleteConfirmModalProps) => (
  <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <Dialog.Portal>
      <Dialog.Overlay
        className="fixed inset-0 z-50 data-[state=open]:animate-in data-[state=open]:fade-in"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none">
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(220,38,38,0.1)" }}
          >
            <AlertTriangle size={20} color="#dc2626" />
          </div>
          <Dialog.Title className="text-[16px] font-semibold" style={{ color: "#191919" }}>
            {title}
          </Dialog.Title>
        </div>
        <Dialog.Description className="mb-6 text-[13px]" style={{ color: "rgba(0,0,0,0.5)" }}>
          {description}
        </Dialog.Description>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
            style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#dc2626" }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
