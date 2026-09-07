export interface UserPaymentSummary {
  id: string;
  amount: string;
  extraFee: string;
  totalAmount: string;
  paymentType: "ONLINE" | "OFFLINE";
  expiresAt: string | null;
  createdAt: string;
  course: { id: string; name: string };
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  state: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { payments: number };
}

export interface AdminUserDetail extends AdminUser {
  payments: UserPaymentSummary[];
}

export interface UserListFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
