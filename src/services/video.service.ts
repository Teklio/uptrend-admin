import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../config/axios";
import type { ApiSuccess } from "../types/common.type";
import type { CourseDetail, CourseVideo } from "../types/course.type";
import type { CreateVideoResult, SyncVideoResult, VideoPlaybackResult } from "../types/video.type";
import type { ReorderItem } from "./module.service";

export interface VideoFormValues {
  title: string;
  description?: string;
}

const courseDetailKey = (courseId: string) => ["courses", courseId] as const;

export const useAddVideo = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ moduleId, values }: { moduleId: string; values: VideoFormValues }) => {
      const { data } = await axiosInstance.post<ApiSuccess<CreateVideoResult>>(
        `/admin/modules/${moduleId}/videos`,
        values,
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: courseDetailKey(courseId) }),
  });
};

export const useUpdateVideo = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ videoId, values }: { videoId: string; values: VideoFormValues }) => {
      const { data } = await axiosInstance.patch<ApiSuccess<CourseVideo>>(`/admin/videos/${videoId}`, values);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: courseDetailKey(courseId) }),
  });
};

// Same optimistic-with-rollback shape as useReorderModules, scoped to one
// module's videos within the nested course-detail cache entry.
export const useReorderVideos = (courseId: string) => {
  const qc = useQueryClient();
  const key = courseDetailKey(courseId);

  return useMutation({
    mutationFn: async ({ moduleId, order }: { moduleId: string; order: ReorderItem[] }) => {
      await axiosInstance.patch(`/admin/modules/${moduleId}/videos/reorder`, { order });
    },
    onMutate: async ({ moduleId, order }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<CourseDetail>(key);

      if (previous) {
        const orderMap = new Map(order.map((o) => [o.id, o.displayOrder]));
        const modules = previous.modules.map((m) => {
          if (m.id !== moduleId) return m;
          const videos = [...m.videos]
            .map((v) => ({ ...v, displayOrder: orderMap.get(v.id) ?? v.displayOrder }))
            .sort((a, b) => a.displayOrder - b.displayOrder);
          return { ...m, videos };
        });
        qc.setQueryData<CourseDetail>(key, { ...previous, modules });
      }

      return { previous };
    },
    // No onSettled invalidate: the optimistic order is already confirmed
    // correct once the PATCH resolves, so refetching here would just replay
    // dnd-kit's settle animation a second time right after it finishes.
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
    },
  });
};

export const useSyncVideo = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      const { data } = await axiosInstance.post<ApiSuccess<SyncVideoResult>>(`/admin/videos/${videoId}/sync`);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: courseDetailKey(courseId) }),
  });
};

export const useVideoPlayback = () =>
  useMutation({
    mutationFn: async (videoId: string) => {
      const { data } = await axiosInstance.get<ApiSuccess<VideoPlaybackResult>>(`/admin/videos/${videoId}/play`);
      return data.data;
    },
  });

export const useDeleteVideo = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      await axiosInstance.delete(`/admin/videos/${videoId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: courseDetailKey(courseId) }),
  });
};
