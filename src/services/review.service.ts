import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../config/axios";
import type { ApiSuccess, PaginatedData } from "../types/common.type";
import type { Review, ReviewListFilters } from "../types/review.type";

const REVIEWS_KEY = "reviews";

export const useGetReviews = (filters: ReviewListFilters) =>
  useQuery({
    queryKey: [REVIEWS_KEY, filters],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiSuccess<PaginatedData<Review>>>("/admin/reviews", {
        params: filters,
      });
      return data.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

export const useUpdateReviewVisibility = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, isHidden }: { reviewId: string; isHidden: boolean }) => {
      const { data } = await axiosInstance.patch<ApiSuccess<Review>>(`/admin/reviews/${reviewId}/visibility`, {
        isHidden,
      });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [REVIEWS_KEY] }),
  });
};
