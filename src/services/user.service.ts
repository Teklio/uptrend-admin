import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../config/axios";
import type { ApiSuccess, PaginatedData } from "../types/common.type";
import type { AdminUser, AdminUserDetail, UserListFilters } from "../types/user.type";

const USERS_KEY = "users";

export const useGetUsers = (filters: UserListFilters) =>
  useQuery({
    queryKey: [USERS_KEY, filters],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiSuccess<PaginatedData<AdminUser>>>("/admin/users", {
        params: filters,
      });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });

export const useGetUser = (userId: string | undefined) =>
  useQuery({
    queryKey: [USERS_KEY, userId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiSuccess<AdminUserDetail>>(`/admin/users/${userId}`);
      return data.data;
    },
    enabled: !!userId,
  });

export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  state: string;
  password: string;
}

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const { data } = await axiosInstance.post<ApiSuccess<AdminUser>>("/admin/users", input);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
};

export const useUpdateUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { data } = await axiosInstance.patch<ApiSuccess<AdminUser>>(`/admin/users/${userId}/status`, {
        isActive,
      });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
};
