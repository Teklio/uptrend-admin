import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../config/axios";
import type { ApiSuccess, PaginatedData } from "../types/common.type";
import type { Payment, PaymentDetail, PaymentListFilters } from "../types/payment.type";

const PAYMENTS_KEY = "payments";

export const useGetPayments = (filters: PaymentListFilters) =>
  useQuery({
    queryKey: [PAYMENTS_KEY, filters],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiSuccess<PaginatedData<Payment>>>("/admin/payments", {
        params: filters,
      });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });

export const useGetPayment = (paymentId: string | undefined) =>
  useQuery({
    queryKey: [PAYMENTS_KEY, paymentId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiSuccess<PaymentDetail>>(`/admin/payments/${paymentId}`);
      return data.data;
    },
    enabled: !!paymentId,
  });

export interface CreateOfflinePaymentInput {
  userId: string;
  courseId: string;
  amount: number;
  paymentMode?: string;
  proof?: File | null;
}

export const useCreateOfflinePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOfflinePaymentInput) => {
      const formData = new FormData();
      formData.append("userId", input.userId);
      formData.append("courseId", input.courseId);
      formData.append("amount", String(input.amount));
      if (input.paymentMode) formData.append("paymentMode", input.paymentMode);
      if (input.proof) formData.append("proof", input.proof);

      const { data } = await axiosInstance.post<ApiSuccess<PaymentDetail>>("/admin/payments/offline", formData);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [PAYMENTS_KEY] }),
  });
};

export const useExtendPaymentExpiry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, days }: { paymentId: string; days: number }) => {
      const { data } = await axiosInstance.patch<ApiSuccess<{ expiresAt: string }>>(
        `/admin/payments/${paymentId}/expiry`,
        { days },
      );
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [PAYMENTS_KEY, variables.paymentId] });
    },
  });
};
