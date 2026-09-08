import { useSyncExternalStore } from "react";
import { videoUploadManager } from "../utils/videoUploadManager";

export const useVideoUploadTask = () =>
  useSyncExternalStore(videoUploadManager.subscribe, videoUploadManager.getSnapshot);
