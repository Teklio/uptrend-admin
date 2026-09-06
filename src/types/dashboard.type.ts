export interface DashboardRecentPayment {
  id: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  course: { id: string; name: string };
}

export interface DashboardStats {
  range: { from: string | null; to: string } | null;
  users: { total: number; active: number; newInRange: number };
  courses: { total: number };
  revenue: { allTime: number; inRange: number };
  payments: { successful: number; pending: number; failed: number };
  recentPayments: DashboardRecentPayment[];
}
