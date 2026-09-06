import { axiosInstance } from "../config/axios";
import type { ComboboxOptionData } from "../components/shared/AsyncCombobox";
import type { ApiSuccess, PaginatedData } from "../types/common.type";
import type { AdminUser } from "../types/user.type";
import type { Course } from "../types/course.type";

// Shared search functions for AsyncCombobox, backed by the existing
// paginated admin list endpoints — used wherever picking a specific
// student or course is needed (offline payments, review filters, ...).
export const searchStudents = async (query: string): Promise<ComboboxOptionData[]> => {
  const { data } = await axiosInstance.get<ApiSuccess<PaginatedData<AdminUser>>>("/admin/users", {
    params: { search: query || undefined, limit: 10 },
  });
  return data.data.items.map((u) => ({ value: u.id, label: u.name || u.email, sublabel: u.email }));
};

export const searchCourses = async (query: string): Promise<ComboboxOptionData[]> => {
  const { data } = await axiosInstance.get<ApiSuccess<PaginatedData<Course>>>("/admin/courses", {
    params: { search: query || undefined, limit: 10 },
  });
  return data.data.items.map((c) => ({ value: c.id, label: c.name, sublabel: c.language ?? undefined }));
};
