export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
export type PaymentType = "ONLINE" | "OFFLINE";

interface PaymentBase {
  id: string;
  rzpOrderId: string | null;
  reference: string | null;
  amount: string;
  taxPrice: string;
  transactionId: string | null;
  paymentDetails: unknown;
  paymentMode: string | null;
  paymentType: PaymentType;
  expiresAt: string | null;
  status: PaymentStatus;
  courseId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string; phone: string | null };
  course: { id: string; name: string };
}

// List rows never carry a signed proof URL (would mean signing on every
// page load) — just whether one exists. The detail view fetches it fresh.
export interface Payment extends PaymentBase {
  hasProof: boolean;
}

export interface PaymentDetail extends PaymentBase {
  proofUrl: string | null;
}

export interface PaymentListFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  paymentType?: PaymentType;
  search?: string;
  userId?: string;
  courseId?: string;
  dateFrom?: string;
  dateTo?: string;
}
