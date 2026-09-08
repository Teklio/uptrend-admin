import { useEffect } from "react";
import { videoUploadManager } from "../../utils/videoUploadManager";

// Browsers force their own fixed warning text on tab close/refresh — the
// only thing we control is whether the prompt appears at all.
export const BeforeUnloadGuard = () => {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (videoUploadManager.isUploading()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return null;
};
