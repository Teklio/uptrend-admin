import { useState } from "react";
import { Eye, Plus } from "lucide-react";
import { useGetPayments } from "../../services/payment.service";
import { useSearchDebounce } from "../../hooks/useSearchDebounce";
import { Table, type TableField } from "../../components/shared/Table";
import { TablePagination } from "../../components/shared/TablePagination";
import { TableFilters } from "../../components/shared/TableFilters";
import { SearchInput } from "../../components/shared/SearchInput";
import { DropdownSelect } from "../../components/shared/Dropdown";
import { DateRangeFilter } from "../../components/shared/DateRangeFilter";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { PaymentViewSheet } from "../../components/payments/PaymentViewSheet";
import { OfflinePaymentSheet } from "../../components/payments/OfflinePaymentSheet";
import { formatCurrency, formatDateTime } from "../../utils/format.util";
import type { PaymentListFilters, PaymentStatus, PaymentType } from "../../types/payment.type";

const STATUS_VARIANT: Record<PaymentStatus, "success" | "warning" | "error" | "neutral"> = {
  SUCCESS: "success",
  PENDING: "warning",
  FAILED: "error",
  CANCELLED: "neutral",
};

const STATUS_OPTIONS = [
  { label: "Success", value: "SUCCESS" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const PAYMENT_TYPE_OPTIONS = [
  { label: "Online", value: "ONLINE" },
  { label: "Offline", value: "OFFLINE" },
];

const FIELDS: TableField[] = [
  { key: "user", label: "User" },
  { key: "course", label: "Course" },
  { key: "amount", label: "Amount" },
  { key: "type", label: "Type" },
  { key: "mode", label: "Mode" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
  { key: "actions", label: "Actions", className: "text-right" },
];

const PaymentsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const debouncedSearch = useSearchDebounce(search);

  const [draftStatus, setDraftStatus] = useState<string | undefined>();
  const [draftPaymentType, setDraftPaymentType] = useState<string | undefined>();
  const [draftDateFrom, setDraftDateFrom] = useState<Date | null>(null);
  const [draftDateTo, setDraftDateTo] = useState<Date | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<PaymentListFilters>({});

  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);

  const filters: PaymentListFilters = {
    ...appliedFilters,
    page,
    limit,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, error } = useGetPayments(filters);

  const applyFilters = () => {
    setAppliedFilters({
      status: draftStatus as PaymentStatus | undefined,
      paymentType: draftPaymentType as PaymentType | undefined,
      dateFrom: draftDateFrom ? draftDateFrom.toISOString() : undefined,
      dateTo: draftDateTo ? draftDateTo.toISOString() : undefined,
    });
    setPage(1);
  };

  const resetFilters = () => {
    setDraftStatus(undefined);
    setDraftPaymentType(undefined);
    setDraftDateFrom(null);
    setDraftDateTo(null);
    setAppliedFilters({});
    setPage(1);
  };

  const hasActiveFilters = !!appliedFilters.status || !!appliedFilters.paymentType || !!appliedFilters.dateFrom;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-semibold" style={{ color: "#191919" }}>
          Payments
        </h1>
        <button
          type="button"
          onClick={() => setOfflineModalOpen(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a]"
          style={{ backgroundColor: "#f5a300" }}
        >
          <Plus size={16} />
          Record offline payment
        </button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by payment ID, user name or email..."
        className="sm:max-w-sm"
      />

      <TableFilters onApply={applyFilters} onReset={resetFilters} hasActiveFilters={hasActiveFilters}>
        <DropdownSelect options={STATUS_OPTIONS} value={draftStatus} onChange={setDraftStatus} placeholder="All status" />
        <DropdownSelect
          options={PAYMENT_TYPE_OPTIONS}
          value={draftPaymentType}
          onChange={setDraftPaymentType}
          placeholder="All type"
        />
        <DateRangeFilter
          from={draftDateFrom}
          to={draftDateTo}
          onChange={({ from, to }) => {
            setDraftDateFrom(from);
            setDraftDateTo(to);
          }}
          fromPlaceholder="Created from"
          toPlaceholder="Created to"
          className="sm:col-span-2"
        />
      </TableFilters>

      <Table
        fields={FIELDS}
        data={data?.items}
        isLoading={isLoading}
        error={error}
        keyExtractor={(p) => p.id}
        emptyMessage="No payments found"
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
            <td className="px-4 py-3 font-mono">{formatCurrency(payment.totalAmount)}</td>
            <td className="px-4 py-3">
              <StatusBadge
                label={payment.paymentType === "OFFLINE" ? "Offline" : "Online"}
                variant={payment.paymentType === "OFFLINE" ? "warning" : "neutral"}
              />
            </td>
            <td className="px-4 py-3">{payment.paymentMode || "—"}</td>
            <td className="px-4 py-3">
              <StatusBadge label={payment.status} variant={STATUS_VARIANT[payment.status]} />
            </td>
            <td className="px-4 py-3" style={{ color: "rgba(0,0,0,0.5)" }}>
              {formatDateTime(payment.createdAt)}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  title="View"
                  onClick={() => setSelectedPaymentId(payment.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
                  style={{ color: "#002b7f" }}
                >
                  <Eye size={15} />
                </button>
              </div>
            </td>
          </>
        )}
      />

      <TablePagination
        meta={data?.pagination}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        isLoading={isLoading}
      />

      <PaymentViewSheet
        open={!!selectedPaymentId}
        onClose={() => setSelectedPaymentId(null)}
        paymentId={selectedPaymentId}
      />

      <OfflinePaymentSheet open={offlineModalOpen} onClose={() => setOfflineModalOpen(false)} />
    </div>
  );
};

export default PaymentsPage;
