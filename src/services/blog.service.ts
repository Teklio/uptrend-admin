import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../config/axios";
import type { ApiSuccess, PaginatedData } from "../types/common.type";
import type { Blog, BlogListFilters } from "../types/blog.type";
import type { BlogFormSchemaType } from "../schemas/blog.schema";

const BLOGS_KEY = "blogs";

export const useGetBlogs = (filters: BlogListFilters) =>
  useQuery({
    queryKey: [BLOGS_KEY, filters],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiSuccess<PaginatedData<Blog>>>("/admin/blogs", {
        params: filters,
      });
      return data.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

export const useGetBlog = (blogId: string | undefined) =>
  useQuery({
    queryKey: [BLOGS_KEY, blogId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiSuccess<Blog>>(`/admin/blogs/${blogId}`);
      return data.data;
    },
    enabled: !!blogId,
    staleTime: 5 * 60 * 1000,
  });

export const useAddBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: BlogFormSchemaType) => {
      const { data } = await axiosInstance.post<ApiSuccess<Blog>>("/admin/blogs", values);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [BLOGS_KEY] }),
  });
};

export const useUpdateBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ blogId, values }: { blogId: string; values: BlogFormSchemaType }) => {
      const { data } = await axiosInstance.patch<ApiSuccess<Blog>>(`/admin/blogs/${blogId}`, values);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [BLOGS_KEY] });
      qc.invalidateQueries({ queryKey: [BLOGS_KEY, variables.blogId] });
    },
  });
};

export const useDeleteBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (blogId: string) => {
      await axiosInstance.delete(`/admin/blogs/${blogId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [BLOGS_KEY] }),
  });
};

// Independent of useAddBlog/useUpdateBlog — lets an already-created blog's
// cover image be swapped or cleared on its own, without resubmitting the
// rest of the blog form.
export const useUploadBlogImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ blogId, file }: { blogId: string; file: File }) => {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await axiosInstance.post<ApiSuccess<Blog>>(`/admin/blogs/${blogId}/image`, formData);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [BLOGS_KEY] });
      qc.invalidateQueries({ queryKey: [BLOGS_KEY, variables.blogId] });
    },
  });
};

export const useDeleteBlogImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (blogId: string) => {
      const { data } = await axiosInstance.delete<ApiSuccess<Blog>>(`/admin/blogs/${blogId}/image`);
      return data.data;
    },
    onSuccess: (_data, blogId) => {
      qc.invalidateQueries({ queryKey: [BLOGS_KEY] });
      qc.invalidateQueries({ queryKey: [BLOGS_KEY, blogId] });
    },
  });
};
