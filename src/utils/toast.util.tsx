import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../config/axios";

const cardStyle = (borderColor: string) => ({
  style: {
    borderLeft: `3px solid ${borderColor}`,
    fontFamily: "'Poppins', sans-serif",
    fontSize: "14px",
    borderRadius: "14px",
  },
});

export const toastMessage = {
  success: ({ message }: { message: string }) =>
    toast.success(message, {
      icon: <CheckCircle2 size={18} color="#16a34a" />,
      ...cardStyle("#16a34a"),
    }),
  error: ({ message }: { message: string }) =>
    toast.error(message, {
      icon: <XCircle size={18} color="#dc2626" />,
      ...cardStyle("#dc2626"),
    }),
  warning: ({ message }: { message: string }) =>
    toast.warning(message, {
      icon: <AlertTriangle size={18} color="#ca8a04" />,
      ...cardStyle("#ca8a04"),
    }),
  info: ({ message }: { message: string }) =>
    toast.info(message, {
      icon: <Info size={18} color="#002b7f" />,
      ...cardStyle("#002b7f"),
    }),
  apiError: (error: unknown) => {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const data = axiosError?.response?.data;
    const fieldMessage = data?.errors
      ? Object.values(data.errors.fieldErrors).flat()[0]
      : undefined;
    const message = data?.message || fieldMessage || "Something went wrong. Please try again.";
    toastMessage.error({ message });
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) => toast.promise(promise, messages),
};
