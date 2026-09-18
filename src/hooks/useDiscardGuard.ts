import { useState } from "react";

// Shared by every sheet/dialog that shouldn't silently drop unsaved input —
// `requestClose` is what backdrop clicks, Escape, the header X, and the
// Cancel button should all call instead of the raw close callback.
export const useDiscardGuard = (hasChanges: boolean, onClose: () => void) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestClose = () => {
    if (hasChanges) setConfirmOpen(true);
    else onClose();
  };

  const confirmDiscard = () => {
    setConfirmOpen(false);
    onClose();
  };

  const cancelDiscard = () => setConfirmOpen(false);

  return { confirmOpen, requestClose, confirmDiscard, cancelDiscard };
};
