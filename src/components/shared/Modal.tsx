import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

// Portaled to document.body so this always sits above a Radix Sheet's own
// Dialog.Portal content — a plain z-index can't out-rank an ancestor's
// stacking context (or its focus/pointer handling) from inside the normal
// component tree, only escaping to the same top-level layer can.
export const Modal = ({ open, onClose, title, children }: ModalProps) =>
  createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            {title && (
              <h2 className="mb-3 text-[16px] font-semibold" style={{ color: "#191919" }}>
                {title}
              </h2>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
