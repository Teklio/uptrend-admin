import { Dialog } from "radix-ui";
import { AnimatePresence, motion, type TargetAndTransition } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

type Side = "right" | "left" | "top" | "bottom";

const SIDE_VARIANTS: Record<
  Side,
  { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition; className: string }
> = {
  right: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
    className: "right-0 top-0 h-full w-full sm:w-160 rounded-l-3xl",
  },
  left: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
    className: "left-0 top-0 h-full w-full sm:w-160 rounded-r-3xl",
  },
  top: {
    initial: { y: "-100%" },
    animate: { y: 0 },
    exit: { y: "-100%" },
    className: "top-0 left-0 w-full rounded-b-3xl",
  },
  bottom: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    className: "bottom-0 left-0 w-full rounded-t-3xl",
  },
};

interface SheetContentProps {
  open: boolean;
  side?: Side;
  children: ReactNode;
  className?: string;
}

export const SheetContent = ({ open, side = "right", children, className = "" }: SheetContentProps) => {
  const variant = SIDE_VARIANTS[side];

  return (
    <Dialog.Portal forceMount>
      <AnimatePresence>
        {open && (
          <>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50"
                style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={variant.initial}
                animate={variant.animate}
                exit={variant.exit}
                transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
                className={`fixed z-50 flex flex-col bg-white shadow-xl focus:outline-none overflow-y-auto ${variant.className} ${className}`}
              >
                {children}
              </motion.div>
            </Dialog.Content>
          </>
        )}
      </AnimatePresence>
    </Dialog.Portal>
  );
};

export const SheetHeader = ({ children }: { children: ReactNode }) => (
  <div
    className="flex items-center justify-between px-6 py-5"
    style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
  >
    {children}
    <Dialog.Close
      className="ml-4 flex h-8 w-8 items-center justify-center rounded-full"
      style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
    >
      <X size={16} />
    </Dialog.Close>
  </div>
);

export const SheetFooter = ({ children }: { children: ReactNode }) => (
  <div
    className="mt-auto flex items-center justify-end gap-2.5 px-6 py-5"
    style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
  >
    {children}
  </div>
);

export const SheetTitle = ({ children }: { children: ReactNode }) => (
  <Dialog.Title className="text-[17px] font-semibold" style={{ color: "#191919" }}>
    {children}
  </Dialog.Title>
);

export const SheetDescription = ({ children }: { children: ReactNode }) => (
  <Dialog.Description className="text-[13px]" style={{ color: "rgba(0,0,0,0.45)" }}>
    {children}
  </Dialog.Description>
);
