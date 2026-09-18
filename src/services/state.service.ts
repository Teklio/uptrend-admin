import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../config/axios";
import type { ApiSuccess } from "../types/common.type";

export interface StateOption {
  id: string;
  name: string;
}

// Public, unauthenticated endpoint (seeded reference data, not admin-only)
// — same backend the checkout/registration forms use.
export const useGetStates = () =>
  useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiSuccess<StateOption[]>>("/states");
      return data.data;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
