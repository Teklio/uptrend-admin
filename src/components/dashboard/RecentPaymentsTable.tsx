import { Table, type TableField } from "../shared/Table";
import { StatusBadge } from "../shared/StatusBadge";
import { formatCurrency, formatDateTime } from "../../utils/format.util";
import type { DashboardRecentPayment } from "../../types/dashboard.type";

const STATUS_VARIANT: Record<DashboardRecentPayment["status"], "success" | "warning" | "error" | "neutral"> = {
  SUCCESS: "success",
  PENDING: "warning",
  FAILED: "error",
  CANCELLED: "neutral",
};

const FIELDS: TableField[] = [
  { key: "user", label: "User" },
  { key: "course", label: "Course" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
];

interface RecentPaymentsTableProps {
  data?: DashboardRecentPayment[];
  isLoading?: boolean;
}

export const RecentPaymentsTable = ({ data, isLoading }: RecentPaymentsTableProps) => (
  <Table
    fields={FIELDS}
    data={data}
    isLoading={isLoading}
    keyExtractor={(p) => p.id}
    emptyMessage="No payments yet"
    formatRow={(payment) => (
      <>
        <td className="px-4 py-3">
          <p className="font-medium" style={{ color: "#191919" }}>
            {payment.user.name || "—"}
          </p>
          <p className="text-[12px]" style={{ color: "rgba(0,0,0,0.4)" }}>
            {payment.user.email}
          </p>
        </td>
        <td className="px-4 py-3">{payment.course.name}</td>
        <td className="px-4 py-3 font-mono">{formatCurrency(payment.amount)}</td>
        <td className="px-4 py-3">
          <StatusBadge label={payment.status} variant={STATUS_VARIANT[payment.status]} />
        </td>
        <td className="px-4 py-3" style={{ color: "rgba(0,0,0,0.5)" }}>
          {formatDateTime(payment.createdAt)}
        </td>
      </>
    )}
  />
);
