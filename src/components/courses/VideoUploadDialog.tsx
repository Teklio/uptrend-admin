import { useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as tus from "tus-js-client";
import { UploadCloud, Film, CheckCircle2, XCircle, X } from "lucide-react";
import { videoFormSchema, type VideoFormSchemaType } from "../../schemas/courseVideo.schema";
import { useAddVideo } from "../../services/video.service";
import { Modal } from "../shared/Modal";
import { Input } from "../shared/Input";
import { toastMessage } from "../../utils/toast.util";
import type { BunnyTusUploadCredentials } from "../../types/video.type";

interface VideoUploadDialogProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  moduleId: string;
}

type Phase = "form" | "uploading" | "error" | "done";

// Bunny requires every TUS chunk except the last to be a multiple of
// 256 KiB — 50MB divides evenly (200 x 256 KiB), so it's a safe choice.
const CHUNK_SIZE = 50 * 1024 * 1024;

export const VideoUploadDialog = ({ open, onClose, courseId, moduleId }: VideoUploadDialogProps) => {
  const { mutateAsync: addVideo, isPending: isCreating } = useAddVideo(courseId);
  const [phase, setPhase] = useState<Phase>("form");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const uploadRef = useRef<tus.Upload | null>(null);

  const form = useForm<VideoFormSchemaType>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: { title: "", description: "" },
  });

  const reset = () => {
    form.reset({ title: "", description: "" });
    setFile(null);
    uploadRef.current = null;
    setPhase("form");
    setProgress(0);
    setErrorMessage("");
  };

  const handleClose = () => {
    if (phase === "uploading") return; // never silently drop an in-progress upload
    reset();
    onClose();
  };

  const startUpload = (file: File, upload: BunnyTusUploadCredentials, title: string) => {
    setPhase("uploading");
    const tusUpload = new tus.Upload(file, {
      endpoint: upload.uploadEndpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize: CHUNK_SIZE,
      headers: {
        AuthorizationSignature: upload.authorizationSignature,
        AuthorizationExpire: String(upload.authorizationExpire),
        VideoId: upload.videoId,
        LibraryId: upload.libraryId,
      },
      metadata: {
        filetype: file.type,
        title,
      },
      onError: (err) => {
        setErrorMessage(err.message);
        setPhase("error");
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess: () => {
        setPhase("done");
      },
    });
    uploadRef.current = tusUpload;
    tusUpload.start();
  };

  const onSubmit = async (values: VideoFormSchemaType) => {
    if (!file) {
      toastMessage.error({ message: "Please choose a video file" });
      return;
    }

    try {
      const { video, upload } = await addVideo({ moduleId, values });
      startUpload(file, upload, video.title);
    } catch (err) {
      toastMessage.apiError(err);
    }
  };

  const retryUpload = () => {
    const upload = uploadRef.current;
    if (!file || !upload) return;
    setErrorMessage("");
    upload.start();
    setPhase("uploading");
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add video">
      {phase === "form" && (
        <FormProvider {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="flex flex-col gap-4">
            <Input name="title" label="Video title" placeholder="e.g. Introduction to Hooks" />
            <Input name="description" type="textarea" label="Description" rows={3} />

            <div>
              <label className="mb-1.5 block text-[13px] font-medium" style={{ color: "#191919" }}>
                Video file
              </label>
              <label
                className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 text-left"
                style={{
                  backgroundColor: "#f0f0f0",
                  border: `1.5px dashed ${file ? "#16a34a" : "rgba(0,0,0,0.15)"}`,
                }}
              >
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                  }}
                />
                {file ? (
                  <>
                    <CheckCircle2 size={18} color="#16a34a" />
                    <span className="flex-1 truncate text-[13px]" style={{ color: "#191919" }}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <Film size={18} style={{ color: "rgba(0,0,0,0.4)" }} />
                    <span className="text-[13px]" style={{ color: "rgba(0,0,0,0.45)" }}>
                      Click to choose a video file
                    </span>
                  </>
                )}
              </label>
            </div>

            <div className="mt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
                style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a] disabled:opacity-60"
                style={{ backgroundColor: "#f5a300" }}
              >
                <UploadCloud size={15} />
                {isCreating ? "Preparing..." : "Upload"}
              </button>
            </div>
          </form>
        </FormProvider>
      )}

      {phase === "uploading" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.08)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: "#002b7f" }}
            />
          </div>
          <p className="font-mono text-[13px]" style={{ color: "rgba(0,0,0,0.6)" }}>
            Uploading… {progress}%
          </p>
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <XCircle size={28} color="#dc2626" />
          <p className="text-center text-[13px]" style={{ color: "rgba(0,0,0,0.6)" }}>
            {errorMessage || "Upload failed."}
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
              style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={retryUpload}
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a]"
              style={{ backgroundColor: "#f5a300" }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <CheckCircle2 size={28} color="#16a34a" />
          <p className="text-center text-[13px]" style={{ color: "rgba(0,0,0,0.6)" }}>
            Uploaded. Bunny is now processing the video — use the Sync button on it in a moment to pull in its
            duration and thumbnail.
          </p>
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a]"
            style={{ backgroundColor: "#f5a300" }}
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
};
