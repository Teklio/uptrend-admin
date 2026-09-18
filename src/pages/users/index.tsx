import { useState } from "react";
import { Eye, Plus, ShieldOff, ShieldCheck } from "lucide-react";
import { useGetUsers, useUpdateUserStatus } from "../../services/user.service";
import { useSearchDebounce } from "../../hooks/useSearchDebounce";
import { Table, type TableField } from "../../components/shared/Table";
import { TablePagination } from "../../components/shared/TablePagination";
import { TableFilters } from "../../components/shared/TableFilters";
import { SearchInput } from "../../components/shared/SearchInput";
import { DropdownSelect } from "../../components/shared/Dropdown";
import { DateRangeFilter } from "../../components/shared/DateRangeFilter";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Modal } from "../../components/shared/Modal";
import { UserViewSheet } from "../../components/users/UserViewSheet";
import { AddUserSheet } from "../../components/users/AddUserSheet";
import { formatDate } from "../../utils/format.util";
import { toastMessage } from "../../utils/toast.util";
import type { AdminUser, UserListFilters } from "../../types/user.type";

const ACTIVE_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

const FIELDS: TableField[] = [
  { key: "user", label: "User" },
  { key: "phone", label: "Phone" },
  { key: "state", label: "State" },
  { key: "purchases", label: "Purchases" },
  { key: "status", label: "Status" },
  { key: "joined", label: "Joined" },
  { key: "actions", label: "Actions", className: "text-right" },
];

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const debouncedSearch = useSearchDebounce(search);

  const [draftIsActive, setDraftIsActive] = useState<string | undefined>();
  const [draftDateFrom, setDraftDateFrom] = useState<Date | null>(null);
  const [draftDateTo, setDraftDateTo] = useState<Date | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<UserListFilters>({});

  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);

  // Reset to page 1 whenever the search term settles on a new value —
  // during render (React's documented pattern for this), not an effect,
  // so it takes effect before the now-stale page is ever fetched. Otherwise
  // a search while sitting on page 3+ keeps requesting page 3 of the new,
  // smaller result set — showing "no results" even when matches exist on
  // page 1.
  const [prevDebouncedSearch, setPrevDebouncedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== prevDebouncedSearch) {
    setPrevDebouncedSearch(debouncedSearch);
    setPage(1);
  }

  const filters: UserListFilters = { ...appliedFilters, page, limit, search: debouncedSearch || undefined };
  const { data, isLoading, error } = useGetUsers(filters);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateUserStatus();

  const applyFilters = () => {
    setAppliedFilters({
      isActive: draftIsActive === undefined ? undefined : draftIsActive === "true",
      dateFrom: draftDateFrom ? draftDateFrom.toISOString() : undefined,
      dateTo: draftDateTo ? draftDateTo.toISOString() : undefined,
    });
    setPage(1);
  };

  const resetFilters = () => {
    setDraftIsActive(undefined);
    setDraftDateFrom(null);
    setDraftDateTo(null);
    setAppliedFilters({});
    setPage(1);
  };

  const hasActiveFilters = appliedFilters.isActive !== undefined || !!appliedFilters.dateFrom;

  const handleToggleStatus = () => {
    if (!statusTarget) return;
    const nextActive = !statusTarget.isActive;
    updateStatus(
      { userId: statusTarget.id, isActive: nextActive },
      {
        onSuccess: () => {
          toastMessage.success({ message: `User ${nextActive ? "activated" : "deactivated"} successfully` });
          setStatusTarget(null);
        },
        onError: (err) => toastMessage.apiError(err),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-semibold" style={{ color: "#191919" }}>
          Users
        </h1>
        <button
          type="button"
          onClick={() => setAddUserOpen(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a]"
          style={{ backgroundColor: "#f5a300" }}
        >
          <Plus size={16} />
          Add user
        </button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email or phone..." className="sm:max-w-sm" />

      <TableFilters onApply={applyFilters} onReset={resetFilters} hasActiveFilters={hasActiveFilters}>
        <DropdownSelect options={ACTIVE_OPTIONS} value={draftIsActive} onChange={setDraftIsActive} placeholder="All status" />
        <DateRangeFilter
          from={draftDateFrom}
          to={draftDateTo}
          onChange={({ from, to }) => {
            setDraftDateFrom(from);
            setDraftDateTo(to);
          }}
          fromPlaceholder="Registered from"
          toPlaceholder="Registered to"
          className="sm:col-span-2"
        />
      </TableFilters>

      <Table
        fields={FIELDS}
        data={data?.items}
        isLoading={isLoading}
        error={error}
        keyExtractor={(u) => u.id}
        emptyMessage="No users found"
        formatRow={(user) => (
          <>
            <td className="px-4 py-3">
              <p className="font-medium" style={{ color: "#191919" }}>
                {user.name || "—"}
              </p>
              <p className="text-[12px]" style={{ color: "rgba(0,0,0,0.4)" }}>
                {user.email}
              </p>
            </td>
            <td className="px-4 py-3">{user.phone || "—"}</td>
            <td className="px-4 py-3">{user.state || "—"}</td>
            <td className="px-4 py-3">{user._count?.payments ?? 0}</td>
            <td className="px-4 py-3">
              <StatusBadge label={user.isActive ? "Active" : "Inactive"} variant={user.isActive ? "success" : "error"} />
            </td>
            <td className="px-4 py-3" style={{ color: "rgba(0,0,0,0.5)" }}>
              {formatDate(user.createdAt)}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  title="View"
                  onClick={() => setViewingUserId(user.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
                  style={{ color: "#002b7f" }}
                >
                  <Eye size={15} />
                </button>
                <button
                  type="button"
                  title={user.isActive ? "Deactivate" : "Activate"}
                  onClick={() => setStatusTarget(user)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
                  style={{ color: user.isActive ? "#dc2626" : "#16a34a" }}
                >
                  {user.isActive ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
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

      <UserViewSheet open={!!viewingUserId} onClose={() => setViewingUserId(null)} userId={viewingUserId} />

      <AddUserSheet open={addUserOpen} onClose={() => setAddUserOpen(false)} />

      <Modal
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        title={statusTarget?.isActive ? "Deactivate this user?" : "Activate this user?"}
      >
        <p className="mb-5 text-[13px]" style={{ color: "rgba(0,0,0,0.5)" }}>
          {statusTarget?.isActive
            ? "They'll still be able to log in and watch courses they already own, but won't be able to purchase new ones."
            : "They'll be able to purchase courses again."}
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setStatusTarget(null)}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
            style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: statusTarget?.isActive ? "#dc2626" : "#16a34a" }}
          >
            {isUpdatingStatus ? "Saving..." : statusTarget?.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
