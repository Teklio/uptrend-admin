import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface VideoPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  embedUrl: string | null;
}

export const VideoPreviewModal = ({ open, onClose, title, embedUrl }: VideoPreviewModalProps) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-xl"
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#191919" }}>
            <span className="text-[13px] font-medium text-white">{title}</span>
            <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="aspect-video w-full">
            {embedUrl && (
              <iframe
                src={embedUrl}
                title={title}
                className="h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
