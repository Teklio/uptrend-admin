import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../config/axios";
import { useAppDispatch } from "../store/hooks";
import { loginSuccess, logoutSuccess, updateProfile } from "../store/slices/authSlice";
import type { ApiSuccess } from "../types/common.type";
import type {
  AdminLoginPayload,
  AdminProfile,
  ChangeAdminPasswordPayload,
  UpdateAdminProfilePayload,
} from "../types/auth.type";

export const ME_QUERY_KEY = ["admin", "me"] as const;

export const useMe = (enabled = true) =>
  useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiSuccess<{ admin: AdminProfile }>>("/admin/auth/me");
      return data.data.admin;
    },
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

export const useLogin = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (payload: AdminLoginPayload) => {
      const { data } = await axiosInstance.post<ApiSuccess<{ admin: AdminProfile }>>(
        "/admin/auth/login",
        payload,
      );
      return data.data.admin;
    },
    onSuccess: (admin) => {
      dispatch(loginSuccess(admin));
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.post("/admin/auth/logout");
    },
    onSettled: () => {
      dispatch(logoutSuccess());
      queryClient.clear();
    },
  });
};

export const useUpdateAdminProfile = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateAdminProfilePayload) => {
      const { data } = await axiosInstance.patch<ApiSuccess<{ admin: AdminProfile }>>(
        "/admin/auth/update-profile",
        payload,
      );
      return data.data.admin;
    },
    onSuccess: (admin) => {
      dispatch(updateProfile(admin));
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
};

export const useChangeAdminPassword = () =>
  useMutation({
    mutationFn: async (payload: ChangeAdminPasswordPayload) => {
      await axiosInstance.patch("/admin/auth/change-password", payload);
    },
  });
