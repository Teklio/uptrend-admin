import * as tus from "tus-js-client";
import { axiosInstance } from "../config/axios";
import { queryClient } from "../config/queryClient";
import type { ApiSuccess } from "../types/common.type";
import type { CreateVideoResult } from "../types/video.type";
import type { VideoFormValues } from "../services/video.service";

export type UploadPhase = "creating" | "uploading" | "error" | "done";

export interface UploadTask {
  courseId: string;
  moduleId: string;
  title: string;
  phase: UploadPhase;
  progress: number;
  errorMessage: string;
}

type Listener = () => void;

// Lives outside the React tree so an in-progress upload survives route
// navigation within the admin app — only one upload can run at a time.
let task: UploadTask | null = null;
let tusUpload: tus.Upload | null = null;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((listener) => listener());
const courseDetailKey = (courseId: string) => ["courses", courseId] as const;

// Bunny requires every TUS chunk except the last to be a multiple of
// 256 KiB — 50MB divides evenly (200 x 256 KiB), so it's a safe choice.
const CHUNK_SIZE = 50 * 1024 * 1024;

const setTask = (next: UploadTask | null) => {
  task = next;
  emit();
};

export const videoUploadManager = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): UploadTask | null {
    return task;
  },

  isUploading() {
    return task?.phase === "creating" || task?.phase === "uploading";
  },

  async start(courseId: string, moduleId: string, file: File, values: VideoFormValues) {
    // Set synchronously, before any await, so a second call fired in the
    // same tick (double-click, or Enter + click) sees a non-null task and
    // bails out instead of creating a second video record.
    if (task) {
      throw new Error("Another upload is already in progress — wait for it to finish or dismiss it first.");
    }
    setTask({ courseId, moduleId, title: values.title, phase: "creating", progress: 0, errorMessage: "" });

    let video: CreateVideoResult["video"];
    let upload: CreateVideoResult["upload"];
    try {
      const { data } = await axiosInstance.post<ApiSuccess<CreateVideoResult>>(
        `/admin/modules/${moduleId}/videos`,
        values,
      );
      ({ video, upload } = data.data);
    } catch (err) {
      setTask(null);
      throw err;
    }

    setTask({ courseId, moduleId, title: video.title, phase: "uploading", progress: 0, errorMessage: "" });
    void queryClient.invalidateQueries({ queryKey: courseDetailKey(courseId) });

    tusUpload = new tus.Upload(file, {
      endpoint: upload.uploadEndpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize: CHUNK_SIZE,
      headers: {
        AuthorizationSignature: upload.authorizationSignature,
        AuthorizationExpire: String(upload.authorizationExpire),
        VideoId: upload.videoId,
        LibraryId: upload.libraryId,
      },
      metadata: { filetype: file.type, title: video.title },
      // tus-js-client caches completed/partial uploads in localStorage keyed
      // by a fingerprint of the file's name/size/type/lastModified — reusing
      // the same local file for a different Bunny video would otherwise be
      // recognized as "already uploaded" and skip straight to onSuccess.
      // Keying off Bunny's own videoId instead guarantees every new video
      // is always treated as a fresh upload.
      fingerprint: () => Promise.resolve(`bunny-video-${upload.videoId}`),
      removeFingerprintOnSuccess: true,
      onError: (err) => {
        if (!task) return;
        setTask({ ...task, phase: "error", errorMessage: err.message });
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        if (!task) return;
        setTask({ ...task, progress: Math.round((bytesUploaded / bytesTotal) * 100) });
      },
      onSuccess: () => {
        if (!task) return;
        setTask({ ...task, phase: "done", progress: 100 });
        void queryClient.invalidateQueries({ queryKey: courseDetailKey(task.courseId) });
      },
    });
    tusUpload.start();
  },

  retry() {
    if (!task || !tusUpload) return;
    setTask({ ...task, phase: "uploading", errorMessage: "" });
    tusUpload.start();
  },

  dismiss() {
    task = null;
    tusUpload = null;
    emit();
  },
};
