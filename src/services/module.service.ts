import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../config/axios";
import type { ApiSuccess } from "../types/common.type";
import type { CourseDetail, CourseModule } from "../types/course.type";

export interface ModuleFormValues {
  title: string;
  description?: string;
}

export interface ReorderItem {
  id: string;
  displayOrder: number;
}

const courseDetailKey = (courseId: string) => ["courses", courseId] as const;

export const useAddModule = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: ModuleFormValues) => {
      const { data } = await axiosInstance.post<ApiSuccess<CourseModule>>(
        `/admin/courses/${courseId}/modules`,
        values,
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: courseDetailKey(courseId) }),
  });
};

export const useUpdateModule = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ moduleId, values }: { moduleId: string; values: ModuleFormValues }) => {
      const { data } = await axiosInstance.patch<ApiSuccess<CourseModule>>(`/admin/modules/${moduleId}`, values);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: courseDetailKey(courseId) }),
  });
};

// Optimistic: the module list re-renders in the new order immediately;
// if the API call fails, the previous snapshot is restored so the UI
// never silently disagrees with what's actually saved.
export const useReorderModules = (courseId: string) => {
  const qc = useQueryClient();
  const key = courseDetailKey(courseId);

  return useMutation({
    mutationFn: async (order: ReorderItem[]) => {
      await axiosInstance.patch(`/admin/courses/${courseId}/modules/reorder`, { order });
    },
    onMutate: async (order) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<CourseDetail>(key);

      if (previous) {
        const orderMap = new Map(order.map((o) => [o.id, o.displayOrder]));
        const modules = [...previous.modules]
          .map((m) => ({ ...m, displayOrder: orderMap.get(m.id) ?? m.displayOrder }))
          .sort((a, b) => a.displayOrder - b.displayOrder);
        qc.setQueryData<CourseDetail>(key, { ...previous, modules });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
};

export const useDeleteModule = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (moduleId: string) => {
      await axiosInstance.delete(`/admin/modules/${moduleId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: courseDetailKey(courseId) }),
  });
};
