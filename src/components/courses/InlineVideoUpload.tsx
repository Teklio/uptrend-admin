import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, Film, CheckCircle2, XCircle, X, Plus, RotateCw } from "lucide-react";
import { videoFormSchema, type VideoFormSchemaType } from "../../schemas/courseVideo.schema";
import { Input } from "../shared/Input";
import { toastMessage } from "../../utils/toast.util";
import { videoUploadManager } from "../../utils/videoUploadManager";
import { useVideoUploadTask } from "../../hooks/useVideoUploadTask";

interface InlineVideoUploadProps {
  courseId: string;
  moduleId: string;
}

export const InlineVideoUpload = ({ courseId, moduleId }: InlineVideoUploadProps) => {
  const [formOpen, setFormOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const task = useVideoUploadTask();

  const form = useForm<VideoFormSchemaType>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: { title: "", description: "" },
  });

  const isOtherActive =
    !!task && task.moduleId !== moduleId && (task.phase === "creating" || task.phase === "uploading");

  const closeForm = () => {
    form.reset({ title: "", description: "" });
    setFile(null);
    setFormOpen(false);
  };

  const onSubmit = async (values: VideoFormSchemaType) => {
    if (!file) {
      toastMessage.error({ message: "Please choose a video file" });
      return;
    }
    setIsCreating(true);
    try {
      await videoUploadManager.start(courseId, moduleId, file, values);
      closeForm();
    } catch (err) {
      if (err instanceof Error && !(err as { isAxiosError?: boolean }).isAxiosError) {
        toastMessage.error({ message: err.message });
      } else {
        toastMessage.apiError(err);
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (task && task.moduleId === moduleId && task.phase === "creating") {
    return (
      <div
        className="mt-1.5 flex items-center gap-2.5 rounded-xl px-4 py-3.5"
        style={{ backgroundColor: "rgba(0,43,127,0.06)" }}
      >
        <span
          className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full"
          style={{ border: "2px solid rgba(0,43,127,0.25)", borderTopColor: "#002b7f" }}
        />
        <span className="min-w-0 truncate text-[13px] font-medium" style={{ color: "#191919" }}>
          Preparing "{task.title}"...
        </span>
      </div>
    );
  }

  if (task && task.moduleId === moduleId && task.phase === "uploading") {
    return (
      <div
        className="mt-1.5 flex flex-col gap-2 rounded-xl px-4 py-3.5"
        style={{ backgroundColor: "rgba(0,43,127,0.06)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-[13px] font-medium" style={{ color: "#191919" }}>
            Uploading "{task.title}"
          </span>
          <span className="shrink-0 font-mono text-[12px] tabular-nums" style={{ color: "rgba(0,0,0,0.5)" }}>
            {task.progress}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.08)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${task.progress}%`, backgroundColor: "#002b7f" }}
          />
        </div>
        <p className="text-[11.5px]" style={{ color: "rgba(0,0,0,0.4)" }}>
          Safe to keep working — this keeps uploading even if you leave this page.
        </p>
      </div>
    );
  }

  if (task && task.moduleId === moduleId && task.phase === "error") {
    return (
      <div
        className="mt-1.5 flex items-center justify-between gap-3 rounded-xl px-4 py-3"
        style={{ backgroundColor: "rgba(220,38,38,0.06)" }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <XCircle size={16} color="#dc2626" className="shrink-0" />
          <span className="min-w-0 truncate text-[12.5px]" style={{ color: "#191919" }}>
            {task.errorMessage || "Upload failed"}
          </span>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => videoUploadManager.retry()}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-[#0f172a]"
            style={{ backgroundColor: "#f5a300" }}
          >
            <RotateCw size={12} />
            Retry
          </button>
          <button
            type="button"
            onClick={() => videoUploadManager.dismiss()}
            className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold"
            style={{ backgroundColor: "rgba(0,0,0,0.06)", color: "#191919" }}
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  if (task && task.moduleId === moduleId && task.phase === "done") {
    return (
      <div
        className="mt-1.5 flex items-center justify-between gap-3 rounded-xl px-4 py-3"
        style={{ backgroundColor: "rgba(22,163,74,0.08)" }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <CheckCircle2 size={16} color="#16a34a" className="shrink-0" />
          <span className="min-w-0 truncate text-[12.5px]" style={{ color: "#191919" }}>
            Uploaded — processing on Bunny. Use Sync once ready.
          </span>
        </div>
        <button
          type="button"
          onClick={() => videoUploadManager.dismiss()}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold"
          style={{ backgroundColor: "rgba(0,0,0,0.06)", color: "#191919" }}
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (!formOpen) {
    return (
      <button
        type="button"
        onClick={() => setFormOpen(true)}
        disabled={isOtherActive}
        title={isOtherActive ? "Wait for the other upload in progress to finish" : undefined}
        className="mt-1.5 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: "rgba(0,43,127,0.08)", color: "#002b7f" }}
      >
        <Plus size={15} />
        Add video
      </button>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className="mt-1.5 flex flex-col gap-3 rounded-xl p-4"
        style={{ backgroundColor: "#f8f9fa", border: "1px solid rgba(0,0,0,0.07)" }}
      >
        <Input name="title" label="Video title" placeholder="e.g. Introduction to Hooks" />
        <Input name="description" type="textarea" label="Description" rows={2} />

        <div>
          <label
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-left"
            style={{
              backgroundColor: "#f0f0f0",
              border: `1.5px dashed ${file ? "#16a34a" : "rgba(0,0,0,0.15)"}`,
            }}
          >
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <>
                <CheckCircle2 size={16} color="#16a34a" />
                <span className="min-w-0 flex-1 truncate text-[12.5px]" style={{ color: "#191919" }}>
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white shadow"
                >
                  <X size={11} />
                </button>
              </>
            ) : (
              <>
                <Film size={16} style={{ color: "rgba(0,0,0,0.4)" }} />
                <span className="text-[12.5px]" style={{ color: "rgba(0,0,0,0.45)" }}>
                  Click to choose a video file
                </span>
              </>
            )}
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={closeForm}
            className="rounded-xl px-3.5 py-2 text-[12.5px] font-semibold"
            style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold text-[#0f172a] disabled:opacity-60"
            style={{ backgroundColor: "#f5a300" }}
          >
            <UploadCloud size={14} />
            {isCreating ? "Preparing..." : "Start upload"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};
