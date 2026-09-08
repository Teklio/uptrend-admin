import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { videoFormSchema, type VideoFormSchemaType } from "../../schemas/courseVideo.schema";
import { useUpdateVideo } from "../../services/video.service";
import { Modal } from "../shared/Modal";
import { Input } from "../shared/Input";
import { toastMessage } from "../../utils/toast.util";
import type { CourseVideo } from "../../types/course.type";

interface VideoFormInlineProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  video: CourseVideo | null;
}

export const VideoFormInline = ({ open, onClose, courseId, video }: VideoFormInlineProps) => {
  const { mutate: updateVideo, isPending } = useUpdateVideo(courseId);

  const form = useForm<VideoFormSchemaType>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: { title: "", description: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ title: video?.title ?? "", description: video?.description ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, video]);

  const onSubmit = (values: VideoFormSchemaType) => {
    if (!video) return;
    updateVideo(
      { videoId: video.id, values },
      {
        onSuccess: () => {
          toastMessage.success({ message: "Video updated" });
          onClose();
        },
        onError: (err) => toastMessage.apiError(err),
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit video">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input name="title" label="Title" placeholder="e.g. Introduction to Hooks" />
          <Input name="description" type="textarea" label="Description" rows={3} />
          <div className="mt-1 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
              style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a] disabled:opacity-60"
              style={{ backgroundColor: "#f5a300" }}
            >
              {isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};
