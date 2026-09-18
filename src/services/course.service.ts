import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../config/axios";
import type { ApiSuccess, PaginatedData } from "../types/common.type";
import type { Course, CourseDetail, CourseListFilters } from "../types/course.type";
import type { CourseFormSchemaType } from "../schemas/course.schema";

const COURSES_KEY = "courses";

export const useGetCourses = (filters: CourseListFilters) =>
  useQuery({
    queryKey: [COURSES_KEY, filters],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiSuccess<PaginatedData<Course>>>("/admin/courses", {
        params: filters,
      });
      return data.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

export const useGetCourse = (courseId: string | undefined) =>
  useQuery({
    queryKey: [COURSES_KEY, courseId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiSuccess<CourseDetail>>(`/admin/courses/${courseId}`);
      return data.data;
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });

export interface CourseImageFiles {
  primaryImage?: File | null;
  mentorImage?: File | null;
}

const buildCourseFormData = (values: CourseFormSchemaType, files: CourseImageFiles) => {
  const formData = new FormData();
  formData.append("name", values.name);
  if (values.description) formData.append("description", values.description);
  if (values.language) formData.append("language", values.language);
  if (values.mentorName) formData.append("mentorName", values.mentorName);
  formData.append("price", String(values.price));
  formData.append("actualPrice", String(values.actualPrice));
  formData.append("extraFee", String(values.extraFee));
  formData.append("features", JSON.stringify(values.features));
  if (files.primaryImage) formData.append("primaryImage", files.primaryImage);
  if (files.mentorImage) formData.append("mentorImage", files.mentorImage);
  return formData;
};

export const useAddCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ values, files }: { values: CourseFormSchemaType; files: CourseImageFiles }) => {
      const formData = buildCourseFormData(values, files);
      const { data } = await axiosInstance.post<ApiSuccess<Course>>("/admin/courses", formData);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [COURSES_KEY] }),
  });
};

export const useUpdateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      values,
      files,
    }: {
      courseId: string;
      values: CourseFormSchemaType;
      files: CourseImageFiles;
    }) => {
      const formData = buildCourseFormData(values, files);
      const { data } = await axiosInstance.patch<ApiSuccess<Course>>(`/admin/courses/${courseId}`, formData);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [COURSES_KEY] });
      qc.invalidateQueries({ queryKey: [COURSES_KEY, variables.courseId] });
    },
  });
};

// Lightweight, single-field PATCH — reuses the same update endpoint as
// useUpdateCourse but sends only isPublished. Still goes through FormData
// (not a plain JSON body) since the route has multer's courseImageFields
// middleware attached ahead of the controller, and every other caller of
// this endpoint already goes through that same multipart path.
export const useToggleCoursePublish = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, isPublished }: { courseId: string; isPublished: boolean }) => {
      const formData = new FormData();
      formData.append("isPublished", String(isPublished));
      const { data } = await axiosInstance.patch<ApiSuccess<Course>>(`/admin/courses/${courseId}`, formData);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [COURSES_KEY] });
      qc.invalidateQueries({ queryKey: [COURSES_KEY, variables.courseId] });
    },
  });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      await axiosInstance.delete(`/admin/courses/${courseId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [COURSES_KEY] }),
  });
};

export type CourseImageType = "primary" | "mentor";

// Independent of useAddCourse/useUpdateCourse — lets an already-created
// course's primary/mentor image be swapped or cleared on its own, without
// resubmitting the rest of the course form.
export const useUploadCourseImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, type, file }: { courseId: string; type: CourseImageType; file: File }) => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", type);
      const { data } = await axiosInstance.post<ApiSuccess<Course>>(`/admin/courses/${courseId}/images`, formData);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [COURSES_KEY] });
      qc.invalidateQueries({ queryKey: [COURSES_KEY, variables.courseId] });
    },
  });
};

export const useDeleteCourseImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, type }: { courseId: string; type: CourseImageType }) => {
      const { data } = await axiosInstance.delete<ApiSuccess<Course>>(`/admin/courses/${courseId}/images`, {
        data: { type },
      });
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [COURSES_KEY] });
      qc.invalidateQueries({ queryKey: [COURSES_KEY, variables.courseId] });
    },
  });
};
