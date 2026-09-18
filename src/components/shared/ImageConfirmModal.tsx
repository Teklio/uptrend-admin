import { Dialog } from "radix-ui";
import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud } from "lucide-react";

interface ImageConfirmModalProps {
  open: boolean;
  previewUrl: string | null;
  title: string;
  description: string;
  isUploading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// Built on Radix's own Dialog (like DiscardChangesModal), not the plain
// custom Modal — this is opened while CourseSheet's own Dialog.Root is
// still open, and only Radix's own focus-trap handling correctly stacks a
// second Dialog.Root on top of a first one.
export const ImageConfirmModal = ({
  open,
  previewUrl,
  title,
  description,
  isUploading,
  onCancel,
  onConfirm,
}: ImageConfirmModalProps) => (
  <Dialog.Root open={open} onOpenChange={(o) => !o && !isUploading && onCancel()}>
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
                  <Dialog.Title className="mb-3 text-[16px] font-semibold" style={{ color: "#191919" }}>
                    {title}
                  </Dialog.Title>
                  {previewUrl && (
                    <img src={previewUrl} alt="Preview" className="mb-3 h-48 w-full rounded-xl object-cover" />
                  )}
                  <Dialog.Description className="mb-6 text-[13px]" style={{ color: "rgba(0,0,0,0.5)" }}>
                    {description}
                  </Dialog.Description>
                  <div className="flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={onCancel}
                      disabled={isUploading}
                      className="rounded-xl px-4 py-2.5 text-[13px] font-semibold disabled:opacity-60"
                      style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={onConfirm}
                      disabled={isUploading}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a] disabled:opacity-60"
                      style={{ backgroundColor: "#f5a300" }}
                    >
                      <UploadCloud size={15} />
                      {isUploading ? "Uploading..." : "Upload"}
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
