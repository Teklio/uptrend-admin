import { Dialog } from "radix-ui";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface DiscardChangesModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// Built on Radix's own Dialog (like DeleteConfirmModal) rather than the
// plain custom Modal — this dialog is always opened while a Sheet's own
// Dialog.Root is still open, and only Radix's own focus-trap/pointer
// handling correctly stacks a second Dialog.Root on top of a first one.
// forceMount + AnimatePresence (same technique as Sheet.tsx) is what makes
// the exit animation actually play instead of the content just vanishing.
export const DiscardChangesModal = ({ open, onCancel, onConfirm }: DiscardChangesModalProps) => (
  <Dialog.Root open={open} onOpenChange={(o) => !o && onCancel()}>
    <Dialog.Portal forceMount>
      <AnimatePresence>
        {open && (
          <>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-60"
                style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl focus:outline-none"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: "rgba(220,38,38,0.1)" }}
                    >
                      <AlertTriangle size={20} color="#dc2626" />
                    </div>
                    <Dialog.Title className="text-[16px] font-semibold" style={{ color: "#191919" }}>
                      Discard changes?
                    </Dialog.Title>
                  </div>
                  <Dialog.Description className="mb-6 text-[13px]" style={{ color: "rgba(0,0,0,0.5)" }}>
                    You have unsaved changes. Closing now will discard them.
                  </Dialog.Description>
                  <div className="flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
                      style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
                    >
                      Keep editing
                    </button>
                    <button
                      type="button"
                      onClick={onConfirm}
                      className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white"
                      style={{ backgroundColor: "#dc2626" }}
                    >
                      Discard changes
                    </button>
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </>
        )}
      </AnimatePresence>
    </Dialog.Portal>
  </Dialog.Root>
);
