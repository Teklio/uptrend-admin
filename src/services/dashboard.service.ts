import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../config/axios";
import type { ApiSuccess } from "../types/common.type";
import type { DashboardStats } from "../types/dashboard.type";

export interface DashboardFilters {
  period?: "7d" | "30d" | "90d";
  dateFrom?: string;
  dateTo?: string;
}

export const useDashboardStats = (filters: DashboardFilters) =>
  useQuery({
    queryKey: ["dashboard", filters],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiSuccess<DashboardStats>>("/admin/dashboard", {
        params: filters,
      });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
